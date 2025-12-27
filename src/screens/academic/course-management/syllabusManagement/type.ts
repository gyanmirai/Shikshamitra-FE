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
  chapterNo: number;
  chapterName: string;
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
  viewMaterial: {
    videos: number;
    pdfs: number;
  };
  progress: number; // Percentage from 0 to 100
  documents?: File[];
}

export interface IChapterFormValues {
  chapterNo: number;
  chapterName: string;
  description: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  documents?: File[];
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
}

export interface IChapterTableProps {
  onDelete: (chapter: IChapter) => void;
  setEditData: React.Dispatch<React.SetStateAction<IChapter | null>>;
  addChapterDialog: UseBooleanReturn;
  data: IChapter[];
  actions: (params: { popover: any; row: IChapter }) => React.JSX.Element;
  handleEyeClick: (subjectName: string) => void;
  onViewDocuments: (chapter: IChapter) => void;
  subjectId?: string;
  standardId?: string;
}
