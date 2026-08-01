'use client';

import type { RootState } from 'src/redux/store';

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
import { useRef, useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Label } from 'src/components/label';
import { useGetQuestionsQuery } from 'src/redux/academicAPI/ExaminationApi/QuestionBankApi/question-bank-api';
import {
  useGetExamsQuery,
  useGetExamScheduleQuery,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import CustomTooltip from 'src/components/custom-tooltip';
import { GlobalIcons } from 'src/utils/icons';
import {
  Box,
  Card,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  Alert,
  Button,
  Dialog,
  Drawer,
  Switch,
  Popover,
  Divider,
  Tooltip,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { shikshaMitraToast } from 'src/components/toast';
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
import dayjs from 'dayjs';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUESTION_TYPE_OPTIONS = [
  { value: 1, label: 'MCQ – Single Correct' },
  { value: 2, label: 'MCQ – Multiple Correct' },
  { value: 3, label: 'True / False' },
  { value: 4, label: 'Fill in the Blank' },
  { value: 5, label: 'Short Answer' },
  { value: 6, label: 'Long Answer' },
  { value: 7, label: 'Match the Following' },
  { value: 8, label: 'Assertion & Reason' },
  { value: 9, label: 'Case Study' },
  { value: 10, label: 'Diagram Based' },
  { value: 11, label: 'Practical' },
];

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

const STATUS_COLOR: Record<
  number,
  'default' | 'info' | 'success' | 'error' | 'warning' | 'primary'
> = {
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

// ─── Validation ───────────────────────────────────────────────────────────────

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

// ─── Section Card Wrapper Component (UI Skill Standard) ───────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Validation Badge ─────────────────────────────────────────────────────────

function SumBadge({ sum, target, label }: { sum: number; target: number; label: string }) {
  const ok = Math.abs(sum - target) < 0.01;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        bgcolor: ok ? 'success.lighter' : 'error.lighter',
        color: ok ? 'success.dark' : 'error.dark',
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      <Iconify icon={ok ? 'mingcute:check-circle-line' : 'mingcute:alert-line'} width={14} />
      {label}: {sum} / {target}
    </Box>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

type StatColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: StatColor;
}) {
  const theme = useTheme();
  const palette = theme.palette[color];
  return (
    <Card
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'background.neutral',
            color: palette.main,
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={20} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ lineHeight: 1 }}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {label}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuestionPaperScreen() {
  const theme = useTheme();
  const { currentYear, currentMedium: medium } = useSelector(
    (state: RootState) => state.globalState
  );
  const academicYearId = currentYear?.id;

  const [drawerMode, setDrawerMode] = useState<'blueprint' | 'preview' | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [localPaperSettings, setLocalPaperSettings] = useState<any>(null);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);

  // Blueprint state
  const [blueprintRules, setBlueprintRules] = useState<
    Record<string, { marks: number; count: number }>
  >({});
  const [difficultyDist, setDifficultyDist] =
    useState<Record<number, number>>(DEFAULT_DIFFICULTY_DIST);
  const [bloomDist, setBloomDist] = useState<Record<number, number>>(DEFAULT_BLOOM_DIST);

  // Bank filter state
  const [bankChapterId, setBankChapterId] = useState('');
  const [bankDifficulty, setBankDifficulty] = useState<number | ''>('');
  const [bankQuestionType, setBankQuestionType] = useState<number | ''>('');

  // Reject paper dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState('');

  // Blueprint sync from server
  const { data: blueprint } = useGetBlueprintQuery(
    { paperId: selectedPaperId },
    { skip: !selectedPaperId }
  );
  useEffect(() => {
    if (blueprint?.chapterRules) {
      const rules: Record<string, { marks: number; count: number }> = {};
      blueprint.chapterRules.forEach((rule: any) => {
        rules[rule.chapterId] = { marks: rule.marks, count: rule.numberOfQuestions || 0 };
      });
      setBlueprintRules(rules);
    } else {
      setBlueprintRules({});
    }

    if (blueprint?.difficultyRules?.length) {
      const dist: Record<number, number> = { ...DEFAULT_DIFFICULTY_DIST };
      blueprint.difficultyRules.forEach((r: any) => {
        dist[r.difficultyLevel] = r.percentage;
      });
      setDifficultyDist(dist);
    }

    if (blueprint?.bloomRules?.length) {
      const dist: Record<number, number> = { ...DEFAULT_BLOOM_DIST };
      blueprint.bloomRules.forEach((r: any) => {
        dist[r.bloomLevel] = r.percentage;
      });
      setBloomDist(dist);
    }
  }, [blueprint]);

  // Classes from medium
  const allClass = useMemo(
    () => medium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [],
    [medium]
  );
  const classOptions = useMemo(
    () => allClass.map((cls: any) => ({ value: cls.id, label: cls.name })),
    [allClass]
  );

  // Data queries
  const { data: dashboard } = useGetQuestionPaperDashboardQuery(
    { academicYearId },
    { skip: !academicYearId }
  );
  const { data: papers, isFetching } = useGetQuestionPapersQuery(
    { academicYearId, page: 1, pageSize: 30 },
    { skip: !academicYearId }
  );
  const { data: paperSettings } = useGetQuestionPaperSettingsQuery(
    { academicYearId },
    { skip: !academicYearId }
  );
  const selectedPaper = (papers?.items || []).find((paper: any) => paper.id === selectedPaperId);

  // Exams & schedules (for create dialog)
  const { data: examsData } = useGetExamsQuery({ academicYearId }, { skip: !academicYearId });
  const exams = examsData?.items || [];

  // Formik
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
            {
              sectionName: 'Section A',
              instructions: '',
              marks: Number(values.totalMarks),
              sortOrder: 1,
            },
          ],
        }).unwrap();
        helpers.resetForm({ values: initialPaperValues(academicYearId) });
        setSelectedPaperId(created.id);
        setDialogOpen(false);
        setDrawerMode('blueprint');
      } catch (err) {
        console.error('Failed to create question paper:', err);
      }
    },
  });

  // Subject options for form (driven by formik.values.standardId)
  const { data: formSubjectData } = useGetSubjectAssignmentsQuery(
    { standardId: formik.values.standardId },
    { skip: !formik.values.standardId }
  );
  const formSubjectOptions = useMemo(() => buildSubjectOptions(formSubjectData), [formSubjectData]);

  // Exam schedules
  const { data: examScheduleData } = useGetExamScheduleQuery(
    { examId: formik.values.examId },
    { skip: !formik.values.examId }
  );
  const examSchedules = examScheduleData?.schedules || examScheduleData?.items || [];
  const examScheduleOptions = examSchedules.map((sch: any) => ({
    value: sch.id,
    label: `${sch.subjectName || sch.subjectId} – ${sch.examDate ? new Date(sch.examDate).toLocaleDateString() : sch.id
      }`,
  }));

  // Chapters for blueprint (driven by selectedPaper)
  const { data: formChapters } = useGetChaptersByStandardQuery(
    { standardId: selectedPaper?.standardId, subjectId: selectedPaper?.subjectId },
    { skip: !selectedPaper?.standardId || !selectedPaper?.subjectId }
  );

  // Paper preview
  const { data: preview } = useGetPaperPreviewQuery(
    { paperId: selectedPaperId },
    { skip: !selectedPaperId || drawerMode !== 'preview' }
  );

  // Print ref
  const printRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedPaper?.paperTitle || 'Question_Paper',
  });

  // Bank questions (for builder tab)
  const { data: bankQuestionsData } = useGetQuestionsQuery(
    {
      standardId: selectedPaper?.standardId,
      subjectId: selectedPaper?.subjectId,
      chapterId: bankChapterId || undefined,
      difficultyLevel: bankDifficulty || undefined,
      questionType: bankQuestionType || undefined,
      status: 3,
      pageSize: 100,
    },
    { skip: !selectedPaper?.standardId || !selectedPaper?.subjectId || drawerMode !== 'blueprint' }
  );
  const bankQuestions = bankQuestionsData?.items || [];

  // Mutations
  const [createPaper, createState] = useCreateQuestionPaperMutation();
  const [saveBlueprint, blueprintState] = useSaveBlueprintMutation();
  const [validateBlueprint, validateState] = useValidateBlueprintMutation();
  const [generatePaper, generateState] = useGeneratePaperMutation();
  const [submitPaper] = useSubmitQuestionPaperMutation();
  const [approvePaper] = useApproveQuestionPaperMutation();
  const [rejectPaper, rejectPaperState] = useRejectQuestionPaperMutation();
  const [publishPaper] = usePublishQuestionPaperMutation();
  const [lockQuestionPaper] = useLockQuestionPaperMutation();
  const [deletePaper] = useDeleteQuestionPaperMutation();
  const [archivePaper] = useArchiveQuestionPaperMutation();
  const [addQuestionToPaper] = useAddQuestionToPaperMutation();
  const [removeQuestionFromPaper] = useRemoveQuestionFromPaperMutation();
  const [savePaperSettings, savingPaperSettings] = useSaveQuestionPaperSettingsMutation();

  const [deletePaperId, setDeletePaperId] = useState<string | null>(null);
  const [archivePaperId, setArchivePaperId] = useState<string | null>(null);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  // ─── Derived validations ─────────────────────────────────────────────────

  const chapterMarksSum = Object.values(blueprintRules).reduce((sum, r) => sum + (r.marks || 0), 0);
  const difficultySum = Object.values(difficultyDist).reduce((s, v) => s + v, 0);
  const bloomSum = Object.values(bloomDist).reduce((s, v) => s + v, 0);
  const blueprintValid =
    selectedPaper != null &&
    Math.abs(chapterMarksSum - selectedPaper.totalMarks) < 0.01 &&
    Math.abs(difficultySum - 100) < 0.01 &&
    Math.abs(bloomSum - 100) < 0.01;

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleSaveBlueprint = async () => {
    if (!selectedPaperId || !selectedPaper) return;
    const chapterRules = Object.entries(blueprintRules)
      .map(([chapterId, data]) => ({
        chapterId,
        marks: Number(data.marks || 0),
        numberOfQuestions: data.count ? Number(data.count) : null,
      }))
      .filter((rule) => rule.marks > 0);

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
      shikshaMitraToast.error({ message: err?.data?.detail || err?.data?.message || 'Failed to save blueprint.' });
    }
  };

  const handleAddQuestion = async (bankQuestion: any) => {
    if (!selectedPaperId || !selectedPaper) return;
    const sectionId = selectedPaper.sections?.[0]?.id;
    if (!sectionId) return;
    try {
      await addQuestionToPaper({
        paperId: selectedPaperId,
        body: {
          questionPaperSectionId: sectionId,
          questionBankItemId: bankQuestion.id,
          questionNumber: (selectedPaper.questions?.length || 0) + 1,
          marks: bankQuestion.marks,
          sortOrder: (selectedPaper.questions?.length || 0) + 1,
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Question added to paper.' });
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || err?.data?.message || 'Failed to add question.' });
    }
  };

  const handleRemoveQuestion = async (paperQuestionId: string) => {
    if (!selectedPaperId) return;
    try {
      await removeQuestionFromPaper({ paperId: selectedPaperId, paperQuestionId }).unwrap();
      shikshaMitraToast.success({ message: 'Question removed from paper.' });
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || err?.data?.message || 'Failed to remove question.' });
    }
  };

  const handleSubmitPaper = async () => {
    if (!selectedPaperId) return;
    try {
      await submitPaper({ id: selectedPaperId }).unwrap();
      shikshaMitraToast.success({ message: 'Paper submitted for approval.' });
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || err?.data?.message || 'Failed to submit paper.' });
    }
  };

  const handleApprovePaper = async () => {
    if (!selectedPaperId) return;
    try {
      await approvePaper({ id: selectedPaperId, body: {} }).unwrap();
      shikshaMitraToast.success({ message: 'Paper approved.' });
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || err?.data?.message || 'Failed to approve paper.' });
    }
  };

  const handlePublishPaper = async () => {
    if (!selectedPaperId) return;
    try {
      await publishPaper({ id: selectedPaperId }).unwrap();
      await lockQuestionPaper({ id: selectedPaperId }).unwrap();
      shikshaMitraToast.success({ message: 'Paper published and locked.' });
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || err?.data?.message || 'Failed to publish paper.' });
    }
  };

  const handleConfirmDeletePaper = async () => {
    if (!deletePaperId) return;
    try {
      await deletePaper({ id: deletePaperId }).unwrap();
      shikshaMitraToast.success({ message: 'Paper deleted.' });
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || err?.data?.message || 'Failed to delete paper.' });
    } finally {
      setDeletePaperId(null);
    }
  };

  const handleConfirmArchivePaper = async () => {
    if (!archivePaperId) return;
    try {
      await archivePaper({ id: archivePaperId }).unwrap();
      shikshaMitraToast.success({ message: 'Paper archived.' });
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || err?.data?.message || 'Failed to archive paper.' });
    } finally {
      setArchivePaperId(null);
    }
  };

  const handleRejectPaperConfirm = async () => {
    if (!selectedPaperId) return;
    try {
      await rejectPaper({ id: selectedPaperId, body: { comment: rejectComment } }).unwrap();
      setRejectDialogOpen(false);
      setRejectComment('');
    } catch (err) {
      console.error('Failed to reject paper:', err);
    }
  };

  const handleOpenSettings = (e: React.MouseEvent<HTMLButtonElement>) => {
    setLocalPaperSettings(paperSettings ? { ...paperSettings } : {});
    setSettingsAnchorEl(e.currentTarget);
  };
  const handleCloseSettings = () => setSettingsAnchorEl(null);
  const handleSavePaperSettings = async () => {
    if (!localPaperSettings) return;
    try {
      await savePaperSettings(localPaperSettings).unwrap();
      setSettingsAnchorEl(null);
    } catch (err) {
      console.error('Failed to save paper settings:', err);
    }
  };

  const handleOpenCreate = () => {
    formik.resetForm();
    setDialogOpen(true);
  };

  const handleCloseCreateDialog = (event?: any, reason?: string) => {
    if (reason === 'backdropClick') return;
    if (formik.dirty) {
      if (window.confirm('You have unsaved changes in the form. Are you sure you want to close?')) {
        setDialogOpen(false);
        formik.resetForm();
      }
    } else {
      setDialogOpen(false);
    }
  };

  const chapterOptions = (formChapters || []).map((c: any) => ({
    value: c.id,
    label: `${c.chapterNumber}. ${c.chapterName}`,
  }));

  const statCards = [
    {
      label: 'Total',
      value: dashboard?.totalPapers || 0,
      icon: 'mingcute:document-2-line',
      color: 'primary' as StatColor,
    },
    {
      label: 'Draft',
      value: dashboard?.draftPapers || 0,
      icon: 'mingcute:file-line',
      color: 'info' as StatColor,
    },
    {
      label: 'Generated',
      value: dashboard?.generatedPapers || 0,
      icon: 'mingcute:sparkles-line',
      color: 'secondary' as StatColor,
    },
    {
      label: 'Pending Approval',
      value: dashboard?.pendingApproval || 0,
      icon: 'mingcute:time-line',
      color: 'warning' as StatColor,
    },
    {
      label: 'Approved',
      value: dashboard?.approvedPapers || 0,
      icon: 'mingcute:check-circle-line',
      color: 'success' as StatColor,
    },
    {
      label: 'Published',
      value: dashboard?.publishedPapers || 0,
      icon: 'mingcute:paper-line',
      color: 'primary' as StatColor,
    },
    {
      label: 'Locked',
      value: dashboard?.lockedPapers || 0,
      icon: 'mingcute:lock-line',
      color: 'error' as StatColor,
    },
  ];

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
            <Typography variant="subtitle2" noWrap>{row.paperTitle}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.paperCode ? `#${row.paperCode}` : row.creationMode}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'standardName',
        label: 'Class',
        filterType: 'string' as const,
        width: 120,
      },
      {
        id: 'subjectName',
        label: 'Subject',
        filterType: 'string' as const,
        width: 140,
      },
      {
        id: 'examTitle',
        label: 'Exam',
        filterType: 'string' as const,
        width: 150,
        render: (_: any, row: any) => (
          <Typography variant="body2" color="text.primary" noWrap>
            {row.examTitle || row.exam?.title || row.examName || '—'}
          </Typography>
        ),
      },
      {
        id: 'examDate',
        label: 'Exam Date',
        filterType: 'date' as const,
        width: 120,
        render: (_: any, row: any) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.examDate || row.exam?.startDate ? dayjs(row.examDate || row.exam?.startDate).format('DD-MM-YYYY') : '—'}
          </Typography>
        ),
      },
      {
        id: 'totalMarks',
        label: 'Marks',
        filterType: 'number' as const,
        width: 90,
        align: 'center' as const,
        render: (v: any) => <Typography variant="subtitle2">{v}</Typography>,
      },
      {
        id: 'durationMinutes',
        label: 'Duration',
        filterType: 'number' as const,
        width: 100,
        align: 'center' as const,
        render: (v: any) => <Typography variant="body2">{v ? `${v} min` : '—'}</Typography>,
      },
      {
        id: 'creationMode',
        label: 'Mode',
        filterType: 'enum' as const,
        width: 110,
        enumOptions: CREATION_MODE_OPTIONS,
        render: (v: any) => (
          <Label variant="soft" color="default" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
            {v || 'Manual'}
          </Label>
        ),
      },
      {
        id: 'questions',
        label: 'Questions',
        filterType: 'number' as const,
        width: 100,
        align: 'center' as const,
        render: (_: any, row: any) => (
          <Typography variant="body2" color="text.secondary">
            {row.questions?.length || row.totalQuestions || 0}
          </Typography>
        ),
      },
      {
        id: 'createdAt',
        label: 'Created On',
        filterType: 'date' as const,
        width: 120,
        render: (_: any, row: any) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.createdAt ? dayjs(row.createdAt).format('DD-MM-YYYY') : '—'}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        filterType: 'enum' as const,
        sticky: true,
        stickyPosition: 'right' as const,
        width: 130,
        enumOptions: Object.entries(STATUS_LABEL).map(([v, l]) => ({
          value: l,
          label: l,
        })),
        render: (v: any) => (
          <Label
            variant="soft"
            color={(STATUS_COLOR[v] as any) || 'default'}
            sx={{ fontWeight: 700 }}
          >
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
          <Stack direction="row" spacing={0.5} justifyContent="flex-start">
            <Tooltip title="Blueprint & Builder">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPaperId(row.id);
                  setDrawerMode('blueprint');
                }}
              >
                <Iconify icon="mingcute:settings-3-line" width={17} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Preview & Workflow">
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPaperId(row.id);
                  setDrawerMode('preview');
                }}
              >
                <Iconify icon="mingcute:eye-line" width={17} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Archive Paper">
              <span>
                <IconButton
                  size="small"
                  color="warning"
                  disabled={row.status === 8 || row.status === 6}
                  onClick={(e) => {
                    e.stopPropagation();
                    setArchivePaperId(row.id);
                  }}
                >
                  <Iconify icon="mingcute:archive-line" width={17} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete Paper">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={row.status > 2}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletePaperId(row.id);
                  }}
                >
                  <Iconify icon="mingcute:delete-2-line" width={17} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [classOptions, formSubjectOptions]
  );

  return (
    <Box height="100%" display="flex" flexDirection="column" gap={1}>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Question Papers"
        description="Create papers, validate blueprints, generate from approved bank questions and publish securely."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Examination' },
          { name: 'Question Papers' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="mingcute:settings-3-line" />}
              disabled={!academicYearId}
              onClick={handleOpenSettings}
            >
              Settings
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="mdi:plus" />}
              disabled={!academicYearId}
              onClick={handleOpenCreate}
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

      {/* Stat Cards */}
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
      >
        {statCards.map((card) => (
          <Box key={card.label} sx={{ flex: '1 1 180px', minWidth: 180 }}>
            <StatCard {...card} />
          </Box>
        ))}
      </Stack>

      {/* ── Papers List ────────────────────────────────────────────────────── */}
      <CustomizableTable
        tableId="question-papers-list"
        tableTitle="Question Papers"
        columns={paperColumns}
        data={papers?.items || []}
        isLoading={isFetching}
        rowProps={(row) => ({
          selected: row.id === selectedPaperId,
          sx: { cursor: 'pointer' },
        })}
        noDataText={
          <Stack alignItems="center" spacing={1} py={6}>
            <Typography variant="subtitle2" color="text.secondary">
              No question papers found
            </Typography>
          </Stack>
        }
      />

      {/* ── Blueprint & Preview Drawer ────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={drawerMode !== null}
        onClose={() => setDrawerMode(null)}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: '90vw', lg: '82vw' },
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {selectedPaper && (
          <>
            {/* Drawer Header */}
            <Box
              sx={{
                px: 3,
                py: 2,
                flexShrink: 0,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={700} noWrap>
                  {selectedPaper.paperTitle}
                </Typography>
                <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    label={`${selectedPaper.totalMarks} marks`}
                    variant="soft"
                    color="primary"
                  />
                  <Chip
                    size="small"
                    label={`${selectedPaper.durationMinutes} min`}
                    variant="soft"
                    color="info"
                  />
                  <Chip
                    size="small"
                    label={STATUS_LABEL[selectedPaper.status] || '—'}
                    color={STATUS_COLOR[selectedPaper.status] || 'default'}
                  />
                </Stack>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                <Button
                  size="small"
                  variant={drawerMode === 'blueprint' ? 'contained' : 'outlined'}
                  startIcon={<Iconify icon="mingcute:settings-3-line" width={16} />}
                  onClick={() => setDrawerMode('blueprint')}
                >
                  Blueprint &amp; Builder
                </Button>
                <Button
                  size="small"
                  variant={drawerMode === 'preview' ? 'contained' : 'outlined'}
                  startIcon={<Iconify icon="mingcute:eye-line" width={16} />}
                  onClick={() => setDrawerMode('preview')}
                >
                  Preview &amp; Workflow
                </Button>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                <IconButton size="small" onClick={() => setDrawerMode(null)}>
                  <Iconify icon="mingcute:close-line" width={20} />
                </IconButton>
              </Stack>
            </Box>

            {/* Drawer Body */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
              {/* ── Blueprint & Builder ──────────────────────────────────────── */}
              {drawerMode === 'blueprint' && (
                <Grid container spacing={1}>
                  {/* Blueprint Panel */}
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Stack spacing={1}>
                      {/* Chapter Weightage */}
                      <Card sx={{ p: 2.5, borderRadius: 2 }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          mb={1.5}
                        >
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              Chapter Weightage
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Set marks &amp; question count per chapter
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Validate blueprint against available questions">
                              <span>
                                <LoadingButton
                                  size="small"
                                  loading={validateState.isLoading}
                                  variant="outlined"
                                  color="info"
                                  onClick={() => validateBlueprint({ paperId: selectedPaperId })}
                                  startIcon={<Iconify icon="mingcute:check-circle-line" />}
                                >
                                  Validate
                                </LoadingButton>
                              </span>
                            </Tooltip>
                            <LoadingButton
                              size="small"
                              loading={blueprintState.isLoading}
                              variant="outlined"
                              onClick={handleSaveBlueprint}
                              startIcon={<Iconify icon="mingcute:save-line" />}
                            >
                              Save
                            </LoadingButton>
                            <LoadingButton
                              size="small"
                              loading={generateState.isLoading}
                              variant="contained"
                              disabled={!blueprintValid}
                              onClick={() => generatePaper({ paperId: selectedPaperId })}
                              startIcon={<Iconify icon="mingcute:sparkles-line" />}
                            >
                              Generate
                            </LoadingButton>
                          </Stack>
                        </Stack>

                        {/* Chapter sum validation */}
                        {selectedPaper && (
                          <Box mb={1.5}>
                            <SumBadge
                              sum={chapterMarksSum}
                              target={selectedPaper.totalMarks}
                              label="Chapter Marks"
                            />
                          </Box>
                        )}

                        <Box sx={{ overflow: 'auto', maxHeight: 320 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow
                                sx={{
                                  '& th': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                                    fontWeight: 600,
                                    fontSize: '0.78rem',
                                  },
                                }}
                              >
                                <TableCell>Chapter</TableCell>
                                <TableCell align="center" sx={{ width: 76 }}>
                                  Marks
                                </TableCell>
                                <TableCell align="center" sx={{ width: 76 }}>
                                  Count
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(formChapters || []).map((chap: any) => {
                                const rule = blueprintRules[chap.id] || { marks: 0, count: 0 };
                                return (
                                  <TableRow key={chap.id} hover>
                                    <TableCell sx={{ fontSize: '0.8rem' }}>
                                      {chap.chapterNumber}. {chap.chapterName}
                                    </TableCell>
                                    <TableCell align="center">
                                      <TextField
                                        size="small"
                                        type="number"
                                        value={rule.marks || ''}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          setBlueprintRules((prev) => ({
                                            ...prev,
                                            [chap.id]: { ...prev[chap.id], marks: val },
                                          }));
                                        }}
                                        inputProps={{
                                          style: {
                                            textAlign: 'center',
                                            fontSize: '0.8rem',
                                            padding: '5px 6px',
                                          },
                                          min: 0,
                                        }}
                                        sx={{ width: 64 }}
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      <TextField
                                        size="small"
                                        type="number"
                                        value={rule.count || ''}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          setBlueprintRules((prev) => ({
                                            ...prev,
                                            [chap.id]: { ...prev[chap.id], count: val },
                                          }));
                                        }}
                                        inputProps={{
                                          style: {
                                            textAlign: 'center',
                                            fontSize: '0.8rem',
                                            padding: '5px 6px',
                                          },
                                          min: 0,
                                        }}
                                        sx={{ width: 64 }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                              {!(formChapters || []).length && (
                                <TableRow>
                                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      No chapters found for this subject.
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </Box>
                      </Card>

                      {/* Difficulty Distribution */}
                      <Card sx={{ p: 2.5, borderRadius: 2 }}>
                        <Box mb={1.5}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Difficulty Distribution
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Percentage of questions per difficulty level — must sum to 100%
                          </Typography>
                        </Box>
                        <SumBadge sum={difficultySum} target={100} label="Difficulty %" />
                        <Table size="small" sx={{ mt: 1.5 }}>
                          <TableHead>
                            <TableRow
                              sx={{
                                '& th': {
                                  bgcolor: alpha(theme.palette.warning.main, 0.06),
                                  fontWeight: 600,
                                  fontSize: '0.78rem',
                                },
                              }}
                            >
                              <TableCell>Level</TableCell>
                              <TableCell align="center" sx={{ width: 100 }}>
                                Percentage
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {DIFFICULTY_OPTIONS.map((d) => (
                              <TableRow key={d.value} hover>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    label={d.label}
                                    color={
                                      d.value === 1
                                        ? 'success'
                                        : d.value === 2
                                          ? 'warning'
                                          : 'error'
                                    }
                                    variant="soft"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <TextField
                                    size="small"
                                    type="number"
                                    value={difficultyDist[d.value] ?? ''}
                                    onChange={(e) =>
                                      setDifficultyDist((prev) => ({
                                        ...prev,
                                        [d.value]: Number(e.target.value),
                                      }))
                                    }
                                    inputProps={{
                                      style: {
                                        textAlign: 'center',
                                        fontSize: '0.8rem',
                                        padding: '5px 6px',
                                      },
                                      min: 0,
                                      max: 100,
                                    }}
                                    sx={{ width: 80 }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>

                      {/* Bloom Level Distribution */}
                      <Card sx={{ p: 2.5, borderRadius: 2 }}>
                        <Box mb={1.5}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Bloom&apos;s Taxonomy Distribution
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Percentage of questions per cognitive level — must sum to 100%
                          </Typography>
                        </Box>
                        <SumBadge sum={bloomSum} target={100} label="Bloom %" />
                        <Table size="small" sx={{ mt: 1.5 }}>
                          <TableHead>
                            <TableRow
                              sx={{
                                '& th': {
                                  bgcolor: alpha(theme.palette.info.main, 0.06),
                                  fontWeight: 600,
                                  fontSize: '0.78rem',
                                },
                              }}
                            >
                              <TableCell>Level</TableCell>
                              <TableCell align="center" sx={{ width: 100 }}>
                                Percentage
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {BLOOM_OPTIONS.map((b) => (
                              <TableRow key={b.value} hover>
                                <TableCell sx={{ fontSize: '0.8rem' }}>{b.label}</TableCell>
                                <TableCell align="center">
                                  <TextField
                                    size="small"
                                    type="number"
                                    value={bloomDist[b.value] ?? ''}
                                    onChange={(e) =>
                                      setBloomDist((prev) => ({
                                        ...prev,
                                        [b.value]: Number(e.target.value),
                                      }))
                                    }
                                    inputProps={{
                                      style: {
                                        textAlign: 'center',
                                        fontSize: '0.8rem',
                                        padding: '5px 6px',
                                      },
                                      min: 0,
                                      max: 100,
                                    }}
                                    sx={{ width: 80 }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>

                      {!blueprintValid && (
                        <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
                          Resolve all distribution errors above before generating the paper.
                        </Alert>
                      )}
                    </Stack>
                  </Grid>

                  {/* Question Builder */}
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Card sx={{ p: 2.5, borderRadius: 2 }}>
                      <Box mb={2}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {selectedPaper.paperTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedPaper.totalMarks} marks &nbsp;|&nbsp;{' '}
                          {selectedPaper.durationMinutes} minutes
                        </Typography>
                      </Box>

                      <Grid container spacing={1}>
                        {/* Current paper questions */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1.5,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                px: 2,
                                py: 1.5,
                                bgcolor: alpha(theme.palette.success.main, 0.06),
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Typography variant="subtitle2" color="success.dark">
                                Paper Questions ({selectedPaper.questions?.length || 0})
                              </Typography>
                            </Box>
                            <Box sx={{ height: 460, overflow: 'auto', p: 1.5 }}>
                              {(selectedPaper.questions || []).length === 0 ? (
                                <Alert severity="info" sx={{ borderRadius: 1.5 }}>
                                  No questions added yet. Add from the bank on the right.
                                </Alert>
                              ) : (
                                <Stack spacing={1}>
                                  {(selectedPaper.questions || []).map((question: any) => (
                                    <Box
                                      key={question.id}
                                      sx={{
                                        p: 1.5,
                                        borderRadius: 1.5,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        bgcolor: 'background.paper',
                                      }}
                                    >
                                      <Box sx={{ pr: 1, flex: 1 }}>
                                        <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                                          Q{question.questionNumber}.{' '}
                                          {question.questionText || 'Bank Question'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {question.marks} marks
                                        </Typography>
                                      </Box>
                                      <Tooltip title="Remove from paper">
                                        <span>
                                          <IconButton
                                            size="small"
                                            color="error"
                                            disabled={selectedPaper.status > 2}
                                            onClick={() => handleRemoveQuestion(question.id)}
                                          >
                                            <Iconify icon="mingcute:delete-2-line" width={16} />
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                    </Box>
                                  ))}
                                </Stack>
                              )}
                            </Box>
                          </Box>
                        </Grid>

                        {/* Question bank */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1.5,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                px: 2,
                                py: 1.5,
                                bgcolor: alpha(theme.palette.primary.main, 0.06),
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Typography variant="subtitle2" color="primary.dark">
                                Available Bank Questions
                              </Typography>
                            </Box>
                            <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Stack spacing={1}>
                                <CustomSelect
                                  label="Chapter"
                                  options={[
                                    { value: '', label: 'All Chapters' },
                                    ...chapterOptions,
                                  ]}
                                  value={bankChapterId}
                                  onChange={(val) => setBankChapterId(val as string)}
                                />
                                <Stack direction="row" spacing={1}>
                                  <CustomSelect
                                    label="Difficulty"
                                    options={[{ value: '', label: 'All' }, ...DIFFICULTY_OPTIONS]}
                                    value={bankDifficulty}
                                    onChange={(val) => setBankDifficulty(val as any)}
                                  />
                                  <CustomSelect
                                    label="Type"
                                    options={[
                                      { value: '', label: 'All' },
                                      ...QUESTION_TYPE_OPTIONS,
                                    ]}
                                    value={bankQuestionType}
                                    onChange={(val) => setBankQuestionType(val as any)}
                                  />
                                </Stack>
                              </Stack>
                            </Box>
                            <Box sx={{ height: 340, overflow: 'auto', p: 1.5 }}>
                              {bankQuestions.length === 0 ? (
                                <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
                                  No approved questions match the current filters.
                                </Alert>
                              ) : (
                                <Stack spacing={1}>
                                  {bankQuestions.map((q: any) => {
                                    const alreadyAdded = (selectedPaper.questions || []).some(
                                      (pq: any) => pq.questionBankItemId === q.id
                                    );
                                    return (
                                      <Box
                                        key={q.id}
                                        sx={{
                                          p: 1.5,
                                          borderRadius: 1.5,
                                          border: '1px solid',
                                          borderColor: alreadyAdded ? 'success.light' : 'divider',
                                          bgcolor: alreadyAdded
                                            ? alpha(theme.palette.success.main, 0.04)
                                            : 'background.paper',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'flex-start',
                                          opacity: alreadyAdded ? 0.7 : 1,
                                          transition: 'all 0.2s',
                                        }}
                                      >
                                        <Box sx={{ pr: 1, flex: 1 }}>
                                          <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                                            {q.questionText}
                                          </Typography>
                                          <Stack
                                            direction="row"
                                            spacing={1}
                                            mt={0.5}
                                            flexWrap="wrap"
                                          >
                                            <Chip
                                              size="small"
                                              label={`${q.marks}M`}
                                              color="primary"
                                              variant="soft"
                                              sx={{ fontSize: '0.7rem', height: 18 }}
                                            />
                                            <Chip
                                              size="small"
                                              label={
                                                DIFFICULTY_OPTIONS.find(
                                                  (d) => d.value === q.difficultyLevel
                                                )?.label
                                              }
                                              color={
                                                q.difficultyLevel === 1
                                                  ? 'success'
                                                  : q.difficultyLevel === 2
                                                    ? 'warning'
                                                    : 'error'
                                              }
                                              variant="soft"
                                              sx={{ fontSize: '0.7rem', height: 18 }}
                                            />
                                          </Stack>
                                        </Box>
                                        <Tooltip
                                          title={alreadyAdded ? 'Already added' : 'Add to paper'}
                                        >
                                          <span>
                                            <IconButton
                                              size="small"
                                              color={alreadyAdded ? 'success' : 'primary'}
                                              disabled={alreadyAdded || selectedPaper.status > 2}
                                              onClick={() => handleAddQuestion(q)}
                                            >
                                              <Iconify
                                                icon={
                                                  alreadyAdded
                                                    ? 'mingcute:check-circle-line'
                                                    : 'mingcute:add-circle-line'
                                                }
                                                width={18}
                                              />
                                            </IconButton>
                                          </span>
                                        </Tooltip>
                                      </Box>
                                    );
                                  })}
                                </Stack>
                              )}
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* ── Preview & Workflow ───────────────────────────────────────── */}
              {drawerMode === 'preview' && (
                <Grid container spacing={1}>
                  {/* Paper Preview */}
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ p: 3, borderRadius: 2 }}>
                      <Box
                        ref={printRef}
                        sx={{
                          minHeight: 420,
                          p: 3,
                          bgcolor: '#ffffff',
                          color: '#000000',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          '@media print': { p: 0, border: 'none' },
                          '& h1': { fontSize: 26, textAlign: 'center', mb: 2 },
                          '& h2': { fontSize: 18, mt: 3, mb: 1 },
                          '& p': { fontSize: 14, lineHeight: 1.7 },
                        }}
                        dangerouslySetInnerHTML={{
                          __html:
                            preview?.printHtml ||
                            '<p style="color:#999;text-align:center;padding:40px">Loading preview…</p>',
                        }}
                      />
                    </Card>
                  </Grid>

                  {/* Actions Sidebar */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={1}>
                      {/* Print / Export */}
                      <Card sx={{ p: 2.5, borderRadius: 2 }}>
                        <Typography variant="subtitle2" mb={1.5} fontWeight={600}>
                          Export
                        </Typography>
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => handlePrint()}
                          startIcon={<Iconify icon="mingcute:print-line" />}
                        >
                          Print / Download PDF
                        </Button>
                      </Card>

                      {/* Approval Workflow */}
                      <Card sx={{ p: 2.5, borderRadius: 2 }}>
                        <Typography variant="subtitle2" mb={1.5} fontWeight={600}>
                          Approval Workflow
                        </Typography>
                        <Stack spacing={1}>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            startIcon={<Iconify icon="mingcute:send-line" />}
                            disabled={selectedPaper.status !== 2 && selectedPaper.status !== 1}
                            onClick={() => submitPaper({ id: selectedPaperId })}
                          >
                            Submit for Approval
                          </Button>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<Iconify icon="mingcute:check-circle-line" />}
                            disabled={selectedPaper.status !== 3}
                            onClick={() => approvePaper({ id: selectedPaperId, body: {} })}
                          >
                            Approve
                          </Button>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Iconify icon="mingcute:close-circle-line" />}
                            disabled={selectedPaper.status !== 3}
                            onClick={() => {
                              setRejectComment('');
                              setRejectDialogOpen(true);
                            }}
                          >
                            Reject
                          </Button>
                          <Button
                            fullWidth
                            size="small"
                            variant="contained"
                            color="warning"
                            startIcon={<Iconify icon="mingcute:lock-line" />}
                            disabled={selectedPaper.status !== 4}
                            onClick={() => publishPaper({ id: selectedPaperId })}
                          >
                            Publish &amp; Lock
                          </Button>
                        </Stack>
                      </Card>
                    </Stack>
                  </Grid>
                </Grid>
              )}
            </Box>
            {/* end Drawer Body */}
          </>
        )}
      </Drawer>

      {/* ── Create Paper Dialog ────────────────────────────────────────────── */}
      <CustomDialog
        open={dialogOpen}
        handleClose={handleCloseCreateDialog}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center" component="span" sx={{ fontWeight: 'normal' }}>
            <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
              Create Question Paper
            </Box>
            <CustomTooltip
              arrow
              placement="right"
              title="Create and configure a new question paper with standard, subject, duration, and instructions."
            >
              <Iconify icon={GlobalIcons.info} sx={{ cursor: 'pointer' }} color="info.main" width={16} height={16} />
            </CustomTooltip>
          </Box>
        }
        maxWidth="md"
        hasForm={false}
      >
        <form
          onSubmit={formik.handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
        >
          <DialogScrollContent>
            <Stack spacing={2}>
              {/* ── 1. Paper Details ────────────────────────────────────── */}
              <SectionPaper
                title="Paper Identity & Target"
                caption="Provide paper title, class, and target subject"
                icon="solar:document-text-bold-duotone"
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                    <ShakingTextField error={(formik.touched.paperTitle || formik.submitCount > 0) && !!formik.errors.paperTitle}>
                      <TextField
                        fullWidth
                        label="Paper Title *"
                        name="paperTitle"
                        value={formik.values.paperTitle}
                        size="small"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={(formik.touched.paperTitle || formik.submitCount > 0) && !!formik.errors.paperTitle}
                        helperText={((formik.touched.paperTitle || formik.submitCount > 0) && formik.errors.paperTitle) || ''}
                        placeholder="e.g. Annual Examination – Mathematics 2025"
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
                        error={(formik.touched.standardId || formik.submitCount > 0) && !!formik.errors.standardId}
                        helperText={((formik.touched.standardId || formik.submitCount > 0) && formik.errors.standardId) || ''}
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
                        error={(formik.touched.subjectId || formik.submitCount > 0) && !!formik.errors.subjectId}
                        helperText={((formik.touched.subjectId || formik.submitCount > 0) && formik.errors.subjectId) || ''}
                      />
                    </ShakingTextField>
                  </Grid>
                </Grid>
              </SectionPaper>

              {/* ── 2. Exam Link ────────────────────────────────────────── */}
              <SectionPaper
                title="Link to Exam Schedule"
                caption="Optionally link this paper to a scheduled examination timetable"
                icon="solar:calendar-mark-bold-duotone"
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomSelect
                      label="Exam"
                      options={[
                        { value: '', label: 'None / Custom Exam' },
                        ...exams.map((ex: any) => ({ value: ex.id, label: ex.examName })),
                      ]}
                      value={formik.values.examId || ''}
                      onChange={(val) => {
                        formik.setFieldValue('examId', val);
                        formik.setFieldValue('examScheduleId', '');
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomSelect
                      label="Exam Schedule / Date"
                      options={[{ value: '', label: 'None' }, ...examScheduleOptions]}
                      value={formik.values.examScheduleId || ''}
                      disabled={!formik.values.examId}
                      onChange={(val) => formik.setFieldValue('examScheduleId', val)}
                    />
                  </Grid>
                </Grid>
              </SectionPaper>

              {/* ── 3. Paper Configuration ─────────────────────────────── */}
              <SectionPaper
                title="Paper Configuration"
                caption="Configure total marks, exam duration, and creation mode"
                icon="solar:tuning-square-bold-duotone"
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <ShakingTextField error={(formik.touched.totalMarks || formik.submitCount > 0) && !!formik.errors.totalMarks}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Total Marks *"
                        name="totalMarks"
                        value={formik.values.totalMarks}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={(formik.touched.totalMarks || formik.submitCount > 0) && !!formik.errors.totalMarks}
                        helperText={
                          ((formik.touched.totalMarks || formik.submitCount > 0) && formik.errors.totalMarks) || ''
                        }
                        inputProps={{ min: 1 }}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <ShakingTextField
                      error={(formik.touched.durationMinutes || formik.submitCount > 0) && !!formik.errors.durationMinutes}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Duration (minutes) *"
                        name="durationMinutes"
                        value={formik.values.durationMinutes}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={(formik.touched.durationMinutes || formik.submitCount > 0) && !!formik.errors.durationMinutes}
                        helperText={
                          ((formik.touched.durationMinutes || formik.submitCount > 0) && formik.errors.durationMinutes) || ''
                        }
                        inputProps={{ min: 1 }}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <CustomSelect
                      label="Creation Mode"
                      options={CREATION_MODE_OPTIONS}
                      value={formik.values.creationMode}
                      onChange={(val) => formik.setFieldValue('creationMode', val)}
                    />
                  </Grid>
                </Grid>
              </SectionPaper>

              {/* ── 4. General Instructions ─────────────────────────────── */}
              <SectionPaper
                title="General Instructions"
                caption="Default guidelines printed on the question paper header"
                icon="solar:info-square-bold-duotone"
              >
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="General Instructions"
                  name="generalInstructions"
                  value={formik.values.generalInstructions}
                  onChange={formik.handleChange}
                />
              </SectionPaper>
            </Stack>
          </DialogScrollContent>

          <DialogActions
            sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}
          >
            <CancelButton onClick={() => handleCloseCreateDialog()} />
            <SubmitButton
              loading={createState.isLoading}
              buttonText="Create"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            />
          </DialogActions>
        </form>
      </CustomDialog>

      {/* ── Question Paper Settings Popover ───────────────────────────────── */}
      <Popover
        open={Boolean(settingsAnchorEl)}
        anchorEl={settingsAnchorEl}
        onClose={handleCloseSettings}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 380,
              borderRadius: 2.5,
              boxShadow: (t) => t.shadows[16],
              overflow: 'hidden',
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: 'primary.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="mingcute:settings-3-line" color="primary.main" width={18} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Question Paper Settings
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Changes save when you click Save
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={handleCloseSettings}>
            <Iconify icon="mingcute:close-line" width={18} />
          </IconButton>
        </Box>

        {/* Scrollable body */}
        <Box sx={{ maxHeight: 420, overflowY: 'auto', px: 2.5, py: 2 }}>
          {localPaperSettings ? (
            <Stack spacing={0}>
              {/* Generator Rules */}
              <Typography
                variant="overline"
                color="text.disabled"
                sx={{ letterSpacing: 1, fontSize: '0.68rem', mb: 0.5 }}
              >
                Generator Rules
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1.25,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Block recently used questions
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Exclude questions used in recent exams from auto-generation
                  </Typography>
                </Box>
                <Switch
                  size="small"
                  checked={localPaperSettings.enableRecentQuestionBlock ?? false}
                  onChange={(_, checked) =>
                    setLocalPaperSettings((prev: any) => ({
                      ...prev,
                      enableRecentQuestionBlock: checked,
                    }))
                  }
                />
              </Box>

              {localPaperSettings.enableRecentQuestionBlock && (
                <Box sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Block period (days)"
                    value={localPaperSettings.recentQuestionBlockDays ?? 180}
                    onChange={(e) =>
                      setLocalPaperSettings((prev: any) => ({
                        ...prev,
                        recentQuestionBlockDays: Number(e.target.value),
                      }))
                    }
                    inputProps={{ min: 1, max: 730 }}
                    helperText="Questions used within this period are excluded"
                  />
                </Box>
              )}

              {/* Security & Release */}
              <Typography
                variant="overline"
                color="text.disabled"
                sx={{ letterSpacing: 1, fontSize: '0.68rem', mt: 2, mb: 0.5 }}
              >
                Security & Release
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1.25,
                  borderBottom: localPaperSettings.enableDownloadReleaseLock ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Lock PDF until exam date
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    PDF download is blocked until X hours before the exam
                  </Typography>
                </Box>
                <Switch
                  size="small"
                  checked={localPaperSettings.enableDownloadReleaseLock ?? false}
                  onChange={(_, checked) =>
                    setLocalPaperSettings((prev: any) => ({
                      ...prev,
                      enableDownloadReleaseLock: checked,
                    }))
                  }
                />
              </Box>

              {localPaperSettings.enableDownloadReleaseLock && (
                <Box sx={{ py: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Release hours before exam"
                    value={localPaperSettings.downloadReleaseHours ?? 1}
                    onChange={(e) =>
                      setLocalPaperSettings((prev: any) => ({
                        ...prev,
                        downloadReleaseHours: Number(e.target.value),
                      }))
                    }
                    inputProps={{ min: 1, max: 72 }}
                    helperText="PDF becomes available this many hours before the exam"
                  />
                </Box>
              )}
            </Stack>
          ) : (
            <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
              No settings found. Select an academic year first.
            </Alert>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: 2.5,
            py: 1.75,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            bgcolor: 'background.neutral',
          }}
        >
          <Button size="small" variant="outlined" onClick={handleCloseSettings}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleSavePaperSettings}
            disabled={savingPaperSettings.isLoading}
            startIcon={
              savingPaperSettings.isLoading ? undefined : (
                <Iconify icon="mingcute:save-line" width={16} />
              )
            }
          >
            {savingPaperSettings.isLoading ? 'Saving…' : 'Save'}
          </Button>
        </Box>
      </Popover>

      {/* ── Reject Paper Dialog ────────────────────────────────────────────── */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mingcute:close-circle-line" color="error.main" />
            <Typography variant="subtitle1" fontWeight={600}>
              Reject Question Paper
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Rejection reason *"
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            placeholder="Explain what needs to be corrected before this paper can be approved…"
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => setRejectDialogOpen(false)}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={rejectPaperState.isLoading}
            disabled={!rejectComment.trim()}
            onClick={handleRejectPaperConfirm}
            startIcon={<Iconify icon="mingcute:close-circle-line" />}
          >
            Reject Paper
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* ── Confirm Delete Paper Dialog ── */}
      <ConfirmDialog
        open={!!deletePaperId}
        title="Delete Question Paper"
        content="This action cannot be undone. The question paper and its blueprint data will be permanently removed."
        icon="warning"
        onClose={() => setDeletePaperId(null)}
        action={
          <Button
            size="small"
            color="error"
            variant="contained"
            onClick={handleConfirmDeletePaper}
          >
            Delete
          </Button>
        }
      />

      {/* ── Confirm Archive Paper Dialog ── */}
      <ConfirmDialog
        open={!!archivePaperId}
        title="Archive Question Paper"
        content="Archiving will hide this paper from active exam schedule options. You can restore it later if needed."
        icon="warning"
        onClose={() => setArchivePaperId(null)}
        action={
          <Button
            size="small"
            color="warning"
            variant="contained"
            onClick={handleConfirmArchivePaper}
          >
            Archive
          </Button>
        }
      />
    </Box>
  );
}
