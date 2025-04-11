import type { IStudentDetails } from './transport-profile-data-interface';

export const studentDetails: IStudentDetails = {
  name: 'Alice Johnson',
  grade: 'Grade 5',
  transport: {
    vehicleNumber: 'MH12-AB-1234',
    driver: {
      name: 'John Doe',
      contact: '+91 9876543210',
    },
    stop: {
      name: 'Main Street Stop',
      pickupTime: '7:30 AM',
      dropTime: '4:30 PM',
    },
  },
};
