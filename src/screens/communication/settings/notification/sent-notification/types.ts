import type { NotificationStatusType } from 'src/enums/notification-status-type';

export interface IPlaceHolderOption {
  value: string;
  label: string;
}

export interface INotificationRecipient {
  name: string;
  message: string;
  communicationChannel: string[];
  placeHolder: string[];
  placeHolderOptions: IPlaceHolderOption[];
  isEnable: boolean;
}

export interface INotificationData {
  id: string;
  event: string;
  triggerCondition: string;
  isActive: NotificationStatusType;
  recipient: INotificationRecipient[];
}

// Props for the child components (Announcement, Event, Survey)
export interface INotificationComponentProps {
  dialog: {
    value: boolean;
    onTrue: () => void;
    onFalse: () => void;
  };
  setIsViewMode: (isView: boolean) => void;
}
