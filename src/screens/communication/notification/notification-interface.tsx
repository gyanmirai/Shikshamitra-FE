export interface IAddEventListDialogProps {
  onClose: () => void;
}

export interface IAddNotificationCategoryDialogProps {
  onClose: () => void;
}

export interface IStudent {
  id: number;
  name: string;
  class: string;
  division: string;
  organization: string;
  contactNumber: string;
  email: string;
}

export interface IFeeTemplates {
  overdueFee: string;
  feeReminder: string;
}
