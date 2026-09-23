import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export const SUBJECT_CATEGORIES = [
  'General',
  'Language',
  'Scholastic',
  'Co-Scholastic',
  'Activity',
  'Practical',
] as const;

export const SUBJECT_ICONS = [
  { value: 'book', label: 'Book', icon: 'lucide:book-open' },
  { value: 'calculator', label: 'Calculator', icon: 'lucide:calculator' },
  { value: 'flask', label: 'Flask', icon: 'lucide:flask-conical' },
  { value: 'monitor', label: 'Monitor', icon: 'lucide:monitor' },
  { value: 'music', label: 'Music', icon: 'lucide:music' },
  { value: 'trophy', label: 'Trophy', icon: 'lucide:trophy' },
  { value: 'palette', label: 'Palette', icon: 'lucide:palette' },
] as const;

export const SUBJECT_ICON_MAP: Record<string, string> = {
  book: 'lucide:book-open',
  calculator: 'lucide:calculator',
  flask: 'lucide:flask-conical',
  monitor: 'lucide:monitor',
  music: 'lucide:music',
  trophy: 'lucide:trophy',
  palette: 'lucide:palette',
};

export const getSubjectIcon = (icon?: string): string => {
  if (!icon) return 'lucide:book-open';
  return SUBJECT_ICON_MAP[icon] || icon;
};

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
  insightsOpen: boolean;
  onCloseInsights: () => void;
  canAdd?: boolean;
  canView?: boolean;
  canDelete?: boolean;
}
