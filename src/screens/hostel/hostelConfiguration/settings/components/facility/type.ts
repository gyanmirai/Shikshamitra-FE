export interface IFacility {
  facilityName: string;
  description: string;
  facilities: string[];
}

export interface IFacilityFormProps {
  dialog: { onFalse: () => void };
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IFacility | null;
}
