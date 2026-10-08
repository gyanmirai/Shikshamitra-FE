---
module: finance
domain: admin-request-auto-approval-browser-qa
content_type: Reference
status: partial
updated_on: 2026-10-07
owner: frontend-team
audience: humans-and-agents
---

# Admin request auto approval: local QA on 2026-10-07

This records the earlier QA run. A later charge-form change on the same date removed the income-category and receiving-bank inputs. Charge Category settings now supply the income mapping, and the bank is chosen at collection. The routing-input observations below describe the earlier implementation.

Environment: local frontend on `localhost:3000`, local API on `localhost:44332`, local PostgreSQL, DDVS test tenant. No production request was submitted.

| Check | Result | Evidence |
| --- | --- | --- |
| Admin charge confirmation in the browser | Passed | The dialog showed charge name/category, academic year, ₹1 per student, one student, ₹1 total, due date, and “This request will be approved automatically when you confirm.” |
| Original charge submit in the browser | Failed | API returned HTTP 400 `Finance:Routing:CategoryRequired`; the form had omitted `incomeCategoryId` and `receivingBankAccountId`. No record was created. |
| Corrected charge request to the local API | Passed | With both routing IDs, the API created charge `3a24283c-9c59-0d62-3f3e-45f6ab02dfc5` with `status=1`. A subsequent GET reported batch status 1, line status 1, and both routing IDs. The ₹1 test charge is labeled `E2E admin auto approval API 20261007`. |
| Test charge cleanup | Blocked | The normal void endpoint returned HTTP 403 for the test admin. The approved test record remains in the local DDVS database. |
| Refund, concession, non-admin browser flows, and updated charge form browser submit | Not completed | The restarted local frontend uses a production `AUTH_URL`; signing in redirected the browser to `app.gyanmirai.in/login`. Testing stopped at that redirect. A process-level local `AUTH_URL` override was rejected by the command approval system. |

At the time of this QA run, the charge form required and submitted income category and receiving bank account. It defaulted the income category from the selected charge category when available and preloaded saved routing on edit. Its admin help text described immediate approval. The focused validation suite passed (12 tests), the admin role helper passed (2 tests), TypeScript syntax transpilation found no diagnostics in changed source files, and targeted `git diff --check` passed. A full browser end-to-end pass is still required after the local auth callback is configured for `localhost:3000` or an isolated test deployment is provided.
