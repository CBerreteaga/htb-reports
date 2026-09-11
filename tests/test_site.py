import json
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORTS_DIR = ROOT / "reports"


class DocumentParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []
        self.scripts = []
        self.stylesheets = []
        self.h1_count = 0
        self.has_viewport = False
        self.has_title = False
        self.has_inline_style = False

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "a" and "href" in values:
            self.hrefs.append(values["href"])
        elif tag == "script" and "src" in values:
            self.scripts.append(values["src"])
        elif tag == "link" and values.get("rel") == "stylesheet":
            self.stylesheets.append(values.get("href"))
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "meta" and values.get("name") == "viewport":
            self.has_viewport = True
        elif tag == "title":
            self.has_title = True
        elif tag == "style":
            self.has_inline_style = True


class SiteValidationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.metadata = json.loads((ROOT / "reports.json").read_text())
        cls.by_slug = {item["slug"]: item for item in cls.metadata}

    def test_metadata_schema_and_unique_values(self):
        required = {"slug", "name", "os", "difficulty", "status"}
        self.assertEqual(len(self.metadata), len(self.by_slug), "report slugs must be unique")
        for report in self.metadata:
            self.assertEqual(set(report), required)
            self.assertTrue(all(isinstance(value, str) and value.strip() for value in report.values()))
            self.assertRegex(report["slug"], r"^[a-z0-9-]+$")
            self.assertIn(report["status"], {"Active", "Retired"})

    def test_metadata_matches_report_files_and_fallback_cards(self):
        report_slugs = {path.stem for path in REPORTS_DIR.glob("*.html")}
        self.assertEqual(set(self.by_slug), report_slugs)

        index = (ROOT / "index.html").read_text()
        cards = re.findall(r'<a class="card" href="reports/([a-z0-9-]+)\.html">(.*?)</a>', index, re.S)
        fallback_slugs = {slug for slug, _ in cards}
        self.assertEqual(set(self.by_slug), fallback_slugs)

        for slug, card in cards:
            heading = re.search(r"<h2>(.*?)</h2>", card, re.S).group(1).strip()
            fields = {
                label.lower(): value.strip()
                for label, value in re.findall(r"<strong>([^:]+):</strong>\s*([^<]+)", card)
            }
            with self.subTest(fallback=slug):
                self.assertEqual(heading, self.by_slug[slug]["name"])
                self.assertEqual(fields["os"], self.by_slug[slug]["os"])
                self.assertEqual(fields["difficulty"], self.by_slug[slug]["difficulty"])
                self.assertEqual(fields["status"], self.by_slug[slug]["status"])

    def test_every_report_uses_shared_progressive_layout(self):
        for path in REPORTS_DIR.glob("*.html"):
            with self.subTest(report=path.name):
                source = path.read_text()
                parser = DocumentParser()
                parser.feed(source)
                self.assertTrue(parser.has_title)
                self.assertTrue(parser.has_viewport)
                self.assertGreaterEqual(parser.h1_count, 1)
                self.assertIn("../style.css", parser.stylesheets)
                self.assertEqual(parser.scripts.count("../report-page.js"), 1)
                self.assertFalse(parser.has_inline_style)
                self.assertNotIn("</h1></h1>", source)
                self.assertNotIn("</code>></pre>", source)

                visible_fields = {
                    label.lower(): value.strip()
                    for label, value in re.findall(
                        r"<strong>(Difficulty|Operating System|Status):</strong>\s*([^<]+)", source, re.I
                    )
                }
                expected = self.by_slug[path.stem]
                for label, key in (("difficulty", "difficulty"), ("operating system", "os"), ("status", "status")):
                    if label in visible_fields:
                        self.assertEqual(visible_fields[label], expected[key])

    def test_internal_file_links_resolve(self):
        pages = [ROOT / "index.html", *REPORTS_DIR.glob("*.html")]
        for path in pages:
            parser = DocumentParser()
            parser.feed(path.read_text())
            for href in parser.hrefs:
                if href.startswith(("#", "http://", "https://", "mailto:")):
                    continue
                target = (path.parent / href.split("#", 1)[0]).resolve()
                with self.subTest(page=path.name, href=href):
                    self.assertTrue(target.exists(), f"broken local link: {href}")


if __name__ == "__main__":
    unittest.main()
