export type ExamResultValues = {
  totalMarks: string;
  passingMarks: string;
  obtainedMarks: string;
  meritRank: string;
};

export type ExamResultErrors = Partial<Record<keyof ExamResultValues, string>>;

const parseExamNumber = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const validateExamResultValues = (values: ExamResultValues): ExamResultErrors => {
  const errors: ExamResultErrors = {};
  const totalMarks = parseExamNumber(values.totalMarks);
  const passingMarks = parseExamNumber(values.passingMarks);
  const obtainedMarks = parseExamNumber(values.obtainedMarks);
  const meritRank = values.meritRank.trim() ? parseExamNumber(values.meritRank) : null;

  if (totalMarks == null || totalMarks <= 0) {
    errors.totalMarks = 'Enter total marks greater than 0.';
  }

  if (passingMarks == null || passingMarks < 0) {
    errors.passingMarks = 'Enter passing marks of 0 or more.';
  } else if (totalMarks != null && totalMarks > 0 && passingMarks > totalMarks) {
    errors.passingMarks = 'Passing marks cannot exceed total marks.';
  }

  if (obtainedMarks == null || obtainedMarks < 0) {
    errors.obtainedMarks = 'Enter obtained marks of 0 or more.';
  } else if (totalMarks != null && totalMarks > 0 && obtainedMarks > totalMarks) {
    errors.obtainedMarks = 'Obtained marks cannot exceed total marks.';
  }

  if (
    values.meritRank.trim() &&
    (meritRank == null || !Number.isInteger(meritRank) || meritRank <= 0)
  ) {
    errors.meritRank = 'Merit rank must be a positive whole number.';
  }

  return errors;
};

export const isValidExamResultValues = (values: ExamResultValues | undefined) =>
  Boolean(values && Object.keys(validateExamResultValues(values)).length === 0);
