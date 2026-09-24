import type { ApiSubstitutionLecture } from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

type LectureOptionSource = Pick<
  ApiSubstitutionLecture,
  'slotSubjectId' | 'period' | 'startTime' | 'endTime' | 'subjectName' | 'originalTeacherName'
>;

export type LectureSelectOption = {
  value: string;
  label: string;
};

export const buildLectureSelectOptions = (lectures: LectureOptionSource[]): LectureSelectOption[] =>
  lectures.map((lecture) => ({
    value: lecture.slotSubjectId,
    label: `${lecture.period} | ${lecture.startTime}-${lecture.endTime} | ${lecture.subjectName} | ${
      lecture.originalTeacherName || 'Teacher not assigned'
    }`,
  }));
