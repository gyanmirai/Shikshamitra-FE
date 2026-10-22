# Seating allocation (compatibility)

| Metadata | Value |
| --- | --- |
| UI heading / identity | Detailed legacy allocation editor |
| Navigation | Examination > Seating Plan > allocate |
| Route pattern | `/academic/seatallocation/[examId]/allocate` |
| Discovery status | Compatibility route; browser discovery unverified |
| Page source | [src/app/(auth-route)/academic/(examination)/seatallocation/[examId]/allocate/page.tsx](<../../../../../../../src/app/(auth-route)/academic/(examination)/seatallocation/[examId]/allocate/page.tsx>) |
| Owning screen | [src/screens/examination/seatingPlan/pages/SeatingAllocationPage.tsx](<../../../../../../../src/screens/examination/seatingPlan/pages/SeatingAllocationPage.tsx>) |
| Case authoring | Not started |

## Discovery notes

The page uses SeatingWorkspaceHeader with a data-dependent exam identity rather than a fixed menu label. This is the detailed legacy editor, not the primary guided flow.

`[examId]` is a dynamic parameter; use a real QA exam identifier when case authoring begins.
[Examination route documentation](<../../../../../../../docs/examination/routes.md>) defines guided and legacy entry points.

No test cases or edge cases have been authored for this screen in this library.

[Academics index](<../../../README.md>) | [Route inventory](<../../../inventory.md>)
