import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import { defaultExamFormValues } from './initialValues';
import { normalizeSelectedExamSubjects } from './exam-subject-selection';

import type { IExamFormValues } from '../type';

dayjs.extend(isSameOrAfter);

const subjectDefaults = { totalMarks: 100, passingMarks: 33, gradeScalingId: 'scale-100' };
const makeOption = (id: string, name: string, code: string) => ({
  subjectId: id,
  selectedElectiveSubjectId: id,
  subjectName: name,
  color: '#1976D2',
  electiveGroupId: 'pt-computer',
  electiveGroupName: 'Pt & Computer Group',
  subjects: [{ subjectId: id, subjectName: name, subjectCode: code, color: '#1976D2' }],
});

export const emptyElectiveOptions = [
  makeOption('computer', 'Computer Science', 'COM06'),
  makeOption('pt', 'Pt', 'PT07'),
];

export const makeEmptyElectiveForm = (computerStudents = 0): IExamFormValues => {
  const subjects = normalizeSelectedExamSubjects(emptyElectiveOptions, subjectDefaults, {
    'pt-computer': {
      isReady: true,
      assignedCounts: { computer: computerStudents, pt: 3 - computerStudents },
    },
  });
  const scheduled = {
    examDate: dayjs().add(2, 'day').startOf('day'),
    startTime: dayjs('2000-01-01T10:00:00'),
    endTime: dayjs('2000-01-01T11:00:00'),
    notes: 'Bring stationery',
  };
  subjects.forEach((subject) => {
    subject.subjects = subject.subjects?.map((nested) =>
      nested.isExamSelectionDisabled ? nested : { ...nested, ...scheduled }
    );
  });
  return {
    ...defaultExamFormValues,
    examId: 'empty-elective-exam',
    examType: 'mid-term',
    examName: 'Mid term Exam 2025 and 2026',
    className: 'class-10',
    gradingScaleId: 'scale-100',
    divisions: ['division-a'],
    subjects,
    roomDetails: { pt: { 'division-a': { roomIds: ['room-a'], capacity: 30 } } },
  };
};
