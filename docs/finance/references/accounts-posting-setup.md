---
module: finance
domain: accounts
content_type: Reference
status: active
updated_on: 2026-10-02
owner: frontend-team
audience: humans-and-agents
---

# Accounts posting setup screen

`/finance/settings/posting-automation` explains the independent Income Categories, Expense Categories, and Bank Accounts configuration. Account Head selectors and cash Asset mappings are retired from the active setup UI. Operational collection and refund entries use [Income, expense, and bank routing](./income-expense-routing.md).

The screen labels posting as **Not active** until the backend reports otherwise. It does not claim that a Collection or refund visible in Income & Expenses has been posted to the General Accounts journal. The remaining source allocation, refund treatment, and journal-linked register work must be completed before live posting can be enabled.
