const ADVANCED_FILTER_LABELS: Record<string, string> = {
  questionType: 'Type',
  topicName: 'Topic',
  difficultyLevel: 'Difficulty',
  bloomLevel: "Bloom's Level",
  marks: 'Marks',
  status: 'Status',
  createdBy: 'Created By',
  createdDate: 'Created Date',
  updatedDate: 'Updated Date',
  timesUsed: 'Times Used',
};

export const QUESTION_TYPE_OPTIONS = [
  { value: 1, label: 'MCQ-Single Correct' },
  { value: 2, label: 'MCQ-Multiple Correct' },
  { value: 3, label: 'True/False' },
  { value: 4, label: 'Fill in the Blank' },
  { value: 5, label: 'Short Answer' },
  { value: 6, label: 'Long Answer' },
  { value: 7, label: 'Match the Following' },
  { value: 8, label: 'Assertion & Reason' },
  { value: 9, label: 'Case Study' },
  { value: 10, label: 'Diagram Based' },
  { value: 11, label: 'Practical' },
];

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

export const STATUS_OPTIONS = [
  { value: 1, label: 'Draft' },
  { value: 2, label: 'Submitted' },
  { value: 3, label: 'Approved' },
  { value: 4, label: 'Rejected' },
  { value: 5, label: 'Archived' },
];

function toLabelMap(options: ReadonlyArray<{ value: number; label: string }>): Record<number, string> {
  return Object.fromEntries(options.map(({ value, label }) => [value, label]));
}

const ENUM_LABELS: Partial<Record<string, Record<number, string>>> = {
  questionType: toLabelMap(QUESTION_TYPE_OPTIONS),
  difficultyLevel: toLabelMap(DIFFICULTY_OPTIONS),
  bloomLevel: toLabelMap(BLOOM_OPTIONS),
  status: toLabelMap(STATUS_OPTIONS),
};

export function formatQuestionBankAdvancedFilterLabel(key: string, value: unknown): string {
  const fieldLabel = ADVANCED_FILTER_LABELS[key] ?? key;
  const numericValue = typeof value === 'number' ? value : Number(value);
  const valueLabel = Number.isFinite(numericValue)
    ? (ENUM_LABELS[key]?.[numericValue] ?? String(value))
    : String(value);

  return `${fieldLabel}: ${valueLabel}`;
}
