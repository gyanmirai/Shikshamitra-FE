import type { Dayjs } from 'dayjs';

export interface IBulkChapterEntry {
  /** Local unique key for React list rendering */
  uid: string;
  /** ID from chapter catalog (if selected from catalog) */
  chapterId?: string;
  chapterNo: number | '';
  chapterName: string;
  description: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  documents?: string[];
}

export interface IBulkChapterFormProps {
  open: boolean;
  onClose: () => void;
  className?: string;
  subject?: string;
  classId?: string;
  subjectId?: string;
  existingChapters?: Array<{ chapterNumber: number; id: string }>;
}

export interface IChapterCardProps {
  entry: IBulkChapterEntry;
  index: number;
  classId?: string;
  onRemove: (uid: string) => void;
  onChange: (uid: string, field: string, value: unknown) => void;
  onBlur: (uid: string, field: string) => void;
  onFileUpload: (uid: string, files: any[]) => Promise<void>;
  onPreviewDocument?: (file: any) => void;
  localFileNames?: Record<string, string>;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  isExpanded: boolean;
  onToggle: (uid: string) => void;
}
