import type { Dayjs } from 'dayjs';
import type { TimelineType } from 'src/components/timeline-view';

export interface IChapterLog {
  key: number;
  des: string; // Description of the progress stage
  time: string; // Timestamp of the log entry
  color?:
    | 'primary'
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'inherit'
    | 'grey'
    | 'secondary'
    | 'default';
  progress: number; // Progress percentage at that point
  teacher: string; // Teacher involved in the step
}
// Interface representing details of a course chapter
export interface ICourseDetail {
  chapterName: string; // Name of the chapter
  teacherName: string; // Name of the teacher assigned to the chapter
  progress: number; // Progress percentage completed for the chapter
  pending: number; // Remaining percentage to be completed
  startDate: Dayjs | string | null;
  timeLine: Dayjs | string | null; // Timeline/deadline for the chapter completion
  logs?: TimelineType[]; // Optional array of log steps
}

// Interface representing a course with its details
export interface ICourse {
  id: number; // Unique identifier for the course
  name: string; // Name of the course
  progress: number; // Overall progress percentage of the course
  details: ICourseDetail[]; // Array of chapter details for the course
  completedChapter: number; // Number of chapters completed
  totalChapter: number; // Number of chapters pending
  color: string; // Color of the course
}

export interface ICourseCardsGridProps {
  courses: ICourse[];
  handleCardDetails: (course: ICourse) => void;
}

export interface IAppWidgetProps {
  title: string;
  color: string;
  completedChapter: number;
  totalChapter: number;
  chart: { series: number }; // % progress
}

export interface IUpdateProgressProps {
  onClose: (e: any, isSubmit: boolean) => void;
}
