# Allocation Review

| Metadata | Value |
| --- | --- |
| UI heading / identity | Allocation Review |
| Navigation | Examination > Seating Plan > review |
| Route pattern | `/academic/seatallocation/[examId]/review` |
| Discovery status | Compatibility route; browser discovery unverified |
| Page source | [src/app/(auth-route)/academic/(examination)/seatallocation/[examId]/review/page.tsx](<../../../../../../../src/app/(auth-route)/academic/(examination)/seatallocation/[examId]/review/page.tsx>) |
| Owning screen | [src/screens/examination/seatingPlan/pages/SeatingReviewPage.tsx](<../../../../../../../src/screens/examination/seatingPlan/pages/SeatingReviewPage.tsx>) |
| Case authoring | Not started |

## Discovery notes

The source breadcrumb heading is "Allocation Review". This route remains available for existing plans; it is not a separate menu entry.

`[examId]` is a dynamic parameter; use a real QA exam identifier when case authoring begins.
[Examination route documentation](<../../../../../../../docs/examination/routes.md>) defines guided and legacy entry points.

No test cases or edge cases have been authored for this screen in this library.

[Academics index](<../../../README.md>) | [Route inventory](<../../../inventory.md>)
