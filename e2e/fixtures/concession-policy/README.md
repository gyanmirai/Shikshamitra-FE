# Concession policy UI verification

Run from the frontend root:

```powershell
node node_modules/vite/bin/vite.js --config e2e/fixtures/concession-policy/vite.config.mts
```

Open `http://127.0.0.1:4187` in the Codex in-app browser. This mounts the actual concession
workspace, table, create/edit form, details, audit and version drawers using the application
theme and synthetic in-memory policies. Every request stays in the fixture; no backend writes
or authentication data are used. The icon alias re-exports actual MUI icons without bundling
the entire icon catalogue.

Verify:

- Current/Archived tabs, search clearing, sticky status/actions, missing dates and Indian currency.
- Create/edit, required-field errors, fractional percentages and all calculation/scope options.
- Discard confirmation, interaction lock during saving, default-policy restrictions.
- Detail values, audit and version history, archive confirmation, restore to Draft.
- Expandable audit diffs, keyboard version selection, Latest badge, and version-search reset.
- Light/dark themes and narrow-screen layout, section help tooltips and a neutral Submit action.
- Drawer context in an info tooltip after the status badge, with no visible header subtitle.
- Policy name beside Status, Description beside the default toggle; both rows stack on mobile.
- No summary/preview/checklist sidebar or submit shortcut.

Request eligibility, amounts and paid-fee refunds remain part of the server-backed request
and refund workflows; the policy form contains only configuration fields.
