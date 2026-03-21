import type { IHomework } from '../homework-creation/type';
import type { IAssignment } from '../assignment-creation/type';

export interface IHomeworkSubmissiontFormProps {
  selectedHomework: IHomework | null;
  onClose: (e: any, isSubmit: boolean) => void;
}

export interface IAssignmentSubmissiontFormProps {
  selectedAssignment: IAssignment | null;
  onClose: (e: any, isSubmit: boolean) => void;
}
