interface EmergencyContact {
  name: string;
  number: string;
}

interface WorkingHours {
  morning: string;
  evening: string;
}

interface AssignedVehicle {
  id: string;
  name: string;
  capacity: number;
}

export interface Driver {
  id: string;
  name: string;
  age: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  contactNumber: string;
  address: string;
  emergencyContact: EmergencyContact;
  experience: string;
  workingHours: WorkingHours;
  status: string;
  vehicle?: AssignedVehicle; // Optional, since some drivers may not have an assigned vehicle
  assignedRoute?: string; // Optional, since some drivers may not have an assigned route
}

// Define the driver data array
export const Driverdata: Driver[] = [
  {
    id: 'driver1',
    name: 'Rakesh Mahajan',
    age: '34',
    licenseNumber: 'DL123456',
    licenseExpiryDate: '20-05-2025',
    contactNumber: '+91-234-567-8951',
    address: '123 Main Street, Anytown, USA',
    emergencyContact: {
      name: 'Ravi Mahajan',
      number: '+91-234-567-8951',
    },
    experience: '10 years',
    workingHours: {
      morning: '6 AM - 9 AM',
      evening: '3 PM - 6 PM',
    },
    status: 'Active',
    vehicle: {
      id: 'bus1',
      name: 'School Bus 1',
      capacity: 40,
    },
    assignedRoute: 'route1',
  },
  {
    id: 'driver2',
    name: 'Rajesh Patel',
    age: '40',
    licenseNumber: 'DL654321',
    licenseExpiryDate: '08-15-2024',
    contactNumber: '+91-234-567-8928',
    address: '456 Elm Street, Anytown, USA',
    emergencyContact: {
      name: 'Poonam Patel',
      number: '+91-234-567-8928',
    },
    experience: '15 years',
    workingHours: {
      morning: '5 AM - 8 AM',
      evening: '2 PM - 5 PM',
    },
    status: 'Inactive',
    vehicle: {
      id: 'bus2',
      name: 'School Bus 2',
      capacity: 50,
    },
    assignedRoute: 'route2',
  },
  {
    id: 'driver1',
    name: 'Sumit Mahajan',
    age: '34',
    licenseNumber: 'DL123456',
    licenseExpiryDate: '08-08-2025',
    contactNumber: '+91-234-567-8908',
    address: '123 Main Street, Anytown, USA',
    emergencyContact: {
      name: 'Ravi Mahajan',
      number: '+91-234-567-8908',
    },
    experience: '10 years',
    workingHours: {
      morning: '6 AM - 9 AM',
      evening: '3 PM - 6 PM',
    },
    status: 'Active',
  },
];
