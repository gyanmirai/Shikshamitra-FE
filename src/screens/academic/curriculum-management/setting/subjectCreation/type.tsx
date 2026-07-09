import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface ISubject {
  id: string;
  name: string;
  displayName?: string;
  category?: string;
  color: string;
  icon?: string;
  description?: string;
  status?: 'Active' | 'Inactive' | 'Archived' | number;
  sortOrder?: number;
  usedInClassesCount?: number;
  usedInElectiveGroupsCount?: number;
  isUsed?: boolean;
  canDelete?: boolean;
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
  createdBy?: string;
}

export interface IPendingRow {
  tempId: string;
  name: string;
  displayName: string;
  category: string;
  color: string;
  icon: string;
  status: string;
  sortOrder: string;
}

export interface ISubjectFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: ISubject | null;
}

export interface ISubjectTableProps {
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: ISubject | null) => void;
  onDelete: (data: ISubject) => void;
  onArchive: (data: ISubject) => void;
  onRestore: (data: ISubject) => void;
  onViewUsage: (data: ISubject) => void;
  onEdit: (data: ISubject) => void;
  onOpenDrawer: () => void;
  canAdd?: boolean;
  canView?: boolean;
  canDelete?: boolean;
}
