import * as Yup from 'yup';

// ------------------ Schema ------------------
export const getIssueBookSchema = (currentYear: any) =>
  Yup.object().shape({
    bookCategory: Yup.string().required('Book category is required'),
    bookTitle: Yup.string().required('Book title is required'),
    edition: Yup.string().required('Edition is required'),
    role: Yup.string().required('Role is required'),
    // Validate class only if role === 'Student'
    class: Yup.string().when('role', {
      is: 'Student',
      then: (schema) => schema.required('Class is required'),
      otherwise: (schema) => schema.nullable(),
    }),
    division: Yup.string().when('role', {
      is: 'Student',
      then: (schema) => schema.required('Division is required'),
      otherwise: (schema) => schema.nullable(),
    }),
    member: Yup.string().required('Member is required'),
    accessionNumber: Yup.string().required('Accession number is required'),
    // issueDate: Yup.mixed()
    //   .required('Issue date is required')
    //   .test(
    //     'is-valid-dayjs',
    //     'Issue date must be a valid date',
    //     (value) => value && dayjs(value as any).isValid()
    //   )
    //   .test(
    //     'min-date',
    //     (value) =>
    //       `Issue date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
    //     (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
    //   )
    //   .test(
    //     'max-date',
    //     (value) =>
    //       `Issue date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
    //     (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
    //   ),

    // dueDate: Yup.mixed()
    //   .required('Due date is required')
    //   .test(
    //     'is-valid-dayjs',
    //     'Due date must be a valid date',
    //     (value) => value && dayjs(value as any).isValid()
    //   )
    //   // eslint-disable-next-line func-names
    //   .test('is-after-issue-date', 'Due date cannot be before Issue date', function (value) {
    //     const { issueDate } = this.parent;
    //     if (!value || !issueDate) return true;
    //     return dayjs(value as any).isSameOrAfter(dayjs(issueDate));
    //   })
    //   .test(
    //     'min-date',
    //     (value) =>
    //       `Due date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
    //     (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
    //   )
    //   .test(
    //     'max-date',
    //     (value) =>
    //       `Due date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
    //     (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
    //   ),
  });
