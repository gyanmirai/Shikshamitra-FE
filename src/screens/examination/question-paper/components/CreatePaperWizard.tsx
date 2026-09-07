'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { styled } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { stepConnectorClasses } from '@mui/material/StepConnector';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetQuestionsQuery } from 'src/redux/academicAPI/ExaminationApi/QuestionBankApi/question-bank-api';
import { useGetQuestionPaperExamLookupQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import {
  Box,
  Step,
  Stack,
  Alert,
  Button,
  Stepper,
  StepLabel,
  Typography,
  StepConnector,
} from '@mui/material';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import {
  useGetBlueprintQuery,
  useGetPaperPreviewQuery,
  useSaveBlueprintMutation,
  useGetQuestionPaperByIdQuery,
  useAddQuestionToPaperMutation,
  useCreateQuestionPaperMutation,
  useUpdateQuestionPaperMutation,
  useSubmitQuestionPaperMutation,
  useRejectQuestionPaperMutation,
  useApproveQuestionPaperMutation,
  usePublishQuestionPaperMutation,
  useRemoveQuestionFromPaperMutation,
} from 'src/redux/academicAPI/ExaminationApi/QuestionPaperApi/question-paper-api';

import StepPreview from './steps/StepPreview';
import AIAssistantDrawer from './AIAssistantDrawer';
import StepPaperPattern from './steps/StepPaperPattern';
import StepAddQuestions from './steps/StepAddQuestions';
import ReviewApprovalPanel from './ReviewApprovalPanel';
import StepReviewAndSubmit from './steps/StepReviewAndSubmit';
import { buildCheckResults } from './steps/StepCheckValidate';
import StepPaperDetails, { PaperDetailsFormValues } from './steps/StepPaperDetails';
import {
  WIZARD_STEPS,
  STATUS_LABEL,
  STATUS_COLOR,
  BLOOM_OPTIONS,
  READONLY_STATUSES,
  DIFFICULTY_OPTIONS,
  DEFAULT_BLOOM_DIST,
  DEFAULT_DIFFICULTY_DIST,
} from '../constants';

import type {
  WizardMode,
  AISuggestion,
  CreationMode,
  QuestionItem,
  SectionPattern,
  PaperRulesState,
  ValidationIssue,
  QuestionPaperMetadata,
  QuestionLibraryFilters,
} from '../types';

const paperValidationSchema = Yup.object({
  paperTitle: Yup.string().required('Please enter a Paper Name.').min(3, 'Title is too short'),
  standardId: Yup.string().required('Please select a Class.'),
  subjectId: Yup.string().required('Please select a Subject.'),
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

const DEFAULT_LIBRARY_FILTERS: QuestionLibraryFilters = {
  keyword: '',
  chapterId: '',
  difficultyLevel: '',
  bloomLevel: '',
};

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

function getPaperSections(response: any): any[] {
  return response?.sections || response?.data?.sections || [];
}

function toSectionsPayload(sections: SectionPattern[]) {
  return sections.map((section, index) => ({
    ...(section.id && !section.id.startsWith('sec-') ? { id: section.id } : {}),
    sectionName: section.sectionName,
    instructions: section.instructions || '',
    marks: Number(section.marks) || 0,
    sortOrder: index + 1,
    questionType: section.questionType ?? null,
    questionCount: section.questionCount ?? null,
    marksPerQuestion: section.marksPerQuestion ?? null,
  }));
}

function getQuestionSectionId(question: any): string | undefined {
  return (
    question?.questionPaperSectionId ||
    question?.paperSectionId ||
    question?.sectionId ||
    question?.section?.id
  );
}

function toSectionKey(sectionId: unknown): string | undefined {
  return typeof sectionId === 'string' && sectionId ? sectionId.toLowerCase() : undefined;
}

function getApiErrorMessage(error: any, fallback: string): string {
  const data = error?.data;
  if (typeof data?.detail === 'string' && data.detail.trim()) return data.detail;
  if (typeof data?.title === 'string' && data.title.trim()) return data.title;
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors).flatMap((value: any) =>
      Array.isArray(value) ? value : [value]
    );
    if (messages.length > 0) return messages.join(' ');
  }
  return fallback;
}

const initialDetailsValues = (academicYearId?: string): PaperDetailsFormValues => ({
  academicYearId: academicYearId || '',
  paperTitle: '',
  standardId: '',
  subjectId: '',
  examId: '',
  totalMarks: 50,
  durationMinutes: 120,
  creationMode: 'Hybrid' as CreationMode,
  generalInstructions: 'All questions are compulsory unless internal choice is provided.',
});

interface CreatePaperWizardProps {
  open: boolean;
  mode: WizardMode;
  /** Existing paper for edit/review modes; also used to prefill a duplicate in create mode. */
  paper: QuestionPaperMetadata | null;
  onClose: () => void;
  /** Navigate the wizard to a specific step when opened (e.g. review mode → questions). */
  initialStep?: number;
  /** Called with the API response right after a paper is created in create mode. */
  onPaperCreated?: (created: QuestionPaperMetadata) => void;
}

export default function CreatePaperWizard({
  open,
  mode,
  paper,
  onClose,
  initialStep = 0,
  onPaperCreated,
}: CreatePaperWizardProps) {
  const dispatch = useDispatch();
  const { currentYear, currentMedium: medium } = useSelector(
    (state: RootState) => state.globalState
  );
  const academicYearId = currentYear?.id;
  const academicYearLabel =
    currentYear?.name || currentYear?.academicYearName || 'Current Academic Year';

  const [activeStep, setActiveStep] = useState(initialStep);
  const [maxReachedStep, setMaxReachedStep] = useState(initialStep);
  const [lastSavedLabel, setLastSavedLabel] = useState<string | null>(null);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [isSavingAndExiting, setIsSavingAndExiting] = useState(false);
  const [paperTitleValidationAttempted, setPaperTitleValidationAttempted] = useState(false);

  // ── Formik for Step 1 ────────────────────────────────────────────────
  const formik = useFormik<PaperDetailsFormValues>({
    initialValues: initialDetailsValues(academicYearId),
    validationSchema: paperValidationSchema,
    onSubmit: () => {},
  });

  // Prefill from existing paper (edit / review / duplicate)
  useEffect(() => {
    if (!open) return;
    setPaperTitleValidationAttempted(false);
    if (paper) {
      formik.resetForm({
        values: {
          academicYearId: paper.academicYearId || academicYearId || '',
          paperTitle: mode === 'create' ? `${paper.paperTitle} (Copy)` : paper.paperTitle,
          standardId: paper.standardId,
          subjectId: paper.subjectId,
          examId: paper.examId || '',
          totalMarks: paper.totalMarks,
          durationMinutes: paper.durationMinutes,
          creationMode: paper.creationMode,
          generalInstructions: paper.generalInstructions || '',
        },
      });
    } else {
      formik.resetForm({ values: initialDetailsValues(academicYearId) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, paper?.id, mode]);

  // ── Blueprint state (Step 2) ─────────────────────────────────────────
  const [blueprintRules, setBlueprintRules] = useState<
    Record<string, { marks: number; count: number }>
  >({});
  const [difficultyDist, setDifficultyDist] =
    useState<Record<number, number>>(DEFAULT_DIFFICULTY_DIST);
  const [bloomDist, setBloomDist] = useState<Record<number, number>>(DEFAULT_BLOOM_DIST);
  const [paperRules, setPaperRules] = useState<PaperRulesState>({
    internalChoice: true,
    negativeMarking: false,
    randomizeQuestions: false,
    autoNumbering: true,
    preventDuplicates: true,
    enforceSectionOrder: true,
  });

  // ── Paper pattern sections (Step 2/3) ────────────────────────────────
  const [sections, setSections] = useState<SectionPattern[]>([]);
  const [questionLibraryFilters, setQuestionLibraryFilters] =
    useState<QuestionLibraryFilters>(DEFAULT_LIBRARY_FILTERS);

  const selectedPaperId = mode === 'create' ? null : paper?.id || null;
  const isReadOnly =
    mode !== 'create' && Boolean(paper && READONLY_STATUSES.includes(paper.status));
  const isReviewMode = mode === 'review' || (mode !== 'create' && paper?.status === 3);

  const { data: paperDetails, refetch: refetchPaperDetails } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetQuestionPaperByIdQuery,
    params: { id: selectedPaperId },
    options: { skip: !selectedPaperId || !open },
    popupConfig: { error: false },
  });

  // Reset step position and pattern state on each fresh open of the wizard.
  // A create → edit transition after the first save must NOT reset the step.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      const startStep = mode === 'create' ? 0 : Math.min(initialStep, mode === 'edit' ? 1 : 0);
      setActiveStep(startStep);
      setMaxReachedStep(startStep);
      setQuestionLibraryFilters(DEFAULT_LIBRARY_FILTERS);
      if (mode === 'create' && !paper) {
        setSections([]);
        setBlueprintRules({});
        setDifficultyDist(DEFAULT_DIFFICULTY_DIST);
        setBloomDist(DEFAULT_BLOOM_DIST);
      }
    }
    wasOpenRef.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Server data ──────────────────────────────────────────────────────
  const { data: blueprint } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBlueprintQuery,
    params: { paperId: selectedPaperId },
    options: { skip: !selectedPaperId || !open },
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

  // Populate sections from the paper when it loads
  useEffect(() => {
    if (!open || mode === 'create') return;
    // Table rows are summaries and can omit questions. Hydrate editing state only
    // from the detailed paper endpoint so saved questions are not overwritten.
    const persistedPaper = paperDetails?.data || paperDetails;
    if (!persistedPaper) return;
    const persistedSections = getPaperSections(persistedPaper);
    const persistedQuestions = persistedPaper?.questions || persistedPaper?.data?.questions || [];
    if (persistedSections.length) {
      const questionsBySection = new Map<string, QuestionItem[]>();
      persistedQuestions.forEach((q: any, i: number) => {
        const key = toSectionKey(getQuestionSectionId(q)) || '__default__';
        const mapped: QuestionItem = {
          id: q.id || `pq-${i}`,
          questionNumber: q.questionNumber || i + 1,
          questionText: q.questionText || 'Question Item',
          marks: q.marks || 1,
          chapterId: q.chapterId,
          chapterName: q.chapterName || 'General',
          difficultyLevel: q.difficultyLevel || 2,
          bloomLevel: q.bloomLevel || 2,
          questionType: q.questionType || 1,
          learningOutcome: q.learningOutcome,
          isLocked: false,
          questionBankItemId: q.questionBankItemId,
        };
        const list = questionsBySection.get(key) || [];
        list.push(mapped);
        questionsBySection.set(key, list);
      });

      setSections((currentSections) =>
        persistedSections.map((sec: any, idx: number) => {
          const previous = currentSections.find((section) => section.id === sec.id);
          const sectionKey = toSectionKey(sec.id);
          const sectionQuestions =
            (sectionKey ? questionsBySection.get(sectionKey) : undefined) ||
            (idx === 0 ? questionsBySection.get('__default__') || [] : []);
          return {
            id: sec.id || `sec-${idx + 1}`,
            sectionName: sec.sectionName || `Section ${String.fromCharCode(65 + idx)}`,
            instructions: sec.instructions || '',
            marks: sec.marks || 0,
            sortOrder: sec.sortOrder || idx + 1,
            questions: sectionQuestions,
            questionType:
              sec.questionType ?? previous?.questionType ?? sectionQuestions[0]?.questionType,
            questionCount: sec.questionCount ?? previous?.questionCount ?? sectionQuestions.length,
            marksPerQuestion:
              sec.marksPerQuestion ?? previous?.marksPerQuestion ?? sectionQuestions[0]?.marks,
          };
        })
      );
    } else if (persistedQuestions.length) {
      setSections([
        {
          id: 'sec-1',
          sectionName: 'Section A',
          instructions: persistedPaper.generalInstructions || '',
          marks: persistedPaper.totalMarks,
          sortOrder: 1,
          questions: persistedQuestions.map((q: any, i: number) => ({
            id: q.id || `pq-${i}`,
            questionNumber: q.questionNumber || i + 1,
            questionText: q.questionText || 'Question Item',
            marks: q.marks || 1,
            chapterId: q.chapterId,
            chapterName: q.chapterName || 'General',
            difficultyLevel: q.difficultyLevel || 2,
            bloomLevel: q.bloomLevel || 2,
            questionType: q.questionType || 1,
            isLocked: false,
            questionBankItemId: q.questionBankItemId,
          })),
        },
      ]);
    }
  }, [open, paper, paperDetails, mode]);

  // Classes, subjects, chapters, exams
  const allClass = useMemo(
    () => medium?.educationMediumStages?.flatMap((s: any) => s.standards || []) || [],
    [medium]
  );
  const classOptions = useMemo(
    () => allClass.map((c: any) => ({ value: c.id, label: c.name })),
    [allClass]
  );

  const {
    data: formSubjectData,
    isLoading: isSubjectLoading,
    isFetching: isSubjectFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { standardId: formik.values.standardId },
    options: { skip: !formik.values.standardId || !open },
  });
  const subjectOptions = useMemo(() => buildSubjectOptions(formSubjectData), [formSubjectData]);

  const chaptersParams =
    mode === 'create'
      ? { standardId: formik.values.standardId, subjectId: formik.values.subjectId }
      : { standardId: paper?.standardId, subjectId: paper?.subjectId };
  const { data: chaptersData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChaptersByStandardQuery,
    params: chaptersParams,
    options: { skip: !chaptersParams.standardId || !chaptersParams.subjectId || !open },
  });
  const chapters = useMemo(() => chaptersData || [], [chaptersData]);

  const examLookupParams = useMemo(
    () => ({
      academicYearId,
      standardId: formik.values.standardId,
      subjectId: formik.values.subjectId,
    }),
    [academicYearId, formik.values.standardId, formik.values.subjectId]
  );
  const {
    data: examLookupData,
    isLoading: isExamLoading,
    isFetching: isExamFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetQuestionPaperExamLookupQuery,
    params: examLookupParams,
    options: {
      skip: !academicYearId || !formik.values.standardId || !formik.values.subjectId || !open,
    },
  });
  const examOptions = useMemo(() => {
    const raw: any[] =
      examLookupData?.items ||
      examLookupData?.data ||
      (Array.isArray(examLookupData) ? examLookupData : []);
    return raw
      .map((e: any) => ({
        value: e.id || e.examId,
        label: e.examName || e.title || e.name || 'Exam',
      }))
      .filter((o) => o.value);
  }, [examLookupData]);

  // Question bank (only when wizard is on the builder step and paper context exists)
  const bankStandardId = mode === 'create' ? formik.values.standardId : paper?.standardId;
  const bankSubjectId = mode === 'create' ? formik.values.subjectId : paper?.subjectId;
  const bankQueryParams = useMemo(
    () => ({
      academicYearId,
      standardId: bankStandardId,
      subjectId: bankSubjectId,
      status: 3,
      pageSize: 100,
      ...(questionLibraryFilters.chapterId ? { chapterId: questionLibraryFilters.chapterId } : {}),
      ...(questionLibraryFilters.difficultyLevel
        ? { difficultyLevel: questionLibraryFilters.difficultyLevel }
        : {}),
      ...(questionLibraryFilters.bloomLevel
        ? { bloomLevel: questionLibraryFilters.bloomLevel }
        : {}),
      ...(questionLibraryFilters.keyword.trim()
        ? { keyword: questionLibraryFilters.keyword.trim() }
        : {}),
    }),
    [academicYearId, bankStandardId, bankSubjectId, questionLibraryFilters]
  );
  const {
    data: bankQuestionsData,
    isLoading: bankLoading,
    isFetching: bankFetching,
    isError: bankError,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetQuestionsQuery,
    params: bankQueryParams,
    options: { skip: !bankStandardId || !bankSubjectId || !open },
    popupConfig: { error: false },
  });
  const bankQuestions: QuestionItem[] = useMemo(
    () =>
      (bankQuestionsData?.items || []).map((q: any) => ({
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
      })),
    [bankQuestionsData]
  );

  // Preview (Step 5)
  const { data: preview, isLoading: previewLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPaperPreviewQuery,
    params: { paperId: selectedPaperId },
    options: { skip: !selectedPaperId || !open || activeStep !== 4 },
  });

  // ── Mutations ────────────────────────────────────────────────────────
  const [createPaper, createState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateQuestionPaperMutation,
    popupConfig: { error: false },
  });
  const [updatePaper, updateState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateQuestionPaperMutation,
    popupConfig: { error: false },
  });
  const [saveBlueprint, blueprintState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSaveBlueprintMutation,
    popupConfig: { error: false },
  });
  const [addQuestionToPaper, addQuestionState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddQuestionToPaperMutation,
  });
  const [removeQuestionFromPaper] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRemoveQuestionFromPaperMutation,
  });
  const [submitPaper, submitState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSubmitQuestionPaperMutation,
  });
  const [approvePaper, approveState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveQuestionPaperMutation,
  });
  const [rejectPaper, rejectState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectQuestionPaperMutation,
  });
  const [publishPaper, publishState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePublishQuestionPaperMutation,
  });

  const markSaved = () => setLastSavedLabel('just now');

  // ── Derived validation ───────────────────────────────────────────────
  const totalMarks = isReadOnly
    ? paper?.totalMarks || Number(formik.values.totalMarks) || 0
    : Number(formik.values.totalMarks) || paper?.totalMarks || 0;
  const durationMinutes = isReadOnly
    ? paper?.durationMinutes || Number(formik.values.durationMinutes) || 0
    : Number(formik.values.durationMinutes) || paper?.durationMinutes || 0;

  const chapterMarksSum = Object.values(blueprintRules).reduce((sum, r) => sum + (r.marks || 0), 0);
  const difficultySum = Object.values(difficultyDist).reduce((s, v) => s + v, 0);
  const bloomSum = Object.values(bloomDist).reduce((s, v) => s + v, 0);

  const validationIssues: ValidationIssue[] = useMemo(() => {
    const issues: ValidationIssue[] = [];
    if (Object.keys(blueprintRules).length === 0) return issues;

    if (Math.abs(chapterMarksSum - totalMarks) >= 0.01) {
      issues.push({
        id: 'v-1',
        type: 'error',
        title: 'Chapter Marks Mismatch',
        description: `Chapter marks total (${chapterMarksSum}) must equal paper total (${totalMarks}M).`,
        sectionTarget: 'chapters',
      });
    }
    if (Math.abs(difficultySum - 100) >= 0.01) {
      issues.push({
        id: 'v-2',
        type: 'error',
        title: 'Difficulty Percentage Imbalance',
        description: `Difficulty distribution totals ${difficultySum}%. Must equal 100%.`,
        sectionTarget: 'difficulty',
      });
    }
    if (Math.abs(bloomSum - 100) >= 0.01) {
      issues.push({
        id: 'v-3',
        type: 'error',
        title: 'Bloom Taxonomy Imbalance',
        description: `Bloom cognitive depth totals ${bloomSum}%. Must equal 100%.`,
        sectionTarget: 'bloom',
      });
    }
    return issues;
  }, [blueprintRules, chapterMarksSum, difficultySum, bloomSum, totalMarks]);

  const checkResults = useMemo(
    () =>
      buildCheckResults({
        sections,
        totalMarks,
        durationMinutes,
        blueprintRules,
        difficultyDist,
        bloomDist,
      }),
    [sections, totalMarks, durationMinutes, blueprintRules, difficultyDist, bloomDist]
  );
  const blockingCount = checkResults.reduce(
    (n, cat) => n + cat.items.filter((i) => i.severity === 'error').length,
    0
  );
  const warningCount = checkResults.reduce(
    (n, cat) => n + cat.items.filter((i) => i.severity === 'warning').length,
    0
  );

  // AI suggestions derived from gaps (spec §21, §45 — recommendations only)
  const aiSuggestions: AISuggestion[] = useMemo(() => {
    const suggestions: AISuggestion[] = [];
    const chapterAgg = new Map<string, { name: string; marks: number }>();
    sections.forEach((sec) =>
      (sec.questions || []).forEach((q) => {
        const key = q.chapterId || 'general';
        const entry = chapterAgg.get(key) || { name: q.chapterName || 'General', marks: 0 };
        entry.marks += q.marks || 0;
        chapterAgg.set(key, entry);
      })
    );
    Object.entries(blueprintRules).forEach(([chapterId, rule]) => {
      const current = chapterAgg.get(chapterId)?.marks || 0;
      if (rule.marks > current + 0.01) {
        const chapter = chapters.find((c: any) => c.id === chapterId);
        suggestions.push({
          id: `ai-ch-${chapterId}`,
          type: 'gap',
          title: `${chapter?.chapterName || 'Chapter'} coverage is below target`,
          description: `Target ${rule.marks} marks, currently ${current}. Recommended: add questions from this chapter.`,
          actionText: 'View Suggested Questions',
          payload: { chapterId },
        });
      }
    });
    return suggestions;
  }, [sections, blueprintRules, chapters]);

  // ── Step navigation ──────────────────────────────────────────────────
  const goToStep = (step: number) => {
    const clamped = Math.max(0, Math.min(WIZARD_STEPS.length - 1, step));
    setActiveStep(clamped);
    setMaxReachedStep((prev) => Math.max(prev, clamped));
  };

  const handleBack = () => goToStep(Math.max(0, activeStep - 1));

  const handleStep0Continue = async (exitAfterSave = false): Promise<boolean> => {
    setLastSavedLabel(null);
    setPaperTitleValidationAttempted(true);
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched(
        Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
        true
      );
      return false;
    }

    if (mode === 'create') {
      try {
        const created = await createPaper({
          ...formik.values,
          status: 1,
          examId: formik.values.examId || null,
          examScheduleId: null,
          totalMarks: Number(formik.values.totalMarks),
          durationMinutes: Number(formik.values.durationMinutes),
          sections: [
            {
              sectionName: 'Section A',
              instructions: '',
              marks: Number(formik.values.totalMarks),
              sortOrder: 1,
              questionType: 1,
              questionCount: 5,
              marksPerQuestion: Math.max(1, Number(formik.values.totalMarks) / 5),
            },
          ],
        }).unwrap();
        markSaved();
        shikshaMitraToast.success({ message: 'Paper created. Continue with the paper pattern.' });
        // Keep the initial pattern metadata available even when the create response
        // does not echo section-level planning fields.
        const createdSection = created?.sections?.[0];
        setSections([
          {
            id: createdSection?.id || 'sec-1',
            sectionName: createdSection?.sectionName || 'Section A',
            instructions: createdSection?.instructions || '',
            marks: createdSection?.marks ?? Number(formik.values.totalMarks),
            sortOrder: createdSection?.sortOrder || 1,
            questionType: createdSection?.questionType ?? 1,
            questionCount: createdSection?.questionCount ?? 5,
            marksPerQuestion:
              createdSection?.marksPerQuestion ?? Math.max(1, Number(formik.values.totalMarks) / 5),
            questions: [],
          },
        ]);
        // Switch the wizard into edit mode so later steps sync with the server.
        if (created?.id) {
          onPaperCreated?.(created as QuestionPaperMetadata);
        }
        if (exitAfterSave) {
          onClose();
        } else {
          goToStep(1);
        }
      } catch (err: any) {
        shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to create paper.' });
        return false;
      }
      return true;
    }

    // Edit mode — persist details changes
    if (paper && selectedPaperId) {
      try {
        const sectionsToPreserve =
          sections.length > 0 ? sections : (getPaperSections(paper) as SectionPattern[]);
        await updatePaper({
          id: selectedPaperId,
          body: {
            ...formik.values,
            examId: formik.values.examId || null,
            totalMarks: Number(formik.values.totalMarks),
            durationMinutes: Number(formik.values.durationMinutes),
            ...(sectionsToPreserve.length
              ? { sections: toSectionsPayload(sectionsToPreserve) }
              : {}),
          },
        }).unwrap();
        markSaved();
        if (exitAfterSave) {
          onClose();
        } else {
          goToStep(1);
        }
      } catch (err: any) {
        shikshaMitraToast.error({
          message: err?.data?.detail || 'Failed to update paper details.',
        });
        return false;
      }
    } else if (exitAfterSave) {
        onClose();
      } else {
        goToStep(1);
      }
    return true;
  };

  const handleStep1Continue = async (exitAfterSave = false): Promise<boolean> => {
    setLastSavedLabel(null);
    // Persist pattern + advanced rules
    if (selectedPaperId) {
      const sectionsPayload = toSectionsPayload(sections);
      const saveResults = await Promise.allSettled([
        // Send the full known body so a replace-style PUT does not drop fields.
        updatePaper({
          id: selectedPaperId,
          body: {
            ...formik.values,
            examId: formik.values.examId || null,
            totalMarks: Number(formik.values.totalMarks),
            durationMinutes: Number(formik.values.durationMinutes),
            sections: sectionsPayload,
          },
        }).unwrap(),
        saveBlueprint({
          paperId: selectedPaperId,
          body: {
            questionPaperId: selectedPaperId,
            totalMarks,
            chapterRules: Object.entries(blueprintRules)
              .map(([chapterId, data]) => ({
                chapterId,
                marks: Number(data.marks || 0),
                numberOfQuestions: data.count ? Number(data.count) : null,
              }))
              .filter((r) => r.marks > 0),
            difficultyRules: DIFFICULTY_OPTIONS.map((d) => ({
              difficultyLevel: d.value,
              percentage: difficultyDist[d.value] || 0,
            })),
            bloomRules: BLOOM_OPTIONS.map((b) => ({
              bloomLevel: b.value,
              percentage: bloomDist[b.value] || 0,
            })),
          },
        }).unwrap(),
      ]);

      const updateResult = saveResults[0];
      if (updateResult.status === 'fulfilled') {
        const savedSections = getPaperSections(updateResult.value);
        if (savedSections.length === sections.length) {
          setSections((current) =>
            current.map((section, index) => ({
              ...section,
              id: savedSections[index].id || section.id,
            }))
          );
        }
      }

      const failedSaveCount = saveResults.filter((result) => result.status === 'rejected').length;
      if (failedSaveCount > 0) {
        shikshaMitraToast.error({
          message: 'Pattern could not be saved. Fix the error and try again.',
        });
        return false;
      }
      markSaved();
    }

    if (exitAfterSave) {
      onClose();
    } else {
      goToStep(2);
    }
    return true;
  };

  const handleStep2Continue = () => goToStep(3);
  const handleStep3Continue = () => goToStep(4);

  const handleSaveAndExit = async () => {
    if (isReadOnly) {
      onClose();
      return;
    }

    setIsSavingAndExiting(true);
    try {
      if (activeStep === 0) {
        await handleStep0Continue(true);
      } else if (activeStep === 1 || activeStep === 2) {
        await handleStep1Continue(true);
      } else {
        onClose();
      }
    } finally {
      setIsSavingAndExiting(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPaperId || isReadOnly) return;
    if (blockingCount > 0) {
      shikshaMitraToast.error({
        message: 'Fix all blocking validation issues before submitting the paper.',
      });
      return;
    }
    try {
      await refetchPaperDetails().unwrap();
      await submitPaper({ id: selectedPaperId }).unwrap();
      shikshaMitraToast.success({ message: 'Paper submitted for review.' });
      dispatch(setIsChanges(false));
      onClose();
    } catch (err: any) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(err, 'Failed to submit paper.'),
      });
    }
  };

  // ── Question handlers (Step 3) ───────────────────────────────────────
  const currentTotalQuestions = sections.reduce((s, sec) => s + (sec.questions?.length || 0), 0);

  const handleAddQuestions = async (bankQuestionsToAdd: QuestionItem[], sectionId: string) => {
    if (!selectedPaperId) return;
    const targetSection = sections.find((section) => section.id === sectionId) || sections[0];
    if (!targetSection) return;

    const existingIds = new Set(
      sections.flatMap((section) =>
        (section.questions || []).map((question) => question.questionBankItemId || question.id)
      )
    );
    const questionsToAdd = bankQuestionsToAdd.filter(
      (question) => !existingIds.has(question.questionBankItemId || question.id)
    );
    if (questionsToAdd.length === 0) return;

    const optimisticQuestions = questionsToAdd.map((question, index) => ({
      ...question,
      id: `q-batch-${Date.now()}-${index}`,
      questionNumber: (targetSection.questions?.length || 0) + index + 1,
    }));
    setSections((previous) =>
      previous.map((section) =>
        section.id === targetSection.id
          ? { ...section, questions: [...(section.questions || []), ...optimisticQuestions] }
          : section
      )
    );
    dispatch(setIsChanges(true));

    const results: PromiseSettledResult<unknown>[] = [];
    for (let index = 0; index < questionsToAdd.length; index += 1) {
      const question = questionsToAdd[index];
      try {
        // Preserve deterministic question numbering for the order-sensitive paper API.
        // eslint-disable-next-line no-await-in-loop
        const response = await addQuestionToPaper({
          paperId: selectedPaperId,
          body: {
            questionPaperSectionId: targetSection.id,
            questionBankItemId: question.questionBankItemId || question.id,
            questionNumber: currentTotalQuestions + index + 1,
            marks: question.marks,
            sortOrder: currentTotalQuestions + index + 1,
          },
        }).unwrap();
        results.push({ status: 'fulfilled', value: response });
      } catch (reason) {
        results.push({ status: 'rejected', reason });
      }
    }
    const failedIndexes = new Set(
      results.flatMap((result, index) => (result.status === 'rejected' ? [index] : []))
    );
    const failedOptimisticIds = new Set(
      optimisticQuestions
        .filter((_, index) => failedIndexes.has(index))
        .map((question) => question.id)
    );

    setSections((previous) =>
      previous.map((section) => {
        if (section.id !== targetSection.id) return section;
        return {
          ...section,
          questions: (section.questions || [])
            .filter((question) => !failedOptimisticIds.has(question.id))
            .map((question) => {
              const optimisticIndex = optimisticQuestions.findIndex(
                (item) => item.id === question.id
              );
              if (optimisticIndex < 0 || failedIndexes.has(optimisticIndex)) return question;
              const result = results[optimisticIndex];
              if (result.status !== 'fulfilled') return question;
              const response = result.value as any;
              const savedId =
                response?.id ||
                response?.paperQuestionId ||
                response?.data?.id ||
                response?.data?.paperQuestionId;
              return savedId ? { ...question, id: savedId } : question;
            }),
        };
      })
    );

    if (failedIndexes.size > 0) {
      shikshaMitraToast.warning({
        message: `${questionsToAdd.length - failedIndexes.size} question(s) added; ${failedIndexes.size} failed.`,
      });
    } else {
      shikshaMitraToast.success({
        message: `${questionsToAdd.length} question(s) added to ${targetSection.sectionName}.`,
      });
      dispatch(setIsChanges(false));
      markSaved();
    }
  };

  const handleAddQuestion = async (bankQuestion: QuestionItem, sectionId: string) => {
    if (!selectedPaperId) return;
    const targetSection = sections.find((s) => s.id === sectionId) || sections[0];
    if (!targetSection) return;

    const previousSections = sections;
    const optimisticQuestionId = `q-${Date.now()}`;

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== targetSection.id) return sec;
        const newQuestion: QuestionItem = {
          ...bankQuestion,
          id: optimisticQuestionId,
          questionNumber: (sec.questions?.length || 0) + 1,
        };
        return { ...sec, questions: [...(sec.questions || []), newQuestion] };
      })
    );
    dispatch(setIsChanges(true));

    try {
      const savedQuestion = (await addQuestionToPaper({
        paperId: selectedPaperId,
        body: {
          questionPaperSectionId: targetSection.id,
          questionBankItemId: bankQuestion.questionBankItemId || bankQuestion.id,
          questionNumber: currentTotalQuestions + 1,
          marks: bankQuestion.marks,
          sortOrder: currentTotalQuestions + 1,
        },
      }).unwrap()) as any;
      const savedQuestionId =
        savedQuestion?.id ||
        savedQuestion?.paperQuestionId ||
        savedQuestion?.data?.id ||
        savedQuestion?.data?.paperQuestionId;
      if (savedQuestionId) {
        setSections((prev) =>
          prev.map((section) => ({
            ...section,
            questions: (section.questions || []).map((question) =>
              question.id === optimisticQuestionId ? { ...question, id: savedQuestionId } : question
            ),
          }))
        );
      }
      shikshaMitraToast.success({ message: `✓ Question added to ${targetSection.sectionName}` });
      dispatch(setIsChanges(false));
      markSaved();
    } catch (err: any) {
      setSections(previousSections);
      shikshaMitraToast.error({
        message: err?.data?.detail || 'Failed to add question to the paper.',
      });
    }
  };

  const handleRemoveQuestion = async (paperQuestionId: string) => {
    const previousSections = sections;
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        questions: (sec.questions || []).filter((q) => q.id !== paperQuestionId),
      }))
    );
    const isTemporaryQuestionId = /^(q-|pq-)/.test(paperQuestionId);
    if (selectedPaperId && !isTemporaryQuestionId) {
      try {
        await removeQuestionFromPaper({ paperId: selectedPaperId, paperQuestionId }).unwrap();
        shikshaMitraToast.success({ message: 'Question removed from paper.' });
      } catch {
        // Fallback silently — matches existing behavior.
      }
    } else if (isTemporaryQuestionId) {
      shikshaMitraToast.success({ message: 'Question removed from paper.' });
    }
  };

  const handleMoveQuestion = (qId: string, direction: 'up' | 'down') => {
    setSections((prev) =>
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

  const handleMoveQuestionToSection = (qId: string, targetSectionId: string) => {
    setSections((prev) => {
      let moved: QuestionItem | null = null;
      const stripped = prev.map((sec) => {
        const found = (sec.questions || []).find((q) => q.id === qId);
        if (!found) return sec;
        moved = found;
        return { ...sec, questions: (sec.questions || []).filter((q) => q.id !== qId) };
      });
      if (!moved) return prev;
      return stripped.map((sec) =>
        sec.id === targetSectionId
          ? { ...sec, questions: [...(sec.questions || []), moved as QuestionItem] }
          : sec
      );
    });
    shikshaMitraToast.success({ message: 'Question moved.' });
  };

  const handleDuplicateQuestion = (q: QuestionItem) => {
    setSections((prev) => {
      const targetIdx = prev.findIndex((sec) => (sec.questions || []).some((x) => x.id === q.id));
      if (targetIdx < 0) return prev;
      return prev.map((sec, idx) => {
        if (idx !== targetIdx) return sec;
        const dup: QuestionItem = {
          ...q,
          id: `q-dup-${Date.now()}`,
          questionNumber: (sec.questions?.length || 0) + 1,
        };
        return { ...sec, questions: [...(sec.questions || []), dup] };
      });
    });
    shikshaMitraToast.success({ message: 'Question duplicated.' });
  };

  const handleReplaceQuestion = async (oldQuestionId: string, newQuestion: QuestionItem) => {
    await handleRemoveQuestion(oldQuestionId);
    const sectionId =
      sections.find((sec) => (sec.questions || []).some((q) => q.id === oldQuestionId))?.id ||
      sections[0]?.id ||
      '';
    await handleAddQuestion(newQuestion, sectionId);
    shikshaMitraToast.success({ message: 'Question replaced.' });
  };

  // ── Review actions ───────────────────────────────────────────────────
  const handleApprove = async (done: () => void) => {
    if (!selectedPaperId) return;
    try {
      await approvePaper({ id: selectedPaperId }).unwrap();
      shikshaMitraToast.success({ message: 'Paper approved.' });
      done();
      onClose();
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to approve paper.' });
    }
  };

  const handleReject = async (feedback: string, done: () => void) => {
    if (!selectedPaperId) return;
    try {
      await rejectPaper({ id: selectedPaperId, body: { feedback } }).unwrap();
      shikshaMitraToast.success({ message: 'Paper rejected with feedback.' });
      done();
      onClose();
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to reject paper.' });
    }
  };

  const handlePublish = async (done: () => void) => {
    if (!selectedPaperId) return;
    try {
      await publishPaper({ id: selectedPaperId }).unwrap();
      shikshaMitraToast.success({ message: 'Paper published.' });
      done();
      onClose();
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to publish paper.' });
    }
  };

  // ── Stepper metadata ─────────────────────────────────────────────────
  const marksAllocated = sections.reduce(
    (s, sec) => s + (sec.questions || []).reduce((qs, q) => qs + (q.marks || 0), 0),
    0
  );
  const completedSteps = [activeStep > 0, activeStep > 1, activeStep > 2, activeStep > 3, false];

  const stepContent = () => {
    if (isReviewMode && activeStep === 0) {
      return (
        <ReviewApprovalPanel
          paper={paper as QuestionPaperMetadata}
          sections={sections}
          checkResults={checkResults}
          onApprove={handleApprove}
          onReject={handleReject}
          onPublish={handlePublish}
          isApproving={approveState.isLoading}
          isRejecting={rejectState.isLoading}
          isPublishing={publishState.isLoading}
          onPreview={() => goToStep(4)}
          onViewQuestions={() => goToStep(2)}
        />
      );
    }

    switch (activeStep) {
      case 0:
        return (
          <StepPaperDetails
            formik={formik}
            classOptions={classOptions}
            subjectOptions={subjectOptions}
            examOptions={examOptions}
            isSubjectLoading={isSubjectLoading || isSubjectFetching}
            isExamLoading={isExamLoading || isExamFetching}
            academicYearLabel={academicYearLabel}
            readOnly={mode !== 'create' && isReadOnly}
            paperTitleValidationAttempted={paperTitleValidationAttempted}
          />
        );
      case 1:
        return (
          <StepPaperPattern
            totalMarks={totalMarks}
            sections={sections}
            onSectionsChange={setSections}
            chapters={chapters as any}
            blueprintRules={blueprintRules}
            onUpdateChapterRule={(chapId, marks, count) =>
              setBlueprintRules((prev) => ({ ...prev, [chapId]: { marks, count } }))
            }
            difficultyDist={difficultyDist}
            onUpdateDifficulty={(lvl, pct) =>
              setDifficultyDist((prev) => ({ ...prev, [lvl]: pct }))
            }
            bloomDist={bloomDist}
            onUpdateBloom={(lvl, pct) => setBloomDist((prev) => ({ ...prev, [lvl]: pct }))}
            paperRules={paperRules}
            onUpdatePaperRule={(key, val) => setPaperRules((prev) => ({ ...prev, [key]: val }))}
            validationIssues={validationIssues}
            readOnly={isReadOnly}
          />
        );
      case 2:
        return (
          <StepAddQuestions
            sections={sections}
            totalMarks={totalMarks}
            bankQuestions={bankQuestions}
            bankAvailableCount={bankQuestionsData?.totalCount ?? bankQuestions.length}
            bankLoading={bankLoading || bankFetching}
            bankError={bankError}
            chapters={chapters as any}
            libraryFilters={questionLibraryFilters}
            onLibraryFiltersChange={setQuestionLibraryFilters}
            onAddQuestion={handleAddQuestion}
            onAddQuestions={(questions, sectionId) => handleAddQuestions(questions, sectionId)}
            onRemoveQuestion={handleRemoveQuestion}
            onMoveQuestion={handleMoveQuestion}
            onMoveQuestionToSection={handleMoveQuestionToSection}
            onDuplicateQuestion={handleDuplicateQuestion}
            onReplaceQuestion={handleReplaceQuestion}
            onSaveDraft={handleStep1Continue}
            isSavingDraft={updateState.isLoading || blueprintState.isLoading}
            isAddingQuestions={addQuestionState.isLoading}
            readOnly={isReadOnly}
          />
        );
      case 3:
        return (
          <StepPreview
            paper={paper}
            sections={sections}
            printHtml={preview?.printHtml}
            isLoading={previewLoading}
          />
        );
      case 4:
        return (
          <StepReviewAndSubmit
            paper={paper}
            results={checkResults}
            summary={[
              { label: 'Paper Details', ok: true },
              {
                label: 'Paper Pattern',
                ok: sections.length > 0,
                detail: sections.length === 0 ? 'no sections' : undefined,
              },
              {
                label: 'Questions',
                ok: currentTotalQuestions > 0,
                detail: currentTotalQuestions === 0 ? 'no questions added' : undefined,
              },
              {
                label: 'Marks',
                ok: Math.abs(marksAllocated - totalMarks) < 0.01,
                detail: `${marksAllocated} / ${totalMarks}`,
              },
              {
                label: 'Validation',
                ok: blockingCount === 0,
                detail: `${blockingCount} blocking issues`,
              },
              { label: 'Preview', ok: true },
            ]}
            blockingCount={blockingCount}
            warningCount={warningCount}
            onSubmit={handleSubmit}
            onPreview={() => goToStep(3)}
            onGoToStep={goToStep}
            isSubmitting={submitState.isLoading}
            readOnly={isReadOnly}
          />
        );
      default:
        return null;
    }
  };

  const primaryAction = () => {
    if (isReviewMode && activeStep === 0) return null;
    switch (activeStep) {
      case 0:
        return (
          <LoadingButton
            size="small"
            variant="contained"
            loading={createState.isLoading || updateState.isLoading}
            onClick={() => handleStep0Continue()}
            endIcon={<Iconify icon="mdi:arrow-right" width={18} />}
          >
            Continue to Paper Pattern
          </LoadingButton>
        );
      case 1:
        return (
          <LoadingButton
            size="small"
            variant="contained"
            loading={updateState.isLoading || blueprintState.isLoading}
            onClick={() => handleStep1Continue()}
            endIcon={<Iconify icon="mdi:arrow-right" width={18} />}
          >
            Continue to Add Questions
          </LoadingButton>
        );
      case 2:
        return (
          <Button
            size="small"
            variant="contained"
            onClick={handleStep2Continue}
            endIcon={<Iconify icon="mdi:arrow-right" width={18} />}
          >
            Continue
          </Button>
        );
      case 3:
        return (
          <Button
            size="small"
            variant="contained"
            onClick={handleStep3Continue}
            endIcon={<Iconify icon="mdi:arrow-right" width={18} />}
          >
            Continue to Review &amp; Submit
          </Button>
        );
      case 4:
        if (isReadOnly) return null;
        return (
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Button
              size="small"
              variant="outlined"
              onClick={() => goToStep(3)}
              startIcon={<Iconify icon="mdi:eye-outline" width={17} />}
            >
              Preview Paper
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              disabled={blockingCount > 0}
              loading={submitState.isLoading}
              onClick={handleSubmit}
              startIcon={<Iconify icon="mdi:send-outline" width={17} />}
            >
              Submit for Review
            </LoadingButton>
          </Stack>
        );
      default:
        return null;
    }
  };

  const targetQuestionCount = sections.reduce(
    (s, sec) => s + (sec.questionCount ?? sec.questions?.length ?? 0),
    0
  );
  const matchingAvailable = bankQuestionsData?.totalCount ?? bankQuestions.length;
  const insufficientQuestions = selectedPaperId != null && matchingAvailable < targetQuestionCount;

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      fullScreen
      maxWidth="lg"
      hasForm={false}
      title={
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {mode === 'create' ? 'Create Question Paper' : paper?.paperTitle || 'Question Paper'}
          </Typography>
          {paper && (
            <Label
              variant="soft"
              color={STATUS_COLOR[paper.status] || 'default'}
              sx={{ fontWeight: 700, height: 22 }}
            >
              {STATUS_LABEL[paper.status] || 'Draft'}
            </Label>
          )}
          {lastSavedLabel && (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 1 }}>
              <Iconify icon="mdi:check-circle-outline" width={13} color="success.main" />
              <Typography variant="caption" color="text.secondary">
                Saved {lastSavedLabel}
              </Typography>
            </Stack>
          )}
        </Stack>
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
        }}
      >
        {/* Stepper header */}
        <Box sx={{ flexShrink: 0, px: { xs: 1, md: 3 }, pt: 2 }}>
          <WizardStepper
            steps={[...WIZARD_STEPS]}
            activeStep={activeStep}
            completedSteps={completedSteps}
            maxReachedStep={maxReachedStep}
            onStepClick={goToStep}
          />
        </Box>

        {/* Step body */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            px: { xs: 1.5, md: 3 },
            py: 2,
            overflow: activeStep === 2 || activeStep === 4 ? 'hidden' : 'auto',
            bgcolor: 'background.default',
          }}
        >
          {activeStep === 4 ? (
            <Scrollbar sx={{ height: '100%', pr: 1 }}>{stepContent()}</Scrollbar>
          ) : (
            <>
              {/* Smart suggestions */}
              {activeStep === 2 && aiSuggestions.length > 0 && !isReadOnly && (
                <Alert
                  severity="info"
                  icon={<Iconify icon="mdi:auto-fix" width={18} />}
                  sx={{ mb: 1.5, borderRadius: 2, maxWidth: 1080, mx: 'auto', width: '100%' }}
                >
                  <Stack spacing={0.5}>
                    {aiSuggestions.slice(0, 2).map((s) => (
                      <Typography key={s.id} variant="caption">
                        <strong>{s.title}</strong> — {s.description}
                      </Typography>
                    ))}
                  </Stack>
                </Alert>
              )}
              {stepContent()}
            </>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            flexShrink: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            px: { xs: 1.5, md: 3 },
            py: 1.25,
            zIndex: 10,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {/* Left: optional step-2 assistance buttons */}
            <Stack direction="row" spacing={1} alignItems="center">
              {activeStep === 2 && !isReadOnly && aiSuggestions.length > 0 && (
                <LoadingButton
                  size="small"
                  variant="text"
                  color="primary"
                  onClick={() => setAiDrawerOpen(true)}
                  startIcon={<Iconify icon="mdi:auto-fix" width={16} />}
                >
                  Assistant ({aiSuggestions.length})
                </LoadingButton>
              )}
            </Stack>

            {/* Right: navigation + primary action */}
            <Stack direction="row" spacing={1.25} alignItems="center">
              {activeStep > 0 && !(isReviewMode && activeStep === 0) && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleBack}
                  startIcon={<Iconify icon="mdi:arrow-left" width={18} />}
                >
                  Back
                </Button>
              )}
              {activeStep === 0 && !isReadOnly && (
                <LoadingButton
                  size="small"
                  variant="outlined"
                  color="inherit"
                  loading={isSavingAndExiting}
                  onClick={handleSaveAndExit}
                  startIcon={<Iconify icon="mdi:content-save-outline" width={16} />}
                >
                  Save &amp; Exit
                </LoadingButton>
              )}
              {activeStep > 0 ? (
                <LoadingButton
                  size="small"
                  variant="outlined"
                  color="inherit"
                  loading={isSavingAndExiting}
                  onClick={handleSaveAndExit}
                  startIcon={<Iconify icon="mdi:content-save-outline" width={16} />}
                >
                  Save &amp; Exit
                </LoadingButton>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={onClose}
                  startIcon={<Iconify icon="mdi:close" width={16} />}
                >
                  Cancel
                </Button>
              )}
              {primaryAction()}
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* AI Assistant — recommendations only, never silent changes (spec §45) */}
      <AIAssistantDrawer
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        suggestions={aiSuggestions}
        onAcceptSuggestion={(suggestion) => {
          shikshaMitraToast.success({ message: `Accepted recommendation: ${suggestion.title}` });
          setAiDrawerOpen(false);
        }}
        onIgnoreSuggestion={() => setAiDrawerOpen(false)}
      />
    </CustomDialog>
  );
}

