import dayjs from 'dayjs';
import * as Yup from 'yup';

// ------------------ Schema ------------------
export const getReserveBookSchema = (currentYear: any) =>
  Yup.object().shape({
    requestedDate: Yup.mixed()
      .required('Requested date is required')
      .test(
        'is-valid-dayjs',
        'Requested date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'min-date',
        (value) =>
          `Requested date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Requested date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),
    reserveDueDate: Yup.mixed()
      .required('Reserve due date is required')
      .test(
        'is-valid-dayjs',
        'Reserve due date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      // eslint-disable-next-line func-names
      .test(
        'is-after-issue-date',
        'Reserve due date cannot be before Requested date',
        // eslint-disable-next-line func-names
        function (value) {
          const { requestedDate } = this.parent;
          if (!value || !requestedDate) return true;
          return dayjs(value as any).isSameOrAfter(dayjs(requestedDate));
        }
      )
      .test(
        'min-date',
        (value) =>
          `Reserve due date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Reserve due date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),
  });
