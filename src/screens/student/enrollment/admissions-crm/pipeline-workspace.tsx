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
import EventRounded from '@mui/icons-material/EventRounded';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import ViewColumnRounded from '@mui/icons-material/ViewColumnRounded';
import ReceiptLongRounded from '@mui/icons-material/ReceiptLongRounded';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import FormatListBulletedRounded from '@mui/icons-material/FormatListBulletedRounded';
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
  Tooltip,
  Collapse,
  Checkbox,
  MenuItem,
  MenuList,
  TextField,
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
  AdmissionCrmPipelineColumnKey,
  useCreateAdmissionCrmLeadMutation,
  useGetAdmissionCrmPipelineStagesQuery,
  useBulkCreateAdmissionCrmTasksMutation,
  useBulkChangeAdmissionCrmStagesMutation,
  useBulkArchiveAdmissionCrmLeadsMutation,
  useGetAdmissionCrmQuickInquiryOptionsQuery,
  useBulkAssignAdmissionCrmLeadOwnersMutation,
  usePreviewAdmissionCrmLeadDuplicatesMutation,
  useGetAdmissionCrmOperationalStandardOptionsQuery,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { formatEnrollmentDate } from './enrollment-display';
import { PipelineStageColumn } from './pipeline-stage-column';
import { EnrollmentWorkspaceHeader } from './workspace-header';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { useWorkspaceTableSessionState } from './workspace-table-session-state';
import { ApplicantExamSchedulingDialog } from './applicant-exam-scheduling-dialog';
import { ApplicantWorkspaceDirtyProvider } from './applicant-workspace-dirty-context';
import { getAdmissionCrmLeadName, getAdmissionCrmChannelLabel } from './admissions-crm-utils';
import { parseEnrollmentTableSorts, serializeEnrollmentTableSort } from './workspace-table-sorting';
import {
  createEnrollmentQueryScopeKey,
  getEnrollmentFilterQueryScope,
} from './enrollment-query-scope';
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
  enrollmentActionsColumn,
  enrollmentTableWrapperSx,
  enrollmentWorkspaceRootSx,
  EnrollmentTableEmptyState,
  enrollmentTableContainerSx,
  EnrollmentWorkspaceErrorState,
  EnrollmentWorkspaceFilterPanel,
} from './workspace-table-patterns';

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
  overrideExamCapacity: `${permissionRoot}.OverrideExamCapacity`,
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

const pipelineColumns = [
  {
    key: AdmissionCrmPipelineColumnKey.NewInquiry,
    label: 'New Inquiry',
    description: 'Newly captured applicants awaiting the first admissions action.',
    color: '#455a64',
  },
  {
    key: AdmissionCrmPipelineColumnKey.FollowUp,
    label: 'Follow-up',
    description: 'Applicants with an open follow-up or a follow-up stage.',
    color: '#00796b',
  },
  {
    key: AdmissionCrmPipelineColumnKey.ExamPending,
    label: 'Exam Pending',
    description: 'Entrance exam scheduling, attendance, or result entry is pending.',
    color: '#1565c0',
  },
  {
    key: AdmissionCrmPipelineColumnKey.ExamDone,
    label: 'Exam Done',
    description: 'The exam is complete and an eligibility decision still needs attention.',
    color: '#5e35b1',
  },
  {
    key: AdmissionCrmPipelineColumnKey.Eligible,
    label: 'Eligible',
    description: 'The applicant is eligible and registration has not started.',
    color: '#2e7d32',
  },
  {
    key: AdmissionCrmPipelineColumnKey.RegistrationPending,
    label: 'Registration Pending',
    description: 'Registration is ready to start or is still in progress.',
    color: '#ef6c00',
  },
  {
    key: AdmissionCrmPipelineColumnKey.RegistrationDone,
    label: 'Registration Done',
    description: 'Registration is verified and the next required handoff has not started.',
    color: '#00838f',
  },
  {
    key: AdmissionCrmPipelineColumnKey.FinanceVerification,
    label: 'Finance Verification',
    description: 'Finance confirmation or an approved waiver is required.',
    color: '#6d4c41',
  },
  {
    key: AdmissionCrmPipelineColumnKey.PlacementPending,
    label: 'Placement Pending',
    description: 'Class capacity and placement work is pending.',
    color: '#ad1457',
  },
  {
    key: AdmissionCrmPipelineColumnKey.ReadyForActivation,
    label: 'Ready for Activation',
    description: 'All admission gates are complete and activation can proceed.',
    color: '#558b2f',
  },
  {
    key: AdmissionCrmPipelineColumnKey.Activated,
    label: 'Activated',
    description: 'The student record has been activated and handed to Student Records.',
    color: '#1b5e20',
  },
] as const;

