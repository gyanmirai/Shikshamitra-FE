import type { UseBooleanReturn } from 'src/hooks/use-boolean';

/**
 * Form structure for updating charges
 * Supports single or batch updates
 */
export interface IUpdateChargeFormValues {
  // Charge Details
  chargeId: string;
  chargeName: string;
  chargeCategoryId: string;
  chargeCategoryName: string;
  purposeDescription: string;
  amount: number | string;
  dueDate: any; // dayjs object

  // Academic Structure
  boardId: string;
  educationMediumId: string;
  standardId: string[]; // Changed to array for multi-select
  divisionIds: string[];

  // Student Selection
  studentIds: string[]; // Selected student IDs
  selectedStudents: Array<{
    id: string;
    label: string;
    rollNumber?: number;
    grNumber?: string;
    divisionName?: string;
  }>;

  // Selection state
  selectionMode: 'selected' | 'all';
}

/**
 * Prefill data structure - API response format
 */
export interface IChargeDetailResponse {
  chargeId: string;
  chargeName: string;
  chargeCategoryId: string;
  categoryName: string;
  purposeDescription: string;
  amount: number;
  dueDate: string;
  priority: number;
  additionalNotes?: string;
  appliedOn?: string;

  // Academic structure
  boardId: string;
  educationMediumId: string;
  standardIds?: string[]; // Can be multiple or single
  divisionIds?: string[];
  studentIds?: string[];

  // Status/Restrictions
  status?: number;
  appliedCount?: number; // Number of charges already applied
  isApprovalRequired?: boolean;
}

/**
 * Student option for selection
 */
export interface IStudentOption {
  id: string;
  label: string;
  studentId: string;
  rollNumber?: number;
  grNumber?: string;
  name: string;
  standardName?: string;
  divisionName?: string;
  standardId?: string;
  divisionId?: string;
  gender?: number;
  hasFeeStructureAssignment?: boolean;
  hasChargeInCategory?: boolean;
}

/**
 * Props for UpdateChargeForm component
 * Supports both Create and Update modes
 */
export interface IUpdateChargeFormProps {
  chargeId?: string; // Optional - if not provided, form is in Create mode
  open: UseBooleanReturn;
  onClose: (event?: any, isSubmit?: boolean) => void;
  isEdit?: boolean; // Optional flag for explicit mode control (for backward compatibility)
  defaultBoardId?: string;
  defaultMediumId?: string;
  defaultStandardId?: string;
  defaultDivisionId?: string;
}

/**
 * Dirty state tracking
 */
export interface IDirtyState {
  initial: IUpdateChargeFormValues;
  current: IUpdateChargeFormValues;
  isDirty: boolean;
}

/**
 * Student selection state
 */
export interface IStudentSelectionState {
  selectedStudentIds: string[];
  filteredStudents: IStudentOption[];
  searchQuery: string;
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

/**
 * Division visibility logic
 */
export interface IDivisionVisibilityRule {
  showDivisions: boolean;
  reason?: 'multi-class-selected' | 'no-class-selected' | 'single-class-selected';
}

/**
 * Update restrictions
 */
export interface IUpdateRestrictions {
  canChangeBoardId: boolean;
  canChangeEducationMediumId: boolean;
  canChangeStandardId: boolean;
  canChangeStudents: boolean;
  boardChangeReason?: string;
  mediumChangeReason?: string;
}

/**
 * Update payload to send to API
 */
export interface IChargeUpdatePayload {
  chargeId: string;
  chargeCategoryId: string;
  purposeDescription: string;
  amount: number;
  dueDate: string; // ISO string
  priority: number;
  studentIds?: string[];
  divisionIds?: string[];
  classIds?: string[];
}
