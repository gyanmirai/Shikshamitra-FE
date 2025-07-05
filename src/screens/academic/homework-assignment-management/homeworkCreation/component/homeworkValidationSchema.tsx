import dayjs from 'dayjs';
import * as Yup from 'yup';

export const homeworkValidationSchema = Yup.object().shape({
  title: Yup.string().required('Homework Title is required'),
  class: Yup.string().required('Class is required'),
  description: Yup.string().required('Description is required'),
  divisions: Yup.array()
    .of(
      Yup.object().shape({
        divisionId: Yup.string().required('Division is required'),
        publishDate: Yup.mixed()
          .test(
            'is-valid-dayjs',
            'Publish Date is required',
            (value) => value && dayjs(value as any).isValid()
          )
          .required('Publish Date is required'),
        dueDate: Yup.mixed()
          .test(
            'is-valid-dayjs',
            'Due Date is required',
            (value) => value && dayjs(value as any).isValid()
          )
          .test('after-publish-date', 'Due Date cannot be before Publish Date', function (value) {
            const { publishDate } = this.parent;
            return !value || !publishDate || dayjs(value as any).isAfter(dayjs(publishDate));
          })
          .required('Due Date is required'),
      })
    )
    .min(1, 'At least one Division is required')
    .test('schedule-complete', 'Select schedule dates also', (value) => {
      if (!value || value.length === 0) return true; // Let .min(1) handle empty case
      return value.every((div) => div.publishDate && div.dueDate);
    }),
  subject: Yup.string().required('Subject is required'),
  chapters: Yup.array().of(Yup.string()),
  homeworkType: Yup.string().required('Homework Type is required'),
  submissionType: Yup.string().required('Submission type is required'),
  attachments: Yup.array(),
  createdBy: Yup.object(),
});
