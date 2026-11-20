import type { Dayjs } from 'dayjs';

import { schoolDate } from './school-date';

export type IssueValues = {
  accessionNumber: string;
  memberId: string;
  memberScan?: string;
  academicYearId?: string;
  issueDate: Dayjs | null;
  dueDate: Dayjs | null;
};
export const issueFingerprint = (values: IssueValues) =>
  JSON.stringify({
    scan: values.accessionNumber.trim(),
    member: values.memberId,
    year: values.academicYearId || '',
    issue: schoolDate(values.issueDate),
    due: schoolDate(values.dueDate),
  });
