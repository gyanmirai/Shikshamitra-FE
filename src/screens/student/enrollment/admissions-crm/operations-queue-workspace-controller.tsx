'use client';

import type { ReactNode } from 'react';

import type { RootState } from 'src/redux/store';

import type { IParams } from 'src/components/customizabaleTable/types';

import type { AdmissionCrmStaffLookupDto } from 'src/redux/student/admissions-crm/core-leads-contracts';

import type {
  AdmissionCrmBulkOperationResultDto,
  AdmissionCrmOperationsQueueFilters,
  AdmissionCrmOperationsSavedViewDto,
} from 'src/redux/student/admissions-crm/operations-governance-contracts';

import { useSelector } from 'react-redux';

import { shikshaMitraToast } from 'src/components/toast';

import { hasGrantedPermission } from 'src/utils/permissions';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import {
  AdmissionCrmRouteType,
  AdmissionCrmSeatOfferType,
  AdmissionCrmSeatOfferStatus,
  AdmissionCrmActivationStatus,
} from 'src/redux/student/admissions-crm/final-admission-contracts';

import {
  useGetAdmissionCrmStaffQuery,
  useBulkCreateAdmissionCrmTasksMutation,
  useBulkAssignAdmissionCrmLeadOwnersMutation,
} from 'src/redux/student/admissions-crm/core-leads-api';

import {
  AdmissionCrmRegistrationStatus,
  AdmissionCrmApplicantDocumentStatus,
} from 'src/redux/student/admissions-crm/registration-documents-contracts';

import { AdmissionCrmOperationsQueueType } from 'src/redux/student/admissions-crm/operations-governance-contracts';

import { AdmissionCrmServiceHandoffStatus } from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  useGetAdmissionCrmSeatPoolsQuery,
  useBulkCreateAdmissionCrmOffersMutation,
} from 'src/redux/student/admissions-crm/final-admission-api';

import {
  useGetAdmissionCrmOperationsQueueQuery,
  useGetAdmissionCrmOperationsSavedViewsQuery,
  useGetAdmissionCrmOperationsQueueSummaryQuery,
  useCreateAdmissionCrmOperationsSavedViewMutation,
  useDeleteAdmissionCrmOperationsSavedViewMutation,
} from 'src/redux/student/admissions-crm/operations-governance-api';

import { formatEnumLabel } from './enrollment-display';

import { useEnrollmentWorkspace } from './enrollment-workspace-context';

import { useWorkspaceTableSessionState } from './workspace-table-session-state';

import {
  buildOperationsQueueColumns,
  type EnrollmentQueueVariant,
} from './operations-queue-columns';

import type { ApplicantWorkspaceTab } from './applicant-workspace-page';

type Props = {
  title: string;
  description: string;
  defaultQueue: AdmissionCrmOperationsQueueType;
  allowedQueues?: AdmissionCrmOperationsQueueType[];
  applicantTab?: ApplicantWorkspaceTab;
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
  [AdmissionCrmOperationsQueueType.PendingPaperEntry]: 'Paper Entry',
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

const getLatestFilter = (filters: IParams['filters'], column: string) =>
  [...filters].reverse().find((filter) => filter.column === column)?.value;

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

export function useOperationsQueueController({
  title,
  description,
  defaultQueue,
  allowedQueues = allQueues,
  applicantTab = 'next',
  variant = 'operations',
  showOperationsUtilities = false,
  headerActions,
}: Props) {
  const { academicYearId, sessionIdentity, state, updateState, getApplicantHref, openApplicant } =
    useEnrollmentWorkspace();

  const permissions = useSelector((root: RootState) => root.auth.permissions);

  const selectedQueue =
    state.queue != null && allowedQueues.includes(state.queue) ? state.queue : defaultQueue;

  const page = Math.max(0, state.page - 1);

  const {
    search,
    setSearch,
    filters: columnFilters,
    setFilters: setColumnFilters,
  } = useWorkspaceTableSessionState(
    `operations-${variant}:${academicYearId || 'none'}:${sessionIdentity}`
  );

  const [ownerSearch, setOwnerSearch] = useState('');

  const [assigneeSearch, setAssigneeSearch] = useState('');

  const [debouncedOwnerSearch, setDebouncedOwnerSearch] = useState('');

  const [debouncedAssigneeSearch, setDebouncedAssigneeSearch] = useState('');

  const [owner, setOwner] = useState<AdmissionCrmStaffLookupDto | null>(null);

  const [assignee, setAssignee] = useState<AdmissionCrmStaffLookupDto | null>(null);

  const [savedViewName, setSavedViewName] = useState('');

  const [savedViewsOpen, setSavedViewsOpen] = useState(false);

  const [showUtilities, setShowUtilities] = useState(false);

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

  const previousSelectedQueueRef = useRef(selectedQueue);

  useEffect(() => {
    if (previousSelectedQueueRef.current === selectedQueue) return;
    previousSelectedQueueRef.current = selectedQueue;
    setColumnFilters([]);
  }, [selectedQueue, setColumnFilters]);

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
        getApplicantHref,
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
      getApplicantHref,
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
              label: 'Class Placement Plan',
              displayValue:
                seatPoolsQuery.data?.items.find((pool) => pool.id === state.seatPoolId)?.name ||
                'Selected class placement plan',
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

  return {
    state: {
      academicYearId,
      allowedQueues,
      applicantTab,
      bulkAction,
      bulkOfferValidUntil,
      bulkSeatPoolId,
      bulkStaff,
      bulkStaffSearch,
      bulkTaskDueAt,
      bulkTaskTitle,
      columns,
      deleteSavedView,
      description,
      headerActions,
      items,
      owner,
      ownerSearch,
      page,
      queueCounts,
      search,
      selectedLeadIds,
      selectedQueue,
      showOperationsUtilities,
      showUtilities,
      state,
      title,
      variant,
    },
    actions: {
      applySavedView,
      assignee,
      assigneeSearch,
      closeBulkDialog,
      createSavedViewState,
      handleBulkAction,
      handleSaveView,
      openApplicant,
      savedViewName,
      savedViewsOpen,
      setAssigneeSearch,
      setBulkAction,
      setBulkOfferValidUntil,
      setBulkSeatPoolId,
      setBulkStaff,
      setBulkStaffSearch,
      setBulkTaskDueAt,
      setBulkTaskTitle,
      setColumnFilters,
      setOwnerSearch,
      setSavedViewName,
      setSavedViewsOpen,
      setSearch,
      setSelectedLeadIds,
      setShowUtilities,
      updateState,
    },
    meta: {
      assigneeStaffQuery,
      bulkAssignOwnersState,
      bulkCreateOffersState,
      bulkCreateTasksState,
      bulkStaffQuery,
      canBulkOperate,
      columnFilters,
      deleteSavedViewState,
      ownerStaffQuery,
      queueQuery,
      savedViewsQuery,
      seatPoolsQuery,
      tableFilters,
    },
  };
}

export type OperationsQueueController = ReturnType<typeof useOperationsQueueController>;