/* ── Stepper ────────────────────────────────────────────────────────── */
const WizardConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 12,
    left: 'calc(-50% + 14px)',
    right: 'calc(50% + 14px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: { borderColor: theme.palette.primary.main },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: { borderColor: theme.palette.primary.main },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.divider,
    borderTopWidth: 2,
    borderRadius: 1,
  },
}));

function WizardStepper({
  steps,
  activeStep,
  completedSteps,
  maxReachedStep,
  onStepClick,
}: {
  steps: string[];
  activeStep: number;
  completedSteps: boolean[];
  maxReachedStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <Stepper activeStep={activeStep} alternativeLabel connector={<WizardConnector />}>
      {steps.map((label, index) => {
        const reachable = index <= maxReachedStep;
        return (
          <Step
            key={label}
            completed={completedSteps[index]}
            sx={{ cursor: reachable ? 'pointer' : 'no-drop' }}
            onClick={() => reachable && onStepClick(index)}
          >
            <StepLabel
              sx={{
                '& .MuiStepLabel-label': {
                  fontSize: '0.75rem',
                  mt: '4px !important',
                  '&.Mui-active': { fontWeight: 700, color: 'primary.main' },
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
}

/* ── Generate confirmation dialog (spec §20) ────────────────────────── */
function GenerateConfirmDialog({
  open,
  totalMarks,
  requiredQuestions,
  availableQuestions,
  chapterCoverageOk,
  difficultyOk,
  isGenerating,
  insufficient,
  onGenerate,
  onCancel,
  onViewQuestionBank,
  onAdjustRules,
}: {
  open: boolean;
  totalMarks: number;
  requiredQuestions: number;
  availableQuestions: number;
  chapterCoverageOk: boolean;
  difficultyOk: boolean;
  isGenerating: boolean;
  insufficient: boolean;
  onGenerate: () => void;
  onCancel: () => void;
  onViewQuestionBank: () => void;
  onAdjustRules: () => void;
}) {
  return (
    <CustomDialog
      open={open}
      handleClose={onCancel}
      maxWidth="sm"
      hasForm={false}
      title={
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="mdi:sparkles" color="primary.main" width={20} />
          <Typography variant="h6" fontWeight={700}>
            Generate Question Paper
          </Typography>
        </Stack>
      }
    >
      <Stack spacing={2} sx={{ p: 2.5 }}>
        <Typography variant="body2" color="text.secondary">
          Based on your current pattern:
        </Typography>

        <Stack spacing={1}>
          <GenerateLine label="Total Marks" value={String(totalMarks)} />
          <GenerateLine label="Questions Required" value={String(requiredQuestions)} />
          <GenerateLine
            label="Chapter Coverage"
            value={chapterCoverageOk ? '✓ Balanced' : '⚠ Rules incomplete (optional)'}
            ok={chapterCoverageOk}
          />
          <GenerateLine
            label="Difficulty"
            value={difficultyOk ? '✓ Balanced' : '⚠ Totals ≠ 100% (optional)'}
            ok={difficultyOk}
          />
          <GenerateLine
            label="Matching Questions"
            value={`${availableQuestions} available`}
            ok={!insufficient}
          />
        </Stack>

        {insufficient && (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Not enough questions
            </Typography>
            <Typography variant="body2">
              You need {requiredQuestions} questions but only {availableQuestions} approved
              questions match this class and subject. Add more approved questions to the Question
              Bank or adjust your pattern.
            </Typography>
          </Alert>
        )}

        <Stack direction="row" spacing={1.25} justifyContent="flex-end">
          <Button variant="outlined" color="inherit" onClick={onCancel}>
            Cancel
          </Button>
          {insufficient && (
            <>
              <Button variant="outlined" onClick={onViewQuestionBank}>
                View Question Bank
              </Button>
              <Button variant="outlined" onClick={onAdjustRules}>
                Adjust Rules
              </Button>
            </>
          )}
          {!insufficient && (
            <LoadingButton variant="contained" loading={isGenerating} onClick={onGenerate}>
              Generate Paper
            </LoadingButton>
          )}
        </Stack>
      </Stack>
    </CustomDialog>
  );
}

function GenerateLine({ label, value, ok = true }: { label: string; value: string; ok?: boolean }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ borderBottom: '1px dashed', borderColor: 'divider', pb: 0.75 }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} color={ok ? 'text.primary' : 'warning.main'}>
        {value}
      </Typography>
    </Stack>
  );
}
