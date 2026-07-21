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
  previousProgress?: number | null;
  changeAmount?: number;
  status?: string | null;
  delayReason?: string | null;
  revisedEndDate?: string | null;
  teacher: string; // Teacher involved in the step
}
// Interface representing details of a course chapter
export interface ICourseDetail {
  id: string;
  chapterId?: string;
  chapterNumber?: number;
  chapterName: string; // Name of the chapter
  teacherName?: string; // Name of the teacher assigned to the chapter
  progress: number; // Progress percentage completed for the chapter
  pending?: number; // Remaining percentage to be completed
  startDate: Dayjs | string | null;
  endDate?: Dayjs | string | null;
  timeLine: Dayjs | string | null; // Timeline/deadline for the chapter completion
  actualStartDate?: Dayjs | string | null;
  actualEndDate?: Dayjs | string | null;
  expectedProgress?: number;
  variance?: number;
  status?: string;
  scheduleStatus?: string;
  riskLevel?: string;
  lastUpdatedBy?: string | null;
  lastUpdatedAt?: Dayjs | string | null;
  logs?: TimelineType[]; // Optional array of log steps
}

// Interface representing a course with its details
export interface ICourse {
  id: string | number; // UUID from API, or legacy integer from static data
  name: string; // Name of the course
  progress: number; // Overall progress percentage of the course
  details: ICourseDetail[]; // Array of chapter details for the course
  completedChapter: number; // Number of chapters completed
  totalChapter: number; // Number of chapters pending
  color: string; // Color of the course
  expectedProgress?: number;
  variance?: number;
  scheduleStatus?: string;
  riskLevel?: string;
  lastUpdatedAt?: Dayjs | string | null;
}

export interface ICourseCardsGridProps {
  courses: ICourse[];
  handleCardDetails: (course: ICourse) => void;
  layout?: 'horizontal' | 'vertical';
  isLoading?: boolean;
}

export interface IAppWidgetProps {
  title: string;
  color: string;
  completedChapter: number;
  totalChapter: number;
  chart: { series: number }; // % progress
  isSelected?: boolean;
  expectedProgress?: number;
  variance?: number;
  scheduleStatus?: string;
  riskLevel?: string;
  lastUpdatedAt?: Dayjs | string | null;
}

export interface IUpdateProgressProps {
  onClose: (e: any, isSubmit: boolean) => void;
  selectedChapter?: ICourseDetail | null;
  divisionId?: string;
}
