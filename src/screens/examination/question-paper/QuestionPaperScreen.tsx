'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { useReactToPrint } from 'react-to-print';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import React, { useRef, useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { academicPaths } from 'src/constants/academic-menu';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import {
  Box,
  Alert,
  Stack,
  Button,
  Select,
  Popover,
  MenuItem,
  Typography,
  InputLabel,
  FormControl,
  DialogActions,
} from '@mui/material';
import {
  useGetPaperPreviewQuery,
  useGetQuestionPapersQuery,
  useGetQuestionPaperByIdQuery,
  useDeleteQuestionPaperMutation,
  useArchiveQuestionPaperMutation,
  useGetQuestionPaperSettingsQuery,
  useGetQuestionPaperDashboardQuery,
  useSaveQuestionPaperSettingsMutation,
} from 'src/redux/academicAPI/ExaminationApi/QuestionPaperApi/question-paper-api';

import CreatePaperWizard from './components/CreatePaperWizard';
import { STATUS_LABEL, STATUS_COLOR, CREATION_MODE_OPTIONS } from './constants';
import QuestionPaperPreviewDrawer from './components/QuestionPaperPreviewDrawer';
import { useQuestionPaperPermissions } from './hooks/useQuestionPaperPermissions';

import type { WizardMode, SectionPattern, QuestionPaperMetadata } from './types';

interface RowAction {
  key: string;
  label: string;
  icon: string;
  color?: 'primary' | 'error' | 'warning' | 'success' | 'info' | 'inherit';
  disabled?: boolean;
  onClick: (row: any) => void;
}

const ALL_FILTER_VALUE = '__all__';

/** Status-based row actions (UX spec §5). */
type StatColor = 'primary' | 'success' | 'info' | 'warning' | 'error';

