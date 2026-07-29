# Healer Policy

Automated healing is review-only. A repair may be proposed for `TEST_BUG`, `LOCATOR_DRIFT`, `TEST_DATA_FAILURE`, or `FLAKY_RACE_CONDITION`.

Human approval is required for requirement changes, visual changes, accessibility expectations, permission expectations, and any production code change.

Never auto-repair product bugs, tenant isolation failures, security failures, data corruption, removed assertions, skipped tests, arbitrary waits, or changed financial/academic calculations.

Maximum repair attempts per failure: 2.
