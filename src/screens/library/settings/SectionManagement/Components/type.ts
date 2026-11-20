export interface ISection {
  id: string;
  sectionName: string;
  numberOfShelf: number;
  createdBy?: string;
  createdOn?: string;
  shelfDetails?: IShelfDetail[];
  shelfNames?: string[];
  shelfItems?: string[];
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
  data: ISection[] | undefined;
  isLoading: boolean;
}

export interface ISectionFormProps {
  open: boolean;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: ISection | null;
  onBusyChange?: (busy: boolean) => void;
}

export interface IShelfDetail {
  id?: string | null;
  shelfName: string;
}

export type SectionValues = {
  sectionName: string;
  numberOfColumns: string;
  shelfNames: string[];
};

export interface ISectionDetails {
  id: string;
  sectionName: string;
  numberOfShelf: number;
  shelfDetails: IShelfDetail[];
  campusId?: string | null;
  campusName?: string | null;
}
