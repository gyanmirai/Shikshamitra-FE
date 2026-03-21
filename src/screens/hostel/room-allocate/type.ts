import type { IHostelRequestFormType } from '../new-request/components/type';

export interface IHostelTableDataProps {
  requests: any[];
  onDelete: (req: IHostelRequestFormType) => void;
  onRequestDetails: (request: IHostelRequestFormType) => void;
  onAssignRoom: (request: IHostelRequestFormType) => void;
  onRejected: (request: IHostelRequestFormType) => void;
  onLeftStudent: (request: IHostelRequestFormType) => void;
}

export interface IAllocateRoomDialogProps {
  open: boolean;
  onClose: (e: any, isSubmit: true) => void;
  request: IHostelRequestFormType | null;
  disabled: boolean;
}

export interface IAllocateRoomDialogFormProps {
  hostelType: string;
  hostelName: string;
  roomName: string;
}
