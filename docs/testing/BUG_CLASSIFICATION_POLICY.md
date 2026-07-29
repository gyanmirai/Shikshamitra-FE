# Bug Classification Policy

| Category                   | Meaning                                                                        |
| -------------------------- | ------------------------------------------------------------------------------ |
| `PRODUCT_BUG`              | Normal user input or supported workflow produces wrong product behavior.       |
| `TEST_BUG`                 | The test expectation, selector, or setup is wrong.                             |
| `LOCATOR_DRIFT`            | Approved UI copy or accessible name changed while behavior remains correct.    |
| `TEST_DATA_FAILURE`        | Seed data is missing, stale, closed, or polluted.                              |
| `ENVIRONMENT_FAILURE`      | App, browser, network, or dependency is unavailable.                           |
| `API_UNAVAILABLE`          | Required API cannot be reached.                                                |
| `AUTHENTICATION_FAILURE`   | Login or session state cannot be established.                                  |
| `PERMISSION_FAILURE`       | A permitted action is denied or restricted action is allowed.                  |
| `TENANT_ISOLATION_FAILURE` | Cross-tenant read/write/delete exposure. Release blocking.                     |
| `FLAKY_RACE_CONDITION`     | Failure is caused by missing event synchronization or nondeterministic timing. |
| `VISUAL_CHANGE`            | Snapshot or layout changed and requires review.                                |
| `ACCESSIBILITY_FAILURE`    | Automated or manual accessibility expectation failed.                          |
| `REQUIREMENT_CHANGE`       | Product behavior changed intentionally and catalogue needs approval.           |
| `UNKNOWN`                  | Evidence is insufficient. Keep failed.                                         |

Do not classify all unknown intermittent failures as flaky.
