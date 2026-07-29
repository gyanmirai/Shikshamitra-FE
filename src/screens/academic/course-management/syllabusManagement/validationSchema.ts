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
    chapterName: Yup.string()
      .required('Chapter Name is required')
      .min(3, 'minimum 3 character required'),
    unitName: Yup.string().max(128, 'Unit name must be 128 characters or less'),
    termName: Yup.string().max(128, 'Term name must be 128 characters or less'),
    estimatedTeachingDays: Yup.number()
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .min(0, 'Teaching days cannot be negative'),
    estimatedPeriods: Yup.number()
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .min(0, 'Periods cannot be negative'),
    revisionDays: Yup.number()
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .min(0, 'Revision days cannot be negative'),
    bufferDays: Yup.number()
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .min(0, 'Buffer days cannot be negative'),
    progressPercentage: Yup.number()
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? 0 : value))
      .min(0, 'Progress cannot be below 0')
      .max(100, 'Progress cannot be above 100'),
    healthScore: Yup.number()
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? 0 : value))
      .min(0, 'Health score cannot be below 0')
      .max(100, 'Health score cannot be above 100'),
    questionCount: Yup.number()
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? 0 : value))
      .min(0, 'Question count cannot be negative'),
    marksWeightage: Yup.number()
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .min(0, 'Marks weightage cannot be negative'),
    startDate: Yup.mixed()
      .required('Chapter Start Date is required')
      .test(
        'is-valid-dayjs',
        'Chapter Start Date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'min-date',
        `Start Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')} (academic year start)`,
        (value) => !value || !dayjs(value as any).isBefore(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        `Start Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')} (academic year end)`,
        (value) => !value || !dayjs(value as any).isAfter(dayjs(currentYear.endDate), 'day')
      )
      .test(
        'no-past-date',
        'Start Date cannot be in the past',
        (value) => !value || !dayjs(value as any).isBefore(dayjs(), 'day')
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
        return !dayjs(value as any).isBefore(dayjs(startDate), 'day');
      })
      .test(
        'no-past-date',
        'End Date cannot be in the past',
        (value) => !value || !dayjs(value as any).isBefore(dayjs(), 'day')
      )
      .test(
        'min-date',
        `End Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')} (academic year start)`,
        (value) => !value || !dayjs(value as any).isBefore(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        `End Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')} (academic year end)`,
        (value) => !value || !dayjs(value as any).isAfter(dayjs(currentYear.endDate), 'day')
      ),
  });
