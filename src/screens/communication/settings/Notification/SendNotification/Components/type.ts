// Notification Template
export interface INotificationTemplate {
  id: string;
  templateName: string;
  hashtags: string[];
  targetRole: string;
  subject: string;
  message: string;
  importance_level: string;
}

// Audience Scope
export interface IAudience {
  educationMediumStageId: string[];
}

// Members (actual recipients)
export interface IAudienceMember {
  isSelect: boolean;
  id: string;
  name: string;
  identifier?: string; // GR No, Employee ID, etc.
  rollNumber?: string; // only for students
  division?: string; // only for students
  class?: string; // only for students
  contactNumber: string;
  type: string;
}

// Channels
export type NotificationChannel = string;

// Final schema for notification send
export interface INotificationSendSchema {
  audience: IAudience; // Scope (who is being targeted logically)
  members: IAudienceMember[]; // Actual selected members
  channels: NotificationChannel[]; // Selected delivery channels
  selectedTemplate: INotificationTemplate; // Chosen template
}
