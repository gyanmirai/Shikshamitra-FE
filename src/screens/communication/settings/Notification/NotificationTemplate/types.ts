import type {
  CommunicationChannelType,
  CommunicationTemplateApprovalStatus,
} from 'src/redux/communication/communicationTypes';

export interface INotificationTemplate {
  id: string; // unique id (e.g. "TMP-001")
  templateName: string; // "Exam Notification"
  hashtags: string[]; // "#Academic #Assignment"
  targetRole: string; // "Student" | "Teacher" | "Parent"
  subject: string; // "12th Exam", "Fee Reminder", "Navratri Celebration"
  message: string;
  body?: string;
  category?: string;
  languageCode?: string;
  channels?: CommunicationChannelType[];
  approvalStatus?: CommunicationTemplateApprovalStatus;
}

export interface INotificationTemplateFormValues {
  templateName: string;
  targetRole: string;
  category: string;
  subject: string;
  message: string;
  hashtags: string[];
  languageCode: string;
  channels: Array<CommunicationChannelType | string | number>;
  approvalStatus: CommunicationTemplateApprovalStatus;
}

export interface ITemplateTableProps {
  data: INotificationTemplate[];
  isLoading: boolean;
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
