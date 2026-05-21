# Finance Charges API Integration Plan (Frontend)

## Objective
Integrate finance charge management screens with live backend APIs end-to-end, remove mock dependencies, align request/response contracts, and keep behavior stable for create, update, approve, reject, delete, list, and detail flows.

## Confirmed Decisions
- Charges List scope is included: student-wise charge history will be derived from backend charges APIs.
- Frontend mapping-first approach is preferred.
- Backend response DTO changes should be avoided unless a hard blocker appears.

## Backend Contract Reference
Primary backend contracts and routes:
- Charges controller: `GET/POST /api/app/charges`, `GET/PUT/DELETE /api/app/charges/{chargeId}`, `POST /api/app/charges/{chargeId}/approve`, `POST /api/app/charges/{chargeId}/reject`
- Create payload: `chargeCategoryId`, `purposeDescription`, `amount`, `dueDate`, `priority`, `studentId`, `additionalNotes?`
- Update payload: optional updates for category/description/amount/dueDate/priority/additionalNotes
- List query: `academicYearId`, `page`, `pageSize`, `search`, `status`, `sortBy`, `sortOrder`, `educationMediumId`, `boardId`

## Current Frontend Gaps Identified
1. Payload mismatch in create flow: UI currently includes scope fields in create body (`boardId`, `educationMediumId`, `standardId`, `divisionId`) that backend derives from `studentId`.
2. Type mismatch in UI models: field aliases are inconsistent (`grNo` vs `grNumber`, `rollNo` vs `rollNumber`, `chargeCategoryName` vs `categoryName`).
3. Priority label mismatch in detail cards: UI mapping does not fully match backend enum semantics (`Low=0`, `Medium=1`, `High=2`).
4. Student charges list uses mock endpoint (`/studentChargeData`) and is not wired to backend charges APIs.
5. Optimistic cache update for delete assumes wrong query draft shape and wrong cache args.

## Implementation Plan

### Phase 1: Stabilize API Layer
1. Update `src/redux/finance/ChargeManagement/chargeApi.ts` with strong request/response typing for list/detail/create/update/approve/reject/delete.
2. Ensure every `getCharges` call includes `academicYearId` and only valid optional filters.
3. Add frontend DTO mapper utilities to normalize backend fields into stable UI models.

### Phase 2: Wire Charges Request Flow
1. Update `src/screens/finance/ChargesManagement/Components/ChargesManage/Component/ChargeForm.tsx`:
   - Create payload must include only backend-accepted fields.
   - Remove UI-only scope fields from request body.
2. Update `src/screens/finance/ChargesManagement/Components/ChargesManage/Component/ChargesTable.tsx`:
   - Consume normalized list item fields.
   - Keep tab counts and status filtering consistent.
3. Update detail flow components:
   - `ViewChargeForm.tsx`
   - `ViewChargeComponent/BasicChargeAccordianCard.tsx`
   - `ViewChargeComponent/ChargeDetailsCard.tsx`
   - `ViewChargeComponent/RequestorInfoCard.tsx`
   - Use nested detail object paths (`student`, `requestor`, `approvalDetails`) safely.
4. Fix priority rendering labels/colors to match backend enum values.

### Phase 3: Replace Student Charges Mock Flow
1. Replace `src/redux/finance/ChargeManagement/studentChargeDataApi.ts` mock query strategy with backend-derived data.
2. Update student history UI:
   - `src/screens/finance/ChargesManagement/Components/ChargesList/ChargesList.tsx`
   - `src/screens/finance/ChargesManagement/Components/ChargesList/StudentChargeTable.tsx`
   - `src/screens/finance/ChargesManagement/Components/ChargesList/StudentChargesListTable.tsx`
3. Build student-wise grouping from charges API results.
4. If all-status aggregation is required and backend status filter is single-valued, fetch per status and merge client-side.

### Phase 4: Mutation Side Effects and Cache Safety
1. Fix delete optimistic update in `src/screens/finance/ChargesManagement/Components/ChargesManage/index.tsx`:
   - Use exact `getCharges` cache args.
   - Update `draft.items` instead of treating draft as flat array.
2. Ensure all mutations invalidate/refetch list and detail predictably.

## Affected Files (Primary)
- `src/redux/finance/ChargeManagement/chargeApi.ts`
- `src/redux/finance/ChargeManagement/studentChargeDataApi.ts`
- `src/screens/finance/ChargesManagement/Components/ChargesManage/Component/ChargeForm.tsx`
- `src/screens/finance/ChargesManagement/Components/ChargesManage/Component/ChargesTable.tsx`
- `src/screens/finance/ChargesManagement/Components/ChargesManage/Component/ViewChargeForm.tsx`
- `src/screens/finance/ChargesManagement/Components/ChargesManage/Component/ViewChargeComponent/BasicChargeAccordianCard.tsx`
- `src/screens/finance/ChargesManagement/Components/ChargesManage/Component/ViewChargeComponent/ChargeDetailsCard.tsx`
- `src/screens/finance/ChargesManagement/Components/ChargesManage/Component/ViewChargeComponent/RequestorInfoCard.tsx`
- `src/screens/finance/ChargesManagement/Components/ChargesManage/index.tsx`
- `src/screens/finance/ChargesManagement/Components/ChargesList/ChargesList.tsx`
- `src/screens/finance/ChargesManagement/Components/ChargesList/StudentChargeTable.tsx`
- `src/screens/finance/ChargesManagement/Components/ChargesList/StudentChargesListTable.tsx`

## Verification Checklist
1. Charges list loads with board/medium/year filters and no undefined field rendering.
2. Create charge works with valid backend payload and refreshes list.
3. Update pending charge works and reflects in list/detail.
4. Approve and reject calls use correct payload keys (`approvalNotes`, `rejectionReason`) and status transitions are accurate.
5. Delete flow updates UI safely, supports undo/refetch without cache errors.
6. Student charges list screen reads live backend-derived grouped data (no mock endpoint usage).
7. Lint/type checks pass after typing and mapper changes.

## Notes
- Keep backend DTO unchanged by default.
- If a frontend-only normalization cannot reliably map required fields, then add minimal compatibility alias fields in response DTO as a fallback.
