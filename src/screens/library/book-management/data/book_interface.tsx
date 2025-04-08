interface IEdition {
  year: number;
  publisher?: string;
  totalCopies: number;
  availableCopies: number;
  currentIssuers?: {
    userId: string;
    name: string;
    role: string;
    issueDate: string;
    dueDate: string;
  }[];
  reservedList?: {
    userId: string;
    name: string;
    role: string;
    reservationDate: string;
  }[];
}

export interface IBook {
  id: string;
  title: string;
  author: string;
  publisher: string;
  editions: IEdition[];
}

interface IPendingCharge {
  type: string;
  amount: number;
  status: string;
}

export interface IMember {
  id: string;
  name: string;
  role: string;
  pendingCharges: IPendingCharge[];
}
