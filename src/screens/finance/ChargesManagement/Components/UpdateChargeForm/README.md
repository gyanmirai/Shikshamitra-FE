# Update Charge Form - Implementation Guide

## Overview

The Update Charge Form is a new comprehensive form system for editing existing charges. It reuses the existing charge architecture while providing enhanced functionality for prefilling values, preventing data loss, and supporting complex academic structures.

## Architecture

### Component Structure

```
UpdateChargeForm/
├── UpdateChargeForm.tsx              # Main form component
├── useChargeDetails.ts               # Hook for fetching and prefilling charge details
├── UpdateChargeValidation.ts         # Validation schema and helpers
├── StudentSelectionLayout.tsx        # Student list with search and selection
├── SelectedStudentsPanel.tsx         # Display of selected students
├── types.ts                          # TypeScript interfaces and types
├── dummyStudents.ts                  # Dummy student data (replace with API)
└── index.ts                          # Barrel exports
```

## Components

### 1. UpdateChargeForm

**Main form component** that ties all functionality together.

**Props:**

```typescript
interface IUpdateChargeFormProps {
  chargeId: string; // ID of charge to update
  open: UseBooleanReturn; // Dialog open state hook
  onClose: (event?, isSubmit?) => void; // Close handler
}
```

**Features:**

- Fetches and prefills charge details
- Enforces academic structure restrictions
- Manages student selection with search
- Tracks dirty state to prevent data loss
- Shows restricted fields based on charge status

**Usage:**

```tsx
const editChargeDialog = useBoolean();

<UpdateChargeForm
  chargeId="charge_123"
  open={editChargeDialog}
  onClose={(e, isSubmit) => {
    if (isSubmit) {
      // Refetch data
    }
    editChargeDialog.onFalse();
  }}
/>;
```

### 2. useChargeDetails Hook

**Custom hook** for fetching and transforming charge data.

**Returns:**

```typescript
{
  prefillValues: IUpdateChargeFormValues | null; // Form initial values
  chargeDetail: IChargeDetailResponse | null; // Raw API response
  isLoading: boolean; // Loading state
  isError: boolean; // Error state
  restrictions: IUpdateRestrictions; // Update restrictions
  divisionVisibility: IDivisionVisibilityRule; // Division visibility logic
}
```

**Restrictions Logic:**

- Board/Medium changes disabled after charge is applied
- Student changes always allowed
- Based on `appliedCount` in API response

**Usage:**

```tsx
const { prefillValues, restrictions, divisionVisibility } = useChargeDetails(chargeId);
```

### 3. StudentSelectionLayout

**Component** for displaying and selecting students with search functionality.

**Props:**

```typescript
interface StudentSelectionLayoutProps {
  students: IStudentOption[];
  selectedStudentIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  divisionFilter?: string;
}
```

**Features:**

- Debounced search (500ms delay)
- Search by name, admission number, roll number
- Select all / deselect all
- Division filtering support
- Loading skeleton

**Usage:**

```tsx
<StudentSelectionLayout
  students={filteredStudents}
  selectedStudentIds={values.studentIds}
  onSelectionChange={(ids) => setFieldValue('studentIds', ids)}
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
/>
```

### 4. SelectedStudentsPanel

**Component** for displaying selected students with removal options.

**Props:**

```typescript
interface SelectedStudentsPanelProps {
  selectedStudents: ISelectedStudent[];
  onRemove?: (studentId: string) => void;
  onClearAll?: () => void;
  isSticky?: boolean;
}
```

**Features:**

- Sticky positioning during scroll
- Shows student count
- Individual removal buttons
- Clear all action
- Empty state message

**Usage:**

```tsx
<SelectedStudentsPanel
  selectedStudents={values.selectedStudents}
  onRemove={(id) => removeStudent(id)}
  onClearAll={() => clearStudents()}
  isSticky={true}
/>
```

## Types

### IUpdateChargeFormValues

Main form value structure:

