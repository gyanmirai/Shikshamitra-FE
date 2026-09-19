import type { ReactNode } from 'react';

import type { ISubjectFormValues } from '../type';

export type SubjectTableRow = ISubjectFormValues & {
  subjectTypeValue: string;
  subjectsName: string;
  subjectNameDisplay: ReactNode;
  subjectCodeValue: string;
  statusValue: string;
  primaryTeacherDisplay: string[];
  chaptersDisplay: number;
  weeklyPeriodsDisplay: string;
  lastUpdatedDisplay: string;
};
