export interface QuestionItem {
  id: string;
  questionNumber?: number;
  questionText: string;
  marks: number;
  chapterId?: string;
  chapterName?: string;
  difficultyLevel: number; // 1: Easy, 2: Medium, 3: Hard
  bloomLevel: number; // 1: Remembering, 2: Understanding, 3: Applying, 4: Analyzing, 5: Evaluating, 6: Creating
  questionType: number;
  learningOutcome?: string;
  source?: string;
  tags?: string[];
  isLocked?: boolean;
  questionBankItemId?: string;
}

export interface PaperSection {
  id: string;
  sectionName: string;
  instructions?: string;
  marks: number;
  sortOrder: number;
  questions: QuestionItem[];
}

export interface BlueprintRule {
  chapterId: string;
  chapterName: string;
  marks: number;
  count: number;
}

export interface DifficultyRule {
  difficultyLevel: number;
  percentage: number;
}

export interface BloomRule {
  bloomLevel: number;
  percentage: number;
}

export interface PaperRulesState {
  internalChoice: boolean;
  negativeMarking: boolean;
  randomizeQuestions: boolean;
  autoNumbering: boolean;
  preventDuplicates: boolean;
  enforceSectionOrder: boolean;
}

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'success';
  title: string;
  description: string;
  sectionTarget?: 'chapter' | 'chapters' | 'difficulty' | 'bloom' | 'rules' | 'builder';
}

export interface AISuggestion {
  id: string;
  type: 'gap' | 'imbalance' | 'improvement';
  title: string;
  description: string;
  actionText: string;
  payload?: any;
}

export interface QuestionPaperMetadata {
  id: string;
  paperTitle: string;
  paperCode?: string;
  standardId: string;
  standardName?: string;
  subjectId: string;
  subjectName?: string;
  examId?: string;
  examTitle?: string;
  examScheduleId?: string;
  examDate?: string;
  totalMarks: number;
  durationMinutes: number;
  creationMode: 'Manual' | 'Auto' | 'Hybrid';
  generalInstructions?: string;
  status: number; // 1: Draft, 2: Generated, 3: Submitted, 4: Approved, 5: Rejected, 6: Published, 7: Locked, 8: Archived
  createdAt?: string;
  updatedAt?: string;
  questions?: QuestionItem[];
  sections?: PaperSection[];
}
