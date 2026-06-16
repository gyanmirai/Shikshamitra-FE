import type { IStudentDetails } from './transport-profile-data-interface';

export const studentDetails: IStudentDetails = {
  name: '-',
  grade: '-',
  transport: {
    vehicleNumber: '-',
    driver: {
      name: '-',
      contact: '-',
    },
    stop: {
      name: '-',
      pickupTime: '-',
      dropTime: '-',
    },
  },
};
