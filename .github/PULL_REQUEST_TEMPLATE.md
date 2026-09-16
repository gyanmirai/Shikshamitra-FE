## Change and evidence

Describe the root cause, scope, related backend PR, and exact validation results.

## Security review

- [ ] Read the [backend security standard](https://github.com/gyanmirai/Shikshamitra-BE/blob/main/docs/common/security/permission-consistency.md).
- [ ] Reviewed incidental permission/navigation changes and reverts, not only the feature label.
- [ ] Catalogue, independent toggles, route/action guards, and backend enforcement agree.
- [ ] Direct and inherited access are distinguished; only changed direct grants are saved and verified.
- [ ] No fixed CRUD lists, implicit action bundles, development bypasses, or role-name shortcuts.
- [ ] Security Regression checks passed in both repositories where applicable.
- [ ] Every server action remains reachable, including flat catalogues and unmapped future actions; bulk operations include search-hidden and collapsed entries.
- [ ] Existing Security layout and separate dialogs are retained unless a redesign was explicitly approved.
- [ ] Allowed/denied, dirty guard, keyboard, responsive, and browser evidence is attached or marked Not run.
- [ ] No sensitive audit exports, auth state, screenshots with personal data, or generated logs are committed.

Screenshots alone are not security sign-off.
Branch protection and live access repairs require separate authorization.
