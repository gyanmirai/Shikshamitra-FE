import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

export const paymentTermValidationSchema = (currentYear: any) =>
  Yup.object().shape({
    paymentTermName: Yup.string()
      .trim()
      .required('Payment Term Name is required')
      .min(2, 'Must be at least 2 characters')
      .max(50, 'Cannot exceed 50 characters'),
    totalInstallments: Yup.number()
      .typeError('Total installments must be a number')
      .min(1, 'At least 1 installment required')
      .max(12, 'Maximum 12 installments allowed')
      .required('Total Installments is required'),

    // academicYearId: Yup.string().required('Academic Year is required'),

    // board: Yup.string().required('Board is required'),

    // medium: Yup.string().required('Medium is required'),

    receiptBook: Yup.string().required('Receipt Book is required'),

    paymentTerm: Yup.string().required('Payment Term is required'),

    installments: Yup.array()
      .test(
        'total-100',
        'Total percentage across installments must be exactly 100',
        (installments = []) => {
          if (!installments.length) return true; // skip if empty
          const total = installments.reduce(
            (sum, inst) => sum + (typeof inst?.percentage === 'number' ? inst.percentage : 0),
            0
          );
          return total === 100;
        }
      )
      .of(
        Yup.object().shape({
          installmentName: Yup.string().required('Installment Name is required'),

          dueDate: Yup.mixed()
            .required('Due Date is required')
            .test(
              'is-valid-dayjs',
              'Due Date must be a valid date',
              (value) => value && dayjs(value as any).isValid()
            )
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
            ),

          reminderDate: Yup.mixed()
            .required('Reminder Date is required')
            .test(
              'is-valid-dayjs',
              'Reminder Date must be a valid date',
              (value) => value && dayjs(value as any).isValid()
            )
            // eslint-disable-next-line func-names
            .test('reminder-before-due', 'Reminder date must be before due date', function (value) {
              const { dueDate } = this.parent;
              if (!value || !dueDate) return true;
              return dayjs(value as any).isBefore(dayjs(dueDate));
            })
            .test(
              'min-date',
              (value) =>
                `Reminder Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
              (value) =>
                value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
            )
            .test(
              'max-date',
              (value) =>
                `Reminder Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
              (value) =>
                value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
            ),
        })
      )
      .required('Installments are required')
      .min(1, 'At least one installment is required')
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
