# Academic context and dependent scope selectors

Use one explicit context from academic year through board, medium, stage, class, and division
where the owning workflow requires those levels. Context selection is presentation/state, not
authorization; retain backend tenant/UserScope enforcement and existing permission checks.

## Existing components and boundaries

| Scope | Source / actual API |
| --- | --- |
| Global academic context | [AcademicContextInput](../../../../src/layouts/components/global-academic-search/academic-context-input.tsx): controlled `options`, `value`, `open`, callbacks, `isYearOnly`; async `onChange` belongs to its owner |
| Board and medium from current Redux year | [BoardMediumDropdown](../../../../src/components/boardMediumDropdown/index.tsx): `value`, `onChange(option)`, `size`, `minWidth` |
| Board, medium, stage from current Redux year | [BoardMediumStageDropdown](../../../../src/components/boardMediumStageDropdown/index.tsx): same shape with `stageId` |
| Student academic-year scope | [use-student-academic-scope](../../../../src/hooks/use-student-academic-scope.ts); preserve its owning student/session contract |
| Class/division/subject fields | Existing feature adapters plus [CustomSelect](custom-select.md) and [searchable dropdowns](searchable-dropdowns.md) |

## Rules

- Display the active context near the data it controls, with persistent labels. Distinguish global
  shell context from a local report/form filter; do not mutate one merely to satisfy the other.
- Keep parent-to-child order where dependencies apply. A parent change invalidates only affected
  descendants, requests, and cached display. Do not retain a subject or division from another class.
- Resolve values by stable IDs, including the full compound board/medium/stage identity. Names
  may repeat across contexts. Keep URL values, Redux context, query keys, and displayed labels aligned.
- Show a prerequisite explanation before querying or enabling dependent controls. Distinguish
  loading, no configured options, no permission, and request failure; an empty list is not all four.
- Preserve a saved selection while options load; validate membership after the scoped result is
  known. Ignore stale responses from the previous context. Do not erase a draft during refresh.
- Global context changes use the established dirty-navigation owner and busy lock. Do not create
  another guard or silently reset a form because the shell changed.
- The two legacy board wrappers auto-select the first option when `value` is absent. This is
  current behavior, not a default for every new form/report. They have no `disabled`, `error`,
  loading, or arbitrary input-prop API; report capability gaps instead of inventing props.
- Both wrappers use a filled context field and fixed minimum-width defaults. Do not transplant
  those defaults into every outlined form field or let them cause mobile document overflow.

## Images and checks

![Local Subject workspace showing global academic context above the module header](../assets/local-subject-workspace.jpg)

Use [the local header](../assets/local-subject-workspace.jpg) for global year/board/medium context
and [the calendar form](../assets/local-calendar-form.jpg) for local class/division scope.
These do not establish every dependent menu or an authorization outcome. Check parent changes,
duplicate names, unavailable prior values, request races, reload/history, dirty navigation, and
responsive labeling. [Capture metadata](image-references.md#local-app-captures-22-october-2026).
