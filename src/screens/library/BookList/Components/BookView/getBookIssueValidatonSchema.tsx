import dayjs from 'dayjs';
import * as Yup from 'yup';

// ------------------ Schema ------------------
export const getIssueBookSchema = (currentYear: any) =>
  Yup.object().shape({
    accessionNumber: Yup.string().required('Accession No. is required'),
    issueDate: Yup.mixed()
      .required('Issue date is required')
      .test(
        'is-valid-dayjs',
        'Issue date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'min-date',
        (value) =>
          `Issue date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Issue date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),
    dueDate: Yup.mixed()
      .required('Due date is required')
      .test(
        'is-valid-dayjs',
        'Due date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      // eslint-disable-next-line func-names
      .test('is-after-issue-date', 'Due date cannot be before Issue date', function (value) {
        const { issueDate } = this.parent;
        if (!value || !issueDate) return true;
        return dayjs(value as any).isSameOrAfter(dayjs(issueDate));
      })
      .test(
        'min-date',
        (value) =>
          `Due date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Due date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),
    memberId: Yup.string().required('Member Id is required'),
  });
