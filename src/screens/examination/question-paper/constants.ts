// Shared constants for the Question Paper module.
// Kept in one place so the list screen and the creation wizard use identical labels and colors.

export const DIFFICULTY_OPTIONS = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
];

export const BLOOM_OPTIONS = [
  { value: 1, label: 'Remembering' },
  { value: 2, label: 'Understanding' },
  { value: 3, label: 'Applying' },
  { value: 4, label: 'Analyzing' },
  { value: 5, label: 'Evaluating' },
  { value: 6, label: 'Creating' },
];

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};

export const DIFFICULTY_COLORS: Record<number, 'success' | 'warning' | 'error'> = {
  1: 'success',
  2: 'warning',
  3: 'error',
};

export const BLOOM_LABELS: Record<number, string> = {
  1: 'Remembering',
  2: 'Understanding',
  3: 'Applying',
  4: 'Analyzing',
  5: 'Evaluating',
  6: 'Creating',
};

export const QUESTION_TYPE_OPTIONS = [
  { value: 1, label: 'MCQ — Single Correct' },
  { value: 2, label: 'MCQ — Multiple Correct' },
  { value: 3, label: 'True / False' },
  { value: 4, label: 'Fill in the Blank' },
  { value: 5, label: 'Short Answer' },
  { value: 6, label: 'Long Answer' },
  { value: 7, label: 'Match the Following' },
  { value: 8, label: 'Assertion & Reason' },
  { value: 9, label: 'Case Study' },
  { value: 10, label: 'Diagram Based' },
  { value: 11, label: 'Practical' },
];

export const QUESTION_TYPE_LABELS: Record<number, string> = QUESTION_TYPE_OPTIONS.reduce(
  (acc, opt) => ({ ...acc, [opt.value]: opt.label }),
  {} as Record<number, string>
);

export const CREATION_MODE_OPTIONS = [
  { value: 'Manual', label: 'Manual' },
  { value: 'Auto', label: 'Auto' },
  { value: 'Hybrid', label: 'Hybrid' },
];

export const CREATION_MODE_CARDS = [
  {
    value: 'Manual' as const,
    label: 'Manual',
    icon: 'mdi:pencil-outline',
    description: 'Build the paper yourself by selecting questions from the Question Bank.',
  },
  {
    value: 'Auto' as const,
    label: 'Auto Generate',
    icon: 'mdi:sparkles',
    description: 'Generate questions automatically based on your paper pattern.',
  },
  {
    value: 'Hybrid' as const,
    label: 'Hybrid',
    icon: 'mdi:shuffle-variant',
    description: 'Automatically generate a starting paper and manually adjust questions.',
  },
];

// 1: Draft, 2: Generated, 3: Submitted, 4: Approved, 5: Rejected, 6: Published, 7: Locked, 8: Archived
export const STATUS_LABEL: Record<number, string> = {
  1: 'Draft',
  2: 'Generated',
  3: 'Submitted',
  4: 'Approved',
  5: 'Rejected',
  6: 'Published',
  7: 'Locked',
  8: 'Archived',
};

export const STATUS_COLOR: Record<
  number,
  'default' | 'info' | 'success' | 'error' | 'warning' | 'primary'
> = {
  1: 'default',
  2: 'info',
  3: 'warning',
  4: 'success',
  5: 'error',
  6: 'primary',
  7: 'error',
  8: 'default',
};

export const DEFAULT_DIFFICULTY_DIST: Record<number, number> = { 1: 30, 2: 50, 3: 20 };
export const DEFAULT_BLOOM_DIST: Record<number, number> = {
  1: 20,
  2: 20,
  3: 15,
  4: 15,
  5: 15,
  6: 15,
};

export const WIZARD_STEPS = [
  'Paper Details',
  'Paper Pattern',
  'Add Questions',
  'Preview',
  'Review & Submit',
] as const;

export type WizardStepIndex = 0 | 1 | 2 | 3 | 4;

// Statuses in which the paper can still be edited freely.
export const EDITABLE_STATUSES = [1, 2, 5]; // Draft, Generated, Rejected
// Statuses in which the paper is read-only for the author.
export const READONLY_STATUSES = [3, 4, 6, 7, 8]; // Submitted, Approved, Published, Locked, Archived
