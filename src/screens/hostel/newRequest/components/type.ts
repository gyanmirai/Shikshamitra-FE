import type { Dayjs } from 'dayjs';
import type { IState, ICountry } from 'country-state-city';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IHostelRequestFormType {
  hostelName: string;
  hostelType: string;
  className: string;
  division: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  packageName: string;
  totalAmount: number;
  scheduleDate: string | Dayjs | null;
  joinDate: string | Dayjs | null;
  feesFrequency: string;
  interationCost: string;
  email: string;
  parentsContactNo: string;
  alternateContactDetails: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  country?: ICountry;
  state?: IState;
  city?: string;
  village: string;
  pinCode: string;
}

export interface IHostelRequestTableProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  addNewRequestDialog: UseBooleanReturn;
  requests: IHostelRequestFormType[];
  onDelete: (data: IHostelRequestFormType) => void;
  onEdit: (data: IHostelRequestFormType) => void;
  onRequestDetails: (data: IHostelRequestFormType) => void;
}
