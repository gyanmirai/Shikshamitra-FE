import type { IStudent } from './notification-interface';

export const allStudents: IStudent[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    class: 'Class 1',
    division: 'A',
    organization: 'Org 1',
    contactNumber: '9187654576',
    email: 'abc@gmail.com',
  },
  {
    id: 2,
    name: 'Bob Smith',
    class: 'Class 2',
    division: 'B',
    organization: 'Org 2',
    contactNumber: '9187654576',
    email: 'abc@gmail.com',
  },
  {
    id: 3,
    name: 'Charlie Brown',
    class: 'Class 1',
    division: 'A',
    organization: 'Org 1',
    contactNumber: '9187654576',
    email: 'abc@gmail.com',
  },
  {
    id: 4,
    name: 'David Williams',
    class: 'Class 3',
    division: 'C',
    organization: 'Org 3',
    contactNumber: '9187654576',
    email: 'abc@gmail.com',
  },
  {
    id: 5,
    name: 'Emma Davis',
    class: 'Class 2',
    division: 'B',
    organization: 'Org 2',
    contactNumber: '9187654576',
    email: 'abc@gmail.com',
  },
];

export const templates = {
  overdueFee:
    'Dear [Student Name], your fee of [Amount] is overdue. Please pay before [Due Date]. check check check check check check',
  feeReminder: 'Hello [Student Name], kindly pay your fee amount [Amount] before [Due Date].',
};
