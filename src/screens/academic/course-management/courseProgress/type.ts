import type { Dayjs } from 'dayjs';
import type { ChartOptions } from 'src/components/chart';

// Interface representing details of a course chapter
export interface ICourseDetail {
  chapterName: string; // Name of the chapter
  teacherName: string; // Name of the teacher assigned to the chapter
  progress: number; // Progress percentage completed for the chapter
  pending: number; // Remaining percentage to be completed
  timeLine: Dayjs | string | null; // Timeline/deadline for the chapter completion
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
  total?: number;
  color: string;
  icon: string;
  totalChapter: number;
  completedChapter: number;
  chart: {
    colors?: string[];
    series: number;
    options?: ChartOptions;
  };
}
