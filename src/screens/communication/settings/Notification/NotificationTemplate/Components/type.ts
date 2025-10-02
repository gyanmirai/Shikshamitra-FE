// type.ts

export interface INotificationTemplate {
  id: string; // unique id (e.g. "TMP-001")
  templateName: string; // "Exam Notification"
  hashtags: string[]; // "#Academic #Assignment"
  targetRole: string; // "Student" | "Teacher" | "Parent"
  subject: string; // "12th Exam", "Fee Reminder", "Navratri Celebration"
  message: string;
}

export interface ITemplateTableProps {
  setOpenDialog: (open: boolean) => void;
  setEditData: (data: INotificationTemplate | null) => void;
  onDelete: (data: INotificationTemplate) => void;
  onEdit: (data: INotificationTemplate) => void;
}

export interface INotificationTemplateFormProps {
  open: boolean;
  onClose: (event: any, isSubmit?: boolean) => void;
  editData?: INotificationTemplate | null;
}
