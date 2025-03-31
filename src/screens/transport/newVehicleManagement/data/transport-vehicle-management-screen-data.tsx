interface Insurance {
  policyNumber: string;
  provider: string;
  expiryDate: string;
  coverageDetails: string;
}

interface Maintenance {
  lastMaintenanceDate: string;
  nextScheduledMaintenance: string;
  notes: string;
}

interface Driver {
  id: string;
  name: string;
}

interface Route {
  id: string;
  name: string;
}

interface DailyInspection {
  date: string;
  inspector: string;
  remarks: string;
  issuesFound: string[];
  actionTaken: string;
}

interface Student {
  name: string;
  id: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  capacity: number;
  occupied: number;
  registrationNumber: string;
  registrationDate: string;
  registrationExpiryDate: string;
  insurance: Insurance;
  maintenance: Maintenance;
  fuelType: string;
  currentStatus: string;
  trackingEnabled: boolean;
  trackerId: string | null;
  assignedDriver: Driver;
  assignedRoute: Route;
  dailyInspection: DailyInspection[];
  studentList: Student[];
}

// Define the vehicle data array
export const Vehicledata: Vehicle[] = [
  {
    id: 'bus1',
    name: 'School Bus 1',
    type: 'Bus',
    capacity: 40,
    occupied: 40,
    registrationNumber: 'MH-12-AB-1234',
    registrationDate: '01-01-2020',
    registrationExpiryDate: '01-01-2025',
    insurance: {
      policyNumber: 'INS123456',
      provider: 'National Insurance Co.',
      expiryDate: '01-01-2024',
      coverageDetails: 'Third-party and comprehensive coverage',
    },
    maintenance: {
      lastMaintenanceDate: '01-10-2023',
      nextScheduledMaintenance: '01-02-2024',
      notes: 'Oil change and brake check completed.',
    },
    fuelType: 'Diesel',
    currentStatus: 'Active',
    trackingEnabled: true,
    trackerId: 'GPS12345',
    assignedDriver: {
      id: 'driver1',
      name: 'Rakesh Mahajan',
    },
    assignedRoute: {
      id: 'route1',
      name: 'Route 1: Downtown to School',
    },
    dailyInspection: [
      {
        date: '2024-12-10',
        inspector: 'John Doe',
        remarks: 'Brakes are slightly worn; consider maintenance.',
        issuesFound: ['Brakes'],
        actionTaken: 'Scheduled maintenance for brakes.',
      },
      {
        date: '2024-12-09',
        inspector: 'Jane Smith',
        remarks: 'All systems functioning well.',
        issuesFound: [],
        actionTaken: 'None',
      },
    ],
    studentList: [
      { name: 'Jay', id: '' },
      { name: 'Hiren', id: '' },
    ],
  },
  {
    id: 'bus2',
    name: 'School Bus 2',
    type: 'Bus',
    capacity: 50,
    occupied: 40,
    registrationNumber: 'MH-12-CD-5678',
    registrationDate: '01-03-2019',
    registrationExpiryDate: '01-03-2024',
    insurance: {
      policyNumber: 'INS654321',
      provider: 'State Insurance Corp.',
      expiryDate: '01-03-2024',
      coverageDetails: 'Third-party only',
    },
    maintenance: {
      lastMaintenanceDate: '01-09-2023',
      nextScheduledMaintenance: '01-01-2024',
      notes: 'Tire replacement required soon.',
    },
    fuelType: 'CNG',
    currentStatus: 'Inactive',
    trackingEnabled: false,
    trackerId: null,
    assignedDriver: {
      id: 'driver2',
      name: 'Rajesh Patel',
    },
    assignedRoute: {
      id: 'route2',
      name: 'Route 2: Suburb to School',
    },
    dailyInspection: [
      {
        date: '2024-12-10',
        inspector: 'Jane Smith',
        remarks: 'Tire pressure low.',
        issuesFound: ['Tire pressure'],
        actionTaken: 'Inflated tires.',
      },
    ],
    studentList: [],
  },
];
