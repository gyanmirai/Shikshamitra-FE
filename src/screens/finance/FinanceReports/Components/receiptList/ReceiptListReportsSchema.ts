import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getReceiptListReportsValidationSchema = (fields: string[], currentYear: any) => {
  const schemaFields: Record<string, any> = {
    report: Yup.string().required('Report is required'),
  };

  if (fields.includes('board')) {
    schemaFields.board = Yup.string().required('Board is required');
  }
  if (fields.includes('medium')) {
    schemaFields.medium = Yup.string().required('Medium is required');
  }
  if (fields.includes('organizations')) {
    schemaFields.organizations = Yup.array().min(1, 'At least one organization is required');
  }
  if (fields.includes('organizationSingle')) {
    schemaFields.organizationSingle = Yup.string().required('Organization is required');
  }
  if (fields.includes('standards')) {
    schemaFields.standards = Yup.array().min(1, 'At least one class is required');
  }
  if (fields.includes('divisions')) {
    schemaFields.divisions = Yup.array().min(1, 'At least one division is required');
  }
  if (fields.includes('students')) {
    schemaFields.students = Yup.array().min(1, 'At least one student is required');
  }
  if (fields.includes('months')) {
    schemaFields.months = Yup.array().min(1, 'At least one month is required');
  }
  if (fields.includes('feeHeads')) {
    schemaFields.feeHeads = Yup.array().min(1, 'At least one fee head is required');
  }
  if (fields.includes('receiptBooks')) {
    schemaFields.receiptBooks = Yup.array().min(1, 'At least one receipt book is required');
  }
  if (fields.includes('receiptBookSingle')) {
    schemaFields.receiptBookSingle = Yup.string().required('Receipt Book is required');
  }
  if (fields.includes('batch')) {
    schemaFields.batch = Yup.string().required('Batch is required');
  }
  if (fields.includes('payTypes')) {
    schemaFields.payTypes = Yup.array().min(1, 'At least one pay type is required');
  }
  if (fields.includes('academicYear')) {
    schemaFields.academicYear = Yup.array().min(1, 'At least one academic year is required');
  }

  // Date Validations

  // FROM DATE
  if (fields.includes('fromDate')) {
    schemaFields.fromDate = Yup.mixed()
      .nullable()
      .required('From Date is required')
      .test(
        'min-date',
        `From Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (!value) return true;
          return dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day');
        }
      )
      .test(
        'max-date',
        `From Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (!value) return true;
          return dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day');
        }
      );
  }

  // TO DATE
  if (fields.includes('toDate')) {
    schemaFields.toDate = Yup.mixed()
      .nullable()
      .required('To Date is required')
      // eslint-disable-next-line func-names
      .test('is-after-start', 'To Date cannot be before From Date', function (value) {
        const { fromDate } = this.parent;
        if (!value || !fromDate) return true;
        return dayjs(value as any).isSameOrAfter(dayjs(fromDate), 'day');
      })
      .test(
        'min-date',
        `To Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (!value) return true;
          return dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day');
        }
      )
      .test(
        'max-date',
        `To Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (!value) return true;
          return dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day');
        }
      );
  }

  // FROM RECEIPT DATE
  if (fields.includes('fromReceiptDate')) {
    schemaFields.fromReceiptDate = Yup.mixed()
      .nullable()
      .required('From Receipt Date is required')
      .test(
        'min-date',
        `From Receipt Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (!value) return true;
          return dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day');
        }
      )
      .test(
        'max-date',
        `From Receipt Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (!value) return true;
          return dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day');
        }
      );
  }

  // TO RECEIPT DATE
  if (fields.includes('toReceiptDate')) {
    schemaFields.toReceiptDate = Yup.mixed()
      .nullable()
      .required('To Receipt Date is required')
      // eslint-disable-next-line func-names
      .test(
        'is-after-start',
        'To Receipt Date cannot be before From Receipt Date',
        // eslint-disable-next-line func-names
        function (value) {
          const { fromReceiptDate } = this.parent;
          if (!value || !fromReceiptDate) return true;
          return dayjs(value as any).isSameOrAfter(dayjs(fromReceiptDate), 'day');
        }
      )
      .test(
        'min-date',
        `To Receipt Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (!value) return true;
          return dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day');
        }
      )
      .test(
        'max-date',
        `To Receipt Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (!value) return true;
          return dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day');
        }
      );
  }

  return Yup.object().shape(schemaFields);
};
