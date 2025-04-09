import type { Dayjs } from 'dayjs';

// Interface for document object containing file information
export interface IDocument {
  id: string;
  name: string;
  url: string;
  file?: File;
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
