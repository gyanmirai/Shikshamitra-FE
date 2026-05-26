import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getChapterValidationSchema = (
  currentYear: { startDate: string; endDate: string },
  existingChapters: Array<{ chapterNumber: number; id: string }> = [],
  editingChapterId?: string
) =>
  Yup.object({
    chapterNo: Yup.number()
      .required('Chapter Number is required')
      .test('unique-chapter-no', 'This Chapter Number is already used', (value) => {
        if (value === undefined || value === null) return true;
        return !existingChapters.some(
          (ch) => ch.chapterNumber === Number(value) && ch.id !== editingChapterId
        );
      }),
    chapterName: Yup.string().required('Chapter Name is required'),
    startDate: Yup.mixed()
      .required('Chapter Start Date is required')
      .test(
        'is-valid-dayjs',
        'Chapter Start Date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'min-date',
        (value) =>
          `Start Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Start Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),

    endDate: Yup.mixed()
      .required('Chapter End Date is required')
      .test(
        'is-valid-dayjs',
        'Chapter End Date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      // eslint-disable-next-line func-names
      .test('is-after-start-date', 'End Date cannot be before Start Date', function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return dayjs(value as any).isSameOrAfter(dayjs(startDate));
      })
      .test(
        'min-date',
        (value) =>
          `End Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `End Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),
  });
