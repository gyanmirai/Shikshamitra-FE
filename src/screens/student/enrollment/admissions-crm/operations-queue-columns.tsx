import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionCrmOperationsQueueItemDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import ThreeDotsActions from 'src/components/three-dots-actions';
import { Chip, Link, Stack, Checkbox, Typography, LinearProgress } from '@mui/material';
import {
  AdmissionCrmRouteType,
  AdmissionCrmSeatOfferStatus,
  AdmissionCrmActivationStatus,
  AdmissionCrmRegistrationStatus,
  AdmissionCrmServiceHandoffStatus,
  AdmissionCrmApplicantDocumentStatus,
  AdmissionCrmRegistrationProvenance,
  AdmissionCrmRegistrationDataEntryState,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { enrollmentActionsColumn } from './workspace-table-patterns';
import { createApplicantLinkNavigationProps } from './applicant-row-navigation';
import {
  getRouteTypeLabel,
  getOfferStatusLabel,
  formatEnrollmentDate,
  getFinanceStateLabel,
  getHandoffStatusLabel,
  getDecisionStatusLabel,
  getActivationStatusLabel,
  getRegistrationStatusLabel,
  getRegistrationFeeStatusLabel,
} from './enrollment-display';

import type { ApplicantWorkspaceTab } from './applicant-workspace-page';

export type EnrollmentQueueVariant = 'registration' | 'offer' | 'activation' | 'operations';

type Options = {
  variant: EnrollmentQueueVariant;
  applicantTab: ApplicantWorkspaceTab;
  getApplicantHref: (leadId: string, tab?: ApplicantWorkspaceTab) => string;
  openApplicant: (leadId: string, tab?: ApplicantWorkspaceTab) => void;
  staffById: ReadonlyMap<string, string>;
  items: AdmissionCrmOperationsQueueItemDto[];
  selectedLeadIds: ReadonlySet<string>;
  onToggleLead: (leadId: string) => void;
  onToggleVisible: (checked: boolean) => void;
  seatPoolOptions: Array<{ value: string; label: string }>;
};

const selectionColumn = (options: Options): IColumn => ({
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
  renderColumn: () => {
    const allVisibleSelected =
      options.items.length > 0 &&
      options.items.every((item) => options.selectedLeadIds.has(item.leadId));
    const someVisibleSelected = options.items.some((item) =>
      options.selectedLeadIds.has(item.leadId)
    );
    return (
      <Checkbox
        size="small"
        checked={allVisibleSelected}
        indeterminate={someVisibleSelected && !allVisibleSelected}
        onChange={(_event, checked) => options.onToggleVisible(checked)}
        inputProps={{ 'aria-label': 'Select visible applicants' }}
      />
    );
  },
  render: (_value, row) => {
    const item = row as AdmissionCrmOperationsQueueItemDto;
    return (
      <Checkbox
        size="small"
        checked={options.selectedLeadIds.has(item.leadId)}
        onClick={(event) => event.stopPropagation()}
        onChange={() => options.onToggleLead(item.leadId)}
        inputProps={{ 'aria-label': `Select ${item.applicantName}` }}
      />
    );
  },
});

const applicantColumn = ({
  applicantTab,
  getApplicantHref,
  openApplicant,
}: Pick<Options, 'applicantTab' | 'getApplicantHref' | 'openApplicant'>): IColumn => ({
  id: 'applicantName',
  originalId: 'ApplicantName',
  label: 'Applicant',
  width: 220,
  minWidth: 200,
  sticky: true,
  stickyPosition: 'left',
  stickyOnMobile: false,
  filterType: 'string',
  render: (value, row) => {
    const item = row as AdmissionCrmOperationsQueueItemDto;
    return (
      <Link
        {...createApplicantLinkNavigationProps({
          href: getApplicantHref(item.leadId, applicantTab),
          onOpen: () => openApplicant(item.leadId, applicantTab),
        })}
        variant="subtitle2"
        color="inherit"
        underline="hover"
        noWrap
        sx={{ textAlign: 'left' }}
      >
        {value}
      </Link>
    );
  },
});

const nextActionColumn: IColumn = {
  id: 'title',
  originalId: 'Title',
  label: 'Next Action',
  width: 290,
  minWidth: 250,
  filterType: 'string',
  render: (value, row) => {
    const item = row as AdmissionCrmOperationsQueueItemDto;
    return (
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography variant="body2" noWrap>
          {value}
        </Typography>
        {item.details ? (
          <Typography variant="caption" color="text.secondary" noWrap>
            {item.details}
          </Typography>
        ) : null}
      </Stack>
    );
  },
};

const ownerColumn = (staffById: ReadonlyMap<string, string>): IColumn => ({
  id: 'owner',
  originalId: 'OwnerUserId',
  label: 'Owner',
  width: 180,
  minWidth: 155,
  filterType: 'enum',
  enumOptions: Array.from(staffById, ([value, label]) => ({ value, label })),
  render: (_value, row) => {
    const { ownerUserId } = row as AdmissionCrmOperationsQueueItemDto;
    if (!ownerUserId) return 'Unassigned';
    return staffById.get(ownerUserId) || 'Assigned';
  },
});

const actionsColumn = ({ applicantTab, openApplicant }: Omit<Options, 'variant'>): IColumn => ({
  id: 'actions',
  label: 'Actions',
  ...enrollmentActionsColumn,
  isSort: false,
  isFilter: false,
  render: (_value, row) => {
    const item = row as AdmissionCrmOperationsQueueItemDto;
    return (
      <ThreeDotsActions
        placement="right-top"
        showViewIcon
        viewLabel="Review Applicant"
        handleViewClick={() => openApplicant(item.leadId, applicantTab)}
        showThreeDots={false}
      />
    );
  },
});

const getRegistrationProvenanceLabel = (
  value?: AdmissionCrmRegistrationProvenance | null
) => {
  if (value === AdmissionCrmRegistrationProvenance.StaffEnteredFromPaper) return 'Paper form';
  if (value === AdmissionCrmRegistrationProvenance.StaffAssistedCounter) return 'Staff assisted';
  if (value === AdmissionCrmRegistrationProvenance.Imported) return 'Imported';
  return 'Online';
};

const getDataEntryStateLabel = (value?: AdmissionCrmRegistrationDataEntryState | null) => {
  if (value === AdmissionCrmRegistrationDataEntryState.InProgress) return 'Entry in progress';
  if (value === AdmissionCrmRegistrationDataEntryState.Submitted) return 'Entry submitted';
  if (value === AdmissionCrmRegistrationDataEntryState.Verified) return 'Entry verified';
  return 'Entry not started';
};

const registrationColumns = (options: Options): IColumn[] => [
  selectionColumn(options),
  applicantColumn(options),
  {
    id: 'registration',
    originalId: 'RegistrationStatus',
    label: 'Registration',
    width: 190,
    minWidth: 170,
    filterType: 'enum',
    enumOptions: Object.values(AdmissionCrmRegistrationStatus)
      .filter((value): value is AdmissionCrmRegistrationStatus => typeof value === 'number')
      .map((value) => ({ value, label: getRegistrationStatusLabel(value) })),
    render: (_value, row) => {
      const context = (row as AdmissionCrmOperationsQueueItemDto).registration;
      return (
        <Stack spacing={0.25}>
          <Chip
            size="small"
            variant="outlined"
            label={getRegistrationStatusLabel(context?.status)}
          />
          <Typography variant="caption" color="text.secondary">
            {context?.formNumber || 'Form not issued'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {context?.provenance === AdmissionCrmRegistrationProvenance.StaffEnteredFromPaper &&
            context.physicalFormNumber
              ? `${getRegistrationProvenanceLabel(context.provenance)} ${context.physicalFormNumber}`
              : getRegistrationProvenanceLabel(context?.provenance)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getDataEntryStateLabel(context?.dataEntryState)}
          </Typography>
        </Stack>
      );
    },
  },
  {
    id: 'completion',
    originalId: 'CompletionPercentage',
    label: 'Completion',
    width: 170,
    minWidth: 150,
    isFilter: false,
    render: (_value, row) => {
      const context = (row as AdmissionCrmOperationsQueueItemDto).registration;
      const completion = Math.max(0, Math.min(100, context?.completionPercentage || 0));
      return (
        <Stack spacing={0.5}>
          <Typography variant="body2">{completion.toFixed(0)}%</Typography>
          <LinearProgress
            variant="determinate"
            value={completion}
            aria-label={`${completion}% complete`}
          />
        </Stack>
      );
    },
  },
  {
    id: 'documents',
    originalId: 'DocumentPendingCount',
    label: 'Documents',
    width: 150,
    minWidth: 135,
    filterType: 'enum',
    enumOptions: Object.values(AdmissionCrmApplicantDocumentStatus)
      .filter((value): value is AdmissionCrmApplicantDocumentStatus => typeof value === 'number')
      .map((value) => ({ value, label: AdmissionCrmApplicantDocumentStatus[value] })),
    render: (_value, row) => {
      const context = (row as AdmissionCrmOperationsQueueItemDto).registration;
      return context?.documentTotalCount
        ? `${context.documentResolvedCount}/${context.documentTotalCount} resolved`
        : 'Not assigned';
    },
  },
  {
    id: 'fee',
    originalId: 'FeeStatus',
    label: 'Fee Readiness',
    width: 155,
    minWidth: 135,
    isFilter: false,
    render: (_value, row) => {
      const context = (row as AdmissionCrmOperationsQueueItemDto).registration;
      return getRegistrationFeeStatusLabel(context?.feeStatus);
    },
  },
  {
    id: 'linkExpiry',
    originalId: 'LinkExpiresAt',
    label: 'Link Expiry',
    width: 140,
    minWidth: 125,
    filterType: 'date',
    render: (_value, row) =>
      formatEnrollmentDate((row as AdmissionCrmOperationsQueueItemDto).registration?.linkExpiresAt),
  },
  ownerColumn(options.staffById),
  nextActionColumn,
  actionsColumn(options),
];

const offerColumns = (options: Options): IColumn[] => [
  selectionColumn(options),
  applicantColumn(options),
  {
    id: 'route',
    originalId: 'RouteType',
    label: 'Admission Route',
    width: 170,
    minWidth: 150,
    filterType: 'enum',
    enumOptions: Object.values(AdmissionCrmRouteType)
      .filter((value): value is AdmissionCrmRouteType => typeof value === 'number')
      .map((value) => ({ value, label: getRouteTypeLabel(value) })),
    render: (_value, row) =>
      getRouteTypeLabel((row as AdmissionCrmOperationsQueueItemDto).offer?.routeType),
  },
  {
    id: 'decision',
    originalId: 'OfferStatus',
    label: 'Decision / Offer',
    width: 190,
    minWidth: 170,
    filterType: 'enum',
    enumOptions: Object.values(AdmissionCrmSeatOfferStatus)
      .filter((value): value is AdmissionCrmSeatOfferStatus => typeof value === 'number')
      .map((value) => ({ value, label: getOfferStatusLabel(value) })),
    render: (_value, row) => {
      const context = (row as AdmissionCrmOperationsQueueItemDto).offer;
      return (
        <Stack spacing={0.25}>
          <Typography variant="body2">{getDecisionStatusLabel(context?.decisionStatus)}</Typography>
          <Typography variant="caption" color="text.secondary">
            {context?.offerId ? getOfferStatusLabel(context.offerStatus) : 'Offer not issued'}
          </Typography>
        </Stack>
      );
    },
  },
  {
    id: 'seatPool',
    originalId: 'SeatPoolName',
    label: 'Class Placement Plan',
    width: 180,
    minWidth: 155,
    filterType: 'enum',
    enumOptions: options.seatPoolOptions,
    render: (_value, row) => {
      const context = (row as AdmissionCrmOperationsQueueItemDto).offer;
      return context?.seatPoolName
        ? `${context.seatPoolName} (${context.remainingSeats ?? 0} left)`
        : 'Not allocated';
    },
  },
  {
    id: 'payment',
    originalId: 'PaymentGateSatisfied',
    label: 'Payment Condition',
    width: 175,
    minWidth: 155,
    filterType: 'enum',
    enumOptions: [
      { value: true, label: 'Satisfied' },
      { value: false, label: 'Not satisfied' },
    ],
    render: (_value, row) => {
      const context = (row as AdmissionCrmOperationsQueueItemDto).offer;
      if (context?.paymentGateSatisfied == null) return 'Not configured';
      return context.paymentGateSatisfied
        ? 'Satisfied'
        : getFinanceStateLabel(context.financeState);
    },
  },
  {
    id: 'offerExpiry',
    originalId: 'OfferExpiresAt',
    label: 'Offer Expiry',
    width: 140,
    minWidth: 125,
    filterType: 'date',
    render: (_value, row) =>
      formatEnrollmentDate((row as AdmissionCrmOperationsQueueItemDto).offer?.offerExpiresAt),
  },
  ownerColumn(options.staffById),
  nextActionColumn,
  actionsColumn(options),
];

const activationColumns = (options: Options): IColumn[] => [
  selectionColumn(options),
  applicantColumn(options),
  {
    id: 'activationStatus',
    originalId: 'ActivationStatus',
    label: 'Activation',
    width: 175,
    minWidth: 155,
    filterType: 'enum',
    enumOptions: Object.values(AdmissionCrmActivationStatus)
      .filter((value): value is AdmissionCrmActivationStatus => typeof value === 'number')
      .map((value) => ({ value, label: getActivationStatusLabel(value) })),
    render: (_value, row) => {
      const context = (row as AdmissionCrmOperationsQueueItemDto).activation;
      return (
        <Stack spacing={0.25}>
          <Chip size="small" variant="outlined" label={getActivationStatusLabel(context?.status)} />
          <Typography variant="caption" color="text.secondary">
            {context?.activationReference || 'Not requested'}
          </Typography>
        </Stack>
      );
    },
  },
  {
    id: 'placement',
    originalId: 'PlacementConfigured',
    label: 'Placement',
    width: 150,
    minWidth: 135,
    filterType: 'enum',
    enumOptions: [
      { value: true, label: 'Configured' },
      { value: false, label: 'Pending' },
    ],
    render: (_value, row) => {
      const context = (row as AdmissionCrmOperationsQueueItemDto).activation;
      if (!context?.placementConfigured) return 'Pending';
      return context.rollNumber ? `Configured · Roll ${context.rollNumber}` : 'Configured';
    },
  },
  {
    id: 'accounts',
    label: 'Accounts',
    width: 160,
    minWidth: 145,
    isSort: false,
    filterType: 'enum',
    enumOptions: [
      { value: true, label: 'Provisioning pending' },
      { value: false, label: 'Provisioned' },
    ],
    render: (_value, row) => {
      const context = (row as AdmissionCrmOperationsQueueItemDto).activation;
      if (!context) return 'Not started';
      if (context.studentId) return 'Student linked';
      if (context.requireStudentAccount || context.requireGuardianAccount)
        return 'Provisioning pending';
      return 'Not required';
    },
  },
  {
    id: 'repair',
    label: 'Repair / Blocker',
    width: 230,
    minWidth: 200,
    isSort: false,
    filterType: 'string',
    render: (_value, row) => {
      const context = (row as AdmissionCrmOperationsQueueItemDto).activation;
      return context?.repairStep || context?.repairReason || 'No blocker recorded';
    },
  },
  ownerColumn(options.staffById),
  nextActionColumn,
  actionsColumn(options),
];

const operationsColumns = (options: Options): IColumn[] => [
  selectionColumn(options),
  applicantColumn(options),
  nextActionColumn,
  {
    id: 'severity',
    originalId: 'IsUrgent',
    label: 'Severity',
    width: 120,
    minWidth: 110,
    filterType: 'enum',
    enumOptions: [{ value: true, label: 'Urgent' }],
    render: (_value, row) => {
      const item = row as AdmissionCrmOperationsQueueItemDto;
      return (
        <Chip
          size="small"
          color={item.isUrgent ? 'warning' : 'default'}
          variant={item.isUrgent ? 'filled' : 'outlined'}
          label={item.operation?.severity || 'Normal'}
        />
      );
    },
  },
  {
    id: 'assignment',
    originalId: 'OwnerUserId',
    label: 'Assignment',
    width: 135,
    minWidth: 120,
    filterType: 'enum',
    enumOptions: Array.from(options.staffById, ([value, label]) => ({ value, label })),
    render: (_value, row) => {
      const item = row as AdmissionCrmOperationsQueueItemDto;
      if (!item.ownerUserId) return 'Unassigned';
      return (
        options.staffById.get(item.ownerUserId) || item.operation?.assignmentStatus || 'Assigned'
      );
    },
  },
  {
    id: 'due',
    originalId: 'AgeDays',
    label: 'Age / Due',
    width: 150,
    minWidth: 135,
    filterType: 'number',
    render: (_value, row) => {
      const item = row as AdmissionCrmOperationsQueueItemDto;
      return `${item.ageDays} days · ${formatEnrollmentDate(item.dueAt)}`;
    },
  },
  {
    id: 'retry',
    originalId: 'ServiceHandoffStatus',
    label: 'Retry State',
    width: 145,
    minWidth: 130,
    filterType: 'enum',
    enumOptions: Object.values(AdmissionCrmServiceHandoffStatus)
      .filter((value): value is AdmissionCrmServiceHandoffStatus => typeof value === 'number')
      .map((value) => ({ value, label: getHandoffStatusLabel(value) })),
    render: (_value, row) => {
      const context = (row as AdmissionCrmOperationsQueueItemDto).operation;
      if (context?.serviceHandoffStatus == null) return 'Not applicable';
      return `${getHandoffStatusLabel(context.serviceHandoffStatus)} · ${context.retryAttemptCount || 0} attempts`;
    },
  },
  actionsColumn(options),
];

export const buildOperationsQueueColumns = (options: Options): IColumn[] => {
  if (options.variant === 'registration') return registrationColumns(options);
  if (options.variant === 'offer') return offerColumns(options);
  if (options.variant === 'activation') return activationColumns(options);
  return operationsColumns(options);
};
