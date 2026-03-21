import type { UseBooleanReturn } from 'src/hooks/useBoolean';

import type { IStudentInfo } from '../concession/type';

export interface IConcessionDocument {
  id: number;
  name: string;
  type: string;
  status: string;
  file?: File;
}

export interface IViewConcessionRequestProps {
  viewConcessionRequest: UseBooleanReturn;
  student: IStudentInfo | null;
  onApprove: () => void;
  onReject: () => void;
  onMismatch: () => void;
  onClose: (e: any, isSubmit: boolean) => void;
}
