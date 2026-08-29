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
  documents?: string[];
  unitName?: string;
  termName?: string;
  topic?: string;
  estimatedTeachingDays?: number;
  estimatedPeriods?: number;
  revisionDays?: number;
  bufferDays?: number;
  difficultyLevel?: string;
  bloomLevel?: string;
  tags?: string;
  learningOutcomes?: string;
  skillsCovered?: string;
  prerequisites?: string;
  teachingMethods?: string;
  classActivities?: string;
  completionCriteria?: string;
  teacherNotes?: string;
  studentSummary?: string;
  parentSummary?: string;
  referenceLinks?: string;
  worksheets?: string;
  audioVideoMaterials?: string;
  boardDocuments?: string;
  assessmentMethod?: string;
  questionTypes?: string;
  marksWeightage?: number;
  bloomCoverage?: string;
  difficultyDistribution?: string;
  visibility?: string;
  publishStatus?: string;
  reviewStatus?: string;
  notifyOnPublish?: boolean;
  progressPercentage?: number;
  coverageStatus?: string;
  lessonPlanStatus?: string;
  homeworkStatus?: string;
  assessmentStatus?: string;
  resourceStatus?: string;
  questionCount?: number;
  healthScore?: number;
  isAiGenerated?: boolean;
  copiedFromPreviousYear?: boolean;
  templateSource?: string;
  dependencyChapterIds?: string;
  versionLabel?: string;
}

export interface SubjectOption {
  value: string;
  label: string;
  originalItem: any;
  isElective: boolean;
  electiveGroupId?: string;
}

export interface IChapterFormValues {
  chapterNo: number | string;
  chapterName: string;
  description: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  documents?: string[];
  unitName: string;
  termName: string;
  topic: string;
  estimatedTeachingDays: number | string;
  estimatedPeriods: number | string;
  revisionDays: number | string;
  bufferDays: number | string;
  difficultyLevel: string;
  bloomLevel: string;
  tags: string;
  learningOutcomes: string;
  skillsCovered: string;
  prerequisites: string;
  teachingMethods: string;
  classActivities: string;
  completionCriteria: string;
  teacherNotes: string;
  studentSummary: string;
  parentSummary: string;
  referenceLinks: string;
  worksheets: string;
  audioVideoMaterials: string;
  boardDocuments: string;
  assessmentMethod: string;
  questionTypes: string;
  marksWeightage: number | string;
  bloomCoverage: string;
  difficultyDistribution: string;
  visibility: string;
  publishStatus: string;
  reviewStatus: string;
  notifyOnPublish: boolean;
  coverageStatus: string;
  lessonPlanStatus: string;
  homeworkStatus: string;
  assessmentStatus: string;
  resourceStatus: string;
  questionCount: number | string;
  healthScore: number | string;
  isAiGenerated: boolean;
  copiedFromPreviousYear: boolean;
  templateSource: string;
  dependencyChapterIds: string;
  versionLabel: string;
}

export type SyllabusViewMode = 'table' | 'timeline' | 'calendar' | 'unit' | 'coverage';

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
  onCreateQuestion?: (chapter: IChapter) => void;
  onViewQuestions?: (chapter: IChapter) => void;
  subjectId?: string;
  standardId?: string;
  canAdd?: boolean;
  canView?: boolean;
  canDelete?: boolean;
}
