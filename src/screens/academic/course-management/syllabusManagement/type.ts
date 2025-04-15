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
  id: number;
  chapterNo: number;
  chapterName: string;
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
  assignedTeacher: string[];
  viewMaterial: {
    videos: number;
    pdfs: number;
  };
  progress: number; // Percentage from 0 to 100
}

export interface IChapterFormValues {
  chapterNo: number;
  chapterName: string;
  assignedTeacher: string;
  content: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  timeLine: Dayjs | null;
  documents?: IDocument[];
}

// Props interface for AddNewChapter component
export interface IAddNewChapterProps {
  onSubmit: (values: IChapterFormValues) => void;
  selectedSubject: string;
  isEdit?: boolean;
  initialValues?: {
    chapterNo: number;
    chapterName: string;
    assignedTeacher: string;
    content: string;
    startTime: Dayjs | null;
    endTime: Dayjs | null;
    timeLine: Dayjs | null;
    documents?: Array<{
      id: string;
      name: string;
      url: string;
    }>;
  } | null;
}

export interface IChapterTableProps {
  ediData: IChapter;
  setEditData: React.Dispatch<React.SetStateAction<IChapter | null>>;
  addChapterDialog: UseBooleanReturn;
  data: IChapter[];
  actions: (params: { popover: any; row: IChapter }) => JSX.Element;
  handleEyeClick: (subjectName: string) => void;
}
