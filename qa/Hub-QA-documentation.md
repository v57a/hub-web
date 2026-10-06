# Hub website — QA documentation

**Test object:** Hub website, built from `github.com/v57a/hub-web` and served locally (bun 1.3.14, vite 8.0.8).

**Environment:** macOS, Chrome 141 (Playwright, Chromium build) · app built from github.com/v57a/hub-web (bun 1.3.14, vite 8.0.8) · local preview http://127.0.0.1:4173 · viewports 1440x900 and 390x844

**Scope:** manual functional testing of the toolbar, home, pricing and feedback pages, plus layout/responsive, build and basic accessibility checks.

**Result:** 37 checks — 19 passed, 17 failed, 1 to verify. 6 test cases written, 9 bugs reported.

## Checklist

| ID | Area | Check | Priority | Result | Notes |
|---|---|---|---|---|---|
| CL-01 | Toolbar | Toolbar renders on /, /pricing, /feedback (desktop 1440) | High | Pass | Fixed bar, radius 30px, 4 controls + logo |
| CL-02 | Toolbar | Logo / wordmark returns to the home page from every page | High | Pass | href="/" |
| CL-03 | Toolbar | "Pricing" opens /pricing | High | Pass | href="/pricing" |
| CL-04 | Toolbar | "Feedback" opens /feedback | High | Pass | href="/feedback" |
| CL-05 | Toolbar | Control "Download" performs an action | High | Fail | BUG-01: element is DIV, no href, no handler |
| CL-06 | Toolbar | Control "Open" performs an action | High | Fail | BUG-01: element is DIV, no href, no handler |
| CL-07 | Toolbar | All toolbar controls reachable with Tab | Medium | Fail | BUG-01: DIVs are skipped (tabindex -1); links are focusable |
| CL-08 | Toolbar | Page name shown: "Pricing" on /pricing, "Feedback" on /feedback | Low | Pass | pageName prop |
| CL-09 | Layout | No horizontal scroll at 390px on any page | Medium | Pass | documentElement.scrollWidth = 390 |
| CL-10 | Layout | Primary call to action stays available at 390px | High | Fail | BUG-05: Download/Open display:none below 680px |
| CL-11 | Home | Hero button "Download" performs an action | High | Fail | BUG-01: DIV class=button, tabindex -1 |
| CL-12 | Home | 8 platforms listed in the hero | Low | Pass | macOS, iOS, tvOS, visionOS, watchOS, Windows, Linux, Web |
| CL-13 | Home | Platform icon matches the platform name in the hero | Medium | Pass | Visually verified against the local build with assets: all 8 icons suit their labels (Apple logo for macOS, watch for watchOS, TV, headset for visionOS, compass for Web, Windows panes, penguin for Linux) |
| CL-14 | Home | Get started: switching macOS / Docker / Windows changes instructions | High | Pass | macOS: curl + bunx; Docker: docker pull/run; Windows: Powershell irm |
| CL-15 | Home | Get started: terminal type matches the chosen platform | Low | Pass | Terminal vs Powershell |
| CL-16 | Home | Community block shows 4 cards (GitHub, Reddit, Discord, Twitter) | Low | Pass | Rendered 4 cards |
| CL-17 | Home | Each community card opens its own resource | Medium | Fail | BUG-04: all four href="https://github.com/v57" |
| CL-18 | Home | Feature grid shows 6 cards with section titles and tags | Low | Pass | Channel, Hub Lite, Hub Pro, Hub Service, Hub Launcher, Hub Web |
| CL-19 | Home | "How Hub works" grid shows 5 cards | Low | Pass | Worker SDK, Production control, Services SDK, Transport, Operations |
| CL-20 | Home | All images on the page load | High | Fail | BUG-03: 39 of 39 images return 404 |
| CL-21 | Pricing | Two plans with feature lists | Low | Pass | Hub Lite and Hub Pro, both Free |
| CL-22 | Pricing | Control "Download Lite" performs an action | High | Fail | BUG-02: DIV buttonget2, no href, no handler |
| CL-23 | Pricing | Control "Download Pro" performs an action | High | Fail | BUG-02: DIV buttonget4, no href, no handler |
| CL-24 | Pricing | Support links open the right resources | Medium | Pass | Discord/Patreon/Boosty/GitHub/Buy Me a Coffee/Ko-Fi verified |
| CL-25 | Pricing | USDT / BTC lead to payment details | Low | To verify | Currently tether.to and bitcoin.org — informational pages, no address or QR; needs a product decision, not a fix |
| CL-26 | Feedback | Composer accepts typed text | High | Pass | Input accepts value, placeholder shown |
| CL-27 | Feedback | Composer "plus" submits the entry | High | Fail | BUG-06: DIV with hover animation, no handler; text is not sent or cleared |
| CL-28 | Feedback | Tag click selects/deselects and moves the tag to the front | Medium | Pass | aria-pressed flips, clear icon appears |
| CL-29 | Feedback | Filter chips filter the card list | High | Fail | BUG-07: list unchanged after clicking Bugs (8 cards before and after) |
| CL-30 | Feedback | Sort "new" / "best" changes the order | High | Fail | BUG-07: order identical after clicking best |
| CL-31 | Feedback | Cards counter matches the displayed cards | Medium | Fail | BUG-07: label reads "38832 CARDS" while 8 cards are rendered |
| CL-32 | Feedback | Card status labels render (Released / Declined / Approved ...) | Low | Pass | 5 status variants shown |
| CL-33 | Cross-page | Browser tab shows a page title | Medium | Fail | BUG-08: document.title is empty on /, /pricing, /feedback |
| CL-34 | Cross-page | Page has a semantic heading structure (h1/h2) | Low | Fail | BUG-08: 0 headings on all three pages |
| CL-35 | Cross-page | Informative images carry alt text | Low | Fail | BUG-08: 37 of 37 images have alt="" |
| CL-36 | Cross-page | No console errors or failed requests on load | High | Fail | BUG-03: 72 failed requests (all 404), console full of 404 lines |
| CL-37 | Build | Fresh clone installs, builds and serves all three pages | High | Pass | bun install → bun run build → bun run preview, all pages 200 |

