import type React from 'react';
import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

// Interface for document object containing file information
export interface IDocument {
  id: string;
  name: string;
  url: string;
  file?: File;
}

export interface IChapter {
  id: string;
  chapterName: string;
  chapterNumber: number;
  chapterStartTime: string;
  chapterEndTime: string;
  description: string;
  standardId: string;
  subjectId: string;
  creatorId: string;
  creationTime: string;
  lastModifierId: string;
  lastModificationTime: string;
}

export interface SubjectOption {
  value: string;
  label: string;
  originalItem: any;
  isElective: boolean;
  electiveGroupId?: string;
}

export interface IChapterFormValues {
  chapterNo: number;
  chapterName: string;
  description: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  documents?: string[];
}

// Props interface for AddNewChapter component
export interface IAddNewChapterProps {
  onSubmit: (values: IChapterFormValues) => void;
  onClose: (e: any, isSubmit: boolean) => void;
  isEdit?: boolean;
  initialValues?: IChapter | null;
  className?: string;
  subject?: string;
  classId?: string;
  subjectId?: string;
  existingChapters?: Array<{ chapterNumber: number; id: string }>;
}

export interface IChapterTableProps {
  onDelete: (chapter: IChapter) => void;
  isLoading: boolean;
  setEditData: React.Dispatch<React.SetStateAction<IChapter | null>>;
  addChapterDialog: UseBooleanReturn;
  data: IChapter[];
  actions: (params: { popover: any; row: IChapter }) => React.JSX.Element;
  handleEyeClick: (subjectName: string) => void;
  onViewDocuments: (chapter: IChapter) => void;
  subjectId?: string;
  standardId?: string;
  canAdd?: boolean;
  canView?: boolean;
  canDelete?: boolean;
}
