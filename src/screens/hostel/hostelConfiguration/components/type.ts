export interface IHostelData {
  hostelName: string;
  totalRoomCapacity: number;
  wardenDetails: string;
  currentOccupation: string; // e.g., "250/500"
  hostelType: string;
  location: string;
}

export interface IHostelDataTableProps {
  openDialog: boolean;
  setOpenDialog: (value: boolean) => void;
  editData?: IHostelData | null;
  setEditData: (value: IHostelData | null) => void;
  data: IHostelData[];
  onDelete: (data: IHostelData) => void;
  onEdit: (data: IHostelData) => void;
}
