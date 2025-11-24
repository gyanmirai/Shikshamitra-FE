export interface ISection {
  id: string;
  sectionName: string;
  numberOfColumns: number;
  createdBy?: string;
  createdOn?: string;
  shelfNames: string[];
}

export interface ISectionTableProps {
  onAddSection: any;
  editData: ISection | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: ISection | null) => void;
  onDelete: (data: ISection) => void;
  onEdit: (data: ISection) => void;
  onView: (data: ISection) => void;
}

export interface ISectionFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: ISection | null;
}
