# QA report — Hub website (github.com/v57/hub-web, fork: v57a/hub-web)

Author: Angelina Griaznova · date: October 2026 · environment: macOS, Playwright Chromium, bun 1.3.14, vite 8.0.8, viewports 1440x900 and 390x844.

## How to reproduce

```
git clone https://github.com/v57a/hub-web.git
cd hub-web
bun install
bun run build
bun run preview --port 4173        # in a second terminal, then run the suite

bun run test                       # Playwright, 45 tests: 32 pass, 13 fail on purpose
bun run test:desktop               # one viewport only
bun run test:mobile
bun run report                     # open the HTML report
```

`bun test` finds nothing — the six bun unit tests that came from upstream were
removed (see the commit history): they were inherited unchanged and one of them
failed on a clean clone because it read files from the gitignored `static/`.

## Result

| | |
|---|---|
| Checklist | 37 checks — 19 pass, 17 fail, 1 needs a product decision |
| Test cases | 6 written |
| Bug reports | 9 (3 major, 4 average, 2 minor) |
| Automated, passing | 32 Playwright tests |
| Automated, failing on purpose | 13 Playwright tests, one per open bug |

## Bugs

| ID | Severity | Title |
|---|---|---|
| BUG-01 | Major | Toolbar controls "Download" and "Open" are dead `<div>` elements, unreachable by keyboard |
| BUG-02 | Major | Pricing page "Download Lite" / "Download Pro" do nothing |
| BUG-03 | Major | Clean clone renders with every image missing — `static/` is in `.gitignore` |
| BUG-04 | Average | All four community cards link to `github.com/v57` |
| BUG-05 | Average | Below 680px the primary call to action disappears |
| BUG-06 | Average | Feedback composer "+" button does not submit the text |
| BUG-07 | Average | Feedback filters, sort and the "38832 CARDS" counter do not affect the list |
| BUG-08 | Minor | No page title, no headings, empty `alt` on every image |
| BUG-09 | Minor | Asset filenames do not describe their content (no visual defect) |

Full details, steps to reproduce, evidence and suggested fixes: `Hub-QA-documentation.md`.
Screenshots: `evidence/`.

## Notes on method

- BUG-03 was confirmed on a clean clone, then re-checked on a working copy that has `static/` present: all 39 images load and the console is clean. The defect is the `.gitignore` entry, not the code.
- BUG-09 was first suspected from the source mapping and then verified by rendering every SVG large and comparing it with its label. The site looks right; only the file names lie. `tests/home.e2e.ts` now pins the current behaviour (right picture, wrong file name) so a rename cannot silently break the hero.
- One suspected bug was rejected: the "Windows" chip in Get started switches the instructions correctly when clicked precisely. It did not reproduce, so it is not in the report.