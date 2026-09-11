# Hack The Box Machine Reports

Welcome to my Hack The Box machine report portfolio. This repository contains write-ups from my hands-on cybersecurity practice, focused on enumeration, exploitation methodology, privilege escalation, documentation, and lessons learned.

## About This Repository

This project was created to document my growth as I continue building practical cybersecurity skills. Each report is written in a structured format similar to a penetration testing report and includes the major phases of the attack path.

The goal is not just to show that a machine was completed, but to demonstrate the thought process behind each step.

## Focus Areas

These reports highlight practice in:

- Network reconnaissance and service enumeration
- Web application enumeration
- Vulnerability research and validation
- Exploitation of misconfigurations and vulnerable services
- Linux and Windows privilege escalation
- Active Directory enumeration and attack paths
- Credential discovery and password reuse analysis
- Post-exploitation methodology
- Professional technical documentation

## Report Structure

Most reports follow this structure:

1. Machine summary
2. Reconnaissance
3. Service enumeration
4. Exploitation
5. Privilege escalation
6. Proof of compromise
7. Lessons learned
8. Remediation recommendations

## Site Architecture

This is a dependency-free static site. Report narratives remain in individual HTML files so existing URLs, rich markup, and no-JavaScript access continue to work. Shared presentation and navigation are applied progressively by `report-page.js`, while `reports.json` is the canonical collection metadata used by the homepage and report headers. The homepage retains static cards as a fallback if JavaScript or JSON loading is unavailable.

When adding a report:

1. Add `reports/<slug>.html` with the complete report content, `../style.css`, and deferred `../report-page.js` references.
2. Add the matching machine metadata to `reports.json`.
3. Add a matching fallback card to `index.html`.
4. Run `python3 -m unittest discover -s tests -p 'test_*.py'`.

## Live Portfolio

You can view the published report site here:

https://cberreteaga.github.io/htb-reports/

## Tools Commonly Used

- Nmap
- Gobuster
- WhatWeb
- curl
- Burp Suite
- Metasploit
- Netcat
- LinPEAS / WinPEAS
- BloodHound
- Certipy
- Impacket
- Hashcat / John the Ripper
- Python
- Bash
- PowerShell

## Current Goal

I am using this portfolio to strengthen my hands-on cybersecurity skills and demonstrate my ability to perform structured security assessments. My long-term goal is to transition into a hands-on cybersecurity role such as:

- Penetration Tester
- Vulnerability Assessment Analyst
- Security Engineer
- Cybersecurity Analyst
- Red Team Operator

## Background

I am a transitioning cybersecurity professional with a background in military operations, defense contracting, knowledge management, Power Platform development, and computer science. I hold a Master of Science in Computer Science and continue to build practical experience through labs, projects, and technical documentation.

## Disclaimer

All reports in this repository are based on Hack The Box lab environments. These write-ups are for educational and portfolio purposes only. Techniques shown here should only be used in authorized environments where explicit permission has been granted.

## Contact

Connect with me on LinkedIn:

https://www.linkedin.com/in/carlos-berreteaga/
