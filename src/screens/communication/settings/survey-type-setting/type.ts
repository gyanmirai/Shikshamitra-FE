import type { UseBooleanReturn } from 'src/hooks/useBoolean';

export interface ISurveyType {
  surveyType: string;
  description: string;
  createdBy: string;
  createdDate: string;
}

export interface ISurveyTypeTableProps {
  data: ISurveyType[];
  onAddSurveyType: { onTrue: () => void };
  setOpenDialog: (val: boolean) => void;
  setEditData: (val: ISurveyType | null) => void;
  onDelete: (row: ISurveyType) => void;
  onEdit: (row: ISurveyType) => void;
}

export interface ISurveyFormProps {
  open: UseBooleanReturn;
  onClose: (event?: unknown, isSaved?: boolean) => void;
  editData: ISurveyType | null;
}
