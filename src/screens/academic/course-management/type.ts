import type { ChartOptions } from 'src/components/chart';

export interface CourseData {
  id: number;
  courseName: string;
  className: string;
  description: string;
  subject: string;
  resource: string;
  learningGoal: string;
  assignedTeacher: string;
  status: string;
  material: { videos: number; pdfs: number };
}

export interface ChapterData {
  id: number;
  courseId: number;
  chapter: string;
  content: string;
  progress: number;
  classId: string;
  division: string;
}

export interface AppWidgetProps {
  title: string;
  total?: number;
  icon: string;
  chart: { colors?: string[]; series: number; options?: ChartOptions };
}

export interface CourseCreationFormProps {
  onSave: (values: CourseData) => void;
  onClose: () => void;
  data: CourseData | null;
  isEdit: boolean;
}

export interface ViewChaptersComponentProps {
  onClose: () => void;
  selectedCourse: CourseData | null;
  chapterData: ChapterData[];
}

export interface ChapterTabsViewProps {
  chapters: ChapterData[];
}
