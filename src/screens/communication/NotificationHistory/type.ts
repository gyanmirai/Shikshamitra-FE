export interface INotification {
  id: string | number; // unique identifier if needed
  dateTime: string; // "2024-01-15 at 10:30 AM"
  title: string; // "Exam Schedule Released"
  category: string; // "Academic"
  sentBy: string; // "John Doe"
  recipients: number; // 245
  channels: string[]; // ["Email", "SMS"]
  status: number; // 0=Pending, 1=Delivered, 2=Opened, 3=Failed (example mapping)

  // Delivery stats
  totalRecipients: number; // 245
  delivered: number; // 240
  opened: number; // 198
  failed: number; // 5

  // Message content
  subject: string; // "Important: Exam Schedule for Final Semester"
  body: string; // "Dear students, ..."
}
