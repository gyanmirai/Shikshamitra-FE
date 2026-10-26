import { EmployeeLeaveStatusOptions } from 'src/enums/employee-leave-status';
import type { ServerColumnBinding } from '../utils/server-column-filters';


export const leaveRequestColumnBindings: ServerColumnBinding[] = [
  { column: 'status', query: 'status', options: EmployeeLeaveStatusOptions, emptyValue: '' },
  {
    column: 'paidType',
    query: 'paidType',
    emptyValue: '',
    options: [
      { label: 'Paid', value: 'Paid' },
      { label: 'Unpaid', value: 'Unpaid' },
    ],
  },
];