function PaperStatCard({
  label,
  value,
  icon,
  color,
  selected,
  onClick,
}: {
  label: string;
  value: number;
  icon: string;
  color: StatColor;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        flex: '1 1 180px',
        minWidth: { xs: 160, md: 0 },
        p: 1.5,
        border: '1px solid',
        borderColor: selected ? `${color}.main` : 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        color: 'text.primary',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: selected ? (theme) => `0 0 0 1px ${theme.palette[color].main}` : 'none',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: `${color}.main`, transform: 'translateY(-1px)' },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.25,
            display: 'grid',
            placeItems: 'center',
            bgcolor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.12),
            color: `${color}.main`,
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={20} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={700} lineHeight={1}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block" mt={0.5}>
            {label}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function buildRowActions(
  handlers: {
    onContinueEditing: (row: any) => void;
    onView: (row: any) => void;
    onReview: (row: any) => void;
    onDuplicate: (row: any) => void;
    onDelete: (row: any) => void;
    onPreview: (row: any) => void;
    onPublish: (row: any) => void;
    onArchive: (row: any) => void;
  },
  permissions: { canView: boolean; canAdd: boolean; canDelete: boolean }
): Record<number, RowAction[]> {
  const {
    onContinueEditing,
    onView,
    onReview,
    onDuplicate,
    onDelete,
    onPreview,
    onPublish,
    onArchive,
  } = handlers;

  const actions: Record<number, RowAction[]> = {
    // Draft
    1: [
      {
        key: 'edit',
        label: 'Continue Editing',
        icon: GlobalIcons.edit,
        color: 'primary',
        onClick: onContinueEditing,
      },
      { key: 'view', label: 'View', icon: GlobalIcons.eye, onClick: onView },
      {
        key: 'duplicate',
        label: 'Duplicate',
        icon: GlobalIcons.copy,
        onClick: onDuplicate,
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: GlobalIcons.delete,
        color: 'error',
        onClick: onDelete,
      },
    ],
    // Generated
    2: [
      {
        key: 'edit',
        label: 'Continue Editing',
        icon: GlobalIcons.edit,
        color: 'primary',
        onClick: onContinueEditing,
      },
      { key: 'review', label: 'Review', icon: 'mdi:checkbox-marked-outline', onClick: onReview },
      {
        key: 'duplicate',
        label: 'Duplicate',
        icon: GlobalIcons.copy,
        onClick: onDuplicate,
      },
    ],
    // Submitted
    3: [
      {
        key: 'edit',
        label: 'Edit',
        icon: GlobalIcons.edit,
        color: 'primary',
        disabled: true,
        onClick: onContinueEditing,
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: GlobalIcons.delete,
        color: 'error',
        disabled: true,
        onClick: onDelete,
      },
      {
        key: 'review',
        label: 'Review Status',
        icon: 'mdi:checkbox-marked-outline',
        color: 'primary',
        onClick: onReview,
      },
      { key: 'view', label: 'View', icon: GlobalIcons.eye, onClick: onView },
    ],
    // Approved
    4: [
      {
        key: 'publish',
        label: 'Publish',
        icon: GlobalIcons.publish,
        color: 'success',
        onClick: onPublish,
      },
      { key: 'preview', label: 'Preview', icon: GlobalIcons.eye, onClick: onPreview },
      { key: 'view', label: 'View', icon: GlobalIcons.doc, onClick: onView },
    ],
    // Rejected
    5: [
      {
        key: 'edit',
        label: 'Edit & Resubmit',
        icon: GlobalIcons.edit,
        color: 'primary',
        onClick: onContinueEditing,
      },
      { key: 'view', label: 'View', icon: GlobalIcons.eye, onClick: onView },
    ],
    // Published
    6: [
      { key: 'preview', label: 'Preview', icon: GlobalIcons.eye, onClick: onPreview },
      {
        key: 'print',
        label: 'Print / Download PDF',
        icon: GlobalIcons.printer,
        onClick: onPreview,
      },
      { key: 'view', label: 'View', icon: GlobalIcons.doc, onClick: onView },
      {
        key: 'archive',
        label: 'Archive',
        icon: GlobalIcons.archive,
        color: 'warning',
        onClick: onArchive,
      },
    ],
    // Locked
    7: [
      {
        key: 'preview',
        label: 'Preview / Download',
        icon: GlobalIcons.eye,
        onClick: onPreview,
      },
      { key: 'view', label: 'View', icon: GlobalIcons.doc, onClick: onView },
      {
        key: 'archive',
        label: 'Archive',
        icon: GlobalIcons.archive,
        color: 'warning',
        onClick: onArchive,
      },
    ],
    // Archived
    8: [
      { key: 'view', label: 'View', icon: GlobalIcons.eye, onClick: onView },
      {
        key: 'delete',
        label: 'Delete',
        icon: GlobalIcons.delete,
        color: 'error',
        onClick: onDelete,
      },
    ],
  };

  return Object.fromEntries(
    Object.entries(actions).map(([status, rowActions]) => [
      status,
      rowActions.filter((action) => {
        // Draft papers remain editable from the list so authors can continue a saved paper.
        if (status === '1' && action.key === 'edit') return true;
        // Submitted papers keep Edit/Delete visible for consistent row layout, but disabled.
        if (action.disabled) return true;
        if (action.key === 'delete') return permissions.canDelete;
        if (action.key === 'view' || action.key === 'preview' || action.key === 'print')
          return permissions.canView;
        return permissions.canAdd;
      }),
    ])
  ) as Record<number, RowAction[]>;
}

