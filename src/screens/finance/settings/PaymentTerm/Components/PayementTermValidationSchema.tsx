import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

export const paymentTermValidationSchema = Yup.object().shape({
  paymentTermName: Yup.string()
    .trim()
    .required('Payment Term Name is required')
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Cannot exceed 50 characters'),
  totalInstallments: Yup.string().required('Total Installment is required'),
  academicYearId: Yup.string().required('Academic Year is required'),

  board: Yup.string().required('Board is required'),

  medium: Yup.string().required('Medium is required'),

  receiptBook: Yup.string().required('Receipt Book is required'),

  paymentTerm: Yup.string().required('Payment Term is required'),

  installments: Yup.array()
    .of(
      Yup.object().shape({
        installmentName: Yup.string().required('Installment Name is required'),
        percentage: Yup.number()
          .transform((value, originalValue) =>
            String(originalValue).trim() === '' ? undefined : Number(originalValue)
          )
          .required('Percentage is required')
          .min(1, 'Percentage must be at least 1')
          .max(100, 'Percentage cannot exceed 100'),
        dueDate: Yup.mixed()
          .required('Due Date is required')
          .test('min-year', function (value) {
            const context = this.options.context as { academicYear?: string };
            const { academicYear } = context; // <-- comes from Formik context
            if (!academicYear || !value) return true;

            const [startYear, endYear] = academicYear.split('-').map(Number);
            const dueYear = dayjs(value as Dayjs).year();

            if (dueYear < startYear || dueYear > endYear) {
              return this.createError({
                message: `Due Date between ${startYear} and ${endYear}`,
              });
            }
            return true;
          }),

        reminderDate: Yup.mixed()
          .required('Reminder Date is required')
          .test('reminder-before-due', 'Reminder date must be before due date', function (value) {
            const { dueDate } = this.parent;
            if (!value || !dueDate) return true;
            return dayjs(value as Dayjs).isBefore(dayjs(dueDate));
          })
          .test('min-year', function (value) {
            const context = this.options.context as { academicYear?: string };
            const { academicYear } = context; // <-- comes from Formik context
            if (!academicYear || !value) return true;

            const [startYear, endYear] = academicYear.split('-').map(Number);
            const dueYear = dayjs(value as Dayjs).year();

            if (dueYear < startYear || dueYear > endYear) {
              return this.createError({
                message: `Due Date between ${startYear} and ${endYear}`,
              });
            }
            return true;
          }),
        gracePeriod: Yup.number()
          .min(1, 'Grace Period must be greater than 0')
          .required('Grace Period is required'),
        overdueCharges: Yup.number()
          .min(1, 'Overdue Charges must be greater than 0')
          .required('Overdue Charges is required'),
      })
    )
    .required('Installments are required')
    .min(1, 'At least one installment is required')
    .test(
      'total-percentage',
      'Total percentage of installments cannot exceed 100',
      (installments) => {
        if (!installments || installments.length === 0) return true;

        const total = installments.reduce(
          (sum, inst) => sum + (typeof inst.percentage === 'number' ? inst.percentage : 0),
          0
        );

        return total <= 100;
      }
    )
    .test('unique-due-dates', 'Due Dates must be unique across installments', (installments) => {
      if (!installments) return true;

      for (let i = 0; i < installments.length; i += 1) {
        for (let j = i + 1; j < installments.length; j += 1) {
          if (
            installments[i].dueDate &&
            installments[j].dueDate &&
            dayjs(installments[i].dueDate as Dayjs).isSame(
              dayjs(installments[j].dueDate as Dayjs),
              'day'
            )
          ) {
            return false;
          }
        }
      }
      return true;
    }),
});