```typescript
{
  chargeId: string;
  chargeCategoryId: string;
  purposeDescription: string;
  amount: number | string;
  dueDate: dayjs.Dayjs;
  priority: string | number;
  additionalNotes: string;

  // Academic Structure
  boardId: string;
  educationMediumId: string;
  standardId: string;
  divisionIds: string[];

  // Student Selection
  studentIds: string[];
  selectedStudents: Array<{ id, label, rollNumber?, grNumber?, divisionName? }>;

  // Selection Mode
  selectionMode: 'students' | 'divisions' | 'classes';
}
```

### IUpdateRestrictions

Controls which fields can be edited:

```typescript
{
  canChangeBoardId: boolean;
  canChangeEducationMediumId: boolean;
  canChangeStandardId: boolean;
  canChangeStudents: boolean;
  boardChangeReason?: string;
  mediumChangeReason?: string;
}
```

## Validation

### Validation Schema

Created using Yup with conditional validation:

**Required Fields:**

- `chargeCategoryId`
- `purposeDescription` (10-500 chars)
- `amount` (> 0)
- `dueDate` (within academic year)
- `priority`
- `boardId`, `educationMediumId`, `standardId`

**Conditional Fields:**

- `divisionIds` - required only if single class selected
- At least one of: `studentIds`, `divisionIds`, or `standardId`

**Usage:**

```tsx
const validationSchema = createUpdateChargeValidationSchema(currentYear, singleClassSelected);
```

## Division Visibility Logic

Divisions are shown only when **exactly one class is selected**.

**Rules:**

- If `standardId` is set and single class: Show divisions
- If multiple classes or no class: Hide divisions and clear selection
- Show warning when changing from multiple → single class with existing divisions

## Student Selection Strategy

### Selection Modes

1. **Student Level**: Individual students selected
2. **Division Level**: All students in divisions selected
3. **Class Level**: All students in class selected

### Search Implementation

- Debounce: 500ms delay
- Search fields: name, admission number, roll number
- Prevents API spam

### Dummy Data (Temporary)

Currently uses `DUMMY_STUDENTS` array. Replace with actual API call:

```typescript
// TODO: Replace with actual API
const [getStudents] = useQueryAndMutation({
  type: 'query',
  currentQueryAndMutation: useLazyGetStudentsByDivisionQuery,
  params: { divisionId: values.divisionId },
});
```

## Dirty State Tracking

**Purpose:** Prevent accidental data loss

**Implementation:**

- Compares initial values with current values (deep JSON comparison)
- Shows confirmation dialog if user tries to close with unsaved changes
- Uses existing `BackPopUpChecked` component

**Usage:**

```tsx
const isDirty = useDirtyState(initialValues, values);

if (isDirty && !confirmed) {
  showWarning('You have unsaved changes');
}
```

## API Integration

### Expected Endpoints

```
GET /charges/{chargeId}          # Fetch charge details
PUT /charges/{chargeId}          # Update charge
GET /students?division={id}      # Fetch students (replace dummy)
GET /classes?medium={id}         # Fetch classes
GET /divisions?standard={id}     # Fetch divisions
```

### Response Format

**GET /charges/{chargeId}**

```json
{
  "chargeId": "charge_123",
  "chargeCategoryId": "cat_001",
  "categoryName": "Tuition Fee",
  "purposeDescription": "Monthly tuition...",
  "amount": 5000,
  "priority": 1,
  "dueDate": "2024-07-31",
  "additionalNotes": "...",
  "boardId": "board_001",
  "educationMediumId": "medium_001",
  "standardIds": ["class_001"],
  "divisionIds": ["division_001"],
  "studentIds": ["student_001", "student_002"],
  "appliedCount": 5,
  "isApprovalRequired": true
}
```

### Update Payload

