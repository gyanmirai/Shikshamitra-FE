'use client';

import type { RootState } from 'src/redux/store';

import type { IColumn, IParams } from 'src/components/customizabaleTable/types';

import type {
  AdmissionCrmLeadDto,
  CreateAdmissionCrmLeadDto,
  AdmissionCrmStaffLookupDto,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import dayjs from 'dayjs';

import { useSelector } from 'react-redux';

import { shikshaMitraToast } from 'src/components/toast';

import { studentPaths } from 'src/constants/student-menu';

import EventRounded from '@mui/icons-material/EventRounded';

import { hasGrantedPermission } from 'src/utils/permissions';

import ThreeDotsActions from 'src/components/three-dots-actions';

import ReceiptLongRounded from '@mui/icons-material/ReceiptLongRounded';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import {
  Box,
  Chip,
  Link,
  Card,
  Alert,
  Stack,
  Button,
  Tooltip,
  Checkbox,
  MenuItem,
  MenuList,
  Typography,
} from '@mui/material';

import {
  AdmissionInquiryStage,
  AdmissionInquiryChannel,
  AdmissionCrmLeadPriority,
  AdmissionCrmPipelineColumnKey,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import { AdmissionCrmRouteType } from 'src/redux/student/admissions-crm/final-admission-contracts';

import {
  useGetAdmissionCrmStaffQuery,
  useGetAdmissionCrmLeadsQuery,
  useCreateAdmissionCrmLeadMutation,
  useBulkCreateAdmissionCrmTasksMutation,
  useBulkChangeAdmissionCrmStagesMutation,
  useBulkArchiveAdmissionCrmLeadsMutation,
  useGetAdmissionCrmQuickInquiryOptionsQuery,
  useBulkAssignAdmissionCrmLeadOwnersMutation,
  usePreviewAdmissionCrmLeadDuplicatesMutation,
  AdmissionCrmCoreLeadsApi,
} from 'src/redux/student/admissions-crm/core-leads-api';

import { useGetAdmissionCrmPipelineStagesQuery } from 'src/redux/student/admissions-crm/setup-playbooks-api';

import { useGetAdmissionCrmOperationalStandardOptionsQuery } from 'src/redux/student/admissions-crm/operations-governance-api';

import { getEnrollmentApiErrorMessage } from './enrollment-api-errors';

import { useEnrollmentWorkspace } from './enrollment-workspace-context';

import { ApplicantTitleTransition } from './enrollment-route-transition';

import { useWorkspaceTableSessionState } from './workspace-table-session-state';

import { formatEnrollmentDate, formatApplicantNumber } from './enrollment-display';

import { getAdmissionCrmLeadName, getAdmissionCrmChannelLabel } from './admissions-crm-utils';

import {
  createEnrollmentQueryScopeKey,
  getEnrollmentFilterQueryScope,
} from './enrollment-query-scope';

import { getDateFilterBounds, getLatestStringFilter } from './workspace-table-filters';

import { createApplicantLinkNavigationProps } from './applicant-row-navigation';

import {
  mapQuickInquiryOptions,
  isValidQuickInquiryEmail,
  isValidQuickInquiryPhone,
  getDefaultQuickInquiryOption,
} from './quick-inquiry-options';

import { enrollmentActionsColumn } from './workspace-table-patterns';

import {
  enrollmentPipelineColumns,
  getEnrollmentPipelineColumn,
} from './pipeline-column-definitions';

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
  manageConfiguration: `${permissionRoot}.ManageConfiguration`,
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
  return enumLabel?.replace(/([a-z])([A-Z])/g, '$1 $2') || 'Unknown admission pathway';
};

const priorityLabels: Record<AdmissionCrmLeadPriority, string> = {
  [AdmissionCrmLeadPriority.None]: 'Not set',
  [AdmissionCrmLeadPriority.Hot]: 'Hot',
  [AdmissionCrmLeadPriority.Warm]: 'Warm',
  [AdmissionCrmLeadPriority.Cold]: 'Cold',
  [AdmissionCrmLeadPriority.Low]: 'Low',
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
  applicantHref: string;
  ownerName: string;
  selected?: boolean;
  showSelection?: boolean;
  canScheduleExam: boolean;
  canManageRegistration: boolean;
  onSelect?: () => void;
  onOpen: () => void;
  onPrefetch: () => void;
  onSchedule: () => void;
  onOpenRegistration: () => void;
};

function PipelineLeadCard({
  lead,
  applicantHref,
  ownerName,
  selected,
  showSelection,
  canScheduleExam,
  canManageRegistration,
  onSelect,
  onOpen,
  onPrefetch,
  onSchedule,
  onOpenRegistration,
}: LeadCardProps) {
  return (
    <Card
      variant="outlined"
      data-testid="student-enrollment-pipeline-card"
      data-lead-id={lead.id}
      data-lead-stage={lead.stage}
      data-lead-pipeline-column={lead.pipelineColumn}
      sx={{ p: 1.25, borderRadius: 1, minWidth: 0, flexShrink: 0 }}
    >
      <Stack spacing={1}>
        <Stack direction="row" gap={1} justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ minWidth: 0 }}>
            <ApplicantTitleTransition leadId={lead.id}>
              <Link
                {...createApplicantLinkNavigationProps({
                  href: applicantHref,
                  onOpen,
                  onPrefetch,
                })}
                data-applicant-link-id={lead.id}
                variant="subtitle2"
                color="inherit"
                underline="hover"
                noWrap
                title={getAdmissionCrmLeadName(lead)}
                sx={{ display: 'block' }}
              >
                {getAdmissionCrmLeadName(lead)}
              </Link>
            </ApplicantTitleTransition>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {formatApplicantNumber(lead.applicantNumber)} ·{' '}
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

export function usePipelineWorkspaceController() {
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

  const prefetchLead = AdmissionCrmCoreLeadsApi.usePrefetch('getAdmissionCrmLead');

  const prefetchProgress = AdmissionCrmCoreLeadsApi.usePrefetch('getAdmissionCrmApplicantProgress');

  const prefetchApplicant = useCallback(
    (leadId: string) => {
      prefetchLead({ leadId }, { ifOlderThan: 30 });
      prefetchProgress({ leadId }, { ifOlderThan: 30 });
    },
    [prefetchLead, prefetchProgress]
  );

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

  const createInquiryInFlightRef = useRef(false);

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

  const encodedAcademicYearId = encodeURIComponent(academicYearId || '');

  const admissionYearSettingsHref = `${studentPaths.enrollment.settingsSections.admissionYear}?cycle=${encodedAcademicYearId}`;

  const pipelineSettingsHref = `${studentPaths.enrollment.settingsSections.pipeline}?cycle=${encodedAcademicYearId}`;

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
                getEnrollmentPipelineColumn(state.pipelineColumn)?.label || 'Current step',
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
              label: 'Admission pathway',
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
        id: 'applicantNumber',
        originalId: 'ApplicantNumber',
        label: 'Applicant ID',
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        sticky: true,
        stickyPosition: 'left',
        stickyOnMobile: false,
        isFilter: false,
        render: (value) => (
          <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatApplicantNumber(value as number)}
          </Typography>
        ),
      },
      {
        id: 'applicant',
        originalId: 'ApplicantName',
        label: 'Applicant',
        width: 250,
        minWidth: 220,
        filterType: 'string',
        render: (_value, row) => {
          const lead = row as AdmissionCrmLeadDto;
          return (
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <ApplicantTitleTransition leadId={lead.id}>
                <Link
                  {...createApplicantLinkNavigationProps({
                    href: getApplicantHref(lead.id, 'inquiry'),
                    onOpen: () => openApplicant(lead.id, 'inquiry'),
                    onPrefetch: () => prefetchApplicant(lead.id),
                  })}
                  data-applicant-link-id={lead.id}
                  variant="subtitle2"
                  color="inherit"
                  underline="hover"
                  noWrap
                  sx={{ display: 'block', textAlign: 'left' }}
                >
                  {getAdmissionCrmLeadName(lead)}
                </Link>
              </ApplicantTitleTransition>
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
        enumOptions: enrollmentPipelineColumns.map((column) => ({
          value: column.key,
          label: column.label,
        })),
        render: (value) => {
          const column = getEnrollmentPipelineColumn(value);
          return column ? (
            <Tooltip arrow title={column.description}>
              <Chip
                size="small"
                variant="outlined"
                label={column.label}
                color={column.color}
                sx={{ color: 'text.primary' }}
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
        label: 'Admission pathway',
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
              viewLabel="Open Inquiry"
              handleViewClick={() => openApplicant(lead.id, 'inquiry')}
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
      prefetchApplicant,
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
    const phoneInvalid = !isValidQuickInquiryPhone(quickForm.primaryContactNo);
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
      phoneInvalid ? contactInputRef : null,
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
    if (createInquiryInFlightRef.current) return;
    createInquiryInFlightRef.current = true;
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
      openApplicant(created.id, 'inquiry');
      shikshaMitraToast.success({ message: 'Inquiry created.' });
    } catch (error) {
      setDuplicateReviewed(false);
      shikshaMitraToast.error({
        message: getEnrollmentApiErrorMessage(
          error,
          'The inquiry could not be created. Review the fields and retry.'
        ),
      });
    } finally {
      createInquiryInFlightRef.current = false;
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
        message:
          error instanceof Error
            ? error.message
            : getEnrollmentApiErrorMessage(error, 'The bulk action could not be completed.'),
      });
    }
  };

  const renderLeadCard = (lead: AdmissionCrmLeadDto) => (
    <PipelineLeadCard
      key={lead.id}
      lead={lead}
      applicantHref={getApplicantHref(lead.id, 'inquiry')}
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
      onOpen={() => openApplicant(lead.id, 'inquiry')}
      onPrefetch={() => prefetchApplicant(lead.id)}
      onSchedule={() => setScheduleLead(lead)}
      onOpenRegistration={() => openApplicant(lead.id, 'registration')}
    />
  );

  const quickInquiryContactMissing = !quickForm.primaryContactNo.trim();

  const quickInquiryEmailInvalid = !isValidQuickInquiryEmail(quickForm.email);

  const quickInquiryPhoneInvalid = !isValidQuickInquiryPhone(quickForm.primaryContactNo);

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

  return {
    state: {
      academicMediumId,
      academicYearId,
      academicYearName,
      admissionYearSettingsHref,
      boardInputRef,
      boardScopeKey,
      bulkAction,
      bulkDueAt,
      bulkOwner,
      bulkReason,
      bulkStage,
      bulkTitle,
      channelInputRef,
      columns,
      contactInputRef,
      debouncedSearch,
      duplicateMatches,
      duplicateReasonInputRef,
      duplicateReviewed,
      emailInputRef,
      firstNameInputRef,
      guardianInputRef,
      inquirySourceInputRef,
      inquiryTypeInputRef,
      leads,
      mediumInputRef,
      overrideProtectedStages,
      page,
      pipelineSettingsHref,
      protectedSelectedLeads,
      quickDialogOpen,
      quickForm,
      quickFormSubmitted,
      quickInquiryOptionsMissing,
      quickInquiryOptionsUnavailable,
      quickInquiryPhoneInvalid,
      renderLeadCard,
      routeInputRef,
      scheduleLead,
      search,
      selectedLeadIds,
      selectedQuickInquiryRoute,
      selectedStandard,
      showOptionalQuickInquiryFields,
      showQuickInquiryContactError,
      showQuickInquiryEmailError,
      staffSearch,
      stages,
      state,
      targetStandardInputRef,
    },
    actions: {
      closeQuickInquiry,
      createLeadState,
      handleBulkAction,
      handleCreateInquiry,
      openApplicant,
      previewDuplicatesState,
      refreshBoardData,
      setBulkAction,
      setBulkDueAt,
      setBulkOwner,
      setBulkReason,
      setBulkStage,
      setBulkTitle,
      setColumnFilters,
      setDebouncedSearch,
      setDuplicateReviewed,
      setOverrideProtectedStages,
      setQuickDialogOpen,
      setQuickEmailTouched,
      setQuickForm,
      setScheduleLead,
      setSearch,
      setSelectedLeadIds,
      setShowOptionalQuickInquiryFields,
      setStaffSearch,
      updateState,
    },
    meta: {
      admissionYearStandardOptions,
      admissionYearStandardOptionsQuery,
      admissionYearStandardsLoading,
      availableSourceOptions,
      boardOptions,
      bulkArchiveLeadsState,
      bulkAssignOwnersState,
      bulkChangeStagesState,
      bulkCreateTasksState,
      can,
      columnFilters,
      leadsQuery,
      mediumOptions,
      ownerStaffQuery,
      quickInquiryOptions,
      quickInquiryOptionsLoading,
      quickInquiryOptionsQuery,
      stagesQuery,
      standardOptions,
      tableFilters,
      taskStaffQuery,
    },
  };
}

export type PipelineWorkspaceController = ReturnType<typeof usePipelineWorkspaceController>;
