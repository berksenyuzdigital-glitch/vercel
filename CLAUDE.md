# Project instructions

## Visual self-check after UI changes

This environment ships a pre-installed Chromium browser wired up for Playwright
(`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`) — no `playwright install` needed.

After making any change to a page or component, verify it visually before
reporting the task done:

1. Launch/refresh the app (see the `run` skill for how this project starts).
2. Open the changed page in the browser and take a screenshot.
3. Look at the screenshot: layout breakage, overlapping elements, unreadable
   contrast, missing responsive behavior, broken animations.
4. Fix anything wrong before handing the result back — don't assume code that
   compiles is code that looks right.
5. Show a before/after screenshot pair when reporting the change.

Skip only when there is no way to render the page (pure backend/CLI change).