export default function QuestionPaperScreen() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { canView, canAdd, canDelete } = useQuestionPaperPermissions();
  const academicYearId = currentYear?.id;

  // ── List state ───────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [scopeFilters, setScopeFilters] = useState({
    standardName: ALL_FILTER_VALUE,
    subjectName: ALL_FILTER_VALUE,
    examTitle: ALL_FILTER_VALUE,
    creationMode: '',
  });
  // The list is intentionally table-only; card view controls were removed from this screen.
  const viewMode = 'table';
  const advancedFiltersOpen = false;

  // ── Wizard state ─────────────────────────────────────────────────────
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState<WizardMode>('create');
  const [wizardPaper, setWizardPaper] = useState<QuestionPaperMetadata | null>(null);
  const [wizardInitialStep, setWizardInitialStep] = useState(0);

  // ── Dialog state ─────────────────────────────────────────────────────
  const [previewPaperId, setPreviewPaperId] = useState<string | null>(null);
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [deleteConfirmPaper, setDeleteConfirmPaper] = useState<any | null>(null);
  const [archiveConfirmPaper, setArchiveConfirmPaper] = useState<any | null>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [localPaperSettings, setLocalPaperSettings] = useState<any>(null);

  // ── Queries ──────────────────────────────────────────────────────────
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

  const { data: preview, isLoading: previewLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPaperPreviewQuery,
    params: { paperId: previewPaperId },
    options: { skip: !previewPaperId },
  });

  const { data: previewDetails } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetQuestionPaperByIdQuery,
    params: { id: previewPaperId },
    options: { skip: !previewPaperId },
  });

  const [deletePaper] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteQuestionPaperMutation,
  });
  const [archivePaper] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useArchiveQuestionPaperMutation,
  });
  const [savePaperSettings] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSaveQuestionPaperSettingsMutation,
  });

  const allPapers: any[] = useMemo(() => papers?.items || [], [papers]);
  const previewPaper = allPapers.find((p) => p.id === previewPaperId);
  const previewPaperData: any = previewDetails || previewPaper;
  const previewSections: SectionPattern[] = useMemo(() => {
    const sections = previewPaperData?.sections || [];
    const questions = previewPaperData?.questions || [];
    return sections.map((section: any, index: number) => ({
      id: section.id || `preview-section-${index + 1}`,
      sectionName: section.sectionName || `Section ${String.fromCharCode(65 + index)}`,
      instructions: section.instructions || '',
      marks: section.marks || 0,
      sortOrder: section.sortOrder || index + 1,
      questionType: section.questionType,
      questionCount: section.questionCount,
      marksPerQuestion: section.marksPerQuestion,
      questions:
        section.questions ||
        questions.filter(
          (question: any) =>
            question.questionPaperSectionId === section.id || question.sectionId === section.id
        ),
    }));
  }, [previewPaperData]);

  const printRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: previewPaper?.paperTitle || 'Question_Paper',
  });

  // Status counts computed from the list (consistent with what the table shows).
  const statusCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    allPapers.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [allPapers]);

  const filteredPapers = useMemo(
    () =>
      allPapers.filter((paper) => {
        const matchesStatus = statusFilter == null || paper.status === statusFilter;
        const matchesClass =
          scopeFilters.standardName === ALL_FILTER_VALUE ||
          paper.standardName === scopeFilters.standardName;
        const matchesSubject =
          scopeFilters.subjectName === ALL_FILTER_VALUE ||
          paper.subjectName === scopeFilters.subjectName;
        const matchesExam =
          scopeFilters.examTitle === ALL_FILTER_VALUE || paper.examTitle === scopeFilters.examTitle;
        const matchesMode =
          !scopeFilters.creationMode || paper.creationMode === scopeFilters.creationMode;
        return matchesStatus && matchesClass && matchesSubject && matchesExam && matchesMode;
      }),
    [allPapers, scopeFilters, statusFilter]
  );

  const paperScopeOptions = useMemo(
    () => ({
      standardName: Array.from(
        new Set(allPapers.map((paper) => paper.standardName).filter(Boolean))
      ).sort(),
      subjectName: Array.from(
        new Set(allPapers.map((paper) => paper.subjectName).filter(Boolean))
      ).sort(),
      examTitle: Array.from(
        new Set(allPapers.map((paper) => paper.examTitle).filter(Boolean))
      ).sort(),
      creationMode: CREATION_MODE_OPTIONS.map((option) => option.value),
    }),
    [allPapers]
  );

  // ── Print ────────────────────────────────────────────────────────────
  // ── Wizard handlers ──────────────────────────────────────────────────
  const openWizard = (mode: WizardMode, paper: QuestionPaperMetadata | null, initialStep = 0) => {
    setWizardMode(mode);
    setWizardPaper(paper);
    setWizardInitialStep(initialStep);
    setWizardOpen(true);
  };

  const rowActions = useMemo(() => {
    const handlers = {
      onContinueEditing: (row: any) => openWizard('edit', row as QuestionPaperMetadata, 0),
      onView: (row: any) => {
        setPreviewPaperId(row.id);
        setPreviewDrawerOpen(true);
      },
      onReview: (row: any) =>
        openWizard(
          row.status === 3 ? 'review' : 'edit',
          row as QuestionPaperMetadata,
          row.status === 3 ? 0 : 3
        ),
      onDuplicate: (row: any) => openWizard('create', row as QuestionPaperMetadata, 0),
      onDelete: (row: any) => setDeleteConfirmPaper(row),
      onPreview: (row: any) => {
        setPreviewDrawerOpen(false);
        setPreviewPaperId(row.id);
      },
      onPublish: (row: any) => openWizard('review', row as QuestionPaperMetadata, 0),
      onArchive: (row: any) => setArchiveConfirmPaper(row),
    };
    return buildRowActions(handlers, { canView, canAdd, canDelete });
  }, [canAdd, canDelete, canView]);

  // ── Delete / archive / settings ──────────────────────────────────────
  const handleDeletePaperConfirm = async () => {
    if (!deleteConfirmPaper) return;
    const paperId = deleteConfirmPaper.id;
    if (!paperId) {
      shikshaMitraToast.error({ message: 'Unable to delete paper: paper ID is missing.' });
      return;
    }

    try {
      await deletePaper({ id: paperId }).unwrap();
      shikshaMitraToast.success({
        message: `Paper "${deleteConfirmPaper.paperTitle}" deleted successfully.`,
      });
      setDeleteConfirmPaper(null);
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to delete paper.' });
    }
  };

  const handleArchivePaperConfirm = async () => {
    if (!archiveConfirmPaper) return;
    try {
      await archivePaper({ paperId: archiveConfirmPaper.id }).unwrap();
      shikshaMitraToast.success({
        message: `Paper "${archiveConfirmPaper.paperTitle}" archived successfully.`,
      });
      setArchiveConfirmPaper(null);
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to archive paper.' });
    }
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
    } catch {
      shikshaMitraToast.error({ message: 'Failed to save settings.' });
    }
  };

  // ── Table columns (spec §5) ──────────────────────────────────────────
  const paperColumns = useMemo(
    () => [
      {
        id: 'paperTitle',
        label: 'Paper Name',
        filterType: 'string' as const,
        minWidth: 220,
        sticky: true,
        stickyPosition: 'left' as const,
        render: (_: any, row: any) => (
          <Box>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {row.paperTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.paperCode ? `#${row.paperCode}` : `by ${row.createdBy || '—'}`}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'examTitle',
        label: 'Exam',
        filterType: 'string' as const,
        width: 140,
        render: (v: any) => (
          <Typography variant="body2" noWrap sx={{ maxWidth: 140 }}>
            {v || '—'}
          </Typography>
        ),
      },
      { id: 'standardName', label: 'Class', filterType: 'string' as const, width: 100 },
      { id: 'subjectName', label: 'Subject', filterType: 'string' as const, width: 130 },
      {
        id: 'totalMarks',
        label: 'Marks',
        filterType: 'number' as const,
        width: 80,
        align: 'center' as const,
        render: (v: any) => (
          <Typography variant="subtitle2" fontWeight={700}>
            {v}
          </Typography>
        ),
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
        id: 'updatedAt',
        label: 'Updated',
        filterType: 'date' as const,
        width: 110,
        render: (v: any, row: any) => {
          const raw = v || row.updatedAt || row.createdAt;
          if (!raw) return <Typography variant="body2">—</Typography>;
          const date = new Date(raw);
          return (
            <Typography variant="caption" color="text.secondary">
              {Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()}
            </Typography>
          );
        },
      },
      {
        id: 'status',
        label: 'Status',
        sticky: true,
        filterType: 'enum' as const,
        width: 120,
        enumOptions: Object.entries(STATUS_LABEL).map(([value, label]) => ({
          value: Number(value),
          label,
        })),
        render: (v: any) => (
          <Label variant="soft" color={STATUS_COLOR[v] || 'default'} sx={{ fontWeight: 700 }}>
            {STATUS_LABEL[v] || v || '—'}
          </Label>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        isFilter: false,
        isSort: false,
        width: 150,
        minWidth: 150,
        align: 'left' as const,
        sticky: true,
        stickyPosition: 'right' as const,
        render: (_: any, row: any) => {
          const actions = rowActions[row.status] || rowActions[1];

          return (
            <AdaptiveThreeDotsActions
              actions={actions.map((action: RowAction) => ({
                id: action.key,
                label: action.label,
                icon: action.icon,
                color: action.color === 'inherit' ? undefined : action.color,
                disabled: action.disabled,
                onClick: () => action.onClick(row),
              }))}
              placement="right-top"
            />
          );
        },
      },
    ],
    [rowActions]
  );

  // ── Summary cards (spec §5 — compact, clickable, filter the table) ───
  const summaryCards = useMemo(
    () => [
      {
        label: 'Total Papers',
        value: dashboard?.totalPapers ?? allPapers.length,
        icon: 'mdi:file-document-outline',
        color: 'primary' as StatColor,
        status: null,
      },
      {
        label: 'Approved',
        value: dashboard?.approvedPapers ?? statusCounts[4] ?? 0,
        icon: 'mdi:check-circle-outline',
        color: 'success' as StatColor,
        status: 4,
      },
      {
        label: 'Draft',
        value: dashboard?.draftPapers ?? statusCounts[1] ?? 0,
        icon: 'mdi:file-outline',
        color: 'info' as StatColor,
        status: 1,
      },
      {
        label: 'Pending Review',
        value: dashboard?.pendingApproval ?? statusCounts[3] ?? 0,
        icon: 'mdi:clock-outline',
        color: 'warning' as StatColor,
        status: 3,
      },
      {
        label: 'Rejected',
        value: dashboard?.rejectedPapers ?? statusCounts[5] ?? 0,
        icon: 'mdi:close-circle-outline',
        color: 'error' as StatColor,
        status: 5,
      },
    ],
    [dashboard, allPapers.length, statusCounts]
  );

  return (
    <Box height="100%" display="flex" flexDirection="column" gap={1.5}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Question Papers"
        description="Create, manage, review and publish examination question papers."
        links={[
          { name: 'Dashboard', href: academicPaths.dashboard },
          { name: 'Examination', href: academicPaths.examination.questionPapers },
          { name: 'Question Papers' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            {canAdd && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="mdi:cog-outline" />}
                onClick={handleOpenSettings}
              >
                Settings
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              disabled={!academicYearId}
              onClick={() => openWizard('create', null, 0)}
              startIcon={<Iconify icon="mdi:add" />}
            >
              Create Question Paper
            </Button>
          </Stack>
        }
      />

      {!academicYearId && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Please select an academic year to manage question papers.
        </Alert>
      )}

      {/* ── Status summary cards (clickable filters) ───────────────── */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {summaryCards.map((card) => (
          <PaperStatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            color={card.color}
            selected={
              statusFilter === card.status || (card.status === null && statusFilter === null)
            }
            onClick={() => setStatusFilter(card.status)}
          />
        ))}
      </Stack>

      {/* ── Active status filter ───────────────────────────────────── */}
      <Box
        sx={{
          p: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.5,
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1}
          alignItems={{ lg: 'center' }}
          sx={{ flexWrap: { lg: 'nowrap' } }}
        >
          {(
            [
              ['standardName', 'Class'],
              ['subjectName', 'Subject'],
              ['examTitle', 'Exam'],
            ] as const
          ).map(([key, label]) => (
            <FormControl key={key} size="small" fullWidth>
              <InputLabel>{label}</InputLabel>
              <Select
                label={label}
                value={scopeFilters[key]}
                onChange={(event) =>
                  setScopeFilters((current) => ({ ...current, [key]: event.target.value }))
                }
              >
                <MenuItem value={ALL_FILTER_VALUE}>All {label}s</MenuItem>
                {paperScopeOptions[key].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
          {(statusFilter !== null ||
            Object.entries(scopeFilters).some(([key, value]) =>
              key === 'creationMode' ? Boolean(value) : value !== ALL_FILTER_VALUE
            )) && (
            <Button
              size="small"
              color="error"
              onClick={() => {
                setStatusFilter(null);
                setScopeFilters({
                  standardName: ALL_FILTER_VALUE,
                  subjectName: ALL_FILTER_VALUE,
                  examTitle: ALL_FILTER_VALUE,
                  creationMode: '',
                });
              }}
              startIcon={<Iconify icon="mdi:close" width={14} />}
              sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              Clear filters
            </Button>
          )}
        </Stack>
        {advancedFiltersOpen && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ pt: 1 }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Creation mode</InputLabel>
              <Select
                label="Creation mode"
                value={scopeFilters.creationMode}
                onChange={(event) =>
                  setScopeFilters((current) => ({ ...current, creationMode: event.target.value }))
                }
              >
                <MenuItem value="">All modes</MenuItem>
                {paperScopeOptions.creationMode.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary" alignSelf="center">
              Use the table column filters for additional paper fields.
            </Typography>
          </Stack>
        )}
      </Box>

      {/* ── Papers table ───────────────────────────────────────────── */}
      {viewMode === 'table' ? (
        <CustomizableTable
          tableId="question-papers-list"
          tableTitle="School Question Papers"
          columns={paperColumns}
          data={filteredPapers}
          isLoading={isFetching}
          wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
          tableContainerProps={{ sx: { height: '100%' } }}
          noDataText="No question papers found"
          rowProps={(row) => ({
            selected: row.id === wizardPaper?.id,
          })}
        />
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {filteredPapers.length === 0 ? (
            <EmptyContent title="No question papers found" sx={{ minHeight: 320 }} />
          ) : (
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5}>
              {filteredPapers.map((paper) => (
                <Box
                  key={paper.id}
                  component="button"
                  type="button"
                  onClick={() => {
                    setPreviewPaperId(paper.id);
                    setPreviewDrawerOpen(true);
                  }}
                  sx={{
                    flex: '1 1 280px',
                    maxWidth: { md: 'calc(50% - 12px)', xl: 'calc(33.333% - 12px)' },
                    minWidth: 260,
                    textAlign: 'left',
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <Typography variant="subtitle2" fontWeight={700} noWrap>
                        {paper.paperTitle || 'Untitled question paper'}
                      </Typography>
                      <Label variant="soft" color={STATUS_COLOR[paper.status] || 'default'}>
                        {STATUS_LABEL[paper.status] || '—'}
                      </Label>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {[paper.examTitle, paper.standardName, paper.subjectName]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {paper.totalMarks ?? '—'} marks · {paper.durationMinutes ?? '—'} minutes
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* ── Guided creation / edit / review wizard ─────────────────── */}
      <CreatePaperWizard
        open={wizardOpen}
        mode={wizardMode}
        paper={wizardPaper}
        initialStep={wizardInitialStep}
        onClose={() => {
          setWizardOpen(false);
          setWizardPaper(null);
        }}
        onPaperCreated={(created) => {
          // Continue the same wizard session against the newly created paper.
          setWizardPaper(created);
          setWizardMode('edit');
        }}
      />

      {/* ── Preview / print dialog ─────────────────────────────────── */}
      <QuestionPaperPreviewDrawer
        open={previewDrawerOpen}
        paper={previewPaperData || null}
        printHtml={preview?.printHtml}
        sections={previewSections}
        isLoading={previewLoading}
        onClose={() => {
          setPreviewDrawerOpen(false);
          setPreviewPaperId(null);
        }}
      />

      <CustomDialog
        open={Boolean(previewPaperId) && !previewDrawerOpen}
        handleClose={() => setPreviewPaperId(null)}
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="mdi:eye-outline" color="primary.main" width={22} />
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
              dangerouslySetInnerHTML={{
                __html:
                  preview?.printHtml ||
                  '<p style="text-align:center;padding:50px;color:#888;">Generating official print preview document…</p>',
              }}
            />
          </Scrollbar>
        </DialogScrollContent>
        <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button variant="outlined" color="inherit" onClick={() => setPreviewPaperId(null)}>
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={previewLoading && !preview?.printHtml}
            onClick={() => handlePrint()}
            startIcon={<Iconify icon="mdi:printer-outline" />}
          >
            Print / Download PDF
          </Button>
        </DialogActions>
      </CustomDialog>

      {/* ── Settings popover ───────────────────────────────────────── */}
      <Popover
        open={Boolean(settingsAnchorEl)}
        anchorEl={settingsAnchorEl}
        onClose={() => setSettingsAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box sx={{ p: 2.5, width: 340 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            Paper Settings
          </Typography>
          <CustomTooltip title="Settings control school-wide defaults for question papers.">
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
              Configure defaults for auto-generation, approvals and duplicates.
            </Typography>
          </CustomTooltip>
          <Button size="small" variant="contained" fullWidth onClick={handleSavePaperSettings}>
            Save Settings
          </Button>
        </Box>
      </Popover>

      {/* ── Delete confirmation ────────────────────────────────────── */}
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

      {/* ── Archive confirmation ───────────────────────────────────── */}
      <ConfirmDialog
        open={Boolean(archiveConfirmPaper)}
        onClose={() => setArchiveConfirmPaper(null)}
        title="Archive Question Paper?"
        content={`Are you sure you want to archive question paper "${archiveConfirmPaper?.paperTitle}"?`}
        action={
          <Button
            variant="contained"
            color="warning"
            size="small"
            onClick={handleArchivePaperConfirm}
          >
            Archive
          </Button>
        }
      />
    </Box>
  );
}