## Test cases

### TC-01 — Toolbar links navigate between the three pages

**Priority:** High · **Status:** Pass

**Preconditions:** Build served at http://127.0.0.1:4173, viewport 1440x900

**Steps:**
1. Open http://127.0.0.1:4173/
2. Click "Pricing" in the top bar
3. Click "Feedback" in the top bar
4. Click the "Hub" wordmark in the top bar

**Expected:** Step 2 opens /pricing and the toolbar shows the page name Pricing. Step 3 opens /feedback with the page name Feedback. Step 4 returns to / and the hero platforms list is visible again.

**Actual:** Matches expected. Each navigation is instant, no reload errors, active page name is correct.

### TC-02 — Toolbar controls "Download" and "Open" trigger their action

**Priority:** High · **Status:** Fail · **Bug:** BUG-01

**Preconditions:** Home page open, DevTools available

**Steps:**
1. Click "Download" in the top bar
2. Click "Open" in the top bar
3. Press Tab repeatedly from the address bar and watch the focus ring
4. Inspect both controls in DevTools (Elements tab)

**Expected:** A download or open flow starts (page opens, file dialog appears, or an obvious visual confirmation). All toolbar controls, including Download and Open, receive focus in Tab order and show a focus ring. Each control is an <a> with href or a <button> with a handler.

**Actual:** Nothing happens on either click. Both controls are <div class="toolbar__action ..."> with no href, no event listener and tabindex = -1, so Tab skips them. Repeatable on /, /pricing and /feedback.

### TC-03 — Home page "Get started in seconds" switches instructions per platform

**Priority:** High · **Status:** Pass

**Preconditions:** Home page open, section is in view

**Steps:**
1. Read the block under "Get started in seconds" (default macOS)
2. Click the "Docker" chip
3. Click the "Windows" chip
4. Check the selected-chip style after each click

**Expected:** The instruction list and the terminal name change with the selected platform: macOS shows the two terminal commands, Docker shows the docker pull/run pair with its description, Windows shows the Powershell command. Only the clicked chip is highlighted.

**Actual:** Works as expected. macOS → 'Install Bun / curl -fsSL https://bun.sh/install | bash' + 'Run / bunx v57/hub'; Docker → docker pull v57dev/hub, docker run -d -p 1997:1997 --name Hub v57dev/hub; Windows → Powershell command. Selected state follows the click.

### TC-04 — Feedback page: filter chips and sort options change the card list

**Priority:** High · **Status:** Fail · **Bug:** BUG-07

