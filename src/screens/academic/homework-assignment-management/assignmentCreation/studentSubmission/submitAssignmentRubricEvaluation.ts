export async function saveAssignmentRubricAndFeedback({
  saveRubric,
  saveFeedback,
  feedbackChanged,
}: {
  saveRubric: () => Promise<boolean>;
  saveFeedback: () => Promise<void>;
  feedbackChanged: boolean;
}): Promise<boolean> {
  if (!(await saveRubric())) return false;
  if (feedbackChanged) await saveFeedback();
  return true;
}

export async function submitAssignmentRubricEvaluation<Student>({
  save,
  nextStudent,
  advance,
  onAdvance,
  onClose,
}: {
  save: () => Promise<boolean>;
  nextStudent: Student | null;
  advance: boolean;
  onAdvance: (student: Student) => void;
  onClose: () => void;
}): Promise<boolean> {
  if (advance && !nextStudent) return false;
  if (!(await save())) return false;

  if (advance && nextStudent) {
    onAdvance(nextStudent);
  } else {
    onClose();
  }
  return true;
}
