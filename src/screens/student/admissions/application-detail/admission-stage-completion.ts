import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

export type StageCompletionKind = 'entrance-exam' | 'physical-form' | 'standard';

export type EntranceExamCompletionValues = {
  scheduledAt: string;
  totalMarks: number;
  passingMarks: number;
  obtainedMarks: number;
};

export type StageCompletionFormValues = EntranceExamCompletionValues & {
  issued: boolean;
  formReference: string;
};

export function getStageCompletionKind(stage?: AdmissionApplicationStage): StageCompletionKind {
  if (!stage) return 'standard';
  if (stage.stageType === 2 || ['ENTRANCE_EXAM', 'ENTRANCE_EXAM_PASSED'].includes(stage.code)) {
    return 'entrance-exam';
  }
  if (stage.code === 'PHYSICAL_FORM_ISSUED') return 'physical-form';
  return 'standard';
}

export function requiresStageCompletionDetails(stage?: AdmissionApplicationStage) {
  return getStageCompletionKind(stage) !== 'standard';
}

export function isPassingEntranceExamResult(values: EntranceExamCompletionValues) {
  return (
    values.totalMarks > 0 &&
    values.passingMarks >= 0 &&
    values.passingMarks <= values.totalMarks &&
    values.obtainedMarks >= values.passingMarks &&
    values.obtainedMarks <= values.totalMarks
  );
}

export function buildEntranceExamCompletionReason(values: EntranceExamCompletionValues) {
  const scheduledAt = new Date(values.scheduledAt).toISOString();
  return `Entrance exam passed; scheduled ${scheduledAt}; score ${values.obtainedMarks}/${values.totalMarks}; pass mark ${values.passingMarks}.`;
}

export function buildPhysicalFormCompletionReason(formReference: string) {
  const reference = formReference.trim();
  return `Physical registration form issued/taken: Yes${
    reference ? `; form reference ${reference}` : ''
  }.`;
}
