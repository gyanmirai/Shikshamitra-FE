import type { IHomework } from '../homeworkCreation/type';
import type { IAssignment } from '../assignmentCreation/type';

export interface IHomeworkSubmissiontFormProps {
  selectedHomework: IHomework | null;
  onClose: (e: any, isSubmit: boolean) => void;
}

export interface IAssignmentSubmissiontFormProps {
  selectedAssignment: IAssignment | null;
  onClose: (e: any, isSubmit: boolean) => void;
}
