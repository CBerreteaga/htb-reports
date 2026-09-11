(() => {
  const slug = window.location.pathname.split('/').pop().replace(/\.html$/, '');
  const originalMain = document.querySelector('.layout main') || document.querySelector('main');
  if (!originalMain) return;

  const title = document.querySelector('h1')?.textContent.trim()
    || document.title.split(/\s[-:]/)[0].replace(/^Hack The Box Report:\s*/, '').trim();
  const content = document.createDocumentFragment();
  const source = originalMain.querySelector(':scope > .report-shell') || originalMain;

  [...source.childNodes].forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && (node.matches('h1, footer') || node.querySelector?.('h1.main-title'))) return;
    content.append(node);
  });

  document.body.replaceChildren();
  document.body.insertAdjacentHTML('beforeend', `
    <header class="site-header">
      <nav class="nav" aria-label="Primary navigation">
        <a class="brand" href="../index.html">HTB REPORTS</a>
        <a class="nav-pill" href="../index.html">All reports</a>
      </nav>
    </header>
    <section class="hero">
      <div class="hero-card">
        <div class="eyebrow">Hack The Box Report</div>
        <h1 class="main-title"></h1>
        <p class="subtitle">A structured walkthrough covering reconnaissance, exploitation, privilege escalation, and defensive lessons.</p>
        <div class="report-meta" aria-label="Machine metadata"></div>
      </div>
    </section>
    <div class="layout">
      <aside aria-label="Table of contents">
        <h2>Contents</h2>
        <nav class="toc"></nav>
      </aside>
      <main class="report report-content"></main>
    </div>
  `);

  document.querySelector('.main-title').textContent = title;
  const report = document.querySelector('.report-content');
  report.append(content);

  const headings = [...report.querySelectorAll('h2')];
  const headingSet = new Set(headings);
  const usedIds = new Set(
    [...document.querySelectorAll('[id]')]
      .filter((element) => !headingSet.has(element))
      .map((element) => element.id),
  );
  const slugify = (value) => value.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'section';

  headings.forEach((heading) => {
    const base = heading.id || slugify(heading.textContent);
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) id = `${base}-${suffix++}`;
    heading.id = id;
    usedIds.add(id);
  });

  const toc = document.querySelector('.toc');
  headings.forEach((heading) => {
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    toc.append(link);
  });
  if (!headings.length) document.querySelector('aside').hidden = true;

  report.insertAdjacentHTML('beforeend', `
    <footer class="report-footer">
      <p><a class="back-link" href="../index.html">Back to all reports</a></p>
      <p class="footer-note">Authorized Hack The Box lab report. Flag values are omitted or redacted for portfolio use.</p>
    </footer>
  `);

  fetch('../reports.json')
    .then((response) => {
      if (!response.ok) throw new Error(`Report metadata request failed: ${response.status}`);
      return response.json();
    })
    .then((reports) => reports.find((item) => item.slug === slug))
    .then((metadata) => {
      if (!metadata) return;
      const container = document.querySelector('.report-meta');
      [metadata.os, metadata.difficulty, metadata.status].forEach((value) => {
        const item = document.createElement('span');
        item.textContent = value;
        container.append(item);
      });
    })
    .catch(() => {
      // The complete report remains usable when metadata cannot be loaded.
    });
})();
