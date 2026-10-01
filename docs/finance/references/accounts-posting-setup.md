# Accounts posting setup screen

`/finance/settings/posting-automation` now shows the school's financial periods, first posting date, cash Asset account, payment destination rules, and API readiness issues. It uses the existing Account Head and masked Bank Account options and the exact `Finance.Accounts.Settings.PostingSetup.View/Edit` permissions. Account Heads links to this screen when the viewer has permission.

The screen labels posting as **Not active** until the backend reports otherwise. It does not claim that a Collection or refund visible in Income & Expenses has been posted to the General Accounts journal. The remaining source allocation, refund treatment, and journal-linked register work must be completed before live posting can be enabled.
