// validations/leaveValidationSchema.ts
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { EmployeeLeaveStatusType } from 'src/enums/employee-leave-status';

export const getLeaveValidationSchema = (editData?: any) =>
  Yup.object().shape({
    leaveType: Yup.string().required('Leave type is required'),
    isHalfDay: Yup.boolean(),
    startDate: Yup.date().required('Start date is required'),
    endDate: Yup.string()
      .nullable()
      // eslint-disable-next-line func-names
      .test('endDate', '', function (value) {
        const { isHalfDay, startDate } = this.parent;
        if (isHalfDay) return true;
        if (startDate && value) {
          const fullStartDate = dayjs(startDate);
          const endDate = dayjs(value);
          const isAfter = endDate.isAfter(fullStartDate);
          return isAfter || this.createError({ message: 'End date must be after start date' });
        }
        if (!value && !isHalfDay) {
          return this.createError({ message: 'End date is required' });
        }
        return true;
      }),
    description: Yup.string().required('Description is required'),
    status: editData ? Yup.string().required('Status is required') : Yup.string().nullable(),
    rejectionReason: Yup.string().test(
      'rejectionReason',
      'Rejection reason is required',
      // eslint-disable-next-line func-names
      function (value) {
        const { status } = this.parent;
        if (editData && status === EmployeeLeaveStatusType.Rejected) {
          return !!value || this.createError({ message: 'Rejection reason is required' });
        }
        return true;
      }
    ),
  });
