export interface IHostelBed {
  bedNumber: string;
  hostelName: string;
}

export interface IBedNumberFormProps {
  dialog: { value: boolean; onTrue: () => void; onFalse: () => void };
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IHostelBed | null;
}
