import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import type { IStudentInfo } from '../Concession/type';

export interface IConcessionDocument {
  id: number;
  name: string;
  type: string;
  status: string;
  file?: File;
}

export interface IViewConcessionRequestProps {
  viewConcessionRequest: UseBooleanReturn;
  student: IStudentInfo;
  documents: IConcessionDocument[] | undefined;
  onApprove: () => void;
  onReject: () => void;
  onMismatch: () => void;
  onClose: (e: any, isSubmit: boolean) => void;
}
