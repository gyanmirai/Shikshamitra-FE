'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type {
  AdmissionCrmLeadDto,
  CreateAdmissionCrmLeadDto,
  AdmissionCrmStaffLookupDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import AddRounded from '@mui/icons-material/AddRounded';
import { shikshaMitraToast } from 'src/components/toast';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import EventRounded from '@mui/icons-material/EventRounded';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import ViewColumnRounded from '@mui/icons-material/ViewColumnRounded';
import ReceiptLongRounded from '@mui/icons-material/ReceiptLongRounded';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import FormatListBulletedRounded from '@mui/icons-material/FormatListBulletedRounded';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';
import {
  Box,
  Chip,
  Link,
  Card,
  Paper,
  Alert,
  Stack,
  Button,
  Dialog,
  Select,
  Switch,
  Tooltip,
  Collapse,
  Checkbox,
  MenuItem,
  MenuList,
  TextField,
  IconButton,
  Typography,
  InputLabel,
  DialogTitle,
  FormControl,
  Autocomplete,
  ToggleButton,
  DialogContent,
  DialogActions,
  InputAdornment,
  FormHelperText,
  LinearProgress,
  CircularProgress,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';
import {
  AdmissionInquiryStage,
  AdmissionCrmRouteType,
  AdmissionInquiryChannel,
  AdmissionCrmLeadPriority,
  useGetAdmissionCrmStaffQuery,
  useGetAdmissionCrmLeadsQuery,
  useGetAdmissionCrmExamSlotsQuery,
  useCreateAdmissionCrmLeadMutation,
  useGetAdmissionCrmPipelineStagesQuery,
  useGetAdmissionCrmStandardOptionsQuery,
  useBulkCreateAdmissionCrmTasksMutation,
  useBulkChangeAdmissionCrmStagesMutation,
  useBulkArchiveAdmissionCrmLeadsMutation,
  useGetAdmissionCrmQuickInquiryOptionsQuery,
  useScheduleAdmissionCrmEntranceExamMutation,
  useBulkAssignAdmissionCrmLeadOwnersMutation,
  usePreviewAdmissionCrmLeadDuplicatesMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { formatEnrollmentDate } from './enrollment-display';
import { PipelineStageColumn } from './pipeline-stage-column';
import { EnrollmentWorkspaceHeader } from './workspace-header';
import { AdmissionCrmStageChip } from './admission-crm-stage-chip';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { useWorkspaceTableSessionState } from './workspace-table-session-state';
import {
  createApplicantRowNavigationProps,
  createApplicantLinkNavigationProps,
} from './applicant-row-navigation';
import {
  mapQuickInquiryOptions,
  isValidQuickInquiryEmail,
  getDefaultQuickInquiryOption,
} from './quick-inquiry-options';
import {
  getAdmissionCrmLeadName,
  getAdmissionCrmStageLabel,
  getAdmissionCrmChannelLabel,
  getAdmissionCrmStageTooltipLines,
} from './admissions-crm-utils';
import {
  enrollmentActionsColumn,
  enrollmentTableWrapperSx,
  enrollmentWorkspaceRootSx,
  EnrollmentTableEmptyState,
  enrollmentTableContainerSx,
  EnrollmentWorkspaceErrorState,
  EnrollmentWorkspaceFilterPanel,
} from './workspace-table-patterns';

import type { PipelineStageGroup } from './enrollment-workspace-state';

const pageSize = 50;
const permissionRoot = 'Students.Enrollment.AdmissionsCrm';
const actionPermissions = {
  add: `${permissionRoot}.Add`,
  assignOwner: `${permissionRoot}.AssignOwner`,
  manageTasks: `${permissionRoot}.ManageTasks`,
  changeStage: `${permissionRoot}.ChangeStage`,
  archiveReopen: `${permissionRoot}.ArchiveReopen`,
  scheduleExam: `${permissionRoot}.ScheduleExam`,
  issueRegistrationForm: `${permissionRoot}.IssueRegistrationForm`,
};

const channels = Object.values(AdmissionInquiryChannel).filter(
  (value): value is AdmissionInquiryChannel => typeof value === 'number'
);
const priorities = Object.values(AdmissionCrmLeadPriority).filter(
  (value): value is AdmissionCrmLeadPriority => typeof value === 'number'
);
const routeTypes = Object.values(AdmissionCrmRouteType).filter(
  (value): value is AdmissionCrmRouteType => typeof value === 'number'
);
const routeTypeLabel = (value: AdmissionCrmRouteType | string | null | undefined) => {
  const numericValue = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  const enumLabel =
    typeof numericValue === 'number' ? AdmissionCrmRouteType[numericValue] : numericValue;
  return enumLabel?.replace(/([a-z])([A-Z])/g, '$1 $2') || 'Unknown pathway';
};

const getLatestEnumFilter = (filters: IParams['filters'], column: string) => {
  const filter = [...filters].reverse().find((item) => item.column === column);
  return filter ? Number(filter.value) : undefined;
};

const getLatestStringFilter = (filters: IParams['filters'], column: string) => {
  const filter = [...filters].reverse().find((item) => item.column === column);
  return filter?.value ? String(filter.value) : undefined;
};

const getDateFilterBounds = (filters: IParams['filters'], column: string) => {
  const filter = [...filters].reverse().find((item) => item.column === column);
  if (!filter || typeof filter.value !== 'string') return {};
  const [day, month, year] = filter.value.split('-').map(Number);
  if (!day || !month || !year) return {};
  const value = new Date(Date.UTC(year, month - 1, day));
  if (filter.type === 'after') {
    value.setUTCDate(value.getUTCDate() + 1);
    return { from: value.toISOString() };
  }
  if (filter.type === 'before') {
    value.setUTCDate(value.getUTCDate() - 1);
    return { until: value.toISOString() };
  }
  const iso = value.toISOString();
  return { from: iso, until: iso };
};

const priorityLabels: Record<AdmissionCrmLeadPriority, string> = {
  [AdmissionCrmLeadPriority.None]: 'Not set',
  [AdmissionCrmLeadPriority.Hot]: 'Hot',
  [AdmissionCrmLeadPriority.Warm]: 'Warm',
  [AdmissionCrmLeadPriority.Cold]: 'Cold',
  [AdmissionCrmLeadPriority.Low]: 'Low',
};

const pipelineStageGroups: Record<PipelineStageGroup, AdmissionInquiryStage[]> = {
  active: [
    AdmissionInquiryStage.NewInquiry,
    AdmissionInquiryStage.FollowUp,
    AdmissionInquiryStage.ExamReady,
    AdmissionInquiryStage.ExamScheduled,
    AdmissionInquiryStage.ExamCompleted,
  ],
  decision: [AdmissionInquiryStage.Eligible, AdmissionInquiryStage.Waitlisted],
  closed: [
    AdmissionInquiryStage.Rejected,
    AdmissionInquiryStage.Stale,
    AdmissionInquiryStage.Archived,
  ],
};

type QuickInquiryForm = {
  firstName: string;
  middleName: string;
  lastName: string;
  parentGuardianName: string;
  primaryContactNo: string;
  email: string;
  admissionIntent: string;
  intendedRouteDefinitionId: string;
  mediumStageId: string;
  targetStandardId: string;
  channel: AdmissionInquiryChannel | '';
  campaignName: string;
  notes: string;
  duplicateContinueReason: string;
};

const emptyQuickInquiry: QuickInquiryForm = {
  firstName: '',
  middleName: '',
  lastName: '',
  parentGuardianName: '',
  primaryContactNo: '',
  email: '',
  admissionIntent: '',
  intendedRouteDefinitionId: '',
  mediumStageId: '',
  targetStandardId: '',
  channel: '',
  campaignName: '',
  notes: '',
  duplicateContinueReason: '',
};

type BulkAction = 'owner' | 'task' | 'stage' | 'archive';

const isExamReady = (lead: AdmissionCrmLeadDto) =>
  Boolean(
    (lead.primaryContactNo || lead.email) &&
    lead.admissionIntent &&
    (lead.desiredClassName || lead.targetStandardId)
  );

const canOpenRegistration = (lead: AdmissionCrmLeadDto, registrationRequiredBeforeExam = false) =>
  Boolean(
    registrationRequiredBeforeExam ||
    lead.registrationFormNumber ||
    lead.registrationFormIssuedAt ||
    lead.stage === AdmissionInquiryStage.NewInquiry ||
    lead.stage === AdmissionInquiryStage.FollowUp ||
    lead.stage === AdmissionInquiryStage.Eligible ||
    lead.stage === AdmissionInquiryStage.Waitlisted
  );

const isRegistrationIssued = (lead: AdmissionCrmLeadDto) =>
  Boolean(lead.registrationFormNumber || lead.registrationFormIssuedAt);

const isExamAlreadyScheduled = (lead: AdmissionCrmLeadDto) =>
  [
    AdmissionInquiryStage.ExamScheduled,
    AdmissionInquiryStage.ExamCompleted,
    AdmissionInquiryStage.Eligible,
    AdmissionInquiryStage.Waitlisted,
    AdmissionInquiryStage.Rejected,
  ].includes(lead.stage);

const protectedBulkStages = new Set([
  AdmissionInquiryStage.ExamReady,
  AdmissionInquiryStage.ExamScheduled,
  AdmissionInquiryStage.ExamCompleted,
  AdmissionInquiryStage.Eligible,
  AdmissionInquiryStage.Waitlisted,
  AdmissionInquiryStage.Rejected,
  AdmissionInquiryStage.Archived,
]);

type LeadCardProps = {
  lead: AdmissionCrmLeadDto;
  ownerName: string;
  selected?: boolean;
  showSelection?: boolean;
  canScheduleExam: boolean;
  canManageRegistration: boolean;
  onSelect?: () => void;
  onOpen: () => void;
  onSchedule: () => void;
  onOpenRegistration: () => void;
};

function PipelineLeadCard({
  lead,
  ownerName,
  selected,
  showSelection,
  canScheduleExam,
  canManageRegistration,
  onSelect,
  onOpen,
  onSchedule,
  onOpenRegistration,
}: LeadCardProps) {
  return (
    <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1, minWidth: 0, flexShrink: 0 }}>
      <Stack spacing={1}>
        <Stack direction="row" gap={1} justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap title={getAdmissionCrmLeadName(lead)}>
              {getAdmissionCrmLeadName(lead)}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {lead.desiredClassName || 'Class not captured'} · {ownerName}
            </Typography>
          </Box>
          {showSelection && (
            <Checkbox
              size="small"
              checked={Boolean(selected)}
              onChange={onSelect}
              inputProps={{ 'aria-label': `Select ${getAdmissionCrmLeadName(lead)}` }}
            />
          )}
        </Stack>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Chip size="small" label={`Score ${lead.leadScore}`} variant="outlined" />
          {lead.priority !== AdmissionCrmLeadPriority.None && (
            <Chip size="small" label={priorityLabels[lead.priority]} color="warning" />
          )}
          {lead.likelyDuplicateCount > 0 && (
            <Chip size="small" label={`${lead.likelyDuplicateCount} duplicate`} color="warning" />
          )}
          <Chip
            size="small"
            icon={<ReceiptLongRounded />}
            label={
              lead.registrationFormNumber
                ? `Registration ${lead.registrationFormNumber}`
                : isRegistrationIssued(lead)
                  ? 'Registration issued'
                  : 'Registration not issued'
            }
            variant="outlined"
            color="default"
            sx={
              isRegistrationIssued(lead)
                ? (theme) => ({
                    color: theme.palette.text.primary,
                    borderColor: theme.palette.success.main,
                    '& .MuiChip-icon': {
                      color:
                        theme.palette.mode === 'dark'
                          ? theme.palette.success.light
                          : theme.palette.success.dark,
                    },
                  })
                : undefined
            }
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
          {lead.admissionIntent}
        </Typography>
        {canManageRegistration && !lead.ownerUserId && !lead.archivedAt ? (
          <Alert severity="warning" sx={{ py: 0.25 }}>
            Registration can continue, but no owner is assigned for follow-up.
          </Alert>
        ) : null}
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Typography variant="caption" color="text.secondary">
            {formatEnrollmentDate(lead.lastActivityTime, true)}
          </Typography>
          <Stack direction="row" gap={1}>
            {canManageRegistration && !lead.archivedAt && (
              <Button size="small" startIcon={<ReceiptLongRounded />} onClick={onOpenRegistration}>
                Registration
              </Button>
            )}
            {canScheduleExam && isExamReady(lead) && !lead.archivedAt && (
              <Button size="small" startIcon={<EventRounded />} onClick={onSchedule}>
                Exam
              </Button>
            )}
            <Button size="small" variant="outlined" onClick={onOpen}>
              Manage
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

export function PipelineWorkspace() {
  const permissions = useSelector((root: RootState) => root.auth.permissions);
  const {
    academicYearId,
    academicYearName,
    academicBoardId,
    academicBoardName,
    academicMediumId,
    academicMediumName,
    currentUserId,
    sessionIdentity,
    state,
    updateState,
    getApplicantHref,
    openApplicant,
  } = useEnrollmentWorkspace();
  const page = Math.max(0, state.page - 1);
  const {
    search,
    setSearch,
    filters: columnFilters,
    setFilters: setColumnFilters,
  } = useWorkspaceTableSessionState(`pipeline:${academicYearId || 'none'}:${sessionIdentity}`);
  const [debouncedSearch, setDebouncedSearch] = useState(() => search.trim());
  const [staffSearch, setStaffSearch] = useState('');
  const [debouncedStaffSearch, setDebouncedStaffSearch] = useState('');
  const [quickDialogOpen, setQuickDialogOpen] = useState(false);
  const [quickForm, setQuickForm] = useState<QuickInquiryForm>(emptyQuickInquiry);
  const [quickFormSubmitted, setQuickFormSubmitted] = useState(false);
  const [quickEmailTouched, setQuickEmailTouched] = useState(false);
  const [showOptionalQuickInquiryFields, setShowOptionalQuickInquiryFields] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<AdmissionCrmLeadDto['likelyDuplicates']>(
    []
  );
  const [duplicateReviewed, setDuplicateReviewed] = useState(false);
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const contactInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const mediumStageInputRef = useRef<HTMLInputElement>(null);
  const targetStandardInputRef = useRef<HTMLInputElement>(null);
  const routeInputRef = useRef<HTMLInputElement>(null);
  const channelInputRef = useRef<HTMLInputElement>(null);
  const duplicateReasonInputRef = useRef<HTMLInputElement>(null);
  const [scheduleLead, setScheduleLead] = useState<AdmissionCrmLeadDto | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [overrideCapacity, setOverrideCapacity] = useState(false);
  const [capacityOverrideReason, setCapacityOverrideReason] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);
  const [bulkOwner, setBulkOwner] = useState<AdmissionCrmStaffLookupDto | null>(null);
  const [bulkTitle, setBulkTitle] = useState('');
  const [bulkDueAt, setBulkDueAt] = useState(() =>
    dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm')
  );
  const [bulkStage, setBulkStage] = useState(AdmissionInquiryStage.FollowUp);
  const [bulkReason, setBulkReason] = useState('');
  const [overrideProtectedStages, setOverrideProtectedStages] = useState(false);

  useEffect(() => {
    if ((state.view || 'list') === 'list') {
      return undefined;
    }
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search, state.view]);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedStaffSearch(staffSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [staffSearch]);

  const resolvedOwner = state.owner === 'me' ? currentUserId : state.owner;
  const leadsQuery = useGetAdmissionCrmLeadsQuery(
    {
      academicYearId: academicYearId || '',
      filterText: debouncedSearch || undefined,
      applicantSearch: getLatestStringFilter(columnFilters, 'applicant'),
      registrationFormNumber: getLatestStringFilter(columnFilters, 'registrationFormNumber'),
      lastActivityFrom: getDateFilterBounds(columnFilters, 'lastActivityTime').from,
      lastActivityUntil: getDateFilterBounds(columnFilters, 'lastActivityTime').until,
      stage: state.stage,
      channel: state.channel,
      campaignName: state.campaign,
      ownerUserId: resolvedOwner,
      priority: state.priority,
      intendedRouteType: state.routeType,
      desiredClassName: state.className,
      academicMediumId,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
      sorting: state.sorting || 'LastActivityTime DESC',
    },
    { skip: !academicYearId || state.view === 'board' }
  );
  const stagesQuery = useGetAdmissionCrmPipelineStagesQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const ownerStaffQuery = useGetAdmissionCrmStaffQuery(
    {
      filter: debouncedStaffSearch || undefined,
      ids:
        [resolvedOwner, bulkAction === 'owner' ? bulkOwner?.id : undefined]
          .filter(Boolean)
          .join(',') || undefined,
      maxResultCount: 25,
      academicYearId,
      ownerOnly: true,
    },
    { skip: !academicYearId }
  );
  const taskStaffQuery = useGetAdmissionCrmStaffQuery(
    {
      filter: debouncedStaffSearch || undefined,
      ids: bulkAction === 'task' ? bulkOwner?.id : undefined,
      maxResultCount: 25,
      academicYearId,
    },
    { skip: !academicYearId || bulkAction !== 'task' }
  );
  const slotsQuery = useGetAdmissionCrmExamSlotsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId || !scheduleLead }
  );
  const isExamSlotsLoading = slotsQuery.isLoading || slotsQuery.isFetching;
  const activeExamSlots = (slotsQuery.data?.items || []).filter((slot) => slot.isActive);
  const quickInquiryOptionsQuery = useGetAdmissionCrmQuickInquiryOptionsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const organizationOptionsQuery = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId || !quickDialogOpen }
  );
  const standardOptionsQuery = useGetAdmissionCrmStandardOptionsQuery(
    { mediumId: academicMediumId || '' },
    { skip: !academicMediumId || !quickDialogOpen }
  );
  const mediumStages = useMemo(
    () =>
      (organizationOptionsQuery.data?.items || []).filter(
        (option) =>
          option.mediumId === academicMediumId &&
          (!academicBoardId || option.boardId === academicBoardId)
      ),
    [academicBoardId, academicMediumId, organizationOptionsQuery.data?.items]
  );
  const standardOptions = useMemo(
    () =>
      (standardOptionsQuery.data || []).filter(
        (standard) => standard.educationMediumStageId === quickForm.mediumStageId
      ),
    [quickForm.mediumStageId, standardOptionsQuery.data]
  );
  const quickInquiryOptions = useMemo(
    () => mapQuickInquiryOptions(quickInquiryOptionsQuery.data),
    [quickInquiryOptionsQuery.data]
  );
  const selectedQuickInquiryRoute = quickInquiryOptions.routes.find(
    (route) => route.id === quickForm.intendedRouteDefinitionId
  );
  const quickInquiryOptionsLoading =
    quickInquiryOptionsQuery.isLoading || quickInquiryOptionsQuery.isFetching;
  const quickInquiryOptionsMissing =
    !quickInquiryOptionsLoading &&
    !quickInquiryOptionsQuery.isError &&
    Boolean(quickInquiryOptionsQuery.data) &&
    (!quickInquiryOptions.channels.length || !quickInquiryOptions.routes.length);

  useEffect(() => {
    if (!quickDialogOpen || !quickInquiryOptionsQuery.data) return;

    setQuickForm((current) => {
      const currentChannelIsAvailable = quickInquiryOptions.channels.some(
        (option) => option.value === current.channel
      );
      const currentRouteIsAvailable = quickInquiryOptions.routes.some(
        (option) => option.id === current.intendedRouteDefinitionId
      );
      const channel = currentChannelIsAvailable
        ? current.channel
        : (getDefaultQuickInquiryOption(quickInquiryOptions.channels)?.value ?? '');
      const intendedRouteDefinitionId = currentRouteIsAvailable
        ? current.intendedRouteDefinitionId
        : (getDefaultQuickInquiryOption(quickInquiryOptions.routes)?.id ?? '');

      if (
        channel === current.channel &&
        intendedRouteDefinitionId === current.intendedRouteDefinitionId
      ) {
        return current;
      }

      return { ...current, channel, intendedRouteDefinitionId };
    });
  }, [
    quickDialogOpen,
    quickInquiryOptions.channels,
    quickInquiryOptions.routes,
    quickInquiryOptionsQuery.data,
  ]);

  useEffect(() => {
    if (!quickDialogOpen || quickForm.mediumStageId || mediumStages.length !== 1) return;
    setQuickForm((current) => ({ ...current, mediumStageId: mediumStages[0].id }));
  }, [mediumStages, quickDialogOpen, quickForm.mediumStageId]);

  useEffect(() => {
    if (!quickDialogOpen || quickForm.targetStandardId || standardOptions.length !== 1) return;
    setQuickForm((current) => ({ ...current, targetStandardId: standardOptions[0].id }));
  }, [quickDialogOpen, quickForm.targetStandardId, standardOptions]);

  const registrationRequiredBeforeExam = Boolean(
    quickInquiryOptionsQuery.data?.registrationFormRequiredBeforeExam
  );
  const entranceExamRequired = quickInquiryOptionsQuery.data?.entranceExamRequired !== false;

  const [createLead, createLeadState] = useCreateAdmissionCrmLeadMutation();
  const [previewDuplicates, previewDuplicatesState] =
    usePreviewAdmissionCrmLeadDuplicatesMutation();
  const [scheduleExam, scheduleExamState] = useScheduleAdmissionCrmEntranceExamMutation();
  const [bulkAssignOwners, bulkAssignOwnersState] = useBulkAssignAdmissionCrmLeadOwnersMutation();
  const [bulkCreateTasks, bulkCreateTasksState] = useBulkCreateAdmissionCrmTasksMutation();
  const [bulkChangeStages, bulkChangeStagesState] = useBulkChangeAdmissionCrmStagesMutation();
  const [bulkArchiveLeads, bulkArchiveLeadsState] = useBulkArchiveAdmissionCrmLeadsMutation();

  useEffect(
    () => setSelectedLeadIds([]),
    [
      debouncedSearch,
      columnFilters,
      state.channel,
      state.owner,
      state.page,
      state.priority,
      state.stage,
    ]
  );

  const stages = useMemo(
    () => (stagesQuery.data || []).filter((stage) => stage.isEnabled),
    [stagesQuery.data]
  );
  const stageGroup = state.stageGroup || 'active';
  const visibleBoardStages = useMemo(
    () =>
      stages.filter((stageItem) =>
        state.stage == null
          ? pipelineStageGroups[stageGroup].includes(stageItem.systemStage)
          : stageItem.systemStage === state.stage
      ),
    [stageGroup, stages, state.stage]
  );
  const stageSelectValue =
    state.stage != null && stages.some((stage) => stage.systemStage === state.stage)
      ? state.stage
      : '';
  const leads = useMemo(() => leadsQuery.data?.items || [], [leadsQuery.data?.items]);
  const showEmptyPipeline =
    !leadsQuery.isLoading && !leadsQuery.isFetching && (leadsQuery.data?.totalCount ?? 0) === 0;
  const rowOwnerIds = useMemo(
    () =>
      Array.from(
        new Set(
          leads.map((lead) => lead.ownerUserId).filter((value): value is string => Boolean(value))
        )
      ).join(','),
    [leads]
  );
  const rowStaffQuery = useGetAdmissionCrmStaffQuery(
    { ids: rowOwnerIds || undefined, maxResultCount: 1, academicYearId },
    { skip: !academicYearId || !rowOwnerIds }
  );
  const staffById = useMemo(
    () =>
      new Map(
        [
          ...(ownerStaffQuery.data || []),
          ...(taskStaffQuery.data || []),
          ...(rowStaffQuery.data || []),
        ].map((staff) => [staff.id, staff.displayName])
      ),
    [ownerStaffQuery.data, rowStaffQuery.data, taskStaffQuery.data]
  );
  const ownerFilterOptions = useMemo(
    () =>
      Array.from(
        new Map(
          [...(ownerStaffQuery.data || []), ...(rowStaffQuery.data || [])].map((staff) => [
            staff.id,
            { value: staff.id, label: staff.displayName },
          ])
        ).values()
      ),
    [ownerStaffQuery.data, rowStaffQuery.data]
  );
  const selectedLeadSet = useMemo(() => new Set(selectedLeadIds), [selectedLeadIds]);
  const protectedSelectedLeads = useMemo(
    () =>
      leads.filter((lead) => selectedLeadSet.has(lead.id) && protectedBulkStages.has(lead.stage)),
    [leads, selectedLeadSet]
  );
  const can = (permission: string) => hasGrantedPermission(permissions, permission);
  const ownerName = useCallback(
    (lead: AdmissionCrmLeadDto) =>
      (lead.ownerUserId ? staffById.get(lead.ownerUserId) : undefined) ||
      (lead.ownerUserId ? 'Assigned staff' : 'Unassigned'),
    [staffById]
  );

  const tableFilters = useMemo<IParams['filters']>(
    () => [
      ...(state.stage == null
        ? []
        : [
            {
              column: 'stage',
              type: 'equals',
              value: state.stage,
              valueType: 'enum',
              label: 'Stage',
              displayValue: getAdmissionCrmStageLabel(state.stage as AdmissionInquiryStage),
            },
          ]),
      ...(state.channel == null
        ? []
        : [
            {
              column: 'channel',
              type: 'equals',
              value: state.channel,
              valueType: 'enum',
              label: 'Channel',
              displayValue: getAdmissionCrmChannelLabel(state.channel as AdmissionInquiryChannel),
            },
          ]),
      ...(state.priority == null
        ? []
        : [
            {
              column: 'priority',
              type: 'equals',
              value: state.priority,
              valueType: 'enum',
              label: 'Priority',
              displayValue: priorityLabels[state.priority as AdmissionCrmLeadPriority],
            },
          ]),
      ...(!state.className
        ? []
        : [
            {
              column: 'desiredClassName',
              type: 'contains',
              value: state.className,
              valueType: 'string',
              label: 'Target Class',
              displayValue: state.className,
            },
          ]),
      ...(state.routeType == null
        ? []
        : [
            {
              column: 'intendedRouteType',
              type: 'equals',
              value: state.routeType,
              valueType: 'enum',
              label: 'Admission Pathway',
              displayValue: routeTypeLabel(state.routeType),
            },
          ]),
      ...(!resolvedOwner
        ? []
        : [
            {
              column: 'ownerUserId',
              type: 'equals',
              value: resolvedOwner,
              valueType: 'enum',
              label: 'Owner',
              displayValue: staffById.get(resolvedOwner) || 'Assigned staff',
            },
          ]),
    ],
    [
      resolvedOwner,
      staffById,
      state.channel,
      state.className,
      state.priority,
      state.routeType,
      state.stage,
    ]
  );

  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'selection',
        label: '',
        width: 56,
        minWidth: 56,
        maxWidth: 56,
        sticky: true,
        stickyPosition: 'left',
        stickyOnMobile: false,
        isSort: false,
        isFilter: false,
        excludeFromExport: true,
        headerSx: {
          px: 0,
          '& .column-separator': { display: 'none' },
          '& > div': { justifyContent: 'center' },
        },
        cellSx: { px: 0, textAlign: 'center' },
        renderColumn: () => (
          <Checkbox
            checked={leads.length > 0 && leads.every((lead) => selectedLeadSet.has(lead.id))}
            indeterminate={
              selectedLeadIds.length > 0 && !leads.every((lead) => selectedLeadSet.has(lead.id))
            }
            onChange={(_, checked) =>
              setSelectedLeadIds(checked ? leads.map((lead) => lead.id) : [])
            }
            inputProps={{ 'aria-label': 'Select visible inquiry leads' }}
            size="small"
          />
        ),
        render: (_value, row) => {
          const lead = row as AdmissionCrmLeadDto;
          return (
            <Checkbox
              checked={selectedLeadSet.has(lead.id)}
              onClick={(event) => event.stopPropagation()}
              onChange={() =>
                setSelectedLeadIds((current) =>
                  current.includes(lead.id)
                    ? current.filter((id) => id !== lead.id)
                    : [...current, lead.id]
                )
              }
              inputProps={{ 'aria-label': `Select ${getAdmissionCrmLeadName(lead)}` }}
              size="small"
            />
          );
        },
      },
      {
        id: 'applicant',
        originalId: 'ApplicantName',
        label: 'Applicant',
        width: 250,
        minWidth: 220,
        sticky: true,
        stickyPosition: 'left',
        stickyOnMobile: false,
        filterType: 'string',
        render: (_value, row) => {
          const lead = row as AdmissionCrmLeadDto;
          return (
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Link
                {...createApplicantLinkNavigationProps({
                  href: getApplicantHref(lead.id, 'overview'),
                  onOpen: () => openApplicant(lead.id, 'overview'),
                })}
                variant="subtitle2"
                color="inherit"
                underline="hover"
                noWrap
                sx={{ textAlign: 'left' }}
              >
                {getAdmissionCrmLeadName(lead)}
              </Link>
              <Typography variant="caption" color="text.secondary" noWrap>
                {lead.primaryContactNo || lead.email || 'No contact'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        id: 'stage',
        label: 'Stage',
        width: 155,
        minWidth: 145,
        filterType: 'enum',
        enumOptions: stages.map((stage) => ({
          value: stage.systemStage,
          label: stage.stageName,
        })),
        render: (value) => {
          const stage = stages.find((item) => item.systemStage === value);
          if (!stage) return <AdmissionCrmStageChip stage={value as AdmissionInquiryStage} />;
          return (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <AdmissionCrmStageChip stage={stage.systemStage} />
              <Tooltip
                arrow
                title={
                  <Stack spacing={0.25}>
                    {getAdmissionCrmStageTooltipLines(stage).map((line) => (
                      <Typography key={line} variant="caption" color="inherit">
                        {line}
                      </Typography>
                    ))}
                  </Stack>
                }
              >
                <IconButton size="small" aria-label={`${stage.stageName} stage details`}>
                  <InfoOutlined fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
      {
        id: 'registrationFormNumber',
        label: 'Registration',
        width: 180,
        minWidth: 165,
        defaultHidden: true,
        filterType: 'string',
        render: (_value, row) => {
          const lead = row as AdmissionCrmLeadDto;
          return (
            <Chip
              size="small"
              variant="outlined"
              color="default"
              sx={
                isRegistrationIssued(lead)
                  ? (theme) => ({
                      color: theme.palette.text.primary,
                      borderColor: theme.palette.success.main,
                    })
                  : undefined
              }
              label={
                lead.registrationFormNumber
                  ? `Issued · ${lead.registrationFormNumber}`
                  : isRegistrationIssued(lead)
                    ? 'Issued'
                    : 'Not issued'
              }
            />
          );
        },
      },
      {
        id: 'channel',
        label: 'Channel',
        width: 155,
        minWidth: 140,
        defaultHidden: true,
        filterType: 'enum',
        enumOptions: channels.map((channel) => ({
          value: channel,
          label: getAdmissionCrmChannelLabel(channel),
        })),
        render: (value) => getAdmissionCrmChannelLabel(value as AdmissionInquiryChannel),
      },
      {
        id: 'desiredClassName',
        label: 'Target Class',
        width: 220,
        minWidth: 180,
        isFilter: true,
        render: (value) => value || 'Placement missing',
      },
      {
        id: 'intendedRouteType',
        label: 'Admission Pathway',
        width: 190,
        minWidth: 170,
        defaultHidden: true,
        filterType: 'enum',
        enumOptions: routeTypes.map((routeType) => ({
          value: routeType,
          label: routeTypeLabel(routeType),
        })),
        render: (value, row) => {
          const lead = row as AdmissionCrmLeadDto;
          const routeName = lead.intendedRouteNameSnapshot?.trim();
          const routeLabel =
            routeName ||
            (value == null ? lead.admissionIntent : routeTypeLabel(value as AdmissionCrmRouteType));
          return (
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap title={routeLabel}>
                {routeLabel}
              </Typography>
              {routeName && lead.intendedRouteDefinitionVersion != null ? (
                <Typography variant="caption" color="text.secondary">
                  Version {lead.intendedRouteDefinitionVersion}
                </Typography>
              ) : null}
            </Stack>
          );
        },
      },
      {
        id: 'ownerUserId',
        label: 'Owner',
        width: 170,
        minWidth: 150,
        filterType: 'enum',
        enumOptions: ownerFilterOptions,
        render: (_value, row) => ownerName(row as AdmissionCrmLeadDto),
      },
      {
        id: 'priority',
        label: 'Priority',
        width: 125,
        minWidth: 115,
        filterType: 'enum',
        enumOptions: priorities.map((priority) => ({
          value: priority,
          label: priorityLabels[priority],
        })),
        render: (value) => priorityLabels[value as AdmissionCrmLeadPriority],
      },
      {
        id: 'leadScore',
        label: 'Score',
        width: 90,
        minWidth: 80,
        defaultHidden: true,
        align: 'right',
        isFilter: false,
      },
      {
        id: 'lastActivityTime',
        label: 'Last Activity',
        width: 150,
        minWidth: 140,
        filterType: 'date',
        render: (value) => formatEnrollmentDate(value, true),
      },
      {
        id: 'actions',
        label: 'Actions',
        ...enrollmentActionsColumn,
        isSort: false,
        isFilter: false,
        render: (_value, row) => {
          const lead = row as AdmissionCrmLeadDto;
          const canSchedule =
            entranceExamRequired &&
            hasGrantedPermission(permissions, actionPermissions.scheduleExam) &&
            isExamReady(lead) &&
            !isExamAlreadyScheduled(lead) &&
            (!registrationRequiredBeforeExam || isRegistrationIssued(lead));
          const canManageRegistration =
            hasGrantedPermission(permissions, actionPermissions.issueRegistrationForm) &&
            canOpenRegistration(lead, registrationRequiredBeforeExam);
          return (
            <ThreeDotsActions
              placement="right-top"
              showViewIcon
              viewLabel="Open Applicant"
              handleViewClick={() => openApplicant(lead.id, 'overview')}
              showThreeDots={canSchedule || canManageRegistration}
              actions={({ popover }) => (
                <MenuList>
                  {canSchedule && (
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        setScheduleLead(lead);
                      }}
                    >
                      <EventRounded fontSize="small" />
                      Schedule Exam
                    </MenuItem>
                  )}
                  {canManageRegistration && (
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        openApplicant(lead.id, 'registration');
                      }}
                    >
                      <ReceiptLongRounded fontSize="small" />
                      Open Registration
                    </MenuItem>
                  )}
                </MenuList>
              )}
            />
          );
        },
      },
    ],
    [
      leads,
      getApplicantHref,
      openApplicant,
      ownerFilterOptions,
      ownerName,
      permissions,
      entranceExamRequired,
      registrationRequiredBeforeExam,
      selectedLeadIds.length,
      selectedLeadSet,
      stages,
    ]
  );

  const resetQuickInquiry = () => {
    setQuickForm(emptyQuickInquiry);
    setDuplicateMatches([]);
    setDuplicateReviewed(false);
    setQuickFormSubmitted(false);
    setQuickEmailTouched(false);
    setShowOptionalQuickInquiryFields(false);
  };

  const closeQuickInquiry = () => {
    setQuickDialogOpen(false);
    resetQuickInquiry();
  };

  const handleCreateInquiry = async () => {
    if (!academicYearId) return;
    setQuickFormSubmitted(true);
    setQuickEmailTouched(true);

    const contactMissing = !quickForm.primaryContactNo.trim() && !quickForm.email.trim();
    const emailInvalid = !isValidQuickInquiryEmail(quickForm.email);
    const optionConfigurationUnavailable =
      quickInquiryOptionsLoading ||
      quickInquiryOptionsQuery.isError ||
      quickInquiryOptionsMissing ||
      !quickInquiryOptionsQuery.data?.isAdmissionCycleActive;

    const firstInvalidInput = [
      !quickForm.firstName.trim() ? firstNameInputRef : null,
      emailInvalid ? emailInputRef : null,
      contactMissing ? contactInputRef : null,
      !quickForm.mediumStageId ? mediumStageInputRef : null,
      !quickForm.targetStandardId ? targetStandardInputRef : null,
      !selectedQuickInquiryRoute ? routeInputRef : null,
      quickForm.channel === '' ? channelInputRef : null,
    ].find((input) => input !== null);

    if (firstInvalidInput || optionConfigurationUnavailable) {
      firstInvalidInput?.current?.focus();
      return;
    }

    const selectedStandard = standardOptions.find((item) => item.id === quickForm.targetStandardId);
    if (!selectedStandard || !selectedQuickInquiryRoute || quickForm.channel === '') return;

    const body: CreateAdmissionCrmLeadDto = {
      channel: quickForm.channel,
      campaignName: quickForm.campaignName.trim() || undefined,
      firstName: quickForm.firstName.trim(),
      middleName: quickForm.middleName.trim() || undefined,
      lastName: quickForm.lastName.trim() || undefined,
      parentGuardianName: quickForm.parentGuardianName.trim() || undefined,
      primaryContactNo: quickForm.primaryContactNo.trim() || undefined,
      email: quickForm.email.trim() || undefined,
      admissionIntent: quickForm.admissionIntent.trim() || selectedQuickInquiryRoute.label,
      intendedRouteDefinitionId: selectedQuickInquiryRoute.id,
      intendedRouteType: selectedQuickInquiryRoute.routeType,
      targetStandardId: selectedStandard.id,
      academicBoardId,
      academicMediumId,
      academicMediumStageId: quickForm.mediumStageId,
      desiredClassName: selectedStandard.name,
      notes: quickForm.notes.trim() || undefined,
      duplicateContinueReason: quickForm.duplicateContinueReason.trim() || undefined,
    };
    try {
      if (!duplicateReviewed) {
        const duplicates = await previewDuplicates({ academicYearId, body }).unwrap();
        setDuplicateMatches(duplicates);
        setDuplicateReviewed(true);
        if (duplicates.length) return;
      }
      if (duplicateMatches.length && !quickForm.duplicateContinueReason.trim()) {
        duplicateReasonInputRef.current?.focus();
        return;
      }
      const created = await createLead({ academicYearId, body }).unwrap();
      closeQuickInquiry();
      openApplicant(created.id);
      shikshaMitraToast.success({ message: 'Inquiry created.' });
    } catch {
      shikshaMitraToast.error({
        message: 'The inquiry could not be created. Review the fields and retry.',
      });
    }
  };

  const handleScheduleExam = async () => {
    if (!scheduleLead || !selectedSlotId) return;
    if (overrideCapacity && !capacityOverrideReason.trim()) {
      shikshaMitraToast.error({ message: 'Enter a reason for the capacity override.' });
      return;
    }
    try {
      await scheduleExam({
        leadId: scheduleLead.id,
        body: {
          entranceExamSlotId: selectedSlotId,
          overrideCapacity,
          capacityOverrideReason: overrideCapacity ? capacityOverrideReason.trim() : undefined,
        },
      }).unwrap();
      setScheduleLead(null);
      setSelectedSlotId('');
      setOverrideCapacity(false);
      setCapacityOverrideReason('');
      shikshaMitraToast.success({ message: 'Entrance exam scheduled.' });
    } catch {
      shikshaMitraToast.error({
        message: 'The exam could not be scheduled. Check readiness and slot capacity.',
      });
    }
  };

  const handleBulkAction = async () => {
    if (!academicYearId || !bulkAction || !selectedLeadIds.length) return;
    try {
      if (bulkAction === 'owner') {
        await bulkAssignOwners({
          academicYearId,
          items: selectedLeadIds.map((leadId) => ({ leadId, ownerUserId: bulkOwner?.id || null })),
        }).unwrap();
      }
      if (bulkAction === 'task') {
        if (!bulkTitle.trim()) throw new Error('Task title is required.');
        await bulkCreateTasks({
          academicYearId,
          leadIds: selectedLeadIds,
          title: bulkTitle.trim(),
          dueAt: dayjs(bulkDueAt).toISOString(),
          assignedUserId: bulkOwner?.id,
        }).unwrap();
      }
      if (bulkAction === 'stage') {
        if (!bulkReason.trim()) throw new Error('Reason is required.');
        if (protectedSelectedLeads.length && !overrideProtectedStages) {
          throw new Error('Remove protected applicants or choose override with a reason.');
        }
        const result = await bulkChangeStages({
          academicYearId,
          leadIds: selectedLeadIds,
          stage: bulkStage,
          reason: bulkReason.trim(),
          overrideProtectedStages,
        }).unwrap();
        if (result.failedCount > 0) {
          shikshaMitraToast.warning({
            message: `${result.succeededCount} stage changes completed; ${result.failedCount} failed.`,
          });
        } else {
          shikshaMitraToast.success({ message: 'Bulk stage change completed.' });
        }
      }
      if (bulkAction === 'archive') {
        if (!bulkReason.trim()) throw new Error('Reason is required.');
        await bulkArchiveLeads({
          academicYearId,
          leadIds: selectedLeadIds,
          reason: bulkReason.trim(),
        }).unwrap();
      }
      setBulkAction(null);
      setBulkReason('');
      setBulkTitle('');
      setOverrideProtectedStages(false);
      setSelectedLeadIds([]);
      if (bulkAction !== 'stage') {
        shikshaMitraToast.success({ message: 'Bulk action completed.' });
      }
    } catch (error) {
      shikshaMitraToast.error({
        message: error instanceof Error ? error.message : 'The bulk action could not be completed.',
      });
    }
  };

  if (!academicYearId) {
    return (
      <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
        <EnrollmentWorkspaceHeader
          title="Admissions Pipeline"
          description="Capture, qualify, assign, and progress inquiries through exam readiness."
        />
        <Alert severity="info">Select an academic year to open the Admissions Pipeline.</Alert>
      </Stack>
    );
  }

  const renderLeadCard = (lead: AdmissionCrmLeadDto) => (
    <PipelineLeadCard
      key={lead.id}
      lead={lead}
      ownerName={ownerName(lead)}
      selected={selectedLeadSet.has(lead.id)}
      showSelection={state.view === 'list'}
      canScheduleExam={
        entranceExamRequired &&
        can(actionPermissions.scheduleExam) &&
        !isExamAlreadyScheduled(lead) &&
        (!registrationRequiredBeforeExam || isRegistrationIssued(lead))
      }
      canManageRegistration={
        can(actionPermissions.issueRegistrationForm) &&
        canOpenRegistration(lead, registrationRequiredBeforeExam)
      }
      onSelect={() =>
        setSelectedLeadIds((current) =>
          current.includes(lead.id) ? current.filter((id) => id !== lead.id) : [...current, lead.id]
        )
      }
      onOpen={() => openApplicant(lead.id)}
      onSchedule={() => setScheduleLead(lead)}
      onOpenRegistration={() => openApplicant(lead.id, 'registration')}
    />
  );

  const quickInquiryContactMissing = !quickForm.primaryContactNo.trim() && !quickForm.email.trim();
  const quickInquiryEmailInvalid = !isValidQuickInquiryEmail(quickForm.email);
  const showQuickInquiryContactError = quickFormSubmitted && quickInquiryContactMissing;
  const showQuickInquiryEmailError =
    quickInquiryEmailInvalid && (quickEmailTouched || quickFormSubmitted);
  const quickInquiryOptionsUnavailable =
    quickInquiryOptionsLoading ||
    quickInquiryOptionsQuery.isError ||
    quickInquiryOptionsMissing ||
    quickInquiryOptionsQuery.data?.isAdmissionCycleActive === false ||
    !quickInquiryOptionsQuery.data;

  return (
    <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
      <EnrollmentWorkspaceHeader
        title="Admissions Pipeline"
        description="Capture, qualify, assign, and progress inquiries through exam readiness."
        actions={
          <Stack direction="row" alignItems="center" gap={1}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={state.view || 'list'}
              onChange={(_, value) =>
                value &&
                updateState(
                  { view: value, owner: value === 'board' ? undefined : state.owner, page: 1 },
                  'push'
                )
              }
              aria-label="Pipeline view"
            >
              <ToggleButton value="board" aria-label="Board view">
                <ViewColumnRounded />
              </ToggleButton>
              <ToggleButton value="list" aria-label="List view">
                <FormatListBulletedRounded />
              </ToggleButton>
            </ToggleButtonGroup>
            {can(actionPermissions.add) ? (
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={() => setQuickDialogOpen(true)}
              >
                Quick Inquiry
              </Button>
            ) : null}
          </Stack>
        }
      />

      {state.view === 'board' ? (
        <EnrollmentWorkspaceFilterPanel
          columns={{ xs: 1, sm: 2, lg: 4 }}
          onClear={() => {
            setSearch('');
            setDebouncedSearch('');
            updateState({
              stage: undefined,
              channel: undefined,
              priority: undefined,
              page: 1,
            });
          }}
          clearDisabled={
            state.stage == null && state.channel == null && state.priority == null && !search
          }
          actions={
            <Stack direction="row" gap={0.75} flexWrap="wrap" justifyContent="flex-end">
              <ToggleButtonGroup
                exclusive
                size="small"
                value={stageGroup}
                onChange={(_, value: PipelineStageGroup | null) =>
                  value && updateState({ stageGroup: value, stage: undefined, page: 1 }, 'push')
                }
                aria-label="Pipeline stage group"
              >
                <ToggleButton value="active">Active</ToggleButton>
                <ToggleButton value="decision">Decision</ToggleButton>
                <ToggleButton value="closed">Closed</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          }
        >
          <>
            <TextField
              size="small"
              label="Search applicants"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                updateState({ page: 1 }, 'replace');
              }}
              autoComplete="off"
            />
            <TextField
              select
              size="small"
              label="Stage"
              value={stageSelectValue}
              onChange={(event) =>
                updateState({
                  stage: event.target.value === '' ? undefined : Number(event.target.value),
                  page: 1,
                })
              }
            >
              <MenuItem value="">All stages</MenuItem>
              {stages.map((stageItem) => (
                <MenuItem key={stageItem.id} value={stageItem.systemStage}>
                  {stageItem.stageName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Channel"
              value={state.channel ?? ''}
              onChange={(event) =>
                updateState({
                  channel: event.target.value === '' ? undefined : Number(event.target.value),
                  page: 1,
                })
              }
            >
              <MenuItem value="">All channels</MenuItem>
              {channels.map((channel) => (
                <MenuItem key={channel} value={channel}>
                  {getAdmissionCrmChannelLabel(channel)}
                </MenuItem>
              ))}
            </TextField>
          </>
          <TextField
            select
            size="small"
            label="Priority"
            value={state.priority ?? ''}
            onChange={(event) =>
              updateState({
                priority: event.target.value === '' ? undefined : Number(event.target.value),
                page: 1,
              })
            }
          >
            <MenuItem value="">All priorities</MenuItem>
            {priorities.map((priority) => (
              <MenuItem key={priority} value={priority}>
                {priorityLabels[priority]}
              </MenuItem>
            ))}
          </TextField>
        </EnrollmentWorkspaceFilterPanel>
      ) : null}

      {selectedLeadIds.length > 0 && (
        <Paper
          variant="outlined"
          role="region"
          aria-label="Bulk inquiry actions"
          sx={{ p: 1, position: 'sticky', top: 8, zIndex: 2, borderRadius: 1 }}
        >
          <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
            <Chip label={`${selectedLeadIds.length} selected`} color="primary" />
            {can(actionPermissions.assignOwner) && (
              <Button size="small" onClick={() => setBulkAction('owner')}>
                Assign Owner
              </Button>
            )}
            {can(actionPermissions.manageTasks) && (
              <Button size="small" onClick={() => setBulkAction('task')}>
                Create Task
              </Button>
            )}
            {can(actionPermissions.changeStage) && (
              <Button size="small" onClick={() => setBulkAction('stage')}>
                Move Stage
              </Button>
            )}
            {can(actionPermissions.archiveReopen) && (
              <Button size="small" color="warning" onClick={() => setBulkAction('archive')}>
                Archive
              </Button>
            )}
          </Stack>
        </Paper>
      )}

      {stagesQuery.isFetching && <LinearProgress aria-label="Loading pipeline stages" />}
      {stagesQuery.isError && (
        <EnrollmentWorkspaceErrorState
          message="Pipeline stages are unavailable. Review Enrollment configuration before continuing."
          onRetry={() => stagesQuery.refetch()}
        />
      )}

      {state.view === 'board' &&
        !stagesQuery.isError &&
        (visibleBoardStages.length ? (
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={1.25}
            alignItems="stretch"
            sx={{
              flex: 1,
              minHeight: 0,
              overflowX: { lg: 'auto' },
              overflowY: { xs: 'auto', lg: 'hidden' },
              pb: 1,
            }}
          >
            {visibleBoardStages.map((stageItem) => (
              <PipelineStageColumn
                key={stageItem.id}
                academicYearId={academicYearId}
                stage={stageItem}
                query={{
                  filterText: debouncedSearch || undefined,
                  channel: state.channel,
                  campaignName: state.campaign,
                  priority: state.priority,
                }}
                resetKey={`${state.channel}-${state.campaign}-${state.priority}-${debouncedSearch}`}
                clientFilter={() => true}
                renderLead={renderLeadCard}
              />
            ))}
          </Stack>
        ) : (
          <Alert severity="info">
            No enabled stages are configured for this pipeline group. Review Journey settings.
          </Alert>
        ))}

      {(state.view || 'list') === 'list' &&
        (leadsQuery.isError ? (
          <EnrollmentWorkspaceErrorState
            message="Inquiry leads are unavailable."
            onRetry={() => leadsQuery.refetch()}
          />
        ) : (
          <>
            <CustomizableTable
              tableId="student-enrollment-pipeline"
              tableTitle="Admissions Pipeline"
              columns={columns}
              data={leads}
              isLoading={leadsQuery.isLoading}
              serverSide
              serverSidePagination
              serverSideSearch
              serverSideSort
              serverSideFilter
              searchTerm={search}
              defaultSearchTerm={search}
              searchFieldProps={{
                placeholder: 'Search applicants',
                inputProps: { 'aria-label': 'Search applicants' },
              }}
              filters={[...tableFilters, ...columnFilters]}
              totalCount={leadsQuery.data?.totalCount || 0}
              page={page}
              rowsPerPage={pageSize}
              defaultRowsPerPage={pageSize}
              rowsPerPageOptions={[pageSize]}
              onSearchInputChange={(value) => {
                setSearch(value);
                setSelectedLeadIds([]);
                if (state.page !== 1) {
                  updateState({ page: 1 }, 'replace');
                }
              }}
              onServerSearch={(value) => {
                setDebouncedSearch(value.trim());
                setSelectedLeadIds([]);
              }}
              onServerPagination={(nextPage) => updateState({ page: nextPage }, 'push')}
              onServerSort={(_column, sorts) => {
                const sort = sorts[0];
                updateState(
                  {
                    sorting: sort
                      ? `${sort.originalId || sort.column} ${sort.direction}`
                      : undefined,
                    page: 1,
                  },
                  'push'
                );
              }}
              onServerFilter={(filters) => {
                const stateColumns = new Set([
                  'stage',
                  'channel',
                  'priority',
                  'intendedRouteType',
                  'desiredClassName',
                  'ownerUserId',
                ]);
                setSelectedLeadIds([]);
                setColumnFilters(filters.filter((filter) => !stateColumns.has(filter.column)));
                updateState(
                  {
                    stage: getLatestEnumFilter(filters, 'stage'),
                    channel: getLatestEnumFilter(filters, 'channel'),
                    priority: getLatestEnumFilter(filters, 'priority'),
                    routeType: getLatestEnumFilter(filters, 'intendedRouteType'),
                    className: getLatestStringFilter(filters, 'desiredClassName'),
                    owner: getLatestStringFilter(filters, 'ownerUserId'),
                    page: 1,
                  },
                  'push'
                );
              }}
              noDataText={
                <EnrollmentTableEmptyState
                  title="No applicants in this cycle view"
                  description="Create a real inquiry for this admission cycle or clear filters to show existing applicants."
                />
              }
              rowProps={(row) => ({
                ...createApplicantRowNavigationProps({
                  applicantName: getAdmissionCrmLeadName(row as AdmissionCrmLeadDto),
                  onOpen: () => openApplicant((row as AdmissionCrmLeadDto).id, 'overview'),
                }),
                'data-testid': 'student-enrollment-pipeline-row',
                'data-lead-id': row.id,
              })}
              wrapperProps={{ sx: enrollmentTableWrapperSx }}
              tableContainerProps={{ sx: enrollmentTableContainerSx }}
            />
            {showEmptyPipeline ? (
              <Alert severity="info">
                No applicants in this cycle view. Create a real inquiry for this admission cycle or
                clear filters to show existing applicants.
              </Alert>
            ) : null}
          </>
        ))}

      <Dialog open={quickDialogOpen} onClose={closeQuickInquiry} fullWidth maxWidth="md">
        <DialogTitle>Quick Inquiry</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info">
              New inquiries start in the New Inquiry stage. The selected academic context determines
              the available academic stages and classes.
            </Alert>
            <Paper variant="outlined" sx={{ p: 1.25 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Academic year
                  </Typography>
                  <Typography variant="body2">
                    {academicYearName || 'Selected academic year'}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Board
                  </Typography>
                  <Typography variant="body2">{academicBoardName || 'Selected board'}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Medium
                  </Typography>
                  <Typography variant="body2">{academicMediumName || 'Selected medium'}</Typography>
                </Box>
              </Stack>
            </Paper>

            {quickInquiryOptionsLoading && <LinearProgress aria-label="Loading inquiry options" />}
            {quickInquiryOptionsQuery.isError && (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => quickInquiryOptionsQuery.refetch()}
                  >
                    Retry
                  </Button>
                }
              >
                Inquiry channels and admission pathways could not be loaded.
              </Alert>
            )}
            {quickInquiryOptionsMissing && (
              <Alert severity="warning">
                Quick inquiry needs at least one active inquiry channel and one published admission
                pathway. Ask an administrator to update Enrollment Settings.
              </Alert>
            )}
            {quickInquiryOptionsQuery.data?.isAdmissionCycleActive === false && (
              <Alert severity="warning">
                Quick inquiry is unavailable because the admission cycle is not active.
              </Alert>
            )}
            {organizationOptionsQuery.isError && (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => organizationOptionsQuery.refetch()}
                  >
                    Retry
                  </Button>
                }
              >
                Academic stages could not be loaded for the selected board and medium.
              </Alert>
            )}
            {!organizationOptionsQuery.isFetching &&
              organizationOptionsQuery.data &&
              !mediumStages.length && (
                <Alert severity="warning">
                  No academic stages are configured for the selected board and medium.
                </Alert>
              )}
            {quickForm.mediumStageId && standardOptionsQuery.isError && (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => standardOptionsQuery.refetch()}
                  >
                    Retry
                  </Button>
                }
              >
                Classes could not be loaded for the selected academic stage.
              </Alert>
            )}

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Student details
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                <TextField
                  required
                  fullWidth
                  inputRef={firstNameInputRef}
                  name="firstName"
                  autoComplete="given-name"
                  label="First name"
                  value={quickForm.firstName}
                  error={quickFormSubmitted && !quickForm.firstName.trim()}
                  helperText={
                    quickFormSubmitted && !quickForm.firstName.trim()
                      ? 'Enter the student’s first name.'
                      : undefined
                  }
                  onChange={(event) => {
                    setQuickForm((current) => ({ ...current, firstName: event.target.value }));
                    setDuplicateReviewed(false);
                  }}
                />
                <TextField
                  fullWidth
                  name="middleName"
                  autoComplete="additional-name"
                  label="Middle name (optional)"
                  value={quickForm.middleName}
                  onChange={(event) => {
                    setQuickForm((current) => ({ ...current, middleName: event.target.value }));
                    setDuplicateReviewed(false);
                  }}
                />
                <TextField
                  fullWidth
                  name="lastName"
                  autoComplete="family-name"
                  label="Last name (optional)"
                  value={quickForm.lastName}
                  onChange={(event) => {
                    setQuickForm((current) => ({ ...current, lastName: event.target.value }));
                    setDuplicateReviewed(false);
                  }}
                />
              </Stack>
              <FormHelperText>
                Keep middle and last names separate so registration can reuse them without asking
                the family again. They remain optional for students with a single name.
              </FormHelperText>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Family contact
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                <TextField
                  fullWidth
                  name="parentGuardianName"
                  autoComplete="name"
                  label="Parent or guardian"
                  value={quickForm.parentGuardianName}
                  onChange={(event) => {
                    setQuickForm((current) => ({
                      ...current,
                      parentGuardianName: event.target.value,
                    }));
                    setDuplicateReviewed(false);
                  }}
                />
                <TextField
                  fullWidth
                  inputRef={contactInputRef}
                  name="primaryContactNo"
                  label="Contact number"
                  type="tel"
                  autoComplete="tel"
                  value={quickForm.primaryContactNo}
                  error={showQuickInquiryContactError}
                  helperText={
                    showQuickInquiryContactError
                      ? 'Add a contact number or email address.'
                      : 'Provide at least one way to contact the family.'
                  }
                  slotProps={{ htmlInput: { inputMode: 'tel' } }}
                  onChange={(event) => {
                    setQuickForm((current) => ({
                      ...current,
                      primaryContactNo: event.target.value,
                    }));
                    setDuplicateReviewed(false);
                  }}
                />
                <TextField
                  fullWidth
                  inputRef={emailInputRef}
                  name="email"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={quickForm.email}
                  error={showQuickInquiryEmailError || showQuickInquiryContactError}
                  helperText={
                    showQuickInquiryEmailError
                      ? 'Enter a valid email address, for example parent@example.com.'
                      : showQuickInquiryContactError
                        ? 'Add an email address or contact number.'
                        : 'Optional when a contact number is provided.'
                  }
                  InputProps={{
                    startAdornment: <InputAdornment position="start">@</InputAdornment>,
                  }}
                  onBlur={() => setQuickEmailTouched(true)}
                  onChange={(event) => {
                    setQuickForm((current) => ({ ...current, email: event.target.value }));
                    setDuplicateReviewed(false);
                  }}
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Admission context
              </Typography>
              <Stack spacing={1}>
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                  <TextField
                    required
                    select
                    fullWidth
                    inputRef={mediumStageInputRef}
                    name="mediumStageId"
                    label="Academic stage"
                    value={quickForm.mediumStageId}
                    disabled={organizationOptionsQuery.isFetching}
                    error={quickFormSubmitted && !quickForm.mediumStageId}
                    helperText={
                      quickFormSubmitted && !quickForm.mediumStageId
                        ? 'Select the student’s academic stage.'
                        : 'Derived from the selected board and medium.'
                    }
                    onChange={(event) => {
                      setQuickForm((current) => ({
                        ...current,
                        mediumStageId: event.target.value,
                        targetStandardId: '',
                      }));
                      setDuplicateReviewed(false);
                    }}
                  >
                    {mediumStages.map((stage) => (
                      <MenuItem key={stage.id} value={stage.id}>
                        {stage.stageName || stage.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    required
                    select
                    fullWidth
                    inputRef={targetStandardInputRef}
                    name="targetStandardId"
                    label="Target class"
                    value={quickForm.targetStandardId}
                    disabled={!quickForm.mediumStageId || standardOptionsQuery.isFetching}
                    error={quickFormSubmitted && !quickForm.targetStandardId}
                    helperText={
                      quickFormSubmitted && !quickForm.targetStandardId
                        ? 'Select the student’s target class.'
                        : 'Available within the selected academic stage.'
                    }
                    onChange={(event) => {
                      setQuickForm((current) => ({
                        ...current,
                        targetStandardId: event.target.value,
                      }));
                      setDuplicateReviewed(false);
                    }}
                  >
                    {standardOptions.map((standard) => (
                      <MenuItem key={standard.id} value={standard.id}>
                        {standard.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                  <TextField
                    required
                    select
                    fullWidth
                    inputRef={routeInputRef}
                    name="intendedRouteDefinitionId"
                    label="Admission pathway"
                    value={quickForm.intendedRouteDefinitionId}
                    disabled={quickInquiryOptionsUnavailable}
                    error={quickFormSubmitted && !selectedQuickInquiryRoute}
                    helperText={
                      quickFormSubmitted && !selectedQuickInquiryRoute
                        ? 'Select a configured admission pathway.'
                        : selectedQuickInquiryRoute
                          ? `Published pathway version ${selectedQuickInquiryRoute.version}.`
                          : 'Loaded from the active enrollment configuration.'
                    }
                    onChange={(event) => {
                      setQuickForm((current) => ({
                        ...current,
                        intendedRouteDefinitionId: event.target.value,
                      }));
                      setDuplicateReviewed(false);
                    }}
                  >
                    {quickInquiryOptions.routes.map((route) => (
                      <MenuItem key={route.id} value={route.id}>
                        {route.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    required
                    select
                    fullWidth
                    inputRef={channelInputRef}
                    name="channel"
                    label="Inquiry channel"
                    value={quickForm.channel}
                    disabled={quickInquiryOptionsUnavailable}
                    error={quickFormSubmitted && quickForm.channel === ''}
                    helperText={
                      quickFormSubmitted && quickForm.channel === ''
                        ? 'Select an active inquiry channel.'
                        : 'Only channels enabled for this admission cycle are shown.'
                    }
                    onChange={(event) => {
                      setQuickForm((current) => ({
                        ...current,
                        channel:
                          event.target.value === ''
                            ? ''
                            : (Number(event.target.value) as AdmissionInquiryChannel),
                      }));
                    }}
                  >
                    {quickInquiryOptions.channels.map((channel) => (
                      <MenuItem key={channel.value} value={channel.value}>
                        {channel.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Stack>
            </Box>

            <Box>
              <Button
                size="small"
                onClick={() => setShowOptionalQuickInquiryFields((current) => !current)}
                aria-expanded={showOptionalQuickInquiryFields}
                aria-controls="quick-inquiry-optional-fields"
              >
                {showOptionalQuickInquiryFields ? 'Hide optional details' : 'Add optional details'}
              </Button>
              <Collapse in={showOptionalQuickInquiryFields}>
                <Stack id="quick-inquiry-optional-fields" spacing={1} sx={{ pt: 1 }}>
                  <TextField
                    name="admissionIntent"
                    label="Intent notes"
                    value={quickForm.admissionIntent}
                    onChange={(event) => {
                      setQuickForm((current) => ({
                        ...current,
                        admissionIntent: event.target.value,
                      }));
                      setDuplicateReviewed(false);
                    }}
                    helperText="Optional context beyond the selected admission pathway."
                  />
                  <TextField
                    name="campaignName"
                    label="Campaign"
                    value={quickForm.campaignName}
                    onChange={(event) =>
                      setQuickForm((current) => ({
                        ...current,
                        campaignName: event.target.value,
                      }))
                    }
                  />
                  <TextField
                    name="notes"
                    label="Internal notes"
                    value={quickForm.notes}
                    onChange={(event) =>
                      setQuickForm((current) => ({ ...current, notes: event.target.value }))
                    }
                    multiline
                    minRows={2}
                  />
                </Stack>
              </Collapse>
            </Box>

            {duplicateMatches.length > 0 && (
              <Alert severity="warning">
                {duplicateMatches.length} likely duplicate inquiry record
                {duplicateMatches.length === 1 ? '' : 's'} found. Review them from the applicant
                workspace after creation or cancel this entry.
              </Alert>
            )}
            {duplicateMatches.length > 0 && (
              <TextField
                required
                fullWidth
                inputRef={duplicateReasonInputRef}
                name="duplicateContinueReason"
                label="Reason to continue"
                value={quickForm.duplicateContinueReason}
                error={quickFormSubmitted && !quickForm.duplicateContinueReason.trim()}
                helperText={
                  quickFormSubmitted && !quickForm.duplicateContinueReason.trim()
                    ? 'Explain why this possible duplicate should be created.'
                    : 'This reason is stored for audit review.'
                }
                onChange={(event) =>
                  setQuickForm((current) => ({
                    ...current,
                    duplicateContinueReason: event.target.value,
                  }))
                }
                multiline
                minRows={2}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeQuickInquiry}
            disabled={createLeadState.isLoading || previewDuplicatesState.isLoading}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            loading={createLeadState.isLoading || previewDuplicatesState.isLoading}
            disabled={quickInquiryOptionsUnavailable}
            onClick={handleCreateInquiry}
          >
            {duplicateReviewed && duplicateMatches.length ? 'Create Anyway' : 'Create Inquiry'}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(scheduleLead)}
        onClose={() => setScheduleLead(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Schedule Entrance Exam</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            {scheduleLead && (
              <Alert severity="info">
                {getAdmissionCrmLeadName(scheduleLead)} ·{' '}
                {scheduleLead.desiredClassName || 'Class not captured'}
              </Alert>
            )}
            <FormControl fullWidth>
              <InputLabel id="pipeline-exam-slot-label">Exam slot</InputLabel>
              <Select
                labelId="pipeline-exam-slot-label"
                label="Exam slot"
                value={selectedSlotId}
                disabled={isExamSlotsLoading}
                onChange={(event) => setSelectedSlotId(event.target.value)}
              >
                {isExamSlotsLoading && (
                  <MenuItem disabled value="">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">Loading exam slots...</Typography>
                    </Stack>
                  </MenuItem>
                )}
                {!isExamSlotsLoading && slotsQuery.isError && (
                  <MenuItem disabled value="">
                    Exam slots could not be loaded
                  </MenuItem>
                )}
                {!isExamSlotsLoading && !slotsQuery.isError && !activeExamSlots.length && (
                  <MenuItem disabled value="">
                    No active exam slots available
                  </MenuItem>
                )}
                {!isExamSlotsLoading &&
                  activeExamSlots.map((slot) => (
                    <MenuItem
                      key={slot.id}
                      value={slot.id}
                      disabled={slot.remainingCapacity <= 0 && !overrideCapacity}
                    >
                      {slot.slotName} · {formatEnrollmentDate(slot.startDate, true)} ·{' '}
                      {slot.remainingCapacity} seats
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={overrideCapacity}
                  onChange={(_, checked) => setOverrideCapacity(checked)}
                />
              }
              label="Override slot capacity"
            />
            {overrideCapacity && (
              <TextField
                required
                label="Capacity override reason"
                value={capacityOverrideReason}
                onChange={(event) => setCapacityOverrideReason(event.target.value)}
                multiline
                minRows={2}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleLead(null)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={scheduleExamState.isLoading}
            disabled={!selectedSlotId || (overrideCapacity && !capacityOverrideReason.trim())}
            onClick={handleScheduleExam}
          >
            Schedule Exam
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(bulkAction)}
        onClose={() => setBulkAction(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Bulk{' '}
          {bulkAction === 'owner'
            ? 'Owner Assignment'
            : bulkAction === 'task'
              ? 'Task Creation'
              : bulkAction === 'stage'
                ? 'Stage Change'
                : 'Archive'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            <Alert severity="info">{selectedLeadIds.length} selected inquiries</Alert>
            {(bulkAction === 'owner' || bulkAction === 'task') && (
              <Autocomplete
                options={
                  bulkAction === 'owner' ? ownerStaffQuery.data || [] : taskStaffQuery.data || []
                }
                value={bulkOwner}
                inputValue={staffSearch}
                onInputChange={(_, value) => setStaffSearch(value)}
                onChange={(_, value) => setBulkOwner(value)}
                getOptionLabel={(option) => `${option.displayName} (${option.employeeCode})`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                loading={
                  bulkAction === 'owner' ? ownerStaffQuery.isFetching : taskStaffQuery.isFetching
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={bulkAction === 'owner' ? 'New owner' : 'Task assignee'}
                  />
                )}
              />
            )}
            {bulkAction === 'task' && (
              <>
                <TextField
                  required
                  label="Task title"
                  value={bulkTitle}
                  onChange={(event) => setBulkTitle(event.target.value)}
                />
                <TextField
                  label="Due date"
                  type="datetime-local"
                  value={bulkDueAt}
                  onChange={(event) => setBulkDueAt(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}
            {bulkAction === 'stage' && (
              <>
                <FormControl fullWidth>
                  <InputLabel id="pipeline-bulk-stage-label">Stage</InputLabel>
                  <Select
                    labelId="pipeline-bulk-stage-label"
                    label="Stage"
                    value={bulkStage}
                    onChange={(event) => setBulkStage(Number(event.target.value))}
                  >
                    {stages.map((stageItem) => (
                      <MenuItem key={stageItem.id} value={stageItem.systemStage}>
                        {stageItem.stageName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {protectedSelectedLeads.length ? (
                  <Alert severity={overrideProtectedStages ? 'warning' : 'error'}>
                    {protectedSelectedLeads.length} selected applicant
                    {protectedSelectedLeads.length === 1 ? '' : 's'} are in protected workflow
                    stages. Remove them before applying, or choose override with an audit reason.
                  </Alert>
                ) : null}
                {protectedSelectedLeads.length ? (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={overrideProtectedStages}
                        onChange={(event) => setOverrideProtectedStages(event.target.checked)}
                      />
                    }
                    label="Override protected stage guardrails"
                  />
                ) : null}
              </>
            )}
            {(bulkAction === 'stage' || bulkAction === 'archive') && (
              <TextField
                required
                label="Reason"
                value={bulkReason}
                onChange={(event) => setBulkReason(event.target.value)}
                multiline
                minRows={2}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkAction(null)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            disabled={
              bulkAction === 'stage' &&
              protectedSelectedLeads.length > 0 &&
              !overrideProtectedStages
            }
            loading={
              bulkAssignOwnersState.isLoading ||
              bulkCreateTasksState.isLoading ||
              bulkChangeStagesState.isLoading ||
              bulkArchiveLeadsState.isLoading
            }
            onClick={handleBulkAction}
          >
            Apply
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
