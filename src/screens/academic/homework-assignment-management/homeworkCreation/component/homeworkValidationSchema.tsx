import dayjs from 'dayjs';
import * as Yup from 'yup';

export const homeworkValidationSchema = (currentYear: any) =>
  Yup.object().shape({
    title: Yup.string().required('Homework Title is required'),
    class: Yup.string().required('Class is required'),
    description: Yup.string().required('Description is required'),
    divisions: Yup.array()
      .of(
        Yup.object().shape({
          divisionId: Yup.string().required('Division is required'),
          publishDate: Yup.mixed()
            .test(
              'min-date',
              (value) =>
                `Publish Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
              (value) =>
                value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
            )
            .test(
              'max-date',
              (value) =>
                `Publish Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
              (value) =>
                value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
            )
            .required('Publish Date is required'),
          dueDate: Yup.mixed()
            .test(
              'min-date',
              (value) =>
                `Due Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
              (value) =>
                value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
            )
            .test(
              'max-date',
              (value) =>
                `Due Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
              (value) =>
                value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
            )
            // eslint-disable-next-line func-names
            .test('after-publish', 'Due Date must be on or after Publish Date', function (value) {
              const { publishDate } = this.parent;
              return (
                !value ||
                !publishDate ||
                dayjs(value as any).isSameOrAfter(dayjs(publishDate), 'day')
              );
            })
            .required('Due Date is required'),
        })
      )
      .min(1, 'At least one Division is required')
      .test('schedule-complete', 'Select schedule dates also', (value) => {
        if (!value || value.length === 0) return true; // Let .min(1) handle empty case
        return value.every((div) => div.publishDate && div.dueDate);
      }),
    subjectId: Yup.string().required('Subject is required'),
    chapters: Yup.array().of(Yup.string()),
    homeworkTypeId: Yup.string().required('Homework Type is required'),
    submissionType: Yup.string().required('Submission type is required'),
    attachments: Yup.array(),
  });
