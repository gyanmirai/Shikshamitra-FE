interface Grade {
  grade: string;
  availableStudents: string[];
}

interface Route {
  value: string;
  label: string;
}

interface PickupPoint {
  value: string;
  label: string;
}

export const availableGrades: any[] = [
  { grade: '1', availableStudents: ['Aarav Patel'] },
  { grade: '2', availableStudents: ['Meera Shah'] },
  { grade: '3', availableStudents: ['Rohan Joshi'] },
  { grade: '9', availableStudents: ['Vikram Mehta', 'Rahul Gandhi'] },
  { grade: '10', availableStudents: ['Priya Desai', 'Anjali Verma'] },
  { grade: '11', availableStudents: ['Sanjay Kumar'] },
  { grade: '12', availableStudents: ['Neha Sharma', 'Kavita Desai'] },
];

export const assignedRoutesList: any[] = [
  { value: 'R101', label: 'R101' },
  { value: 'R102', label: 'R102' },
  { value: 'R103', label: 'R103' },
  { value: 'R104', label: 'R104' },
];

export const pickupPointsList: any[] = [
  { value: 'School', label: 'School' },
  { value: 'Dindoli', label: 'Dindoli' },
  { value: 'Godadara', label: 'Godadara' },
  { value: 'Mini Bazar', label: 'Mini Bazar' },
  { value: 'Ved', label: 'Ved' },
];