type QuickInquiryForm = {
  firstName: string;
  middleName: string;
  lastName: string;
  parentGuardianName: string;
  primaryContactNo: string;
  email: string;
  admissionIntent: string;
  intendedRouteDefinitionId: string;
  inquirySourceId: string;
  inquiryTypeId: string;
  academicBoardId: string;
  academicMediumId: string;
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
  inquirySourceId: '',
  inquiryTypeId: '',
  academicBoardId: '',
  academicMediumId: '',
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

function PipelineWorkspaceContent() {
  const permissions = useSelector((root: RootState) => root.auth.permissions);
  const {
    academicYearId,
    academicYearName,
    academicMediumId,
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
  const guardianInputRef = useRef<HTMLInputElement>(null);
  const contactInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const inquirySourceInputRef = useRef<HTMLInputElement>(null);
  const inquiryTypeInputRef = useRef<HTMLInputElement>(null);
  const boardInputRef = useRef<HTMLInputElement>(null);
  const mediumInputRef = useRef<HTMLInputElement>(null);
  const targetStandardInputRef = useRef<HTMLInputElement>(null);
  const routeInputRef = useRef<HTMLInputElement>(null);
  const channelInputRef = useRef<HTMLInputElement>(null);
  const duplicateReasonInputRef = useRef<HTMLInputElement>(null);
  const [scheduleLead, setScheduleLead] = useState<AdmissionCrmLeadDto | null>(null);
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
  const [boardDataRevision, setBoardDataRevision] = useState(0);
  const refreshBoardData = useCallback(() => setBoardDataRevision((current) => current + 1), []);

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
      pipelineColumn: state.pipelineColumn,
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
  const quickInquiryOptionsQuery = useGetAdmissionCrmQuickInquiryOptionsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const admissionYearStandardOptionsQuery = useGetAdmissionCrmOperationalStandardOptionsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId || !quickDialogOpen }
  );
  const admissionYearStandardOptions = useMemo(
    () => admissionYearStandardOptionsQuery.data || [],
    [admissionYearStandardOptionsQuery.data]
  );
  const boardOptions = useMemo(
    () =>
      Array.from(
        new Map(
          admissionYearStandardOptions.map((option) => [
            option.boardId,
            { id: option.boardId, name: option.boardName },
          ])
        ).values()
      ).sort((left, right) => left.name.localeCompare(right.name)),
    [admissionYearStandardOptions]
  );
  const mediumOptions = useMemo(
    () =>
      Array.from(
        new Map(
          admissionYearStandardOptions
            .filter((option) => option.boardId === quickForm.academicBoardId)
            .map((option) => [option.mediumId, { id: option.mediumId, name: option.mediumName }])
        ).values()
      ).sort((left, right) => left.name.localeCompare(right.name)),
    [admissionYearStandardOptions, quickForm.academicBoardId]
  );
  const standardOptions = useMemo(
    () =>
      admissionYearStandardOptions
        .filter(
          (option) =>
            option.boardId === quickForm.academicBoardId &&
            option.mediumId === quickForm.academicMediumId
        )
        .sort((left, right) => left.standardName.localeCompare(right.standardName)),
    [admissionYearStandardOptions, quickForm.academicBoardId, quickForm.academicMediumId]
  );
  const quickInquiryOptions = useMemo(
    () => mapQuickInquiryOptions(quickInquiryOptionsQuery.data),
    [quickInquiryOptionsQuery.data]
  );
  const selectedQuickInquiryRoute = quickInquiryOptions.routes.find(
    (route) => route.id === quickForm.intendedRouteDefinitionId
  );
  const availableSourceOptions = useMemo(
    () =>
      quickInquiryOptions.sources.filter(
        (source) => quickForm.channel === '' || source.allowedChannels.includes(quickForm.channel)
      ),
    [quickForm.channel, quickInquiryOptions.sources]
  );
  const selectedStandard = admissionYearStandardOptions.find(
    (option) => option.standardId === quickForm.targetStandardId
  );
  const quickInquiryOptionsLoading =
    quickInquiryOptionsQuery.isLoading || quickInquiryOptionsQuery.isFetching;
  const admissionYearStandardsLoading =
    admissionYearStandardOptionsQuery.isLoading || admissionYearStandardOptionsQuery.isFetching;
  const quickInquiryOptionsMissing =
    !quickInquiryOptionsLoading &&
    !quickInquiryOptionsQuery.isError &&
    Boolean(quickInquiryOptionsQuery.data) &&
    (!quickInquiryOptions.channels.length ||
      !quickInquiryOptions.sources.length ||
      !quickInquiryOptions.inquiryTypes.length ||
      !quickInquiryOptions.routes.length);

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
      const availableSources = quickInquiryOptions.sources.filter(
        (source) => channel === '' || source.allowedChannels.includes(channel)
      );
      const currentSourceIsAvailable = availableSources.some(
        (source) => source.id === current.inquirySourceId
      );
      const inquirySourceId = currentSourceIsAvailable
        ? current.inquirySourceId
        : (getDefaultQuickInquiryOption(availableSources)?.id ?? '');
      const currentTypeIsAvailable = quickInquiryOptions.inquiryTypes.some(
        (type) => type.id === current.inquiryTypeId
      );
      const inquiryTypeId = currentTypeIsAvailable
        ? current.inquiryTypeId
        : (getDefaultQuickInquiryOption(quickInquiryOptions.inquiryTypes)?.id ?? '');

      if (
        channel === current.channel &&
        intendedRouteDefinitionId === current.intendedRouteDefinitionId &&
        inquirySourceId === current.inquirySourceId &&
        inquiryTypeId === current.inquiryTypeId
      ) {
        return current;
      }

      return {
        ...current,
        channel,
        intendedRouteDefinitionId,
        inquirySourceId,
        inquiryTypeId,
      };
    });
  }, [
    quickDialogOpen,
    quickInquiryOptions.channels,
    quickInquiryOptions.inquiryTypes,
    quickInquiryOptions.routes,
    quickInquiryOptions.sources,
    quickInquiryOptionsQuery.data,
  ]);

  useEffect(() => {
    if (!quickDialogOpen || quickForm.academicBoardId || boardOptions.length !== 1) return;
    setQuickForm((current) => ({ ...current, academicBoardId: boardOptions[0].id }));
  }, [boardOptions, quickDialogOpen, quickForm.academicBoardId]);

  useEffect(() => {
    if (!quickDialogOpen || quickForm.academicMediumId || mediumOptions.length !== 1) return;
    setQuickForm((current) => ({ ...current, academicMediumId: mediumOptions[0].id }));
  }, [mediumOptions, quickDialogOpen, quickForm.academicMediumId]);

  useEffect(() => {
    if (!quickDialogOpen || quickForm.targetStandardId || standardOptions.length !== 1) return;
    setQuickForm((current) => ({
      ...current,
      targetStandardId: standardOptions[0].standardId,
    }));
  }, [quickDialogOpen, quickForm.targetStandardId, standardOptions]);

  const registrationRequiredBeforeExam = Boolean(
    quickInquiryOptionsQuery.data?.registrationFormRequiredBeforeExam
  );
  const entranceExamRequired = quickInquiryOptionsQuery.data?.entranceExamRequired !== false;

  const [createLead, createLeadState] = useCreateAdmissionCrmLeadMutation();
  const [previewDuplicates, previewDuplicatesState] =
    usePreviewAdmissionCrmLeadDuplicatesMutation();
  const [bulkAssignOwners, bulkAssignOwnersState] = useBulkAssignAdmissionCrmLeadOwnersMutation();
  const [bulkCreateTasks, bulkCreateTasksState] = useBulkCreateAdmissionCrmTasksMutation();
  const [bulkChangeStages, bulkChangeStagesState] = useBulkChangeAdmissionCrmStagesMutation();
  const [bulkArchiveLeads, bulkArchiveLeadsState] = useBulkArchiveAdmissionCrmLeadsMutation();

  const selectionScopeKey = createEnrollmentQueryScopeKey({
    academicYearId,
    academicMediumId,
    view: state.view || 'list',
    filterText: debouncedSearch,
    filters: getEnrollmentFilterQueryScope(columnFilters),
    pipelineColumn: state.pipelineColumn,
    channel: state.channel,
    campaignName: state.campaign,
    ownerUserId: resolvedOwner,
    priority: state.priority,
    intendedRouteType: state.routeType,
    desiredClassName: state.className,
    page: state.page,
    sorting: state.sorting || 'LastActivityTime DESC',
    boardDataRevision,
  });
  const boardScopeKey = createEnrollmentQueryScopeKey({
    academicYearId,
    academicMediumId,
    filterText: debouncedSearch,
    channel: state.channel,
    campaignName: state.campaign,
    priority: state.priority,
    boardDataRevision,
  });

  useEffect(() => {
    setSelectedLeadIds([]);
    setBulkAction(null);
  }, [selectionScopeKey]);

  const stages = useMemo(
    () => (stagesQuery.data || []).filter((stage) => stage.isEnabled),
    [stagesQuery.data]
  );
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
      ...(state.pipelineColumn == null
        ? []
        : [
            {
              column: 'pipelineColumn',
              type: 'equals',
              value: state.pipelineColumn,
              valueType: 'enum',
              label: 'Current step',
              displayValue:
                pipelineColumns.find((column) => column.key === state.pipelineColumn)?.label ||
                'Current step',
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
      state.pipelineColumn,
      state.priority,
      state.routeType,
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
                  href: getApplicantHref(lead.id, 'next'),
                  onOpen: () => openApplicant(lead.id, 'next'),
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
        id: 'pipelineColumn',
        label: 'Current step',
        width: 190,
        minWidth: 175,
        filterType: 'enum',
        enumOptions: pipelineColumns.map((column) => ({
          value: column.key,
          label: column.label,
        })),
        render: (value) => {
          const column = pipelineColumns.find((item) => item.key === value);
          return column ? (
            <Tooltip arrow title={column.description}>
              <Chip
                size="small"
                variant="outlined"
                label={column.label}
                sx={{ color: column.color, borderColor: column.color }}
              />
            </Tooltip>
          ) : (
            <Chip size="small" variant="outlined" label="Needs review" />
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
              handleViewClick={() => openApplicant(lead.id, 'next')}
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

    const contactMissing = !quickForm.primaryContactNo.trim();
    const emailInvalid = !isValidQuickInquiryEmail(quickForm.email);
    const optionConfigurationUnavailable =
      quickInquiryOptionsLoading ||
      quickInquiryOptionsQuery.isError ||
      quickInquiryOptionsMissing ||
      !quickInquiryOptionsQuery.data?.isAdmissionCycleActive ||
      admissionYearStandardsLoading ||
      admissionYearStandardOptionsQuery.isError ||
      !admissionYearStandardOptions.length;

    const firstInvalidInput = [
      !quickForm.firstName.trim() ? firstNameInputRef : null,
      !quickForm.parentGuardianName.trim() ? guardianInputRef : null,
      emailInvalid ? emailInputRef : null,
      contactMissing ? contactInputRef : null,
      !quickForm.academicBoardId ? boardInputRef : null,
      !quickForm.academicMediumId ? mediumInputRef : null,
      !quickForm.targetStandardId ? targetStandardInputRef : null,
      !selectedQuickInquiryRoute ? routeInputRef : null,
      quickForm.channel === '' ? channelInputRef : null,
      availableSourceOptions.length > 0 && !quickForm.inquirySourceId
        ? inquirySourceInputRef
        : null,
      quickInquiryOptions.inquiryTypes.length > 0 && !quickForm.inquiryTypeId
        ? inquiryTypeInputRef
        : null,
    ].find((input) => input !== null);

    if (firstInvalidInput || optionConfigurationUnavailable) {
      firstInvalidInput?.current?.focus();
      return;
    }

    if (!selectedStandard || !selectedQuickInquiryRoute || quickForm.channel === '') return;

    const body: CreateAdmissionCrmLeadDto = {
      channel: quickForm.channel,
      inquirySourceId: quickForm.inquirySourceId || undefined,
      inquiryTypeId: quickForm.inquiryTypeId || undefined,
      campaignName: quickForm.campaignName.trim() || undefined,
      firstName: quickForm.firstName.trim(),
      middleName: quickForm.middleName.trim() || undefined,
      lastName: quickForm.lastName.trim() || undefined,
      parentGuardianName: quickForm.parentGuardianName.trim() || undefined,
      primaryContactNo: quickForm.primaryContactNo.trim() || undefined,
      email: quickForm.email.trim() || undefined,
      admissionIntent: quickForm.admissionIntent.trim() || selectedQuickInquiryRoute.label,
      intendedRouteDefinitionId: selectedQuickInquiryRoute.definitionId,
      intendedRouteType: selectedQuickInquiryRoute.routeType,
      targetStandardId: selectedStandard.standardId,
      academicBoardId: selectedStandard.boardId,
      academicMediumId: selectedStandard.mediumId,
      academicMediumStageId: selectedStandard.mediumStageId,
      desiredClassName: selectedStandard.standardName,
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
        if (result.succeededCount > 0) refreshBoardData();
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
        const result = await bulkArchiveLeads({
          academicYearId,
          leadIds: selectedLeadIds,
          reason: bulkReason.trim(),
        }).unwrap();
        if (result.succeededCount > 0) refreshBoardData();
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

  const quickInquiryContactMissing = !quickForm.primaryContactNo.trim();
  const quickInquiryEmailInvalid = !isValidQuickInquiryEmail(quickForm.email);
  const showQuickInquiryContactError = quickFormSubmitted && quickInquiryContactMissing;
  const showQuickInquiryEmailError =
    quickInquiryEmailInvalid && (quickEmailTouched || quickFormSubmitted);
  const quickInquiryOptionsUnavailable =
    quickInquiryOptionsLoading ||
    quickInquiryOptionsQuery.isError ||
    quickInquiryOptionsMissing ||
    quickInquiryOptionsQuery.data?.isAdmissionCycleActive === false ||
    !quickInquiryOptionsQuery.data ||
    admissionYearStandardsLoading ||
    admissionYearStandardOptionsQuery.isError ||
    !admissionYearStandardOptions.length;

  return (
    <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
      <EnrollmentWorkspaceHeader
        title="Admissions Pipeline"
        description="Capture and progress every applicant from inquiry through activation."
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
              channel: undefined,
              priority: undefined,
              page: 1,
            });
          }}
          clearDisabled={state.channel == null && state.priority == null && !search}
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

      {(state.view || 'list') === 'list' && stagesQuery.isFetching && (
        <LinearProgress aria-label="Loading pipeline stages" />
      )}
      {(state.view || 'list') === 'list' && stagesQuery.isError && (
        <EnrollmentWorkspaceErrorState
          message="Pipeline stages are unavailable. Review Enrollment configuration before continuing."
          onRetry={() => stagesQuery.refetch()}
        />
      )}

      {state.view === 'board' && (
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
          {pipelineColumns.map((column) => (
            <PipelineStageColumn
              key={column.key}
              academicYearId={academicYearId}
              column={column}
              query={{
                filterText: debouncedSearch || undefined,
                academicMediumId,
                channel: state.channel,
                campaignName: state.campaign,
                priority: state.priority,
              }}
              resetKey={boardScopeKey}
              renderLead={renderLeadCard}
            />
          ))}
        </Stack>
      )}

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
              serverSideSortMode="single"
              serverSideFilter
              searchTerm={search}
              defaultSearchTerm={search}
              searchFieldProps={{
                placeholder: 'Search applicants',
                inputProps: { 'aria-label': 'Search applicants' },
              }}
              filters={[...tableFilters, ...columnFilters]}
              sorts={parseEnrollmentTableSorts(state.sorting || 'LastActivityTime DESC', columns)}
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
                const nextSorting = serializeEnrollmentTableSort(sorts);
                updateState(
                  {
                    sorting: nextSorting || undefined,
                    page: 1,
                  },
                  'push'
                );
              }}
              onServerFilter={(filters) => {
                const stateColumns = new Set([
                  'pipelineColumn',
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
                    pipelineColumn: getLatestEnumFilter(filters, 'pipelineColumn'),
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
                  title="No applicants in this admission year view"
                  description="Create a real inquiry for this admission year or clear filters to show existing applicants."
                />
              }
              rowProps={(row) => ({
                ...createApplicantRowNavigationProps({
                  applicantName: getAdmissionCrmLeadName(row as AdmissionCrmLeadDto),
                  onOpen: () => openApplicant((row as AdmissionCrmLeadDto).id, 'next'),
                }),
                'data-testid': 'student-enrollment-pipeline-row',
                'data-lead-id': row.id,
              })}
              wrapperProps={{ sx: enrollmentTableWrapperSx }}
              tableContainerProps={{ sx: enrollmentTableContainerSx }}
            />
            {showEmptyPipeline ? (
              <Alert severity="info">
                No applicants in this admission year. Create a real inquiry for this admission year
                or clear filters to show existing applicants.
              </Alert>
            ) : null}
          </>
        ))}

      <Dialog open={quickDialogOpen} onClose={closeQuickInquiry} fullWidth maxWidth="md">
        <DialogTitle>Quick Inquiry</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info">
              New applicants start in New Inquiry. Board, medium, and standard come from the
              published Admission Year Setup.
            </Alert>
            <Paper variant="outlined" sx={{ p: 1.25 }}>
              <Typography variant="caption" color="text.secondary">
                Admission year
              </Typography>
              <Typography variant="body2">
                {academicYearName || 'Selected academic year'}
              </Typography>
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
                Inquiry sources, types, channels, and pathways could not be loaded.
              </Alert>
            )}
            {quickInquiryOptionsMissing && (
              <Alert severity="warning">
                Quick Inquiry needs an active channel, source, inquiry type, and admission pathway.
              </Alert>
            )}
            {quickInquiryOptionsQuery.data?.isAdmissionCycleActive === false && (
              <Alert severity="warning">
                Quick inquiry is unavailable because the admission year is not active.
              </Alert>
            )}
            {admissionYearStandardOptionsQuery.isError && (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => admissionYearStandardOptionsQuery.refetch()}
                  >
                    Retry
                  </Button>
                }
              >
                Boards, mediums, and standards could not be loaded from Admission Year Setup.
              </Alert>
            )}
            {!admissionYearStandardsLoading &&
              admissionYearStandardOptionsQuery.data &&
              !admissionYearStandardOptions.length && (
                <Alert severity="warning">
                  No standards are available in the published Admission Year Setup.
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
                  required
                  fullWidth
                  inputRef={guardianInputRef}
                  name="parentGuardianName"
                  autoComplete="name"
                  label="Parent or guardian"
                  value={quickForm.parentGuardianName}
                  error={quickFormSubmitted && !quickForm.parentGuardianName.trim()}
                  helperText={
                    quickFormSubmitted && !quickForm.parentGuardianName.trim()
                      ? 'Enter the parent or guardian name.'
                      : undefined
                  }
                  onChange={(event) => {
                    setQuickForm((current) => ({
                      ...current,
                      parentGuardianName: event.target.value,
                    }));
                    setDuplicateReviewed(false);
                  }}
                />
                <TextField
                  required
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
                      ? 'Add the parent or guardian mobile number.'
                      : 'Used for admission follow-up and status messages.'
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
                  error={showQuickInquiryEmailError}
                  helperText={
                    showQuickInquiryEmailError
                      ? 'Enter a valid email address, for example parent@example.com.'
                      : 'Optional.'
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
                <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
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
                        : 'How the family contacted the school.'
                    }
                    onChange={(event) => {
                      setQuickForm((current) => ({
                        ...current,
                        channel:
                          event.target.value === ''
                            ? ''
                            : (Number(event.target.value) as AdmissionInquiryChannel),
                        inquirySourceId: '',
                      }));
                    }}
                  >
                    {quickInquiryOptions.channels.map((channel) => (
                      <MenuItem key={channel.value} value={channel.value}>
                        {channel.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    required={availableSourceOptions.length > 0}
                    select
                    fullWidth
                    inputRef={inquirySourceInputRef}
                    name="inquirySourceId"
                    label="Inquiry source"
                    value={quickForm.inquirySourceId}
                    disabled={quickInquiryOptionsUnavailable || quickForm.channel === ''}
                    error={
                      quickFormSubmitted &&
                      availableSourceOptions.length > 0 &&
                      !quickForm.inquirySourceId
                    }
                    helperText={
                      quickFormSubmitted &&
                      availableSourceOptions.length > 0 &&
                      !quickForm.inquirySourceId
                        ? 'Select where this inquiry came from.'
                        : availableSourceOptions.length
                          ? 'Available for the selected channel.'
                          : 'No separate source is configured for this channel.'
                    }
                    onChange={(event) =>
                      setQuickForm((current) => ({
                        ...current,
                        inquirySourceId: event.target.value,
                      }))
                    }
                  >
                    {availableSourceOptions.map((source) => (
                      <MenuItem key={source.id} value={source.id}>
                        {source.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    required={quickInquiryOptions.inquiryTypes.length > 0}
                    select
                    fullWidth
                    inputRef={inquiryTypeInputRef}
                    name="inquiryTypeId"
                    label="Inquiry type"
                    value={quickForm.inquiryTypeId}
                    disabled={quickInquiryOptionsUnavailable}
                    error={
                      quickFormSubmitted &&
                      quickInquiryOptions.inquiryTypes.length > 0 &&
                      !quickForm.inquiryTypeId
                    }
                    helperText={
                      quickFormSubmitted &&
                      quickInquiryOptions.inquiryTypes.length > 0 &&
                      !quickForm.inquiryTypeId
                        ? 'Select the inquiry type.'
                        : quickInquiryOptions.inquiryTypes.length
                          ? 'Used for filtering and reporting.'
                          : 'No inquiry types are configured.'
                    }
                    onChange={(event) =>
                      setQuickForm((current) => ({
                        ...current,
                        inquiryTypeId: event.target.value,
                      }))
                    }
                  >
                    {quickInquiryOptions.inquiryTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                  <TextField
                    required
                    select
                    fullWidth
                    inputRef={boardInputRef}
                    name="academicBoardId"
                    label="Board"
                    value={quickForm.academicBoardId}
                    disabled={admissionYearStandardsLoading}
                    error={quickFormSubmitted && !quickForm.academicBoardId}
                    helperText={
                      quickFormSubmitted && !quickForm.academicBoardId
                        ? 'Select the board.'
                        : 'Available in the published Admission Year Setup.'
                    }
                    onChange={(event) => {
                      setQuickForm((current) => ({
                        ...current,
                        academicBoardId: event.target.value,
                        academicMediumId: '',
                        targetStandardId: '',
                      }));
                      setDuplicateReviewed(false);
                    }}
                  >
                    {boardOptions.map((board) => (
                      <MenuItem key={board.id} value={board.id}>
                        {board.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    required
                    select
                    fullWidth
                    inputRef={mediumInputRef}
                    name="academicMediumId"
                    label="Medium"
                    value={quickForm.academicMediumId}
                    disabled={!quickForm.academicBoardId || admissionYearStandardsLoading}
                    error={quickFormSubmitted && !quickForm.academicMediumId}
                    helperText={
                      quickFormSubmitted && !quickForm.academicMediumId
                        ? 'Select the medium.'
                        : 'Available for the selected board.'
                    }
                    onChange={(event) => {
                      setQuickForm((current) => ({
                        ...current,
                        academicMediumId: event.target.value,
                        targetStandardId: '',
                      }));
                      setDuplicateReviewed(false);
                    }}
                  >
                    {mediumOptions.map((medium) => (
                      <MenuItem key={medium.id} value={medium.id}>
                        {medium.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    required
                    select
                    fullWidth
                    inputRef={targetStandardInputRef}
                    name="targetStandardId"
                    label="Standard"
                    value={quickForm.targetStandardId}
                    disabled={!quickForm.academicMediumId || admissionYearStandardsLoading}
                    error={quickFormSubmitted && !quickForm.targetStandardId}
                    helperText={
                      quickFormSubmitted && !quickForm.targetStandardId
                        ? 'Select the target standard.'
                        : selectedStandard
                          ? selectedStandard.mediumStageName
                          : 'Available for the selected board and medium.'
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
                      <MenuItem key={standard.standardId} value={standard.standardId}>
                        {standard.standardName}
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
                        ? 'Select an admission pathway.'
                        : selectedQuickInquiryRoute?.version
                          ? `Published pathway version ${selectedQuickInquiryRoute.version}.`
                          : 'Allowed by the published Admission Year Setup.'
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

      <ApplicantExamSchedulingDialog
        lead={scheduleLead}
        academicYearId={academicYearId}
        canOverrideCapacity={can(actionPermissions.overrideExamCapacity)}
        onClose={() => setScheduleLead(null)}
        onScheduled={refreshBoardData}
      />

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

export function PipelineWorkspace() {
  return (
    <ApplicantWorkspaceDirtyProvider>
      <PipelineWorkspaceContent />
    </ApplicantWorkspaceDirtyProvider>
  );
}
