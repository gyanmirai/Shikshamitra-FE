# Coverage Policy

Coverage is calculated from `tests/catalog/academic.yaml`, not from file count alone.

Formulas:

- Automation Coverage = automated scenarios / planned scenarios.
- Pass Rate = passed executed scenarios / executed scenarios.
- Critical Coverage = automated critical scenarios / planned critical scenarios.

Skipped tests count as automated but not passed. Blocked scenarios do not count as passed.

Generate reports with:

```bash
npm run test:e2e:coverage
```
