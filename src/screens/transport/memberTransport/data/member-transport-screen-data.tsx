export interface Assignment {
  name: string;
  grade: string;
  id: number;
  assignedRoute: string;
  pickupPoint: string;
  dropoffPoint: string;
  role: 'Student' | 'Teacher';
  declinedReason?: string;
  status?: string;
  reason?: string;
  preferable?: string;
}

export interface StudentAssignment extends Assignment {
  grNo: string;
  role: 'Student';
}

export interface StaffAssignment extends Assignment {
  employeeNo: string;
  role: 'Teacher';
}

export const assignmentsForStaff: StaffAssignment[] = [
  {
    name: 'Ms. Anjali Verma',
    grade: '-',
    id: 9,
    assignedRoute: 'R108',
    pickupPoint: 'School',
    dropoffPoint: 'Ved',
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
    role: 'Teacher',
    employeeNo: '568',
  },
  {
    name: 'Ms. Kavita Desai',
    grade: '-',
    id: 10,
    assignedRoute: 'R110',
    pickupPoint: 'School',
    dropoffPoint: 'Godadara',
    role: 'Teacher',
    employeeNo: '569',
  },
];

export const assignments: StudentAssignment[] = [
  {
    name: 'Aarav Patel',
    grade: '1',
    id: 1,
    assignedRoute: 'R101',
    pickupPoint: 'School',
    dropoffPoint: 'Dindoli',
    role: 'Student',
    grNo: '570',
  },
  {
    name: 'Meera Shah',
    grade: '2',
    id: 3,
    assignedRoute: 'R102',
    pickupPoint: 'School',
    dropoffPoint: 'Godadara',
    role: 'Student',
    grNo: '571',
  },
];