**Preconditions:** Feedback page open, 8 cards rendered, counter label visible

**Steps:**
1. Note the number and order of the cards and the counter label
2. Click the filter chip "Bugs"
3. Compare the card list and the counter with step 1
4. Click "best" in the sort block (Sort: new | best)
5. Compare the card order with step 1

**Expected:** The list is reduced to bug-related entries or the list stays complete with an explicit active filter applied to the data; the counter reflects the number of entries shown. Sorting re-orders the cards by the chosen key and the chosen sort option is highlighted.

**Actual:** Only the chip highlight changes (aria-pressed="true"). The list keeps the same 8 cards in the same order, the counter still reads "38832 CARDS". Clicking "best" changes the highlight and nothing else — the order is byte-identical to the default.

### TC-05 — Feedback composer submits a new entry

**Priority:** High · **Status:** Fail · **Bug:** BUG-06

**Preconditions:** Feedback page open, composer field visible with the placeholder 'Describe your issue or suggestion'

**Steps:**
1. Click the input field and type 'sample text'
2. Click the round '+' button on the right of the field
3. Press Enter in the field
4. Refresh the page and look for the submitted entry

**Expected:** The entry is submitted: a new card appears, or an explicit confirmation/validation message is shown; the input is cleared or keeps the text with a visible state change.

**Actual:** Nothing happens. The '+' is a <div class="buttonicon"> with a hover animation and cursor:pointer but no click handler, so the text stays in the field untouched and no card is created. Enter does nothing.

### TC-06 — Home page community cards open the matching resource

**Priority:** Medium · **Status:** Fail · **Bug:** BUG-04

**Preconditions:** Home page open, community block in view

**Steps:**
1. Read the four cards: GitHub, Reddit, Discord, Twitter
2. Read the href attribute of each card link
3. Open each card in a new tab and note the destination

**Expected:** GitHub opens the repository, Reddit the subreddit, Discord the invite, Twitter the account — each card leads to its own resource as the label promises.

**Actual:** All four cards carry href="https://github.com/v57". Reddit, Discord and Twitter lands on the GitHub profile, which contradicts the card text "@v57/hub · Discussions & feedback", "· Chat & updates", "· Announcements & releases".

## Bug reports

### BUG-01 — Toolbar controls "Download" and "Open" are dead on all pages (no action, unreachable by keyboard)

**Severity:** Major · **Priority:** High · **Reproducibility:** 100% (5 of 5 runs)

**Environment:** macOS, Chrome 141 (Playwright, Chromium build) · app built from github.com/v57a/hub-web (bun 1.3.14, vite 8.0.8) · local preview http://127.0.0.1:4173 · viewports 1440x900 and 390x844

**Preconditions:** Any page of the site opened

**Steps to reproduce:**
1. Open http://127.0.0.1:4173/
2. Click "Download" in the top bar
3. Click "Open" in the top bar
4. Press Tab through the page from the address bar
5. Inspect both elements in DevTools

**Expected result:** Both controls start their flow (download / open). They take part in the Tab order and can be activated with Enter or Space, since they look like the primary calls to action of the site.

**Actual result:** Nothing happens on click. Both are <div class="toolbar__action toolbar__action--solid|--outline"> without href or click handler, tabindex = -1, so keyboard users cannot reach them at all. The same two controls behave identically on /pricing and /feedback, and the hero button "Download" on the home page is the same dead DIV (class="button").

**Evidence:** DOM dump: tag DIV, href null, tabindex -1. Toolbar config (src/lib/components/toolbar.ts) defines Download and Open without an href, so Toolbar.svelte renders them as <div> instead of <a>.

**Suggested fix:** Add an href (or a click handler) to the Download and Open actions, or render them as disabled controls with an explicit "coming soon" state. Same fix for the hero Download button and for the pricing blocks.

**Impact:** The main call to action of the product does nothing; the page can only be navigated by the two secondary links.

### BUG-02 — Pricing page: "Download Lite" and "Download Pro" buttons do nothing

**Severity:** Major · **Priority:** High · **Reproducibility:** 100% (3 of 3 runs)

**Environment:** macOS, Chrome 141 (Playwright, Chromium build) · app built from github.com/v57a/hub-web (bun 1.3.14, vite 8.0.8) · local preview http://127.0.0.1:4173 · viewports 1440x900 and 390x844

**Preconditions:** /pricing opened

