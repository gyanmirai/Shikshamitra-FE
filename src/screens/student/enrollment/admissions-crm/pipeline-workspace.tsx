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
import { useMemo, useState, useEffect, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import ViewColumnRounded from '@mui/icons-material/ViewColumnRounded';
import ReceiptLongRounded from '@mui/icons-material/ReceiptLongRounded';
import FormatListBulletedRounded from '@mui/icons-material/FormatListBulletedRounded';
import {
  Box,
  Chip,
  Card,
  Paper,
  Alert,
  Stack,
  Button,
  Dialog,
  Select,
  Switch,
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
  LinearProgress,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';
import {
  AdmissionInquiryStage,
  AdmissionInquiryChannel,
  AdmissionCrmLeadPriority,
  useGetAdmissionCrmStaffQuery,
  useGetAdmissionCrmLeadsQuery,
  useGetAdmissionCrmExamSlotsQuery,
  useCreateAdmissionCrmLeadMutation,
  useGetAdmissionCrmPipelineStagesQuery,
  useBulkCreateAdmissionCrmTasksMutation,
  useBulkChangeAdmissionCrmStagesMutation,
  useBulkArchiveAdmissionCrmLeadsMutation,
  useScheduleAdmissionCrmEntranceExamMutation,
  useBulkAssignAdmissionCrmLeadOwnersMutation,
  useIssueAdmissionCrmRegistrationFormMutation,
  usePreviewAdmissionCrmLeadDuplicatesMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { PipelineStageColumn } from './pipeline-stage-column';
import { EnrollmentWorkspaceHeader } from './workspace-header';
import { AdmissionCrmStageChip } from './admission-crm-stage-chip';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { ApplicantWorkspaceDrawer } from './applicant-workspace-drawer';
import {
  getAdmissionCrmLeadName,
  getAdmissionCrmStageLabel,
  getAdmissionCrmChannelLabel,
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
import type { ApplicantDrawerTab } from './applicant-workspace-drawer';

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

const getLatestEnumFilter = (filters: IParams['filters'], column: string) => {
  const filter = [...filters].reverse().find((item) => item.column === column);
  return filter ? Number(filter.value) : undefined;
};

const getLatestStringFilter = (filters: IParams['filters'], column: string) => {
  const filter = [...filters].reverse().find((item) => item.column === column);
  return filter?.value ? String(filter.value) : undefined;
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
  parentGuardianName: string;
  primaryContactNo: string;
  email: string;
  admissionIntent: string;
  desiredClassName: string;
  channel: AdmissionInquiryChannel;
  campaignName: string;
  notes: string;
  duplicateContinueReason: string;
};

const emptyQuickInquiry: QuickInquiryForm = {
  firstName: '',
  parentGuardianName: '',
  primaryContactNo: '',
  email: '',
  admissionIntent: '',
  desiredClassName: '',
  channel: AdmissionInquiryChannel.WalkInReception,
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

type LeadCardProps = {
  lead: AdmissionCrmLeadDto;
  ownerName: string;
  selected?: boolean;
  showSelection?: boolean;
  canScheduleExam: boolean;
  canIssueRegistrationForm: boolean;
  onSelect?: () => void;
  onOpen: () => void;
  onSchedule: () => void;
  onIssueRegistrationForm: () => void;
};

function PipelineLeadCard({
  lead,
  ownerName,
  selected,
  showSelection,
  canScheduleExam,
  canIssueRegistrationForm,
  onSelect,
  onOpen,
  onSchedule,
  onIssueRegistrationForm,
}: LeadCardProps) {
  return (
    <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1, minWidth: 0 }}>
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
              lead.registrationFormNumber ? `Form ${lead.registrationFormNumber}` : 'Form pending'
            }
            variant="outlined"
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
          {lead.admissionIntent}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Typography variant="caption" color="text.secondary">
            {dayjs(lead.lastActivityTime).format('DD MMM, HH:mm')}
          </Typography>
          <Stack direction="row" gap={1}>
            {canIssueRegistrationForm && !lead.registrationFormNumber && !lead.archivedAt && (
              <Button
                size="small"
                startIcon={<ReceiptLongRounded />}
                onClick={onIssueRegistrationForm}
              >
                Issue Form
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
  const { academicYearId, currentUserId, state, updateState, openApplicant, closeApplicant } =
    useEnrollmentWorkspace();
  const page = Math.max(0, state.page - 1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [debouncedStaffSearch, setDebouncedStaffSearch] = useState('');
  const [quickDialogOpen, setQuickDialogOpen] = useState(false);
  const [quickForm, setQuickForm] = useState<QuickInquiryForm>(emptyQuickInquiry);
  const [duplicateMatches, setDuplicateMatches] = useState<AdmissionCrmLeadDto['likelyDuplicates']>(
    []
  );
  const [duplicateReviewed, setDuplicateReviewed] = useState(false);
  const [scheduleLead, setScheduleLead] = useState<AdmissionCrmLeadDto | null>(null);
  const [registrationLead, setRegistrationLead] = useState<AdmissionCrmLeadDto | null>(null);
  const [registrationFormNumber, setRegistrationFormNumber] = useState('');
  const [registrationFormAmount, setRegistrationFormAmount] = useState('250');
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
      stage: state.stage,
      channel: state.channel,
      campaignName: state.campaign,
      ownerUserId: resolvedOwner,
      priority: state.priority,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
      sorting: 'LastActivityTime DESC',
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

  const [createLead, createLeadState] = useCreateAdmissionCrmLeadMutation();
  const [previewDuplicates, previewDuplicatesState] =
    usePreviewAdmissionCrmLeadDuplicatesMutation();
  const [scheduleExam, scheduleExamState] = useScheduleAdmissionCrmEntranceExamMutation();
  const [issueRegistrationForm, issueRegistrationFormState] =
    useIssueAdmissionCrmRegistrationFormMutation();
  const [bulkAssignOwners, bulkAssignOwnersState] = useBulkAssignAdmissionCrmLeadOwnersMutation();
  const [bulkCreateTasks, bulkCreateTasksState] = useBulkCreateAdmissionCrmTasksMutation();
  const [bulkChangeStages, bulkChangeStagesState] = useBulkChangeAdmissionCrmStagesMutation();
  const [bulkArchiveLeads, bulkArchiveLeadsState] = useBulkArchiveAdmissionCrmLeadsMutation();

  useEffect(
    () => setSelectedLeadIds([]),
    [state.channel, state.owner, state.page, state.priority, state.stage]
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
    [resolvedOwner, staffById, state.channel, state.priority, state.stage]
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
        label: 'Applicant',
        width: 250,
        minWidth: 220,
        sticky: true,
        stickyPosition: 'left',
        stickyOnMobile: false,
        isSort: false,
        isFilter: false,
        render: (_value, row) => {
          const lead = row as AdmissionCrmLeadDto;
          return (
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {getAdmissionCrmLeadName(lead)}
              </Typography>
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
        isSort: false,
        render: (value) => <AdmissionCrmStageChip stage={value as AdmissionInquiryStage} />,
      },
      {
        id: 'channel',
        label: 'Channel',
        width: 155,
        minWidth: 140,
        filterType: 'enum',
        enumOptions: channels.map((channel) => ({
          value: channel,
          label: getAdmissionCrmChannelLabel(channel),
        })),
        isSort: false,
        render: (value) => getAdmissionCrmChannelLabel(value as AdmissionInquiryChannel),
      },
      {
        id: 'admissionIntent',
        label: 'Intent',
        width: 220,
        minWidth: 180,
        isSort: false,
        isFilter: false,
        render: (value, row) => {
          const lead = row as AdmissionCrmLeadDto;
          return lead.desiredClassName || value;
        },
      },
      {
        id: 'ownerUserId',
        label: 'Owner',
        width: 170,
        minWidth: 150,
        filterType: 'enum',
        enumOptions: ownerFilterOptions,
        isSort: false,
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
        isSort: false,
        render: (value) => priorityLabels[value as AdmissionCrmLeadPriority],
      },
      {
        id: 'leadScore',
        label: 'Score',
        width: 90,
        minWidth: 80,
        align: 'right',
        isSort: false,
        isFilter: false,
      },
      {
        id: 'lastActivityTime',
        label: 'Last Activity',
        width: 150,
        minWidth: 140,
        isSort: false,
        isFilter: false,
        render: (value) => dayjs(value).format('DD MMM, HH:mm'),
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
            hasGrantedPermission(permissions, actionPermissions.scheduleExam) && isExamReady(lead);
          const canIssueForm =
            hasGrantedPermission(permissions, actionPermissions.issueRegistrationForm) &&
            !lead.registrationFormNumber;
          return (
            <ThreeDotsActions
              placement="right-top"
              showViewIcon
              viewLabel="Open Applicant"
              handleViewClick={() => openApplicant(lead.id, 'overview')}
              showThreeDots={canSchedule || canIssueForm}
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
                  {canIssueForm && (
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        setRegistrationLead(lead);
                        setRegistrationFormNumber('');
                        setRegistrationFormAmount('250');
                      }}
                    >
                      <ReceiptLongRounded fontSize="small" />
                      Issue Registration Form
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
      openApplicant,
      ownerFilterOptions,
      ownerName,
      permissions,
      selectedLeadIds.length,
      selectedLeadSet,
      stages,
    ]
  );

  const resetQuickInquiry = () => {
    setQuickForm(emptyQuickInquiry);
    setDuplicateMatches([]);
    setDuplicateReviewed(false);
  };

  const handleCreateInquiry = async () => {
    if (!academicYearId) return;
    if (!quickForm.primaryContactNo.trim() && !quickForm.email.trim()) {
      shikshaMitraToast.error({ message: 'Contact number or email is required.' });
      return;
    }
    if (!quickForm.admissionIntent.trim()) {
      shikshaMitraToast.error({ message: 'Admission intent is required.' });
      return;
    }
    const body: CreateAdmissionCrmLeadDto = {
      channel: quickForm.channel,
      campaignName: quickForm.campaignName.trim() || undefined,
      firstName: quickForm.firstName.trim() || undefined,
      parentGuardianName: quickForm.parentGuardianName.trim() || undefined,
      primaryContactNo: quickForm.primaryContactNo.trim() || undefined,
      email: quickForm.email.trim() || undefined,
      admissionIntent: quickForm.admissionIntent.trim(),
      desiredClassName: quickForm.desiredClassName.trim() || undefined,
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
        shikshaMitraToast.error({
          message: 'Enter a reason before creating a possible duplicate.',
        });
        return;
      }
      const created = await createLead({ academicYearId, body }).unwrap();
      setQuickDialogOpen(false);
      resetQuickInquiry();
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

  const handleIssueRegistrationForm = async () => {
    if (!registrationLead) return;
    const formNumber = registrationFormNumber.trim().toUpperCase();
    const amount = Number(registrationFormAmount);
    if (!formNumber) {
      shikshaMitraToast.error({ message: 'Enter a registration form number.' });
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      shikshaMitraToast.error({ message: 'Enter a valid registration amount.' });
      return;
    }
    try {
      await issueRegistrationForm({
        leadId: registrationLead.id,
        body: { formNumber, amount },
      }).unwrap();
      setRegistrationLead(null);
      setRegistrationFormNumber('');
      setRegistrationFormAmount('250');
      shikshaMitraToast.success({ message: 'Registration form issued.' });
    } catch {
      shikshaMitraToast.error({
        message: 'The registration form could not be issued. Review the number and retry.',
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
        await bulkChangeStages({
          academicYearId,
          leadIds: selectedLeadIds,
          stage: bulkStage,
          reason: bulkReason.trim(),
        }).unwrap();
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
      setSelectedLeadIds([]);
      shikshaMitraToast.success({ message: 'Bulk action completed.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: error instanceof Error ? error.message : 'The bulk action could not be completed.',
      });
    }
  };

  if (!academicYearId) {
    return <Alert severity="info">Select an academic year to open the Admissions Pipeline.</Alert>;
  }

  const renderLeadCard = (lead: AdmissionCrmLeadDto) => (
    <PipelineLeadCard
      key={lead.id}
      lead={lead}
      ownerName={ownerName(lead)}
      selected={selectedLeadSet.has(lead.id)}
      showSelection={state.view === 'list'}
      canScheduleExam={can(actionPermissions.scheduleExam)}
      canIssueRegistrationForm={can(actionPermissions.issueRegistrationForm)}
      onSelect={() =>
        setSelectedLeadIds((current) =>
          current.includes(lead.id) ? current.filter((id) => id !== lead.id) : [...current, lead.id]
        )
      }
      onOpen={() => openApplicant(lead.id)}
      onSchedule={() => setScheduleLead(lead)}
      onIssueRegistrationForm={() => {
        setRegistrationLead(lead);
        setRegistrationFormNumber('');
        setRegistrationFormAmount('250');
      }}
    />
  );

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
              onChange={(event) => setSearch(event.target.value)}
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
          <CustomizableTable
            tableId="student-enrollment-pipeline"
            tableTitle="Admissions Pipeline"
            columns={columns}
            data={leads}
            isLoading={leadsQuery.isLoading}
            serverSide
            serverSidePagination
            serverSideSearch
            serverSideFilter
            searchTerm={search}
            defaultSearchTerm={search}
            searchFieldProps={{
              placeholder: 'Search applicants',
              inputProps: { 'aria-label': 'Search applicants' },
            }}
            filters={tableFilters}
            totalCount={leadsQuery.data?.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            defaultRowsPerPage={pageSize}
            rowsPerPageOptions={[pageSize]}
            onServerSearch={(value) => {
              setSearch(value);
              setDebouncedSearch(value.trim());
            }}
            onServerPagination={(nextPage) => updateState({ page: nextPage }, 'push')}
            onServerFilter={(filters) =>
              updateState(
                {
                  stage: getLatestEnumFilter(filters, 'stage'),
                  channel: getLatestEnumFilter(filters, 'channel'),
                  priority: getLatestEnumFilter(filters, 'priority'),
                  owner: getLatestStringFilter(filters, 'ownerUserId'),
                  page: 1,
                },
                'push'
              )
            }
            noDataText={
              <EnrollmentTableEmptyState
                title="No matching inquiries"
                description="Change the table filters or create a new inquiry."
              />
            }
            rowProps={(row) => ({
              'data-testid': 'student-enrollment-pipeline-row',
              'data-lead-id': row.id,
            })}
            wrapperProps={{ sx: enrollmentTableWrapperSx }}
            tableContainerProps={{ sx: enrollmentTableContainerSx }}
          />
        ))}

      <Dialog
        open={quickDialogOpen}
        onClose={() => setQuickDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Quick Inquiry</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            <Alert severity="info">
              Contact details and admission intent are enough to create an inquiry.
            </Alert>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <TextField
                fullWidth
                label="Student name"
                value={quickForm.firstName}
                onChange={(event) => {
                  setQuickForm((current) => ({ ...current, firstName: event.target.value }));
                  setDuplicateReviewed(false);
                }}
              />
              <TextField
                fullWidth
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
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <TextField
                fullWidth
                label="Contact number"
                type="tel"
                autoComplete="tel"
                value={quickForm.primaryContactNo}
                onChange={(event) => {
                  setQuickForm((current) => ({ ...current, primaryContactNo: event.target.value }));
                  setDuplicateReviewed(false);
                }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                value={quickForm.email}
                onChange={(event) => {
                  setQuickForm((current) => ({ ...current, email: event.target.value }));
                  setDuplicateReviewed(false);
                }}
              />
            </Stack>
            <TextField
              required
              label="Admission intent"
              value={quickForm.admissionIntent}
              onChange={(event) => {
                setQuickForm((current) => ({ ...current, admissionIntent: event.target.value }));
                setDuplicateReviewed(false);
              }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <TextField
                fullWidth
                label="Desired class"
                value={quickForm.desiredClassName}
                onChange={(event) => {
                  setQuickForm((current) => ({ ...current, desiredClassName: event.target.value }));
                  setDuplicateReviewed(false);
                }}
              />
              <TextField
                select
                fullWidth
                label="Inquiry channel"
                value={quickForm.channel}
                onChange={(event) =>
                  setQuickForm((current) => ({ ...current, channel: Number(event.target.value) }))
                }
              >
                {channels.map((channel) => (
                  <MenuItem key={channel} value={channel}>
                    {getAdmissionCrmChannelLabel(channel)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              label="Campaign"
              value={quickForm.campaignName}
              onChange={(event) =>
                setQuickForm((current) => ({ ...current, campaignName: event.target.value }))
              }
            />
            <TextField
              label="Notes"
              value={quickForm.notes}
              onChange={(event) =>
                setQuickForm((current) => ({ ...current, notes: event.target.value }))
              }
              multiline
              minRows={2}
            />
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
                label="Reason to continue"
                value={quickForm.duplicateContinueReason}
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
            onClick={() => {
              setQuickDialogOpen(false);
              resetQuickInquiry();
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            loading={createLeadState.isLoading || previewDuplicatesState.isLoading}
            onClick={handleCreateInquiry}
          >
            {duplicateReviewed && duplicateMatches.length ? 'Create Anyway' : 'Create Inquiry'}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(registrationLead)}
        onClose={() => setRegistrationLead(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Issue Registration Form</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            {registrationLead && (
              <Alert severity="info">
                {getAdmissionCrmLeadName(registrationLead)} ·{' '}
                {registrationLead.desiredClassName || registrationLead.admissionIntent}
              </Alert>
            )}
            <TextField
              autoFocus
              fullWidth
              label="Form number"
              value={registrationFormNumber}
              onChange={(event) => setRegistrationFormNumber(event.target.value.toUpperCase())}
            />
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={registrationFormAmount}
              onChange={(event) => setRegistrationFormAmount(event.target.value)}
              slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistrationLead(null)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={issueRegistrationFormState.isLoading}
            disabled={!registrationFormNumber.trim() || Number(registrationFormAmount) <= 0}
            onClick={handleIssueRegistrationForm}
          >
            Issue Form
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
                onChange={(event) => setSelectedSlotId(event.target.value)}
              >
                {(slotsQuery.data?.items || [])
                  .filter((slot) => slot.isActive)
                  .map((slot) => (
                    <MenuItem
                      key={slot.id}
                      value={slot.id}
                      disabled={slot.remainingCapacity <= 0 && !overrideCapacity}
                    >
                      {slot.slotName} · {dayjs(slot.startDate).format('DD MMM, HH:mm')} ·{' '}
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

      <ApplicantWorkspaceDrawer
        leadId={state.applicant}
        academicYearId={academicYearId}
        initialTab={(state.applicantTab as ApplicantDrawerTab | undefined) || 'overview'}
        onTabChange={(nextTab) => updateState({ applicantTab: nextTab }, 'replace')}
        onClose={closeApplicant}
      />
    </Stack>
  );
}
