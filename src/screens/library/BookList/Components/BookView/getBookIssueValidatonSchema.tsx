import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

const date = (label: string) =>
  Yup.mixed<Dayjs>()
    .nullable()
    .required(`${label} is required`)
    .test('valid', `${label} must be a valid date`, (value) =>
      Boolean(value && dayjs(value).isValid())
    );
export const getIssueBookSchema = (
  _currentYear?: unknown,
  manualDue?: boolean,
  requireYear = false
) => {
  const due = Yup.mixed<Dayjs>()
    .nullable()
    .test('valid', 'Due date must be a valid date', (value) => !value || value.isValid())
    .test('order', 'Due date must be on or after the issue date', function ordered(value) {
      return (
        !value ||
        !this.parent.issueDate ||
        value.startOf('day').valueOf() >= dayjs(this.parent.issueDate).startOf('day').valueOf()
      );
    });
  return Yup.object({
    accessionNumber: Yup.string().trim().required('Accession number is required'),
    memberId: Yup.string().required('Choose a Library member'),
    academicYearId: requireYear
      ? Yup.string().trim().required('Choose the staff loan academic year')
      : Yup.string(),
    issueDate: date('Issue date'),
    dueDate:
      manualDue === false
        ? Yup.mixed<Dayjs>().nullable()
        : manualDue
          ? due.required('Due date is required')
          : due,
  });
};