**Steps to reproduce:**
1. Open http://127.0.0.1:4173/pricing
2. Click "Download Lite"
3. Click "Download Pro"
4. Tab through the plan cards

**Expected result:** The chosen plan is downloaded or the user is sent to the download page; both controls are focusable and announce themselves as buttons or links.

**Actual result:** Both are <div class="buttonget2"> and <div class="buttonget4"> with no href and tabindex = -1. Click does nothing; the page contains no <button> element at all, so the whole pricing page is non-interactive apart from the support links in the toolbar block.

**Evidence:** Element dump on /pricing: {tag: DIV, href: null, tabindex: -1} for both labels; document.querySelectorAll('button').length === 0.

**Suggested fix:** Wrap both CTAs in <a href> pointing to the real download target or convert them to <button> with a handler.

**Impact:** A user who decides to download from the pricing page cannot proceed.

### BUG-03 — Fresh clone renders with all images broken: the whole static/ folder is excluded from the repository

**Severity:** Major · **Priority:** High · **Reproducibility:** 100% (clean clone, 2 runs)

**Environment:** macOS, Chrome 141 (Playwright, Chromium build) · app built from github.com/v57a/hub-web (bun 1.3.14, vite 8.0.8) · local preview http://127.0.0.1:4173 · viewports 1440x900 and 390x844

**Preconditions:** Clean machine with bun installed

**Steps to reproduce:**
1. git clone https://github.com/v57a/hub-web.git
2. cd hub-web && bun install
3. bun run build && bun run preview --port 4173
4. Open http://127.0.0.1:4173/ and open DevTools → Network
5. Repeat for /pricing and /feedback

**Expected result:** The page looks like the design: platform icons, feature icons, community logos, status badges. No failed requests in the network log.

