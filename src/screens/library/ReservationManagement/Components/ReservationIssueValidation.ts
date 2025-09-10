import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getReservationIssueBookSchema = (currentYear: any) =>
  Yup.object().shape({
    bookCategory: Yup.string().required('Book category is required'),
    bookTitle: Yup.string().required('Book title is required'),
    edition: Yup.string().required('Edition is required'),
    issueDate: Yup.mixed()
      .required('Issue date is required')
      .test('is-valid-dayjs', 'Issue date must be a valid date', (value) =>
        value ? dayjs(value as Dayjs).isValid() : false
      )
      .test(
        'min-date',
        (value) =>
          `Issue date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Issue date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),

    dueDate: Yup.mixed()
      .required('Due date is required')
      .test('is-valid-dayjs', 'Due date must be a valid date', (value) =>
        value ? dayjs(value as Dayjs).isValid() : false
      )
      // eslint-disable-next-line func-names
      .test('is-after-issue-date', 'Due date cannot be before Issue date', function (value) {
        const { issueDate } = this.parent;
        if (!value || !issueDate) return true;
        return dayjs(value as Dayjs).isSameOrAfter(dayjs(issueDate), 'day');
      })
      .test(
        'min-date',
        (value) =>
          `Due date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Due date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),
  });
