# Student Setup Guide Verification

Runs the actual StudentSetupScreen, shared Academic-style setup shell, guide catalog, hooks,
API endpoints and lazy native setting managers. Synthetic identity and academic context adapters
provide year-a/year-b, board-a, medium-a, class-a and division-a. No real school data is accessed.

```bash
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js --config e2e/fixtures/student-setup-guide/vite.config.mts
```

Open http://127.0.0.1:4189/student/setup in the Codex in-app browser. Query flags: `configured`,
`readonly`, `limited`, `denied`, `loadError`, `conflict`, `dark`. Guide deep links use production
`stage`, `setting`, `guideYear` parameters. Flags persist as progress changes the URL.

Guide progress and visit markers exist only in browser memory. Native manager lookup/list reads
return synthetic empty results, with starter Records policy and empty numbering settings. Native
domain writes deliberately fail with safe feedback, retaining entered drafts. This verifies layout,
permission states, guide navigation, progress, context selection and open-editor locks. It does not
verify backend permissions, database persistence, saved domain mutations, live workflow-builder
routes, email, or production behavior. Full authenticated Next/API verification remains separate.