```json
{
  "chargeCategoryId": "cat_001",
  "purposeDescription": "Updated description...",
  "amount": 5500,
  "dueDate": "2024-07-31T00:00:00Z",
  "priority": 2,
  "additionalNotes": "Updated notes",
  "studentIds": ["student_001", "student_002"],
  "divisionIds": [],
  "classIds": ["class_001"]
}
```

## Integration with Existing Code

### In ChargesManagement (index.tsx)

**Before:**

```tsx
<ChargeForm
  open={editChargeDialog}
  onClose={handleEditClose}
  editData={selectedChargeData}
  isEdit
/>
```

**After:**

```tsx
<UpdateChargeForm
  chargeId={selectedChargeData.chargeId}
  open={editChargeDialog}
  onClose={handleEditClose}
/>
```

### Key Differences from ChargeForm

- Takes `chargeId` instead of `editData`
- Fetches data independently
- Enhanced student selection UI
- Better restriction handling
- Improved dirty state tracking

## Performance Optimizations

1. **Debounced Search**: 500ms delay to prevent API spam
2. **Memoization**: `useMemo` for expensive calculations
3. **useCallback**: Stable function references
4. **Lazy Loading**: Classes and students loaded on demand
5. **Pagination Ready**: StudentSelectionLayout supports pagination

## UX Features

### Loading States

- Skeleton loader while fetching charge details
- Loading spinner for student list
- Disabled buttons during submission

### Empty States

- "No students found" when search yields no results
- "Select a division first" when no division selected
- Clear messaging throughout

### Confirmation Dialogs

- Dirty state warning before closing
- Warning when changing from multi → single class with divisions
- Delete confirmations through existing ConfirmDialog

### Visual Feedback

- Restricted fields show helper text explaining why they're disabled
- Info alerts for applied charges
- Sticky action bar for easy form submission
- Chip badges showing selection counts

## Error Handling

**Form Validation Errors:**

- Display in-form helper text
- ShakingTextField animation for focus
- Clear error messages

**API Errors:**

- Toast notifications (success/error)
- Graceful fallbacks
- Logging for debugging

**Example:**

```tsx
try {
  await updateCharge({ id: chargeId, body: payload }).unwrap();
  shikshaMitraToast.success({ message: 'Charge updated successfully' });
  onClose(null, true);
} catch (error) {
  console.error('Failed to update charge:', error);
  shikshaMitraToast.error({ message: 'Failed to update charge' });
}
```

## Future Enhancements

1. **Replace Dummy Students**: Implement actual API call
2. **Batch Operations**: Update multiple charges at once
3. **Change History**: Show what changed in the update
4. **Approval Workflow**: Conditional approval based on category
5. **Audit Trail**: Log all update operations
6. **Scheduling**: Schedule charges for future application
7. **Bulk Actions**: Select and update multiple charges
8. **Email Notifications**: Notify stakeholders of updates

## Testing

### Unit Tests

- Form validation with various inputs
- Dirty state detection
- Restriction logic
- Search/filter functionality

### Integration Tests

- Charge loading and prefilling
- Form submission and API calls
- Dialog open/close behavior
- Dirty state warnings

### E2E Tests

- Complete update flow
- Student selection workflow
- Academic structure changes
- Unsaved changes detection

## Troubleshooting

### Common Issues

**Issue: Form not prefilling**

- Check if chargeId is correct
- Verify API endpoint returns expected format
- Check browser console for fetch errors

**Issue: Students not loading**

- Currently uses dummy data - replace with actual API
- Check StudentSelectionLayout is receiving correct props

**Issue: Divisions not showing**

- Verify `divisionVisibility.showDivisions` is true
- Check if single class is actually selected

**Issue: Form closing without saving**

- Check isDirty state calculation
- Verify BackPopUpChecked is wrapping the form

## File References

- Main implementation: [UpdateChargeForm](./UpdateChargeForm.tsx)
- Integration: [ChargesManagement](./index.tsx)
- Existing form (create): [ChargeForm](./Component/ChargeForm.tsx)
- API: `src/redux/finance/ChargeManagement/chargeApi.ts`
