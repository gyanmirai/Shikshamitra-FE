import type { IData } from 'src/components/customizable-table/types';

export interface ISubject {
  id: string;
  subjectId?: string;
  name: string;
  subjectColor: string;
  subjectCode: string;
  noOfLecture: number;
  electiveGroupId?: string | null;
}

export interface IWeeklyLecture extends IData {
  id: string;
  className: string;
  totalLectures: number;
  subjects: ISubject[];
}

export interface ICreateNoOfLectureProps {
  open?: boolean;
  onClose?: (event: any, isSubmit?: boolean) => void;
  disabled?: boolean;
  editData: ISubjectFormValues | null;
  selectedClass?: string;
  isEdit: boolean;
}

export interface ISubjectFormValues {
  id?: string;
  className: string;
  subjects: ISubject[];
  totalLectures: number;
}
