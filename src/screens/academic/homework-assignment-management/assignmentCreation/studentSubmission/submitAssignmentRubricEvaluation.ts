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
