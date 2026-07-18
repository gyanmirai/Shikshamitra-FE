'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { IParams } from 'src/components/customizabaleTable/types';
import type {
  AdmissionCrmStaffLookupDto,
  AdmissionCrmBulkOperationResultDto,
  AdmissionCrmOperationsQueueFilters,
  AdmissionCrmOperationsSavedViewDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import { useMemo, useState, useEffect, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import BookmarkAddOutlined from '@mui/icons-material/BookmarkAddOutlined';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Button,
  Switch,
  Dialog,
  Divider,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import {
  AdmissionCrmRouteType,
  AdmissionCrmSeatOfferType,
  AdmissionCrmSeatOfferStatus,
  useGetAdmissionCrmStaffQuery,
  AdmissionCrmActivationStatus,
  AdmissionCrmRegistrationStatus,
  AdmissionCrmOperationsQueueType,
  AdmissionCrmServiceHandoffStatus,
  useGetAdmissionCrmSeatPoolsQuery,
  AdmissionCrmApplicantDocumentStatus,
  useGetAdmissionCrmOperationsQueueQuery,
  useBulkCreateAdmissionCrmTasksMutation,
  useBulkCreateAdmissionCrmOffersMutation,
  useGetAdmissionCrmOperationsSavedViewsQuery,
  useBulkAssignAdmissionCrmLeadOwnersMutation,
  useGetAdmissionCrmOperationsQueueSummaryQuery,
  useCreateAdmissionCrmOperationsSavedViewMutation,
  useDeleteAdmissionCrmOperationsSavedViewMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { formatEnumLabel } from './enrollment-display';
import { EnrollmentWorkspaceHeader } from './workspace-header';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { ApplicantWorkspaceDrawer } from './applicant-workspace-drawer';
import { IntegrationCapabilitiesPanel } from './integration-capabilities-panel';
import {
  buildOperationsQueueColumns,
  type EnrollmentQueueVariant,
} from './operations-queue-columns';
import {
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentWorkspaceRootSx,
  enrollmentTableContainerSx,
  EnrollmentWorkspaceErrorState,
  EnrollmentWorkspaceFilterPanel,
} from './workspace-table-patterns';

import type { ApplicantDrawerTab } from './applicant-workspace-drawer';

const RteAllotmentImport = dynamic(() =>
  import('./rte-allotment-import').then((module) => module.RteAllotmentImport)
);
const AdmissionsDataQuality = dynamic(() =>
  import('./admissions-data-quality').then((module) => module.AdmissionsDataQuality)
);

type Props = {
  title: string;
  description: string;
  defaultQueue: AdmissionCrmOperationsQueueType;
  allowedQueues?: AdmissionCrmOperationsQueueType[];
  applicantTab?: ApplicantDrawerTab;
  variant?: EnrollmentQueueVariant;
  showOperationsUtilities?: boolean;
  headerActions?: ReactNode;
};

const pageSize = 50;
type BulkAction = 'owner' | 'task' | 'offer';
const queueLabels: Record<AdmissionCrmOperationsQueueType, string> = {
  [AdmissionCrmOperationsQueueType.UnassignedExam]: 'Unassigned Exams',
  [AdmissionCrmOperationsQueueType.CapacityConflict]: 'Capacity Conflicts',
  [AdmissionCrmOperationsQueueType.NoShow]: 'Exam No-shows',
  [AdmissionCrmOperationsQueueType.RegistrationInvitationPending]: 'Ready to Invite',
  [AdmissionCrmOperationsQueueType.ExpiringRegistrationLink]: 'Expiring Links',
  [AdmissionCrmOperationsQueueType.IncompleteRegistration]: 'Incomplete Registrations',
  [AdmissionCrmOperationsQueueType.RejectedDocument]: 'Rejected Documents',
  [AdmissionCrmOperationsQueueType.DocumentVerificationBacklog]: 'Document Verification',
  [AdmissionCrmOperationsQueueType.AdmissionReady]: 'Admission Ready',
  [AdmissionCrmOperationsQueueType.PolicyException]: 'Policy Exceptions',
  [AdmissionCrmOperationsQueueType.PaymentCondition]: 'Payment Conditions',
  [AdmissionCrmOperationsQueueType.HouseholdResolution]: 'Household Resolution',
  [AdmissionCrmOperationsQueueType.IdentityConflict]: 'Identity Conflicts',
  [AdmissionCrmOperationsQueueType.FinalApproval]: 'Final Approval',
  [AdmissionCrmOperationsQueueType.ActivationRepair]: 'Activation Repair',
  [AdmissionCrmOperationsQueueType.RouteEligibilityReview]: 'Route Eligibility',
  [AdmissionCrmOperationsQueueType.GovernmentAllotmentReconciliation]: 'RTE Reconciliation',
  [AdmissionCrmOperationsQueueType.TransferEvidencePending]: 'Transfer Evidence',
  [AdmissionCrmOperationsQueueType.ReturningIdentityMatch]: 'Returning Identity Match',
  [AdmissionCrmOperationsQueueType.CancellationReview]: 'Cancellation Review',
  [AdmissionCrmOperationsQueueType.RouteAppealReview]: 'Route Appeals',
  [AdmissionCrmOperationsQueueType.ServiceHandoffException]: 'Service Handoff Exceptions',
};

const allQueues = Object.values(AdmissionCrmOperationsQueueType).filter(
  (value): value is AdmissionCrmOperationsQueueType => typeof value === 'number'
);

const enumOptions = <T extends number>(source: Record<string, string | number>) =>
  Object.entries(source)
    .filter((entry): entry is [string, T] => typeof entry[1] === 'number')
    .map(([key, value]) => ({ value, label: formatEnumLabel(key) }));

const getLatestFilter = (filters: IParams['filters'], column: string) =>
  [...filters].reverse().find((filter) => filter.column === column)?.value;

const getLatestEnumFilter = <T extends number>(filters: IParams['filters'], column: string) => {
  const value = getLatestFilter(filters, column);
  return value === undefined || value === null || value === '' ? undefined : (Number(value) as T);
};

const getLatestNumberFilter = (filters: IParams['filters'], column: string) => {
  const value = getLatestFilter(filters, column);
  return value === undefined || value === null || value === '' ? undefined : Number(value);
};

const getLatestStringFilter = (filters: IParams['filters'], column: string) => {
  const value = getLatestFilter(filters, column);
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

const getLatestBooleanFilter = (filters: IParams['filters'], column: string) => {
  const value = getLatestFilter(filters, column);
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
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

const formatFilterDate = (value: string, dayOffset = 0) => {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return [
    String(date.getUTCDate()).padStart(2, '0'),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    date.getUTCFullYear(),
  ].join('-');
};

const restoreDateFilter = (
  column: string,
  label: string,
  from?: string,
  until?: string
): IParams['filters'] => {
  if (from && until) {
    return [{ column, label, type: 'equals', value: formatFilterDate(from), valueType: 'date' }];
  }
  if (from) {
    return [{ column, label, type: 'after', value: formatFilterDate(from, -1), valueType: 'date' }];
  }
  if (until) {
    return [
      { column, label, type: 'before', value: formatFilterDate(until, 1), valueType: 'date' },
    ];
  }
  return [];
};

const restoreSavedColumnFilters = (
  filters: AdmissionCrmOperationsQueueFilters
): IParams['filters'] => [
  ...(filters.applicantSearch
    ? [
        {
          column: 'applicantName',
          label: 'Applicant',
          type: 'contains',
          value: filters.applicantSearch,
          valueType: 'string',
        },
      ]
    : []),
  ...(filters.actionSearch
    ? [
        {
          column: 'title',
          label: 'Next Action',
          type: 'contains',
          value: filters.actionSearch,
          valueType: 'string',
        },
      ]
    : []),
  ...restoreDateFilter(
    'linkExpiry',
    'Link Expiry',
    filters.registrationLinkExpiresFrom,
    filters.registrationLinkExpiresUntil
  ),
  ...restoreDateFilter(
    'offerExpiry',
    'Offer Expiry',
    filters.offerExpiresFrom,
    filters.offerExpiresUntil
  ),
  ...(filters.paymentGateSatisfied == null
    ? []
    : [
        {
          column: 'payment',
          label: 'Payment Condition',
          type: 'equals',
          value: filters.paymentGateSatisfied,
          valueType: 'enum',
        },
      ]),
  ...(filters.placementConfigured == null
    ? []
    : [
        {
          column: 'placement',
          label: 'Placement',
          type: 'equals',
          value: filters.placementConfigured,
          valueType: 'enum',
        },
      ]),
  ...(filters.accountProvisioningPending == null
    ? []
    : [
        {
          column: 'accounts',
          label: 'Accounts',
          type: 'equals',
          value: filters.accountProvisioningPending,
          valueType: 'enum',
        },
      ]),
  ...(filters.repairSearch
    ? [
        {
          column: 'repair',
          label: 'Repair / Blocker',
          type: 'contains',
          value: filters.repairSearch,
          valueType: 'string',
        },
      ]
    : []),
];

export function OperationsQueueWorkspace({
  title,
  description,
  defaultQueue,
  allowedQueues = allQueues,
  applicantTab = 'overview',
  variant = 'operations',
  showOperationsUtilities = false,
  headerActions,
}: Props) {
  const { academicYearId, state, updateState, openApplicant, closeApplicant } =
    useEnrollmentWorkspace();
  const permissions = useSelector((root: RootState) => root.auth.permissions);
  const selectedQueue =
    state.queue != null && allowedQueues.includes(state.queue) ? state.queue : defaultQueue;
  const page = Math.max(0, state.page - 1);
  const [search, setSearch] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [debouncedOwnerSearch, setDebouncedOwnerSearch] = useState('');
  const [debouncedAssigneeSearch, setDebouncedAssigneeSearch] = useState('');
  const [owner, setOwner] = useState<AdmissionCrmStaffLookupDto | null>(null);
  const [assignee, setAssignee] = useState<AdmissionCrmStaffLookupDto | null>(null);
  const [savedViewName, setSavedViewName] = useState('');
  const [savedViewsOpen, setSavedViewsOpen] = useState(false);
  const [showUtilities, setShowUtilities] = useState(false);
  const [columnFilters, setColumnFilters] = useState<IParams['filters']>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);
  const [bulkStaff, setBulkStaff] = useState<AdmissionCrmStaffLookupDto | null>(null);
  const [bulkStaffSearch, setBulkStaffSearch] = useState('');
  const [debouncedBulkStaffSearch, setDebouncedBulkStaffSearch] = useState('');
  const [bulkTaskTitle, setBulkTaskTitle] = useState('');
  const [bulkTaskDueAt, setBulkTaskDueAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [bulkSeatPoolId, setBulkSeatPoolId] = useState('');
  const [bulkOfferValidUntil, setBulkOfferValidUntil] = useState(() => {
    const value = new Date();
    value.setDate(value.getDate() + 14);
    return value.toISOString().slice(0, 10);
  });
  const canBulkOperate = hasGrantedPermission(
    permissions,
    'Students.Enrollment.AdmissionsCrm.BulkOperations'
  );
  const seatPoolsQuery = useGetAdmissionCrmSeatPoolsQuery(
    { academicYearId: academicYearId || '', maxResultCount: 100 },
    { skip: !academicYearId || (variant !== 'offer' && variant !== 'registration') }
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedOwnerSearch(ownerSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [ownerSearch]);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedAssigneeSearch(assigneeSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [assigneeSearch]);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedBulkStaffSearch(bulkStaffSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [bulkStaffSearch]);

  const ownerStaffQuery = useGetAdmissionCrmStaffQuery(
    {
      filter: debouncedOwnerSearch || undefined,
      ids: state.owner || undefined,
      maxResultCount: 25,
      academicYearId,
      ownerOnly: true,
    },
    { skip: !academicYearId }
  );
  const assigneeStaffQuery = useGetAdmissionCrmStaffQuery(
    {
      filter: debouncedAssigneeSearch || undefined,
      ids: state.assignee || undefined,
      maxResultCount: 25,
      academicYearId,
    },
    { skip: !academicYearId }
  );
  const bulkStaffQuery = useGetAdmissionCrmStaffQuery(
    {
      filter: debouncedBulkStaffSearch || undefined,
      maxResultCount: 25,
      academicYearId,
    },
    { skip: !academicYearId || (bulkAction !== 'owner' && bulkAction !== 'task') }
  );
  const summaryQuery = useGetAdmissionCrmOperationsQueueSummaryQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const queueQuery = useGetAdmissionCrmOperationsQueueQuery(
    {
      academicYearId: academicYearId || '',
      queueType: selectedQueue,
      search: search.trim() || undefined,
      ownerUserId: state.owner && state.owner !== 'me' ? state.owner : undefined,
      assignedToUserId: state.assignee,
      urgentOnly: state.urgent || undefined,
      minimumAgeDays: state.minimumAgeDays,
      registrationStatus: state.registrationStatus,
      documentStatus: state.documentStatus,
      offerStatus: state.offerStatus,
      routeType: state.routeType,
      seatPoolId: state.seatPoolId,
      activationStatus: state.activationStatus,
      serviceHandoffStatus: state.serviceHandoffStatus,
      applicantSearch: getLatestStringFilter(columnFilters, 'applicantName'),
      actionSearch: getLatestStringFilter(columnFilters, 'title'),
      registrationLinkExpiresFrom: getDateFilterBounds(columnFilters, 'linkExpiry').from,
      registrationLinkExpiresUntil: getDateFilterBounds(columnFilters, 'linkExpiry').until,
      offerExpiresFrom: getDateFilterBounds(columnFilters, 'offerExpiry').from,
      offerExpiresUntil: getDateFilterBounds(columnFilters, 'offerExpiry').until,
      paymentGateSatisfied: getLatestBooleanFilter(columnFilters, 'payment'),
      placementConfigured: getLatestBooleanFilter(columnFilters, 'placement'),
      accountProvisioningPending: getLatestBooleanFilter(columnFilters, 'accounts'),
      repairSearch: getLatestStringFilter(columnFilters, 'repair'),
      sorting: state.sorting,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
    },
    { skip: !academicYearId }
  );
  const rowOwnerIds = useMemo(
    () =>
      Array.from(
        new Set(
          (queueQuery.data?.items || [])
            .map((item) => item.ownerUserId)
            .filter((value): value is string => Boolean(value))
        )
      ).join(','),
    [queueQuery.data?.items]
  );
  const rowStaffQuery = useGetAdmissionCrmStaffQuery(
    { ids: rowOwnerIds, maxResultCount: 1, academicYearId },
    { skip: !academicYearId || !rowOwnerIds }
  );
  const savedViewsQuery = useGetAdmissionCrmOperationsSavedViewsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const [createSavedView, createSavedViewState] =
    useCreateAdmissionCrmOperationsSavedViewMutation();
  const [deleteSavedView, deleteSavedViewState] =
    useDeleteAdmissionCrmOperationsSavedViewMutation();
  const [bulkAssignOwners, bulkAssignOwnersState] = useBulkAssignAdmissionCrmLeadOwnersMutation();
  const [bulkCreateTasks, bulkCreateTasksState] = useBulkCreateAdmissionCrmTasksMutation();
  const [bulkCreateOffers, bulkCreateOffersState] = useBulkCreateAdmissionCrmOffersMutation();

  useEffect(() => {
    setSelectedLeadIds([]);
  }, [
    selectedQueue,
    state.page,
    state.registrationStatus,
    state.documentStatus,
    state.offerStatus,
    state.activationStatus,
    state.serviceHandoffStatus,
  ]);
  useEffect(() => {
    setColumnFilters([]);
  }, [selectedQueue]);

  useEffect(() => {
    setOwner((ownerStaffQuery.data || []).find((item) => item.id === state.owner) || null);
  }, [ownerStaffQuery.data, state.owner]);
  useEffect(() => {
    setAssignee((assigneeStaffQuery.data || []).find((item) => item.id === state.assignee) || null);
  }, [assigneeStaffQuery.data, state.assignee]);

  const queueCounts = useMemo(
    () =>
      allowedQueues.map((queueType) => {
        const summary = summaryQuery.data?.queues.find((item) => item.queueType === queueType);
        return {
          queueType,
          label: queueLabels[queueType],
          count: summary?.count || 0,
          urgentCount: summary?.urgentCount || 0,
        };
      }),
    [allowedQueues, summaryQuery.data?.queues]
  );

  const staffById = useMemo(
    () =>
      new Map(
        [
          ...(ownerStaffQuery.data || []),
          ...(assigneeStaffQuery.data || []),
          ...(rowStaffQuery.data || []),
        ].map((staff) => [staff.id, staff.displayName])
      ),
    [assigneeStaffQuery.data, ownerStaffQuery.data, rowStaffQuery.data]
  );
  const items = useMemo(() => queueQuery.data?.items || [], [queueQuery.data?.items]);
  const selectedLeadSet = useMemo(() => new Set(selectedLeadIds), [selectedLeadIds]);
  const toggleLead = useCallback((leadId: string) => {
    setSelectedLeadIds((current) =>
      current.includes(leadId) ? current.filter((id) => id !== leadId) : [...current, leadId]
    );
  }, []);
  const toggleVisible = useCallback(
    (checked: boolean) => {
      setSelectedLeadIds((current) => {
        const visibleIds = items.map((item) => item.leadId);
        if (!checked) return current.filter((id) => !visibleIds.includes(id));
        return Array.from(new Set([...current, ...visibleIds]));
      });
    },
    [items]
  );
  const columns = useMemo(
    () =>
      buildOperationsQueueColumns({
        variant,
        applicantTab,
        openApplicant,
        staffById,
        items,
        selectedLeadIds: selectedLeadSet,
        onToggleLead: toggleLead,
        onToggleVisible: toggleVisible,
        seatPoolOptions: (seatPoolsQuery.data?.items || []).map((pool) => ({
          value: pool.id,
          label: pool.name,
        })),
      }),
    [
      applicantTab,
      items,
      openApplicant,
      seatPoolsQuery.data?.items,
      selectedLeadSet,
      staffById,
      toggleLead,
      toggleVisible,
      variant,
    ]
  );
  const tableFilters = useMemo<IParams['filters']>(
    () => [
      ...(state.registrationStatus == null
        ? []
        : [
            {
              column: 'registration',
              type: 'enum',
              value: state.registrationStatus,
              valueType: 'enum',
              label: 'Registration',
              displayValue: formatEnumLabel(
                AdmissionCrmRegistrationStatus[state.registrationStatus]
              ),
            },
          ]),
      ...(state.documentStatus == null
        ? []
        : [
            {
              column: 'documents',
              type: 'enum',
              value: state.documentStatus,
              valueType: 'enum',
              label: 'Documents',
              displayValue: formatEnumLabel(
                AdmissionCrmApplicantDocumentStatus[state.documentStatus]
              ),
            },
          ]),
      ...(state.offerStatus == null
        ? []
        : [
            {
              column: 'decision',
              type: 'enum',
              value: state.offerStatus,
              valueType: 'enum',
              label: 'Offer',
              displayValue: formatEnumLabel(AdmissionCrmSeatOfferStatus[state.offerStatus]),
            },
          ]),
      ...(state.routeType == null
        ? []
        : [
            {
              column: 'route',
              type: 'enum',
              value: state.routeType,
              valueType: 'enum',
              label: 'Admission route',
              displayValue: formatEnumLabel(AdmissionCrmRouteType[state.routeType]),
            },
          ]),
      ...(state.activationStatus == null
        ? []
        : [
            {
              column: 'activationStatus',
              type: 'enum',
              value: state.activationStatus,
              valueType: 'enum',
              label: 'Activation',
              displayValue: formatEnumLabel(AdmissionCrmActivationStatus[state.activationStatus]),
            },
          ]),
      ...(state.serviceHandoffStatus == null
        ? []
        : [
            {
              column: 'retry',
              type: 'enum',
              value: state.serviceHandoffStatus,
              valueType: 'enum',
              label: 'Handoff status',
              displayValue: formatEnumLabel(
                AdmissionCrmServiceHandoffStatus[state.serviceHandoffStatus]
              ),
            },
          ]),
      ...(state.minimumAgeDays == null
        ? []
        : [
            {
              column: 'due',
              type: 'number',
              value: state.minimumAgeDays,
              valueType: 'number',
              label: 'Minimum age',
              displayValue: `${state.minimumAgeDays} days`,
            },
          ]),
      ...(state.urgent
        ? [
            {
              column: 'severity',
              type: 'enum',
              value: true,
              valueType: 'enum',
              label: 'Severity',
              displayValue: 'Urgent',
            },
          ]
        : []),
      ...(!state.owner || state.owner === 'me'
        ? []
        : [
            {
              column: variant === 'operations' ? 'assignment' : 'owner',
              type: 'equals',
              value: state.owner,
              valueType: 'enum',
              label: variant === 'operations' ? 'Assignment' : 'Owner',
              displayValue: staffById.get(state.owner) || 'Assigned staff',
            },
          ]),
      ...(!state.seatPoolId
        ? []
        : [
            {
              column: 'seatPool',
              type: 'equals',
              value: state.seatPoolId,
              valueType: 'enum',
              label: 'Seat Pool',
              displayValue:
                seatPoolsQuery.data?.items.find((pool) => pool.id === state.seatPoolId)?.name ||
                'Selected seat pool',
            },
          ]),
    ],
    [
      state.activationStatus,
      state.documentStatus,
      state.minimumAgeDays,
      state.owner,
      state.offerStatus,
      state.registrationStatus,
      state.routeType,
      state.serviceHandoffStatus,
      state.seatPoolId,
      state.urgent,
      staffById,
      seatPoolsQuery.data?.items,
      variant,
    ]
  );

  const applySavedView = (savedView: AdmissionCrmOperationsSavedViewDto) => {
    if (!allowedQueues.includes(savedView.queueType)) {
      shikshaMitraToast.error({
        message: 'This saved view belongs to another Enrollment workspace.',
      });
      return;
    }
    setSearch('');
    setColumnFilters(restoreSavedColumnFilters(savedView.filters));
    updateState(
      {
        queue: savedView.queueType,
        sorting: savedView.filters.sorting,
        owner: savedView.filters.ownerUserId,
        assignee: savedView.filters.assignedToUserId,
        urgent: savedView.filters.urgentOnly || undefined,
        minimumAgeDays: savedView.filters.minimumAgeDays,
        registrationStatus: savedView.filters.registrationStatus,
        documentStatus: savedView.filters.documentStatus,
        offerStatus: savedView.filters.offerStatus,
        routeType: savedView.filters.routeType,
        seatPoolId: savedView.filters.seatPoolId,
        activationStatus: savedView.filters.activationStatus,
        serviceHandoffStatus: savedView.filters.serviceHandoffStatus,
        page: 1,
      },
      'push'
    );
  };

  const handleSaveView = async () => {
    if (!academicYearId || !savedViewName.trim()) return;
    try {
      await createSavedView({
        academicYearId,
        name: savedViewName.trim(),
        queueType: selectedQueue,
        filters: {
          applicantSearch: getLatestStringFilter(columnFilters, 'applicantName'),
          actionSearch: getLatestStringFilter(columnFilters, 'title'),
          ownerUserId: state.owner && state.owner !== 'me' ? state.owner : undefined,
          assignedToUserId: state.assignee,
          urgentOnly: state.urgent || undefined,
          minimumAgeDays: state.minimumAgeDays,
          registrationStatus: state.registrationStatus,
          documentStatus: state.documentStatus,
          offerStatus: state.offerStatus,
          routeType: state.routeType,
          seatPoolId: state.seatPoolId,
          activationStatus: state.activationStatus,
          serviceHandoffStatus: state.serviceHandoffStatus,
          registrationLinkExpiresFrom: getDateFilterBounds(columnFilters, 'linkExpiry').from,
          registrationLinkExpiresUntil: getDateFilterBounds(columnFilters, 'linkExpiry').until,
          offerExpiresFrom: getDateFilterBounds(columnFilters, 'offerExpiry').from,
          offerExpiresUntil: getDateFilterBounds(columnFilters, 'offerExpiry').until,
          paymentGateSatisfied: getLatestBooleanFilter(columnFilters, 'payment'),
          placementConfigured: getLatestBooleanFilter(columnFilters, 'placement'),
          accountProvisioningPending: getLatestBooleanFilter(columnFilters, 'accounts'),
          repairSearch: getLatestStringFilter(columnFilters, 'repair'),
          sorting: state.sorting,
        },
        isShared: false,
      }).unwrap();
      setSavedViewName('');
      shikshaMitraToast.success({ message: 'Operations view saved.' });
    } catch {
      shikshaMitraToast.error({ message: 'The operations view could not be saved.' });
    }
  };

  const closeBulkDialog = () => {
    setBulkAction(null);
    setBulkStaff(null);
    setBulkStaffSearch('');
    setBulkTaskTitle('');
    setBulkSeatPoolId('');
  };

  const handleBulkAction = async () => {
    if (!academicYearId || !bulkAction || selectedLeadIds.length === 0) return;
    try {
      let result: AdmissionCrmBulkOperationResultDto;
      if (bulkAction === 'owner') {
        if (!bulkStaff) return;
        result = await bulkAssignOwners({
          academicYearId,
          items: selectedLeadIds.map((leadId) => ({ leadId, ownerUserId: bulkStaff.id })),
        }).unwrap();
      } else if (bulkAction === 'task') {
        if (!bulkStaff || !bulkTaskTitle.trim()) return;
        result = await bulkCreateTasks({
          academicYearId,
          leadIds: selectedLeadIds,
          title: bulkTaskTitle.trim(),
          dueAt: new Date(bulkTaskDueAt).toISOString(),
          assignedUserId: bulkStaff.id,
        }).unwrap();
      } else {
        if (!bulkSeatPoolId) return;
        result = await bulkCreateOffers({
          academicYearId,
          leadIds: selectedLeadIds,
          offer: {
            seatPoolId: bulkSeatPoolId,
            offerType: AdmissionCrmSeatOfferType.Provisional,
            terms: {},
            language: 'en',
            validFrom: new Date().toISOString(),
            validUntil: new Date(`${bulkOfferValidUntil}T23:59:59`).toISOString(),
          },
        }).unwrap();
      }
      if (result.failedCount > 0) {
        setSelectedLeadIds(
          result.items.filter((item) => !item.success).map((item) => item.entityId)
        );
        shikshaMitraToast.error({
          message: `${result.succeededCount} completed; ${result.failedCount} failed and remain selected.`,
        });
        return;
      }
      shikshaMitraToast.success({
        message:
          bulkAction === 'owner'
            ? 'Owners updated for the selected applicants.'
            : bulkAction === 'task'
              ? 'Tasks created for the selected applicants.'
              : 'Eligible offers created. Blocked applicants were left unchanged.',
      });
      setSelectedLeadIds([]);
      closeBulkDialog();
    } catch (error) {
      shikshaMitraToast.error({
        message:
          typeof error === 'object' && error && 'data' in error
            ? ((error as { data?: { detail?: string } }).data?.detail ??
              'The bulk action could not be completed.')
            : 'The bulk action could not be completed.',
      });
    }
  };

  if (!academicYearId) {
    return (
      <Alert severity="info">Select an academic year to open this Enrollment workspace.</Alert>
    );
  }

  return (
    <Stack spacing={1.5} sx={showOperationsUtilities ? { minWidth: 0 } : enrollmentWorkspaceRootSx}>
      <EnrollmentWorkspaceHeader title={title} description={description} actions={headerActions} />

      <EnrollmentWorkspaceFilterPanel
        clearDisabled={
          columnFilters.length === 0 &&
          !state.owner &&
          !state.assignee &&
          !state.minimumAgeDays &&
          !state.urgent &&
          state.registrationStatus == null &&
          state.documentStatus == null &&
          state.offerStatus == null &&
          state.routeType == null &&
          !state.seatPoolId &&
          state.activationStatus == null &&
          state.serviceHandoffStatus == null
        }
        onClear={() => {
          setColumnFilters([]);
          updateState(
            {
              owner: undefined,
              assignee: undefined,
              minimumAgeDays: undefined,
              urgent: undefined,
              registrationStatus: undefined,
              documentStatus: undefined,
              offerStatus: undefined,
              routeType: undefined,
              seatPoolId: undefined,
              activationStatus: undefined,
              serviceHandoffStatus: undefined,
              page: 1,
            },
            'push'
          );
        }}
        actions={
          <Button
            size="small"
            variant="outlined"
            startIcon={<BookmarkAddOutlined />}
            onClick={() => setSavedViewsOpen(true)}
          >
            Saved views
          </Button>
        }
      >
        <TextField
          select
          size="small"
          label="Queue"
          value={selectedQueue}
          onChange={(event) =>
            updateState(
              {
                queue: Number(event.target.value) as AdmissionCrmOperationsQueueType,
                sorting: undefined,
                page: 1,
              },
              'push'
            )
          }
        >
          {queueCounts.map((queue) => (
            <MenuItem key={queue.queueType} value={queue.queueType}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
                sx={{ width: '100%' }}
              >
                <span>{queue.label}</span>
                <Stack direction="row" gap={0.5} alignItems="center">
                  <Chip size="small" variant="outlined" label={queue.count} />
                  {queue.urgentCount > 0 ? (
                    <Chip size="small" color="warning" label={`${queue.urgentCount} urgent`} />
                  ) : null}
                </Stack>
              </Stack>
            </MenuItem>
          ))}
        </TextField>
        {variant === 'registration' ? (
          <>
            <TextField
              select
              size="small"
              label="Registration status"
              value={state.registrationStatus ?? ''}
              onChange={(event) =>
                updateState({
                  registrationStatus:
                    event.target.value === ''
                      ? undefined
                      : (Number(event.target.value) as AdmissionCrmRegistrationStatus),
                  page: 1,
                })
              }
            >
              <MenuItem value="">All statuses</MenuItem>
              {enumOptions<AdmissionCrmRegistrationStatus>(AdmissionCrmRegistrationStatus).map(
                (option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                )
              )}
            </TextField>
            <TextField
              select
              size="small"
              label="Document status"
              value={state.documentStatus ?? ''}
              onChange={(event) =>
                updateState({
                  documentStatus:
                    event.target.value === ''
                      ? undefined
                      : (Number(event.target.value) as AdmissionCrmApplicantDocumentStatus),
                  page: 1,
                })
              }
            >
              <MenuItem value="">All documents</MenuItem>
              {enumOptions<AdmissionCrmApplicantDocumentStatus>(
                AdmissionCrmApplicantDocumentStatus
              ).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </>
        ) : null}
        {variant === 'offer' ? (
          <>
            <TextField
              select
              size="small"
              label="Offer status"
              value={state.offerStatus ?? ''}
              onChange={(event) =>
                updateState({
                  offerStatus:
                    event.target.value === ''
                      ? undefined
                      : (Number(event.target.value) as AdmissionCrmSeatOfferStatus),
                  page: 1,
                })
              }
            >
              <MenuItem value="">All offers</MenuItem>
              {enumOptions<AdmissionCrmSeatOfferStatus>(AdmissionCrmSeatOfferStatus).map(
                (option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                )
              )}
            </TextField>
            <TextField
              select
              size="small"
              label="Admission route"
              value={state.routeType ?? ''}
              onChange={(event) =>
                updateState({
                  routeType:
                    event.target.value === ''
                      ? undefined
                      : (Number(event.target.value) as AdmissionCrmRouteType),
                  page: 1,
                })
              }
            >
              <MenuItem value="">All routes</MenuItem>
              {enumOptions<AdmissionCrmRouteType>(AdmissionCrmRouteType).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Seat pool"
              value={state.seatPoolId || ''}
              onChange={(event) =>
                updateState({ seatPoolId: event.target.value || undefined, page: 1 })
              }
            >
              <MenuItem value="">All seat pools</MenuItem>
              {(seatPoolsQuery.data?.items || []).map((pool) => (
                <MenuItem key={pool.id} value={pool.id}>
                  {pool.name}
                </MenuItem>
              ))}
            </TextField>
          </>
        ) : null}
        {variant === 'activation' ? (
          <TextField
            select
            size="small"
            label="Activation status"
            value={state.activationStatus ?? ''}
            onChange={(event) =>
              updateState({
                activationStatus:
                  event.target.value === ''
                    ? undefined
                    : (Number(event.target.value) as AdmissionCrmActivationStatus),
                page: 1,
              })
            }
          >
            <MenuItem value="">All statuses</MenuItem>
            {enumOptions<AdmissionCrmActivationStatus>(AdmissionCrmActivationStatus).map(
              (option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              )
            )}
          </TextField>
        ) : null}
        {variant === 'operations' ? (
          <TextField
            select
            size="small"
            label="Handoff status"
            value={state.serviceHandoffStatus ?? ''}
            onChange={(event) =>
              updateState({
                serviceHandoffStatus:
                  event.target.value === ''
                    ? undefined
                    : (Number(event.target.value) as AdmissionCrmServiceHandoffStatus),
                page: 1,
              })
            }
          >
            <MenuItem value="">All handoff states</MenuItem>
            {enumOptions<AdmissionCrmServiceHandoffStatus>(AdmissionCrmServiceHandoffStatus).map(
              (option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              )
            )}
          </TextField>
        ) : null}
        <Autocomplete
          size="small"
          options={ownerStaffQuery.data || []}
          value={owner}
          inputValue={ownerSearch}
          onInputChange={(_, value) => setOwnerSearch(value)}
          onChange={(_, value) => updateState({ owner: value?.id, page: 1 })}
          getOptionLabel={(option) => `${option.displayName} (${option.employeeCode})`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          loading={ownerStaffQuery.isFetching}
          renderInput={(params) => <TextField {...params} label="Owner" />}
          sx={{ minWidth: 0, width: '100%' }}
        />
        <Autocomplete
          size="small"
          options={assigneeStaffQuery.data || []}
          value={assignee}
          inputValue={assigneeSearch}
          onInputChange={(_, value) => setAssigneeSearch(value)}
          onChange={(_, value) => updateState({ assignee: value?.id, page: 1 })}
          getOptionLabel={(option) => `${option.displayName} (${option.employeeCode})`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          loading={assigneeStaffQuery.isFetching}
          renderInput={(params) => <TextField {...params} label="Assignee" />}
          sx={{ minWidth: 0, width: '100%' }}
        />
        <TextField
          size="small"
          type="number"
          name="minimumAgeDays"
          autoComplete="off"
          label="Minimum age (days)"
          value={state.minimumAgeDays || ''}
          onChange={(event) =>
            updateState({
              minimumAgeDays: event.target.value ? Number(event.target.value) : undefined,
              page: 1,
            })
          }
          inputProps={{ min: 1, max: 3650 }}
          sx={{ minWidth: 0, width: '100%' }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(state.urgent)}
              onChange={(_, checked) => updateState({ urgent: checked || undefined, page: 1 })}
            />
          }
          label="Urgent only"
        />
      </EnrollmentWorkspaceFilterPanel>

      {selectedLeadIds.length > 0 ? (
        <Paper
          variant="outlined"
          role="region"
          aria-label="Bulk enrollment actions"
          sx={{ p: 1, position: 'sticky', top: 8, zIndex: 2 }}
        >
          <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
            <Chip color="primary" label={`${selectedLeadIds.length} selected`} />
            {canBulkOperate ? (
              <>
                <Button size="small" onClick={() => setBulkAction('owner')}>
                  Assign owner
                </Button>
                <Button size="small" onClick={() => setBulkAction('task')}>
                  Create task
                </Button>
                {(variant === 'registration' || variant === 'offer') && (
                  <Button size="small" variant="contained" onClick={() => setBulkAction('offer')}>
                    Create offers
                  </Button>
                )}
              </>
            ) : null}
            <Button size="small" color="inherit" onClick={() => setSelectedLeadIds([])}>
              Clear selection
            </Button>
          </Stack>
        </Paper>
      ) : null}

      <Dialog open={Boolean(bulkAction)} onClose={closeBulkDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {bulkAction === 'owner'
            ? 'Assign owner'
            : bulkAction === 'task'
              ? 'Create tasks'
              : 'Create offers'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Alert severity="info">{selectedLeadIds.length} selected applicants</Alert>
            {(bulkAction === 'owner' || bulkAction === 'task') && (
              <Autocomplete
                options={bulkStaffQuery.data || []}
                value={bulkStaff}
                inputValue={bulkStaffSearch}
                onInputChange={(_event, value) => setBulkStaffSearch(value)}
                onChange={(_event, value) => setBulkStaff(value)}
                getOptionLabel={(option) => `${option.displayName} (${option.employeeCode})`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                loading={bulkStaffQuery.isFetching}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={bulkAction === 'owner' ? 'Owner' : 'Task assignee'}
                  />
                )}
              />
            )}
            {bulkAction === 'task' ? (
              <>
                <TextField
                  label="Task title"
                  value={bulkTaskTitle}
                  onChange={(event) => setBulkTaskTitle(event.target.value)}
                />
                <TextField
                  type="datetime-local"
                  label="Due at"
                  value={bulkTaskDueAt}
                  onChange={(event) => setBulkTaskDueAt(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </>
            ) : null}
            {bulkAction === 'offer' ? (
              <>
                <TextField
                  select
                  label="Seat pool"
                  value={bulkSeatPoolId}
                  onChange={(event) => setBulkSeatPoolId(event.target.value)}
                >
                  {(seatPoolsQuery.data?.items || []).map((pool) => (
                    <MenuItem key={pool.id} value={pool.id}>
                      {pool.name} ({pool.remainingCapacity} seats available)
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  type="date"
                  label="Offer valid until"
                  value={bulkOfferValidUntil}
                  onChange={(event) => setBulkOfferValidUntil(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <Alert severity="warning">
                  Admission criteria are checked for every applicant. Applicants with missing
                  registration, documents, payment, or capacity remain unchanged.
                </Alert>
              </>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBulkDialog}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={
              bulkAssignOwnersState.isLoading ||
              bulkCreateTasksState.isLoading ||
              bulkCreateOffersState.isLoading
            }
            disabled={
              (bulkAction === 'owner' && !bulkStaff) ||
              (bulkAction === 'task' && (!bulkStaff || !bulkTaskTitle.trim() || !bulkTaskDueAt)) ||
              (bulkAction === 'offer' && (!bulkSeatPoolId || !bulkOfferValidUntil))
            }
            onClick={handleBulkAction}
          >
            {bulkAction === 'owner'
              ? 'Assign'
              : bulkAction === 'task'
                ? 'Create tasks'
                : 'Create eligible offers'}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={savedViewsOpen}
        onClose={() => setSavedViewsOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Saved Views</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <TextField
                fullWidth
                size="small"
                label="View name"
                value={savedViewName}
                onChange={(event) => setSavedViewName(event.target.value)}
                autoComplete="off"
              />
              <LoadingButton
                variant="contained"
                startIcon={<BookmarkAddOutlined />}
                loading={createSavedViewState.isLoading}
                disabled={!savedViewName.trim()}
                onClick={handleSaveView}
              >
                Save Current
              </LoadingButton>
            </Stack>
            <Divider />
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              {(savedViewsQuery.data || [])
                .filter((view) => allowedQueues.includes(view.queueType))
                .map((view) => (
                  <Chip
                    key={view.id}
                    label={view.name}
                    onClick={() => {
                      applySavedView(view);
                      setSavedViewsOpen(false);
                    }}
                    onDelete={async () => {
                      try {
                        await deleteSavedView({ viewId: view.id }).unwrap();
                        shikshaMitraToast.success({ message: 'Saved view deleted.' });
                      } catch {
                        shikshaMitraToast.error({
                          message: 'The saved view could not be deleted.',
                        });
                      }
                    }}
                    deleteIcon={<DeleteOutlineRounded />}
                    disabled={deleteSavedViewState.isLoading}
                  />
                ))}
              {!(savedViewsQuery.data || []).some((view) =>
                allowedQueues.includes(view.queueType)
              ) ? (
                <Typography variant="body2" color="text.secondary">
                  No saved views for this workspace.
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSavedViewsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {queueQuery.isError ? (
        <EnrollmentWorkspaceErrorState
          message="This operations queue is unavailable."
          onRetry={() => queueQuery.refetch()}
        />
      ) : (
        <CustomizableTable
          tableId={`student-enrollment-operations-${selectedQueue}`}
          tableTitle={queueLabels[selectedQueue]}
          columns={columns}
          data={queueQuery.data?.items || []}
          isLoading={queueQuery.isLoading}
          serverSide
          serverSidePagination
          serverSideSearch
          serverSideSort
          serverSideFilter
          searchTerm={search}
          defaultSearchTerm={search}
          searchFieldProps={{
            placeholder: 'Search this queue',
            inputProps: { 'aria-label': 'Search this admissions queue' },
          }}
          totalCount={queueQuery.data?.totalCount || 0}
          filters={[...tableFilters, ...columnFilters]}
          page={page}
          rowsPerPage={pageSize}
          defaultRowsPerPage={pageSize}
          rowsPerPageOptions={[pageSize]}
          onServerSearch={setSearch}
          onServerPagination={(nextPage) => updateState({ page: nextPage }, 'push')}
          onServerSort={(_column, sorts) => {
            const sort = sorts[0];
            updateState(
              {
                sorting: sort ? `${sort.originalId || sort.column} ${sort.direction}` : undefined,
                page: 1,
              },
              'push'
            );
          }}
          onServerFilter={(filters) => {
            const stateFilterColumns = new Set([
              'registration',
              'documents',
              'decision',
              'route',
              'activationStatus',
              'retry',
              'due',
              'severity',
              'owner',
              'assignment',
              'seatPool',
            ]);
            setColumnFilters(filters.filter((filter) => !stateFilterColumns.has(filter.column)));
            updateState(
              {
                registrationStatus: getLatestEnumFilter<AdmissionCrmRegistrationStatus>(
                  filters,
                  'registration'
                ),
                documentStatus: getLatestEnumFilter<AdmissionCrmApplicantDocumentStatus>(
                  filters,
                  'documents'
                ),
                offerStatus: getLatestEnumFilter<AdmissionCrmSeatOfferStatus>(filters, 'decision'),
                routeType: getLatestEnumFilter<AdmissionCrmRouteType>(filters, 'route'),
                activationStatus: getLatestEnumFilter<AdmissionCrmActivationStatus>(
                  filters,
                  'activationStatus'
                ),
                serviceHandoffStatus: getLatestEnumFilter<AdmissionCrmServiceHandoffStatus>(
                  filters,
                  'retry'
                ),
                minimumAgeDays: getLatestNumberFilter(filters, 'due'),
                urgent: getLatestFilter(filters, 'severity') === true || undefined,
                owner:
                  getLatestStringFilter(filters, 'owner') ||
                  getLatestStringFilter(filters, 'assignment'),
                seatPoolId: getLatestStringFilter(filters, 'seatPool'),
                page: 1,
              },
              'push'
            );
          }}
          noDataText={
            <EnrollmentTableEmptyState
              title="Queue cleared"
              description="No applicants currently need action in this queue."
            />
          }
          rowProps={(row) => ({
            'data-testid': 'student-enrollment-operations-row',
            'data-queue-key': row.key,
          })}
          wrapperProps={showOperationsUtilities ? undefined : { sx: enrollmentTableWrapperSx }}
          tableContainerProps={{ sx: enrollmentTableContainerSx }}
        />
      )}

      {showOperationsUtilities && (
        <Stack spacing={1.5}>
          <IntegrationCapabilitiesPanel academicYearId={academicYearId} />
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                <Box>
                  <Typography variant="subtitle2">Operations Utilities</Typography>
                  <Typography variant="body2" color="text.secondary">
                    RTE allotment reconciliation and data-quality exception handling.
                  </Typography>
                </Box>
                <Button size="small" onClick={() => setShowUtilities((current) => !current)}>
                  {showUtilities ? 'Hide' : 'Open'}
                </Button>
              </Stack>
              {showUtilities && (
                <Stack spacing={2}>
                  <Divider />
                  <RteAllotmentImport academicYearId={academicYearId} />
                  <AdmissionsDataQuality academicYearId={academicYearId} />
                </Stack>
              )}
            </Stack>
          </Paper>
        </Stack>
      )}

      <ApplicantWorkspaceDrawer
        leadId={state.applicant}
        academicYearId={academicYearId}
        initialTab={(state.applicantTab as ApplicantDrawerTab | undefined) || applicantTab}
        onTabChange={(tab) => updateState({ applicantTab: tab }, 'replace')}
        onClose={closeApplicant}
      />
    </Stack>
  );
}
