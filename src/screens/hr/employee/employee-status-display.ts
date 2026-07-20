import dayjs from 'dayjs';
import { EmployeeStatusType } from 'src/enums/employee-status-type';

export const isFutureDateOnly = (value?: string | Date | null) => {
  if (!value) {
    return false;
  }

  const date = dayjs(value);
  return date.isValid() && date.startOf('day').isAfter(dayjs().startOf('day'));
};

export const getEmployeeStatusDisplayValue = (status: EmployeeStatusType, doj?: string | Date | null) =>
  status === EmployeeStatusType.Active && isFutureDateOnly(doj)
    ? 'Upcoming'
    : EmployeeStatusType[status];
