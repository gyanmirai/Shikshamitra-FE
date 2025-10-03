import dayjs from 'dayjs';
import * as Yup from 'yup';

export const budgetValidationSchema = (currentYear: any) => [
  // Step 1 – Basic Budget Info
  Yup.object().shape({
    board: Yup.string().required('Board is required'),
    budgetTitle: Yup.string().required('Budget Title is required'),
    budgetCategory: Yup.string().required('Budget Category is required'),
    budgetSubCategories: Yup.array().min(1, 'Select at least one sub-category'),
    startDate: Yup.mixed()
      .test(
        'is-valid-date',
        'Start Date is required',
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
      )
      .required('Start Date is required'),

    endDate: Yup.mixed()
      .test(
        'is-valid-date',
        'End Date is required',
        (value) => value && dayjs(value as any).isValid()
      )
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
      )
      .required('End Date is required')
      .test('is-after-start', 'End date must be after Start date', function (value) {
        const { startDate } = this.parent;
        return dayjs(value as any).isAfter(dayjs(startDate));
      }),

    totalBudgetAmount: Yup.number()
      .required('Total Budget Amount is required')
      .min(1, 'Total Budget Amount Must be greater than 0'),

    spendingThreshold: Yup.number()
      .min(1, 'Threshold must be at least 1%')
      .max(100, 'Threshold cannot exceed 100%')
      .required('Spending Threshold is required'),

    departments: Yup.array().min(1, 'Select at least one department'),
  }),

  // Step 2 – Subcategories
  Yup.object().shape({
    totalBudgetAmount: Yup.number().required('Total budget amount is required'),
    subCategories: Yup.array()
      .of(
        Yup.object().shape({
          category: Yup.string().required('Category is required'),
          subCategory: Yup.string().required('Sub Category is required'),
          amount: Yup.number()
            .min(1, 'Amount must be greater than 0')
            .required('Amount is required')
            .test('budget-limit', function (value) {
              const { path, createError, from } = this;
              const allValues = from && from.length > 0 ? from[from.length - 1]?.value : undefined;
              const totalBudgetAmount = allValues?.totalBudgetAmount;
              const subCategories = allValues?.subCategories;

              if (!subCategories || !totalBudgetAmount) return true;

              const totalAllocated = subCategories.reduce((sum: number, item: any) => {
                const amount =
                  typeof item.amount === 'string' ? parseFloat(item.amount) || 0 : item.amount || 0;
                return sum + amount;
              }, 0);

              const remaining = Number(totalBudgetAmount) - totalAllocated;

              if (remaining < 0) {
                return createError({
                  path,
                  message: `Amount cannot exceed total budget amount`,
                });
              }

              return true;
            }),
        })
      )
      .min(1, 'At least one subcategory is required'),
  }),
  // Step 3 – Review (no validation)
  Yup.object().shape({}),
];
