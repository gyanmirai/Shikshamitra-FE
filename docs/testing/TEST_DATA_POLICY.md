# Test Data Policy

Academic E2E data must be deterministic and cleanup-safe.

- Use API setup for prerequisites wherever possible.
- Prefix every mutable test record with `e2e-{runId}-{workerId}`.
- Never delete records that do not contain the current E2E marker.
- Use unique subject names, exam names, homework titles, and receipt-like identifiers.
- Keep tests independent and retry-safe.
- Do not run destructive tests against production-like shared tenants without explicit approval.
- Block tenant-isolation tests until two safe E2E tenants and credentials are configured.
