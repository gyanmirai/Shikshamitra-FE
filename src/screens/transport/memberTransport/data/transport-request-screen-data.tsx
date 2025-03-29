import type { StaffAssignment, StudentAssignment } from './member-transport-screen-data';

export const assignments: StudentAssignment[] = [
  {
    name: 'Aarav Patel',
    grade: '1',
    id: 1,
    assignedRoute: 'R101',
    pickupPoint: 'School',
    dropoffPoint: 'Dindoli',
    preferable: '-',
    role: 'Student',
    grNo: '570',
  },
  {
    name: 'Meera Shah',
    grade: '2',
    id: 3,
    assignedRoute: 'R102',
    pickupPoint: 'School',
    dropoffPoint: '-',
    preferable: 'Godadara',
    role: 'Student',
    grNo: '571',
  },
];

export const assignmentsForStaff: StaffAssignment[] = [
  {
    name: 'Ms. Anjali Verma',
    grade: '-',
    id: 9,
    assignedRoute: 'R108',
    pickupPoint: 'School',
    dropoffPoint: 'Ved',
    preferable: '-',
    role: 'Teacher',
    employeeNo: '567',
  },
  {
    name: 'Mr. Rahul Gandhi',
    grade: '-',
    id: 11,
    assignedRoute: 'R109',
    pickupPoint: 'School',
    dropoffPoint: 'Dindoli',
    preferable: '-',
    role: 'Teacher',
    employeeNo: '568',
  },
  {
    name: 'Ms. Kavita Desai',
    grade: '-',
    id: 10,
    assignedRoute: 'R110',
    pickupPoint: 'School',
    dropoffPoint: '-',
    preferable: 'Godadara',
    role: 'Teacher',
    employeeNo: '569',
  },
];
