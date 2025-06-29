import type { IData } from 'src/components/customizabaleTable/type';

export interface ISubject {
  id: string;
  name: string;
  subjectColor: string;
  subjectCode: string;
  noOfLecture: number;
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
}

export interface ISubjectFormValues {
  className: string;
  subjects: ISubject[];
  totalLectures: number;
}