**Actual result:** All 39 images on the home page fail with 404 (72 failed requests across the site: /files/platforms/*, /files/features/*, /files/apps/*, /files/status/*, /files/icon/*, /Button/*). The console is filled with 404 lines. Cause: .gitignore excludes static/ and tests/, so the asset folder never reaches the repository; a reviewer who clones the project sees a page with no icons at all.

**Evidence:** Failed requests list from the network log; .gitignore contains the lines static/ and tests/.

**Suggested fix:** Remove static/ from .gitignore and commit the assets (or move them under a tracked folder such as public/ that SvelteKit serves).

**Impact:** The published artifact cannot be reviewed as designed; every screenshot and every visual check is meaningless until fixed.

### BUG-04 — Home page community cards all lead to the GitHub profile

**Severity:** Average · **Priority:** Medium · **Reproducibility:** 100% (3 of 3 runs)

**Environment:** macOS, Chrome 141 (Playwright, Chromium build) · app built from github.com/v57a/hub-web (bun 1.3.14, vite 8.0.8) · local preview http://127.0.0.1:4173 · viewports 1440x900 and 390x844

**Preconditions:** Home page opened, community block visible

**Steps to reproduce:**
1. Scroll to the community block (GitHub, Reddit, Discord, Twitter)
2. Read the href of each of the four cards
3. Open Reddit, Discord and Twitter cards

**Expected result:** Each card opens its own resource: the GitHub repository, the subreddit, the Discord invite and the X/Twitter account.

**Actual result:** All four cards carry href="https://github.com/v57". A user following the Reddit, Discord or Twitter card lands on the GitHub profile.

**Evidence:** DOM dump: [{GitHub, https://github.com/v57}, {Reddit, https://github.com/v57}, {Discord, https://github.com/v57}, {Twitter, https://github.com/v57}]. Hardcoded in src/lib/components/home/HomeCommunityGrid.svelte: href="https://github.com/v57" is passed to every card in the loop.

**Suggested fix:** Move the href into the communityLinks data (src/lib/components/home/content.ts) and pass link.href to IconLink.

**Impact:** Three of four community entry points lead somewhere the label does not promise.

### BUG-05 — Below 680px the primary call to action disappears from the toolbar

**Severity:** Average · **Priority:** Medium · **Reproducibility:** 100% (2 of 2 runs)

**Environment:** macOS, Chrome 141 (Playwright, Chromium build) · app built from github.com/v57a/hub-web (bun 1.3.14, vite 8.0.8) · local preview http://127.0.0.1:4173 · viewports 1440x900 and 390x844 · mobile viewport 390x844

**Preconditions:** Home page opened, viewport width 390px

**Steps to reproduce:**
1. Resize the window to 390px (or open the device toolbar with an iPhone preset)
2. Look at the toolbar
3. Try to start a download from the top of the page

**Expected result:** The main call to action ("Download") stays reachable on mobile — as a compact button, an icon button or inside a menu.

**Actual result:** Both the solid "Download" and the outline "Open" controls get display:none below 680px (media query in Toolbar.svelte). Only the two text links Pricing and Feedback remain, so on a phone the main action of the site is not available in the top bar.

**Evidence:** getComputedStyle on the toolbar actions at 390px: Download → display none, Open → display none, width 0.

**Suggested fix:** Keep the solid action visible on mobile (shrink the label or switch it to an icon).

**Impact:** Mobile users, which is most of the traffic for such a landing page, lose the primary call to action.

### BUG-06 — Feedback page: the round '+' button does not submit the typed text

**Severity:** Average · **Priority:** High · **Reproducibility:** 100% (4 of 4 runs)

**Environment:** macOS, Chrome 141 (Playwright, Chromium build) · app built from github.com/v57a/hub-web (bun 1.3.14, vite 8.0.8) · local preview http://127.0.0.1:4173 · viewports 1440x900 and 390x844

**Preconditions:** /feedback opened

**Steps to reproduce:**
1. Type 'sample text' into the composer field
2. Click the round '+' button
3. Press Enter in the field
4. Refresh the page and search for the entry

**Expected result:** The entry is submitted and confirmed (new card, toast, or validation message); the field is cleared; the same action is available by keyboard.

**Actual result:** Nothing happens. The button is <div class="buttonicon"> with a hover animation (the icon rotates 90° on hover) and cursor:pointer, but it has no click handler and is not focusable. The typed text stays in the field, no card is created, no feedback of any kind. The control looks interactive and behaves as decoration.

**Evidence:** Element dump: DIV class="buttonicon" → outerHTML contains only an <img src="/Button/plus.svg">; input value after the click is still "sample text". src/lib/components/feedback/FeedbackComposer.svelte renders the element as a div without a handler.

**Suggested fix:** Turn the '+' into a <button type="submit"> inside a form, wire the submit (or explicitly mark the composer as a demo with a disabled state).

**Impact:** The one interactive feature of the feedback page cannot be completed; the fake affordance makes the site look broken rather than unfinished.

### BUG-07 — Feedback page: filter chips, sort options and the cards counter do not affect the list

**Severity:** Average · **Priority:** High · **Reproducibility:** 100% (3 of 3 runs)

**Environment:** macOS, Chrome 141 (Playwright, Chromium build) · app built from github.com/v57a/hub-web (bun 1.3.14, vite 8.0.8) · local preview http://127.0.0.1:4173 · viewports 1440x900 and 390x844

**Preconditions:** /feedback opened, 8 cards rendered

**Steps to reproduce:**
1. Note the card order and the label above the list
2. Click the filter chip "Bugs"
3. Compare the list with step 1
4. Click "best" in the Sort block
5. Compare the order with step 1
6. Count the cards and compare with the counter label

**Expected result:** Choosing a category filters the entries (or applies an explicit active filter state to the data), sorting re-orders the entries, and the counter shows the number of entries actually displayed.

**Actual result:** Clicking "Bugs" only highlights the chip (aria-pressed becomes true) — the same 8 cards stay in the same order. Clicking "best" also only changes the highlight; the order is unchanged. The counter above the list is hardcoded as "38832 CARDS" while 8 cards are rendered.

**Evidence:** Card title sequence before and after the chip click is identical (About this platform > User Feedback > User Feedback > Bug Reports > User Tutorials > User Feedback > Community Guidelines > Platform Updates). The parent page passes filters to FeedbackFilterBar but does not listen to its select/sort events and does not filter feedbackCards; the counter is a constant in src/lib/components/feedback/content.ts.

**Suggested fix:** Handle the select/sort events in src/routes/feedback/+page.svelte, filter/sort the array and bind the real number of entries to the counter.

**Impact:** Two visible controls and a statistics label report state that does not exist — a user cannot narrow down 38 832 entries, and the counter contradicts the list.

### BUG-08 — No page title in the browser tab, no semantic headings, no alt text for 37 images

**Severity:** Minor · **Priority:** Low · **Reproducibility:** 100% (3 of 3 runs)

**Environment:** macOS, Chrome 141 (Playwright, Chromium build) · app built from github.com/v57a/hub-web (bun 1.3.14, vite 8.0.8) · local preview http://127.0.0.1:4173 · viewports 1440x900 and 390x844

**Preconditions:** Any page opened

**Steps to reproduce:**
1. Open / , /pricing , /feedback and look at the browser tab
2. Run document.title in the console on each page
3. Run document.querySelectorAll('h1,h2,h3,h4').length on each page
4. Run document.querySelectorAll('img[alt=""]').length / document.querySelectorAll('img').length

**Expected result:** Each page has a unique <title> ("Hub — ...", "Pricing — Hub", "Feedback — Hub"), one h1 per page and h2 for sections; informative images (platform and status icons, logos) have alt text or aria-label.

**Actual result:** document.title is an empty string on all three pages (bookmarks and tabs show a blank or URL), the heading count is 0 on every page (everything is div/span), and 37 of 37 images on the home page carry alt="".

**Evidence:** Console: document.title === ''; headings h1..h4 === 0; imgs total 37, emptyAlt 37.

**Suggested fix:** Add <svelte:head><title>…</title></svelte:head> per route, mark up section titles as h1/h2, and give meaningful alt text to informative icons.

**Impact:** Screen reader and search engine visibility suffer; several browser tabs of the site are indistinguishable.

### BUG-09 — Asset filenames do not describe their content: 6 of 8 platform icons are mislabelled (cosmetic, no visual defect)

**Severity:** Minor · **Priority:** Low · **Reproducibility:** 100% (4 of 4 files checked one by one)

**Environment:** macOS, Chrome 141 (Playwright, Chromium build) · app built from github.com/v57a/hub-web (bun 1.3.14, vite 8.0.8) · local preview http://127.0.0.1:4173 · viewports 1440x900 and 390x844 · verified on the local copy with assets (Desktop/projects/hub-web), dev server http://127.0.0.1:5177

**Preconditions:** Local copy of the project including static/files/platforms/*.svg

**Steps to reproduce:**
1. Open static/files/platforms/ and render every SVG large, labelled with its filename
2. Note what each file actually draws
3. Compare with the platform names used in the hero (src/lib/components/home/content.ts, platforms array)
4. Compare the result with the icons the hero shows next to each label

**Expected result:** Each file name matches its content: ios.svg draws the iOS symbol, macos.svg the Apple logo, watchos.svg a watch, linux.svg the penguin, web.svg a browser/globe, visionos.svg a headset.

**Actual result:** The files are cross-wired: ios.svg draws the Apple logo, macos.svg draws the penguin (Tux), watchos.svg draws a phone, linux.svg draws a watch, web.svg draws a headset/visor, visionos.svg draws a compass. Only tvos.svg (a TV) and windows.svg (four panes) match their names. Because the same wrong pairing is used in the platforms array, the hero displays the right picture next to every label — macOS shows the Apple logo, watchOS the watch, visionOS the visor, Web the compass, Linux the penguin. So there is no visible defect on the site; the defect is in the asset names and in the mapping, which will mislead the next person who edits it.

**Evidence:** Icon audit renders (evidence/icon-audit-3x.png, evidence/BUG-09-hero-rows-large.png): ios.svg = Apple logo, macos.svg = penguin, watchos.svg = phone, linux.svg = watch, web.svg = visor, visionos.svg = compass, tvos.svg = TV, windows.svg = panes. viewBox sizes also travel with the wrong files (ios.svg and macos.svg both 0 0 12 14; linux.svg 0 0 10 14 matches the watch). test/home-content.test.ts asserts the current mismatched mapping, so the test locks the defect in.

**Suggested fix:** Rename the files to match their content (or swap the contents) and update the src values in the platforms array plus the expectations in test/home-content.test.ts. Renaming is the safer option: it changes no visual output.

**Impact:** No user-visible defect today. The risk is maintenance: anyone who trusts the filename will 'fix' the site into showing the wrong icon, and the existing unit test protects the wrong state.

## Not covered

- Backend and API: the site is a static mock-up, there is no server side to test.
- Real download flow: no download target exists yet, so only the presence of the action could be checked.
- Cross-browser and cross-device: Chrome only (Playwright Chromium build), viewports 1440x900 and 390x844.
- Localisation and content proofreading beyond the checked labels.
