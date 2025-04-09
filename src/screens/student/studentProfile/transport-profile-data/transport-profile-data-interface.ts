interface IDriver {
  name: string;
  contact: string;
}

interface IStop {
  name: string;
  pickupTime: string;
  dropTime: string;
}

interface ITransport {
  vehicleNumber: string;
  driver: IDriver;
  stop: IStop;
}

export interface IStudentDetails {
  name: string;
  grade: string;
  transport: ITransport;
}
