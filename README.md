# Sunday Night Lights — Website v1

This is a working static-site starter, built from the approved SNL homepage design and the actual team logos supplied by the league. It is **not live** and does not connect to Excel, OneDrive, or GameChanger yet.

## Files
- `index.html` — approved homepage structure, four featured story cards, scoreboard, matchup preview, standings, and leaders.
- `schedule.html`, `standings.html`, `playoffs.html`, `teams.html`, `highlights.html`, `stats.html`, `registration.html` — additional sections.
- `team.html?team=buffaloes` — team profile example. Other team IDs: `iht`, `morsl`, `outcasts`, `maul`, `raccoons`.
- `article.html?id=trade` — story example. Other IDs: `opener`, `expansion`, `batbros`.
- `js/data.js` — the current sample/verified-score snapshot; update this to change the display data.
- `js/main.js` and `css/style.css` — page components and styling.
- `assets` — real team logos, extracted matchup artwork, and original SNL dome banner with season copy covered.

## Preview
Open `index.html` in a browser. All pages use local relative links and do not require a build process. Online, the site can be published using GitHub Pages.

## Deploy to a new GitHub Pages repository
1. Create the dedicated website repository (`SundayNightLights.github.io` under the SundayNightLights account, or another configured Pages repository).
2. Add **the contents** of this folder at the repository root (not the folder itself).
3. In repository Settings > Pages, deploy from the default branch `/ (root)`.
4. Do not overwrite or change the existing `SNL-Calendar-Hub` repo. The calendar subscribe button links to its existing page.

## Not connected or ready for public collection
- Live Excel / OneDrive / GameChanger integrations and official standings: **not configured**.
- Instagram and YouTube profiles: **links not provided**, displayed as inactive icons.
- Player registration and waiver: **not active**, collects no personal information.
- Leaderboards: intentionally blank until verified player statistics are supplied.
- Week 1: five visible results from the approved scoreboard; sixth game intentionally marked pending.
- Week 2: six matchups from the design reference. Full 10-week schedule has not yet been imported.
- Stories: headlines/short previews based on league-provided topics, not full fact-checked articles.
- Banner: the old season-specific title has been covered using image processing, preserving the original logo and dome photography.

The website is expandable: add the actual links, photos, full schedule, roster data, and integrations later.
