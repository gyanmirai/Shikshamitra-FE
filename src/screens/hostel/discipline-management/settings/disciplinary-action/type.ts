export interface IDisciplineAction {
  disciplineActionName: string;
  description: string;
}

export interface DisciplineActionFormProps {
  dialog: { onFalse: () => void };
  onClose: (_e?: any, isSubmit?: boolean) => void;
  editData: IDisciplineAction | null;
}
