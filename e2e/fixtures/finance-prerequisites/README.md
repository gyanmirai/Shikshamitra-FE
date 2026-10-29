# Finance prerequisite fixture

Uses the production shared prerequisite state, Proration and Refund Policy drawers, manual Income and Expense forms and Cash Deposit dialog with synthetic scoped lookups. It sends no backend requests or writes.

Run `node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js --config e2e/fixtures/finance-prerequisites/vite.config.mts` from the frontend root.

Open port 4197 with `?view=proration`, `?view=refund`, `?view=income&missing=category`, `?view=expense&missing=bank`, or `?view=deposit`. Add `dark`, `readonly`, `slow` or `error` flags to check themes, setup-link permissions and lookup-state precedence. Complete synthetic setup refreshes the same mounted form without resetting its entered values.
