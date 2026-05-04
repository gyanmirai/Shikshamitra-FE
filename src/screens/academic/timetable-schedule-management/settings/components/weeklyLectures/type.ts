import type { IData } from 'src/components/customizabaleTable/types';

/**
 * Domain type representing a single subject row inside the weekly-lectures form.
 *
 * NOTE: `noOfLecture` is kept as `string | number` because the underlying
 * `<TextField type="number" />` produces strings until coerced on submit.
 */
export interface ISubject {
  id: string;
  subjectId?: string;
  subjectName?: string;
  /** Display name used inside the form table (subjectName or elective group name). */
  name?: string;
  subjectColor: string;
  subjectCode?: string;
  weeklyLectures?: number;
  noOfLecture: number | string;
  electiveGroupId?: string | null;
  electiveGroupName?: string | null;
  subjectType?: number;
  subjects?: Array<{ subjectId: string; subjectName: string; subjectCode: string; name?: string }>;
  electiveGroupSubjects?: Array<{
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    name?: string;
  }>;
  subjectCount?: number;
  electiveGroupColor?: string;
}

export interface IWeeklyLecture extends IData {
  id: string;
  className: string;
  totalLectures: number;
  subjects: ISubject[];
}

export interface ISubjectFormValues {
  id?: string;
  className: string;
  subjects: ISubject[];
  totalLectures: number;
  classId: string;
  standardId?: string;
  standardName?: string;
}

export interface ICreateNoOfLectureProps {
  open?: boolean;
  onClose?: (event: unknown, isSubmit?: boolean) => void;
  disabled?: boolean;
  editData: ISubjectFormValues | null;
  selectedClass?: string;
  isEdit: boolean;
  tableData: ISubjectFormValues[] | undefined;
}

/** Minimal shape of a class/standard option produced from the medium selector. */
export interface IClassOption {
  id: string;
  name: string;
}

/** Row payload sent to the create/update mutation. */
export interface ISubjectPayload {
  subjectId: string | undefined;
  weeklyLectures: number;
  electiveGroupId: string | null;
}
