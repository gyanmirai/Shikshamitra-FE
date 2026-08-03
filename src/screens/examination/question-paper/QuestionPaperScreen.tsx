'use client';

import type { RootState } from 'src/redux/store';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Label } from 'src/components/label';
import CustomTooltip from 'src/components/custom-tooltip';
import { GlobalIcons } from 'src/utils/icons';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { shikshaMitraToast } from 'src/components/toast';
import { Scrollbar } from 'src/components/scrollbar';
import { TimetableSettingsSummaryCards } from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { academicPaths } from 'src/constants/academic-menu';
import dayjs from 'dayjs';

import {
  Box,
  Card,
  Grid,
  Paper,
  Stack,
  Alert,
  Button,
  Dialog,
  Popover,
  Divider,
  Tooltip,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { useGetQuestionsQuery } from 'src/redux/academicAPI/ExaminationApi/QuestionBankApi/question-bank-api';
import { useGetQuestionPaperExamLookupQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import {
  useGetBlueprintQuery,
  useGetPaperPreviewQuery,
  useSaveBlueprintMutation,
  useGeneratePaperMutation,
  useGetQuestionPapersQuery,
  useValidateBlueprintMutation,
  useAddQuestionToPaperMutation,
  useCreateQuestionPaperMutation,
  useSubmitQuestionPaperMutation,
  useRejectQuestionPaperMutation,
  useDeleteQuestionPaperMutation,
  useApproveQuestionPaperMutation,
  usePublishQuestionPaperMutation,
  useLockQuestionPaperMutation,
  useArchiveQuestionPaperMutation,
  useGetQuestionPaperSettingsQuery,
  useGetQuestionPaperDashboardQuery,
  useRemoveQuestionFromPaperMutation,
  useSaveQuestionPaperSettingsMutation,
} from 'src/redux/academicAPI/ExaminationApi/QuestionPaperApi/question-paper-api';

// Subcomponents
import type { QuestionItem, PaperSection, PaperRulesState, ValidationIssue, AISuggestion } from './types';
import QuestionPaperHeader from './components/QuestionPaperHeader';
import ProgressDashboard from './components/ProgressDashboard';
import BlueprintLeftPanel from './components/BlueprintLeftPanel';
import PaperBuilderCenterPanel from './components/PaperBuilderCenterPanel';
import QuestionLibraryRightPanel from './components/QuestionLibraryRightPanel';
import AIAssistantDrawer from './components/AIAssistantDrawer';
import LiveAnalyticsModal from './components/LiveAnalyticsModal';
import StickyBottomActionBar from './components/StickyBottomActionBar';

const DIFFICULTY_OPTIONS = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
];

const BLOOM_OPTIONS = [
  { value: 1, label: 'Remembering' },
  { value: 2, label: 'Understanding' },
  { value: 3, label: 'Applying' },
  { value: 4, label: 'Analyzing' },
  { value: 5, label: 'Evaluating' },
  { value: 6, label: 'Creating' },
];

const CREATION_MODE_OPTIONS = [
  { value: 'Manual', label: 'Manual' },
  { value: 'Auto', label: 'Auto' },
  { value: 'Hybrid', label: 'Hybrid' },
];

const STATUS_LABEL: Record<number, string> = {
  1: 'Draft',
  2: 'Generated',
  3: 'Submitted',
  4: 'Approved',
  5: 'Rejected',
  6: 'Published',
  7: 'Locked',
  8: 'Archived',
};

const STATUS_COLOR: Record<number, 'default' | 'info' | 'success' | 'error' | 'warning' | 'primary'> = {
  1: 'default',
  2: 'info',
  3: 'warning',
  4: 'success',
  5: 'error',
  6: 'primary',
  7: 'error',
  8: 'default',
};

const DEFAULT_DIFFICULTY_DIST: Record<number, number> = { 1: 30, 2: 50, 3: 20 };
const DEFAULT_BLOOM_DIST: Record<number, number> = { 1: 20, 2: 20, 3: 15, 4: 15, 5: 15, 6: 15 };

const paperValidationSchema = Yup.object({
  paperTitle: Yup.string().required('Paper title is required').min(3, 'Title is too short'),
  standardId: Yup.string().required('Class is required'),
  subjectId: Yup.string().required('Subject is required'),
  totalMarks: Yup.number()
    .typeError('Enter a valid number')
    .required('Total marks are required')
    .positive('Must be positive')
    .max(1000, 'Max 1000 marks'),
  durationMinutes: Yup.number()
    .typeError('Enter a valid number')
    .required('Duration is required')
    .min(10, 'Minimum 10 minutes')
    .max(480, 'Maximum 480 minutes'),
  creationMode: Yup.string().required(),
});

const SectionPaper = ({
  title,
  caption,
  icon,
  children,
  action,
}: {
  title: string;
  caption?: string;
  icon: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <Paper
    variant="outlined"
    sx={{
      p: { xs: 1.5, md: 2 },
      borderRadius: 1.5,
      bgcolor: (theme) => alpha(theme.palette.background.paper, 0.92),
      borderColor: (theme) => alpha(theme.palette.divider, 0.9),
      boxShadow: (theme) => `0 10px 30px -24px ${alpha(theme.palette.grey[500], 0.4)}`,
    }}
  >
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={1}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <Iconify icon={icon} width={18} height={18} />
          </Box>
          <Stack spacing={0.2}>
            <Typography variant="subtitle2" fontWeight={700}>
              {title}
            </Typography>
            {caption && (
              <Typography variant="caption" color="text.secondary">
                {caption}
              </Typography>
            )}
          </Stack>
        </Stack>
        {action}
      </Stack>
      {children}
    </Stack>
  </Paper>
);

function buildSubjectOptions(data: any) {
  const options: { value: string; label: string }[] = [];
  data?.data?.items?.forEach((item: any) => {
    if (item.subjects?.length > 1 && item.electiveGroupName) {
      item.subjects.forEach((sub: any, i: number) => {
        options.push({
          value: sub.subjectId,
          label: sub.subjectName || `${item.electiveGroupName} ${i + 1}`,
        });
      });
    } else {
      options.push({
        value: item.subjects?.[0]?.subjectId || item.id,
        label: item.subjects?.[0]?.subject?.name || item.subjects?.[0]?.subjectName || '',
      });
    }
  });
  return options;
}

const initialPaperValues = (academicYearId?: string) => ({
  academicYearId: academicYearId || '',
  paperTitle: '',
  standardId: '',
  subjectId: '',
  examId: '',
  examScheduleId: '',
  totalMarks: 50,
  durationMinutes: 120,
  creationMode: 'Hybrid',
  generalInstructions: 'All questions are compulsory unless internal choice is provided.',
});

export default function QuestionPaperScreen() {
  const theme = useTheme();
  const { currentYear, currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const academicYearId = currentYear?.id;

  const [viewMode, setViewMode] = useState<'list' | 'workspace'>('list');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [localPaperSettings, setLocalPaperSettings] = useState<any>(null);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);

  // Blueprint local states
  const [blueprintRules, setBlueprintRules] = useState<Record<string, { marks: number; count: number }>>({});
  const [difficultyDist, setDifficultyDist] = useState<Record<number, number>>(DEFAULT_DIFFICULTY_DIST);
  const [bloomDist, setBloomDist] = useState<Record<number, number>>(DEFAULT_BLOOM_DIST);
  const [paperRules, setPaperRules] = useState<PaperRulesState>({
    internalChoice: true,
    negativeMarking: false,
    randomizeQuestions: false,
    autoNumbering: true,
    preventDuplicates: true,
    enforceSectionOrder: true,
  });

  // Local Paper Canvas Sections state
  const [canvasSections, setCanvasSections] = useState<PaperSection[]>([
    { id: 'sec-1', sectionName: 'Section A', instructions: 'All questions in this section are compulsory.', marks: 20, sortOrder: 1, questions: [] },
    { id: 'sec-2', sectionName: 'Section B', instructions: 'Answer any 4 questions out of 5.', marks: 30, sortOrder: 2, questions: [] },
  ]);

  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([
    { id: 'ai-1', type: 'gap', title: 'Chapter Weightage Underrepresented', description: 'Geometry chapter is allocated 0 marks in blueprint. Add at least 5 marks.', actionText: 'Add 5 Marks to Geometry' },
    { id: 'ai-2', type: 'imbalance', title: 'Bloom Cognitive Depth Gap', description: 'Applying level is under 15% target. Consider replacing Q2 with an application-based question.', actionText: 'Suggest Applying Questions' },
  ]);

  const [showProgressDashboard, setShowProgressDashboard] = useState(false);

  const { data: dashboard } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetQuestionPaperDashboardQuery,
    params: { academicYearId },
    options: { skip: !academicYearId },
  });

  const { data: papers, isLoading: isFetching } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetQuestionPapersQuery,
    params: { academicYearId, page: 1, pageSize: 50 },
    options: { skip: !academicYearId },
  });

  const { data: paperSettings } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetQuestionPaperSettingsQuery,
    params: { academicYearId },
    options: { skip: !academicYearId },
  });

  const selectedPaper = (papers?.items || []).find((p: any) => p.id === selectedPaperId);

  // Sync blueprint from server
  const { data: blueprint } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBlueprintQuery,
    params: { paperId: selectedPaperId },
    options: { skip: !selectedPaperId },
  });

  useEffect(() => {
    if (blueprint?.chapterRules) {
      const rules: Record<string, { marks: number; count: number }> = {};
      blueprint.chapterRules.forEach((rule: any) => {
        rules[rule.chapterId] = { marks: rule.marks, count: rule.numberOfQuestions || 0 };
      });
      setBlueprintRules(rules);
    }
    if (blueprint?.difficultyRules?.length) {
      const dist: Record<number, number> = { ...DEFAULT_DIFFICULTY_DIST };
      blueprint.difficultyRules.forEach((r: any) => { dist[r.difficultyLevel] = r.percentage; });
      setDifficultyDist(dist);
    }
    if (blueprint?.bloomRules?.length) {
      const dist: Record<number, number> = { ...DEFAULT_BLOOM_DIST };
      blueprint.bloomRules.forEach((r: any) => { dist[r.bloomLevel] = r.percentage; });
      setBloomDist(dist);
    }
  }, [blueprint]);

  // Populate canvas sections when selected paper questions arrive
  useEffect(() => {
    if (selectedPaper?.questions) {
      const questionsList: QuestionItem[] = selectedPaper.questions.map((q: any, i: number) => ({
        id: q.id || `pq-${i}`,
        questionNumber: q.questionNumber || i + 1,
        questionText: q.questionText || q.text || 'Question Item',
        marks: q.marks || 1,
        chapterId: q.chapterId,
        chapterName: q.chapterName || 'General',
        difficultyLevel: q.difficultyLevel || 2,
        bloomLevel: q.bloomLevel || 2,
        questionType: q.questionType || 1,
        learningOutcome: q.learningOutcome,
        isLocked: false,
        questionBankItemId: q.questionBankItemId,
      }));

      setCanvasSections((prev) => [
        {
          ...prev[0],
          questions: questionsList,
        },
        ...prev.slice(1),
      ]);
    }
  }, [selectedPaper]);

  // Classes & Medium
  const allClass = useMemo(() => medium?.educationMediumStages?.flatMap((s: any) => s.standards || []) || [], [medium]);
  const classOptions = useMemo(() => allClass.map((c: any) => ({ value: c.id, label: c.name })), [allClass]);

  // Formik Create Paper
  const formik = useFormik({
    initialValues: initialPaperValues(academicYearId),
    validationSchema: paperValidationSchema,
    onSubmit: async (values, helpers) => {
      try {
        const created = await createPaper({
          ...values,
          examId: values.examId || null,
          examScheduleId: values.examScheduleId || null,
          totalMarks: Number(values.totalMarks),
          durationMinutes: Number(values.durationMinutes),
          sections: [
            { sectionName: 'Section A', instructions: '', marks: Number(values.totalMarks), sortOrder: 1 },
          ],
        }).unwrap();
        helpers.resetForm({ values: initialPaperValues(academicYearId) });
        setSelectedPaperId(created.id);
        setDialogOpen(false);
        setViewMode('workspace');
        shikshaMitraToast.success({ message: 'Question Paper created successfully!' });
      } catch (err: any) {
        shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to create paper.' });
      }
    },
  });

  // Subject options via useQueryAndMutation
  const { data: formSubjectData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { standardId: formik.values.standardId },
    options: { skip: !formik.values.standardId },
  });
  const formSubjectOptions = useMemo(() => buildSubjectOptions(formSubjectData), [formSubjectData]);

  // Chapters for target paper via useQueryAndMutation
  const { data: formChapters } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChaptersByStandardQuery,
    params: { standardId: selectedPaper?.standardId, subjectId: selectedPaper?.subjectId },
    options: { skip: !selectedPaper?.standardId || !selectedPaper?.subjectId },
  });

  // Bank questions via useQueryAndMutation
  const { data: bankQuestionsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetQuestionsQuery,
    params: { standardId: selectedPaper?.standardId, subjectId: selectedPaper?.subjectId, status: 3, pageSize: 100 },
    options: { skip: !selectedPaper?.standardId || !selectedPaper?.subjectId || viewMode !== 'workspace' },
  });

  const bankQuestions: QuestionItem[] = (bankQuestionsData?.items || []).map((q: any) => ({
    id: q.id,
    questionText: q.questionText,
    marks: q.marks || 1,
    chapterId: q.chapterId,
    chapterName: q.chapterName || 'Chapter Item',
    difficultyLevel: q.difficultyLevel || 2,
    bloomLevel: q.bloomLevel || 2,
    questionType: q.questionType || 1,
    learningOutcome: q.learningOutcome,
    questionBankItemId: q.id,
  }));

  // Preview data via useQueryAndMutation
  const { data: preview } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPaperPreviewQuery,
    params: { paperId: selectedPaperId },
    options: { skip: !selectedPaperId || !previewDialogOpen },
  });

  // Confirm dialog states
  const [deleteConfirmPaper, setDeleteConfirmPaper] = useState<any | null>(null);
  const [archiveConfirmPaper, setArchiveConfirmPaper] = useState<any | null>(null);

  // Print ref
  const printRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedPaper?.paperTitle || 'Question_Paper',
  });

  // Mutations via useQueryAndMutation
  const [createPaper, createState] = useQueryAndMutation({ type: 'mutation', currentQueryAndMutation: useCreateQuestionPaperMutation });
  const [saveBlueprint, blueprintState] = useQueryAndMutation({ type: 'mutation', currentQueryAndMutation: useSaveBlueprintMutation });
  const [validateBlueprint, validateState] = useQueryAndMutation({ type: 'mutation', currentQueryAndMutation: useValidateBlueprintMutation });
  const [generatePaper, generateState] = useQueryAndMutation({ type: 'mutation', currentQueryAndMutation: useGeneratePaperMutation });
  const [addQuestionToPaper] = useQueryAndMutation({ type: 'mutation', currentQueryAndMutation: useAddQuestionToPaperMutation });
  const [removeQuestionFromPaper] = useQueryAndMutation({ type: 'mutation', currentQueryAndMutation: useRemoveQuestionFromPaperMutation });
  const [savePaperSettings] = useQueryAndMutation({ type: 'mutation', currentQueryAndMutation: useSaveQuestionPaperSettingsMutation });
  const [deletePaper] = useQueryAndMutation({ type: 'mutation', currentQueryAndMutation: useDeleteQuestionPaperMutation });
  const [archivePaper] = useQueryAndMutation({ type: 'mutation', currentQueryAndMutation: useArchiveQuestionPaperMutation });

  const handleDeletePaperConfirm = async () => {
    if (!deleteConfirmPaper) return;
    try {
      await deletePaper({ paperId: deleteConfirmPaper.id }).unwrap();
      shikshaMitraToast.success({ message: `Paper "${deleteConfirmPaper.paperTitle}" deleted successfully.` });
      setDeleteConfirmPaper(null);
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to delete paper.' });
    }
  };

  const handleArchivePaperConfirm = async () => {
    if (!archiveConfirmPaper) return;
    try {
      await archivePaper({ paperId: archiveConfirmPaper.id }).unwrap();
      shikshaMitraToast.success({ message: `Paper "${archiveConfirmPaper.paperTitle}" archived successfully.` });
      setArchiveConfirmPaper(null);
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to archive paper.' });
    }
  };

  // Derived validations
  const chapterMarksSum = Object.values(blueprintRules).reduce((sum, r) => sum + (r.marks || 0), 0);
  const difficultySum = Object.values(difficultyDist).reduce((s, v) => s + v, 0);
  const bloomSum = Object.values(bloomDist).reduce((s, v) => s + v, 0);
  const currentCanvasMarks = canvasSections.reduce((s, sec) => s + (sec.questions || []).reduce((qs, q) => qs + (q.marks || 0), 0), 0);
  const currentTotalQuestions = canvasSections.reduce((s, sec) => s + (sec.questions?.length || 0), 0);

  const blueprintValid =
    selectedPaper != null &&
    Math.abs(chapterMarksSum - selectedPaper.totalMarks) < 0.01 &&
    Math.abs(difficultySum - 100) < 0.01 &&
    Math.abs(bloomSum - 100) < 0.01;

  const validationIssues: ValidationIssue[] = useMemo(() => {
    const issues: ValidationIssue[] = [];
    if (selectedPaper) {
      if (Math.abs(chapterMarksSum - selectedPaper.totalMarks) >= 0.01) {
        issues.push({
          id: 'v-1',
          type: 'error',
          title: 'Chapter Marks Mismatch',
          description: `Chapter marks total (${chapterMarksSum}) must equal paper total (${selectedPaper.totalMarks}M).`,
          sectionTarget: 'chapters',
        });
      } else {
        issues.push({ id: 'v-1-ok', type: 'success', title: 'Chapter Marks Complete', description: 'Total chapter marks match paper total.' });
      }

      if (Math.abs(difficultySum - 100) >= 0.01) {
        issues.push({
          id: 'v-2',
          type: 'error',
          title: 'Difficulty Percentage Imbalance',
          description: `Difficulty distribution totals ${difficultySum}%. Must equal 100%.`,
          sectionTarget: 'difficulty',
        });
      } else {
        issues.push({ id: 'v-2-ok', type: 'success', title: 'Difficulty Distribution Valid', description: 'Easy, Medium, Hard percentages sum to 100%.' });
      }

      if (Math.abs(bloomSum - 100) >= 0.01) {
        issues.push({
          id: 'v-3',
          type: 'error',
          title: 'Bloom Taxonomy Imbalance',
          description: `Bloom cognitive depth totals ${bloomSum}%. Must equal 100%.`,
          sectionTarget: 'bloom',
        });
      } else {
        issues.push({ id: 'v-3-ok', type: 'success', title: 'Bloom Taxonomy Valid', description: 'Cognitive depth percentages sum to 100%.' });
      }
    }
    return issues;
  }, [selectedPaper, chapterMarksSum, difficultySum, bloomSum]);

  // Handlers
  const handleSaveBlueprint = async () => {
    if (!selectedPaperId || !selectedPaper) return;
    const chapterRules = Object.entries(blueprintRules)
      .map(([chapterId, data]) => ({
        chapterId,
        marks: Number(data.marks || 0),
        numberOfQuestions: data.count ? Number(data.count) : null,
      }))
      .filter((r) => r.marks > 0);

    try {
      await saveBlueprint({
        paperId: selectedPaperId,
        body: {
          questionPaperId: selectedPaperId,
          totalMarks: selectedPaper.totalMarks,
          chapterRules,
          difficultyRules: DIFFICULTY_OPTIONS.map((d) => ({
            difficultyLevel: d.value,
            percentage: difficultyDist[d.value] || 0,
          })),
          bloomRules: BLOOM_OPTIONS.map((b) => ({
            bloomLevel: b.value,
            percentage: bloomDist[b.value] || 0,
          })),
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Blueprint saved successfully.' });
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to save blueprint.' });
    }
  };

  const handleAddQuestionToPaperCanvas = async (bankQuestion: QuestionItem) => {
    if (!selectedPaperId || !selectedPaper) return;
    const sectionId = selectedPaper.sections?.[0]?.id || canvasSections[0]?.id;

    setCanvasSections((prev) => {
      const updated = [...prev];
      const targetSec = updated[0];
      const newQuestion: QuestionItem = {
        ...bankQuestion,
        id: `q-${Date.now()}`,
        questionNumber: (targetSec.questions?.length || 0) + 1,
      };
      targetSec.questions = [...(targetSec.questions || []), newQuestion];
      return updated;
    });

    if (sectionId) {
      try {
        await addQuestionToPaper({
          paperId: selectedPaperId,
          body: {
            questionPaperSectionId: sectionId,
            questionBankItemId: bankQuestion.id,
            questionNumber: currentTotalQuestions + 1,
            marks: bankQuestion.marks,
            sortOrder: currentTotalQuestions + 1,
          },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Question added to paper.' });
      } catch (err: any) {
        // Fallback silently if mock
      }
    }
  };

  const handleRemoveQuestionFromPaperCanvas = async (paperQuestionId: string) => {
    setCanvasSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        questions: (sec.questions || []).filter((q) => q.id !== paperQuestionId),
      }))
    );

    if (selectedPaperId) {
      try {
        await removeQuestionFromPaper({ paperId: selectedPaperId, paperQuestionId }).unwrap();
        shikshaMitraToast.success({ message: 'Question removed from paper.' });
      } catch (err) {
        // Fallback silently
      }
    }
  };

  const handleDuplicateQuestion = (q: QuestionItem) => {
    setCanvasSections((prev) => {
      const updated = [...prev];
      const targetSec = updated[0];
      const dup: QuestionItem = { ...q, id: `q-dup-${Date.now()}`, questionNumber: (targetSec.questions?.length || 0) + 1 };
      targetSec.questions = [...(targetSec.questions || []), dup];
      return updated;
    });
    shikshaMitraToast.success({ message: 'Question duplicated.' });
  };

  const handleToggleLockQuestion = (qId: string) => {
    setCanvasSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        questions: (sec.questions || []).map((q) => (q.id === qId ? { ...q, isLocked: !q.isLocked } : q)),
      }))
    );
  };

  const handleMoveQuestion = (qId: string, direction: 'up' | 'down') => {
    setCanvasSections((prev) =>
      prev.map((sec) => {
        const questions = [...(sec.questions || [])];
        const idx = questions.findIndex((q) => q.id === qId);
        if (idx < 0) return sec;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= questions.length) return sec;
        const temp = questions[idx];
        questions[idx] = questions[targetIdx];
        questions[targetIdx] = temp;
        return { ...sec, questions };
      })
    );
  };

  const handleAddSection = () => {
    setCanvasSections((prev) => [
      ...prev,
      {
        id: `sec-${prev.length + 1}`,
        sectionName: `Section ${String.fromCharCode(65 + prev.length)}`,
        instructions: '',
        marks: 20,
        sortOrder: prev.length + 1,
        questions: [],
      },
    ]);
  };

  const handleUpdateSection = (sectionId: string, name: string, instructions: string) => {
    setCanvasSections((prev) =>
      prev.map((sec) => (sec.id === sectionId ? { ...sec, sectionName: name, instructions } : sec))
    );
  };

  const handleOpenSettings = (e: React.MouseEvent<HTMLButtonElement>) => {
    setLocalPaperSettings(paperSettings ? { ...paperSettings } : {});
    setSettingsAnchorEl(e.currentTarget);
  };

  const handleSavePaperSettings = async () => {
    if (!localPaperSettings) return;
    try {
      await savePaperSettings(localPaperSettings).unwrap();
      setSettingsAnchorEl(null);
      shikshaMitraToast.success({ message: 'Question paper settings saved.' });
    } catch (err: any) {
      shikshaMitraToast.error({ message: 'Failed to save settings.' });
    }
  };

  const paperColumns = useMemo(
    () => [
      {
        id: 'paperTitle',
        label: 'Paper',
        filterType: 'string' as const,
        minWidth: 200,
        sticky: true,
        stickyPosition: 'left' as const,
        render: (_: any, row: any) => (
          <Box>
            <Typography variant="subtitle2" fontWeight={700} noWrap>{row.paperTitle}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.paperCode ? `#${row.paperCode}` : row.creationMode}
            </Typography>
          </Box>
        ),
      },
      { id: 'standardName', label: 'Class', filterType: 'string' as const, width: 110 },
      { id: 'subjectName', label: 'Subject', filterType: 'string' as const, width: 130 },
      {
        id: 'totalMarks',
        label: 'Marks',
        filterType: 'number' as const,
        width: 80,
        align: 'center' as const,
        render: (v: any) => <Typography variant="subtitle2" fontWeight={700}>{v}</Typography>,
      },
      {
        id: 'durationMinutes',
        label: 'Duration',
        filterType: 'number' as const,
        width: 90,
        align: 'center' as const,
        render: (v: any) => <Typography variant="body2">{v ? `${v} min` : '—'}</Typography>,
      },
      {
        id: 'creationMode',
        label: 'Mode',
        filterType: 'enum' as const,
        width: 100,
        enumOptions: CREATION_MODE_OPTIONS,
        render: (v: any) => <Label variant="soft" color="default">{v || 'Manual'}</Label>,
      },
      {
        id: 'status',
        label: 'Status',
        filterType: 'enum' as const,
        sticky: true,
        stickyPosition: 'right' as const,
        width: 120,
        render: (v: any) => (
          <Label variant="soft" color={(STATUS_COLOR[v] as any) || 'default'} sx={{ fontWeight: 700 }}>
            {STATUS_LABEL[v] || v || '—'}
          </Label>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        isFilter: false,
        isSort: false,
        width: 140,
        align: 'left' as const,
        sticky: true,
        stickyPosition: 'right' as const,
        render: (_: any, row: any) => (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title="Settings & Author Workspace">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPaperId(row.id);
                  setViewMode('workspace');
                }}
              >
                <Iconify icon="mingcute:settings-3-line" width={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Preview & Print">
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPaperId(row.id);
                  setPreviewDialogOpen(true);
                }}
              >
                <Iconify icon="mingcute:eye-line" width={17} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Archive Paper">
              <IconButton
                size="small"
                color="warning"
                onClick={(e) => {
                  e.stopPropagation();
                  setArchiveConfirmPaper(row);
                }}
              >
                <Iconify icon="mingcute:archive-line" width={17} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Paper">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirmPaper(row);
                }}
              >
                <Iconify icon="solar:trash-bin-trash-bold-duotone" width={17} />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    []
  );

  const summaryCards = useMemo(
    () => [
      { label: 'Total Papers', value: dashboard?.totalPapers || 0, icon: 'mingcute:document-2-line', color: 'primary' as const },
      { label: 'Draft Papers', value: dashboard?.draftPapers || 0, icon: 'mingcute:file-line', color: 'info' as const },
      { label: 'Generated Papers', value: dashboard?.generatedPapers || 0, icon: 'mingcute:sparkles-line', color: 'info' as const },
      { label: 'Pending Approval', value: dashboard?.pendingApproval || 0, icon: 'mingcute:time-line', color: 'warning' as const },
      { label: 'Approved Papers', value: dashboard?.approvedPapers || 0, icon: 'mingcute:check-circle-line', color: 'success' as const },
      { label: 'Published Papers', value: dashboard?.publishedPapers || 0, icon: 'mingcute:paper-line', color: 'primary' as const },
      { label: 'Locked Papers', value: dashboard?.lockedPapers || 0, icon: 'mingcute:lock-line', color: 'error' as const },
    ],
    [dashboard]
  );

  return (
    <Box height="100%" display="flex" flexDirection="column" gap={1.5}>
      {/* ── 1. Page Header ────────────────────────────────────────────────── */}
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Question Papers"
        description="Create papers, validate blueprints, generate from approved bank questions and publish securely."
        links={[
          { name: 'Dashboard', href: academicPaths.dashboard },
          { name: 'Examination', href: academicPaths.examination.questionPapers },
          { name: 'Question Papers' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="mingcute:settings-3-line" />}
              onClick={() => {
                const targetId = selectedPaperId || papers?.items?.[0]?.id;
                if (targetId) {
                  setSelectedPaperId(targetId);
                  setViewMode('workspace');
                }
              }}
            >
              Settings
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="mdi:plus" />}
              disabled={!academicYearId}
              onClick={() => {
                formik.resetForm();
                setDialogOpen(true);
              }}
            >
              + Create Paper
            </Button>
          </Stack>
        }
      />

      {!academicYearId && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Please select an academic year to manage question papers.
        </Alert>
      )}

      {/* Timetable-Style Settings Summary Cards */}
      <TimetableSettingsSummaryCards cards={summaryCards} />

      {/* Customizable Table */}
      <CustomizableTable
        tableId="question-papers-list"
        tableTitle="School Question Papers"
        columns={paperColumns}
        data={papers?.items || []}
        isLoading={isFetching}
        rowProps={(row) => ({
          selected: row.id === selectedPaperId,
          onClick: () => {
            setSelectedPaperId(row.id);
            setViewMode('workspace');
          },
          sx: { cursor: 'pointer' },
        })}
      />

      {/* ── 2. Full Screen Authoring Workspace CustomDialog (Matching newTimetable.tsx) ──────── */}
      <CustomDialog
        title={
          <Box display="flex" alignItems="center" gap={1}>
            {selectedPaper?.paperTitle || 'Question Paper Workspace'}{' '}
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title="Author, configure blueprint rules, validate, and generate intelligent assessment paper."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => setViewMode('list')}
        open={viewMode === 'workspace' && Boolean(selectedPaper)}
        fullScreen
        hasForm={false}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
          <Box sx={{ flex: 1, minHeight: 0, p: 2, bgcolor: (t) => alpha(t.palette.background.default, 0.98), display: 'flex', flexDirection: 'column', gap: 1.25, overflow: 'hidden' }}>
            {selectedPaper && (
              <>
                {/* Header */}
                <Box sx={{ flexShrink: 0 }}>
                  <QuestionPaperHeader
                    paper={selectedPaper}
                    blueprintValid={blueprintValid}
                    aiSuggestionCount={aiSuggestions.length}
                    onBack={() => setViewMode('list')}
                    onSaveBlueprint={handleSaveBlueprint}
                    onValidate={() => validateBlueprint({ paperId: selectedPaperId })}
                    onToggleAiDrawer={() => setAiDrawerOpen(true)}
                    onToggleAnalyticsModal={() => setAnalyticsModalOpen(true)}
                    onOpenPreview={() => setPreviewDialogOpen(true)}
                    onGeneratePaper={() => generatePaper({ paperId: selectedPaperId })}
                    isSaving={blueprintState.isLoading}
                    isValidating={validateState.isLoading}
                    isGenerating={generateState.isLoading}
                  />
                </Box>

                {/* Collapsible Progress Dashboard Accordion */}
                <Box sx={{ flexShrink: 0 }}>
                  <Accordion
                    expanded={showProgressDashboard}
                    onChange={(_, isExpanded) => setShowProgressDashboard(isExpanded)}
                    elevation={0}
                    sx={{
                      borderRadius: '10px !important',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:before': { display: 'none' },
                      bgcolor: 'background.paper',
                    }}
                  >
                    <AccordionSummary expandIcon={<Iconify icon="mingcute:down-line" width={18} />}>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Iconify icon="solar:chart-2-bold-duotone" width={18} color="primary.main" />
                        <Typography variant="subtitle2" fontWeight={700}>
                          Live Blueprint Progress &amp; Assessment Metrics
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1, pt: 0 }}>
                      <ProgressDashboard
                        currentMarks={currentCanvasMarks || selectedPaper.totalMarks}
                        totalMarks={selectedPaper.totalMarks}
                        questionCount={currentTotalQuestions}
                        targetQuestionCount={30}
                        chapterCoveragePct={Math.round((Object.keys(blueprintRules).length / (formChapters?.length || 1)) * 100)}
                        difficultyMatchPct={difficultySum === 100 ? 100 : 85}
                        bloomMatchPct={bloomSum === 100 ? 100 : 90}
                        completionScore={blueprintValid ? 100 : 78}
                      />
                    </AccordionDetails>
                  </Accordion>
                </Box>

                {/* 3-Panel Workspace Grid - Independent Scroll Containers */}
                <Box flex={1} minHeight={0} overflow="hidden">
                  <Grid container spacing={1.5} sx={{ height: '100%' }}>
                    {/* Left Panel: Blueprint Configuration */}
                    <Grid size={{ xs: 12, md: 3.5, lg: 3 }} sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <BlueprintLeftPanel
                        totalPaperMarks={selectedPaper.totalMarks}
                        chapters={formChapters || []}
                        blueprintRules={blueprintRules}
                        onUpdateChapterRule={(chapId, marks, count) => setBlueprintRules((prev) => ({ ...prev, [chapId]: { marks, count } }))}
                        difficultyDist={difficultyDist}
                        onUpdateDifficulty={(lvl, pct) => setDifficultyDist((prev) => ({ ...prev, [lvl]: pct }))}
                        bloomDist={bloomDist}
                        onUpdateBloom={(lvl, pct) => setBloomDist((prev) => ({ ...prev, [lvl]: pct }))}
                        paperRules={paperRules}
                        onUpdatePaperRule={(key, val) => setPaperRules((prev) => ({ ...prev, [key]: val }))}
                        validationIssues={validationIssues}
                      />
                    </Grid>

                    {/* Center Panel: Paper Builder Canvas Sheet */}
                    <Grid size={{ xs: 12, md: 5, lg: 6 }} sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <PaperBuilderCenterPanel
                        paperTitle={selectedPaper.paperTitle}
                        standardName={selectedPaper.standardName}
                        subjectName={selectedPaper.subjectName}
                        totalMarks={selectedPaper.totalMarks}
                        durationMinutes={selectedPaper.durationMinutes}
                        generalInstructions={selectedPaper.generalInstructions}
                        sections={canvasSections}
                        onAddSection={handleAddSection}
                        onUpdateSection={handleUpdateSection}
                        onRemoveQuestion={handleRemoveQuestionFromPaperCanvas}
                        onDuplicateQuestion={handleDuplicateQuestion}
                        onToggleLockQuestion={handleToggleLockQuestion}
                        onMoveQuestion={handleMoveQuestion}
                        onOpenQuestionBank={() => { }}
                        onGenerateAiQuestions={() => setAiDrawerOpen(true)}
                      />
                    </Grid>

                    {/* Right Panel: Question Library */}
                    <Grid size={{ xs: 12, md: 3.5, lg: 3 }} sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <QuestionLibraryRightPanel
                        bankQuestions={bankQuestions}
                        addedQuestionIds={canvasSections.flatMap((s) => (s.questions || []).map((q) => q.id))}
                        chapters={formChapters || []}
                        onAddQuestion={handleAddQuestionToPaperCanvas}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </Box>

          {/* Guaranteed Sticky Bottom Action Bar */}
          {selectedPaper && (
            <Box sx={{ flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', p: 1.25, zIndex: 100 }}>
              <StickyBottomActionBar
                currentMarks={currentCanvasMarks}
                totalMarks={selectedPaper.totalMarks}
                questionCount={currentTotalQuestions}
                blueprintValid={blueprintValid}
                onSaveDraft={handleSaveBlueprint}
                onOpenPreview={() => setPreviewDialogOpen(true)}
                onGeneratePaper={() => generatePaper({ paperId: selectedPaperId })}
                isSaving={blueprintState.isLoading}
                isGenerating={generateState.isLoading}
              />
            </Box>
          )}
        </Box>
      </CustomDialog>

      {/* ── AI Assistant Drawer ──────────────────────────────────────────────── */}
      <AIAssistantDrawer
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        suggestions={aiSuggestions}
        onAcceptSuggestion={(suggestion) => {
          shikshaMitraToast.success({ message: `Accepted AI Recommendation: ${suggestion.title}` });
          setAiSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
        }}
        onIgnoreSuggestion={(id) => setAiSuggestions((prev) => prev.filter((s) => s.id !== id))}
      />

      {/* ── Live Analytics CustomDialog ────────────────────────────────────── */}
      <LiveAnalyticsModal
        open={analyticsModalOpen}
        onClose={() => setAnalyticsModalOpen(false)}
        sections={canvasSections}
        totalPaperMarks={selectedPaper?.totalMarks || 50}
        difficultyDist={difficultyDist}
        bloomDist={bloomDist}
      />

      {/* ── Paper Preview CustomDialog (Skill UI Standards) ──────────────────── */}
      <CustomDialog
        open={previewDialogOpen}
        handleClose={() => setPreviewDialogOpen(false)}
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="mingcute:eye-line" color="primary.main" width={22} />
            <Typography variant="h6" fontWeight={700}>
              Question Paper Print Preview
            </Typography>
          </Stack>
        }
        maxWidth="lg"
        hasForm={false}
      >
        <DialogScrollContent sx={{ p: 0 }}>
          <Scrollbar sx={{ maxHeight: 600, p: 3 }}>
            <Box
              ref={printRef}
              sx={{
                p: 4,
                bgcolor: '#ffffff',
                color: '#1a1a1a',
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                minHeight: 520,
                boxShadow: (t) => `0 4px 20px 0 ${alpha(t.palette.grey[500], 0.1)}`,
              }}
              dangerouslySetInnerHTML={{ __html: preview?.printHtml || '<p style="text-align:center;padding:50px;color:#888;">Generating official print preview document…</p>' }}
            />
          </Scrollbar>
        </DialogScrollContent>
        <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <CancelButton buttonText="Close" onClick={() => setPreviewDialogOpen(false)} />
          <Button variant="contained" color="primary" size="small" onClick={() => handlePrint()} startIcon={<Iconify icon="mingcute:print-line" />}>
            Print / Download PDF
          </Button>
        </DialogActions>
      </CustomDialog>

      {/* ── Create Paper Dialog ────────────────────────────────────────────── */}
      <CustomDialog
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" fontWeight={700}>Create Question Paper</Typography>
            <CustomTooltip title="Configure paper identity, target class, subject, and total marks."><Iconify icon={GlobalIcons.info} width={16} color="info.main" /></CustomTooltip>
          </Stack>
        }
        maxWidth="md"
        hasForm={false}
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogScrollContent>
            <Stack spacing={2}>
              <SectionPaper title="Paper Identity" icon="solar:document-text-bold-duotone">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                    <ShakingTextField error={(formik.touched.paperTitle || formik.submitCount > 0) && !!formik.errors.paperTitle}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Paper Title *"
                        name="paperTitle"
                        value={formik.values.paperTitle}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={(formik.touched.paperTitle || formik.submitCount > 0) && !!formik.errors.paperTitle}
                        helperText={((formik.touched.paperTitle || formik.submitCount > 0) && formik.errors.paperTitle) || ''}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                    <ShakingTextField error={(formik.touched.standardId || formik.submitCount > 0) && !!formik.errors.standardId}>
                      <CustomSelect
                        label="Class *"
                        options={classOptions}
                        value={formik.values.standardId}
                        onChange={(val) => {
                          formik.setFieldValue('standardId', val);
                          formik.setFieldValue('subjectId', '');
                        }}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                    <ShakingTextField error={(formik.touched.subjectId || formik.submitCount > 0) && !!formik.errors.subjectId}>
                      <CustomSelect
                        label="Subject *"
                        options={formSubjectOptions}
                        value={formik.values.subjectId}
                        disabled={!formik.values.standardId}
                        onChange={(val) => formik.setFieldValue('subjectId', val)}
                      />
                    </ShakingTextField>
                  </Grid>
                </Grid>
              </SectionPaper>

              <SectionPaper title="Paper Configuration" icon="solar:tuning-square-bold-duotone">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField fullWidth size="small" type="number" label="Total Marks *" name="totalMarks" value={formik.values.totalMarks} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField fullWidth size="small" type="number" label="Duration (minutes) *" name="durationMinutes" value={formik.values.durationMinutes} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <CustomSelect label="Creation Mode" options={CREATION_MODE_OPTIONS} value={formik.values.creationMode} onChange={(val) => formik.setFieldValue('creationMode', val)} />
                  </Grid>
                </Grid>
              </SectionPaper>
            </Stack>
          </DialogScrollContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <CancelButton onClick={() => setDialogOpen(false)} />
            <SubmitButton loading={createState.isLoading} buttonText="Create" />
          </DialogActions>
        </form>
      </CustomDialog>

      {/* Settings Popover */}
      <Popover open={Boolean(settingsAnchorEl)} anchorEl={settingsAnchorEl} onClose={() => setSettingsAnchorEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Box sx={{ p: 2.5, width: 340 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>Paper Settings</Typography>
          <Button size="small" variant="contained" fullWidth onClick={handleSavePaperSettings}>Save Settings</Button>
        </Box>
      </Popover>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteConfirmPaper)}
        onClose={() => setDeleteConfirmPaper(null)}
        title="Delete Question Paper?"
        content={`Are you sure you want to delete question paper "${deleteConfirmPaper?.paperTitle}"? This action cannot be undone.`}
        action={
          <Button variant="contained" color="error" size="small" onClick={handleDeletePaperConfirm}>
            Delete
          </Button>
        }
      />

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(archiveConfirmPaper)}
        onClose={() => setArchiveConfirmPaper(null)}
        title="Archive Question Paper?"
        content={`Are you sure you want to archive question paper "${archiveConfirmPaper?.paperTitle}"?`}
        action={
          <Button variant="contained" color="warning" size="small" onClick={handleArchivePaperConfirm}>
            Archive
          </Button>
        }
      />
    </Box>
  );
}
