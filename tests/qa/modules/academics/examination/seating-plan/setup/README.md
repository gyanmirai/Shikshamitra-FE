# Seating setup

| Metadata | Value |
| --- | --- |
| UI heading / identity | Seating plan workspace / Published seating |
| Navigation | Examination > Seating Plan > setup |
| Route pattern | `/academic/seatallocation/[examId]/setup` |
| Discovery status | Source-confirmed workflow; browser discovery unverified |
| Page source | [src/app/(auth-route)/academic/(examination)/seatallocation/[examId]/setup/page.tsx](<../../../../../../../src/app/(auth-route)/academic/(examination)/seatallocation/[examId]/setup/page.tsx>) |
| Owning screen | [src/screens/examination/seatingPlan/guided/guided-seating-page.tsx](<../../../../../../../src/screens/examination/seatingPlan/guided/guided-seating-page.tsx>) |
| Case authoring | Not started |

## Discovery notes

The source header is "Seating plan workspace" for drafts and "Published seating" after publication. The list launches this guided route. Preserve the documented step, planId, standardId, and status query parameters.

`[examId]` is a dynamic parameter; use a real QA exam identifier when case authoring begins.
[Examination route documentation](<../../../../../../../docs/examination/routes.md>) defines guided and legacy entry points.

No test cases or edge cases have been authored for this screen in this library.

[Academics index](<../../../README.md>) | [Route inventory](<../../../inventory.md>)
