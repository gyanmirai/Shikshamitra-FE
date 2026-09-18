'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionInquiry,
  AdmissionInquirySource,
  AdmissionInquiryStatus,
  AdmissionInquiryWorkQueue,
  AdmissionInquiryListInput,
} from 'src/redux/student/admissions/admission-inquiries-api';

import NextLink from 'next/link';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useState, useDeferredValue } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetAdmissionCyclesQuery } from 'src/redux/student/admissions/admission-cycles-api';
import { useGetAdmissionOfferingsQuery } from 'src/redux/student/admissions/admission-offerings-api';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Stack,
  Button,
  Skeleton,
  MenuItem,
  MenuList,
  Typography,
} from '@mui/material';
import {
  useGetAdmissionInquiriesQuery,
  useGetAdmissionInquiryAssignableCounsellorsQuery,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { getAdmissionInquiryAccess } from './inquiry-access';
import { inquiryWorkState } from './inquiry-management/admission-inquiry-work-state';
import { AdmissionInquiryManagementDrawer } from './inquiry-management/admission-inquiry-management-drawer';
import { AdmissionInquiryAssignmentDialog } from './inquiry-management/admission-inquiry-assignment-dialog';
import { AdmissionInquiryCommunicationDialog } from './inquiry-management/admission-inquiry-communication-dialog';
import {
  inquirySourceLabel,
  inquiryStatusLabel,
} from './inquiry-management/admission-inquiry-list-options';
import {
  MY_INQUIRIES_FILTER,
  AdmissionInquiryFilters,
  UNASSIGNED_INQUIRIES_FILTER,
} from './inquiry-management/admission-inquiry-filters';

const ACTIVE_STATUSES: AdmissionInquiryStatus[] = [0, 1, 2, 3];
const HANDOFF_STATUSES: AdmissionInquiryStatus[] = [4, 5, 6, 7, 8];

const statusColors: Record<
  AdmissionInquiryStatus,
  'default' | 'info' | 'warning' | 'success' | 'error'
> = {
  0: 'info',
  1: 'info',
  2: 'success',
  3: 'warning',
  4: 'info',
  5: 'success',
  6: 'default',
  7: 'error',
  8: 'default',
};

type PipelineGroup = 'active' | 'handoff';
type PipelineFilters = Omit<AdmissionInquiryListInput, 'status' | 'skipCount' | 'maxResultCount'>;

export default function AdmissionInquiryPipelineScreen() {
  const [group, setGroup] = useState<PipelineGroup>('active');
  const [search, setSearch] = useState('');
  const [cycleId, setCycleId] = useState('');
  const [offeringId, setOfferingId] = useState('');
  const [source, setSource] = useState<'' | AdmissionInquirySource>('');
  const [workQueue, setWorkQueue] = useState<'' | AdmissionInquiryWorkQueue>('');
  const [ownerId, setOwnerId] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<AdmissionInquiry | null>(null);
  const [assignmentInquiry, setAssignmentInquiry] = useState<AdmissionInquiry | null>(null);
  const [communicationInquiry, setCommunicationInquiry] = useState<AdmissionInquiry | null>(null);
  const deferredSearch = useDeferredValue(search.trim());
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.sub as string | undefined
  );
  const { canManage, canAssign } = getAdmissionInquiryAccess(permissions);
  const canCommunicate =
    canManage && hasGrantedPermission(permissions, 'Communication.Campaigns.Add');
  const canSendCommunication = hasGrantedPermission(permissions, 'Communication.Campaigns.Send');
  const assignedCounsellorId =
    ownerId === MY_INQUIRIES_FILTER
      ? currentUserId
      : ownerId && ownerId !== UNASSIGNED_INQUIRIES_FILTER
        ? ownerId
        : undefined;
  const filters: PipelineFilters = {
    search: deferredSearch || undefined,
    admissionCycleId: cycleId || undefined,
    admissionOfferingId: offeringId || undefined,
    source: source === '' ? undefined : source,
    workQueue: workQueue === '' ? undefined : workQueue,
    assignedCounsellorId,
    isAssigned: ownerId === UNASSIGNED_INQUIRIES_FILTER ? false : undefined,
  };
  const {
    data: cycles,
    isLoading: cyclesLoading,
    isError: cyclesError,
  } = useGetAdmissionCyclesQuery(
    { maxResultCount: 100, skipCount: 0 },
    { refetchOnMountOrArgChange: true }
  );
  const { data: offerings } = useGetAdmissionOfferingsQuery({ maxResultCount: 100, skipCount: 0 });
  const { data: counsellors = [] } = useGetAdmissionInquiryAssignableCounsellorsQuery(undefined, {
    skip: !canAssign,
  });
  const {
    data: assignmentCounsellors = [],
    isLoading: assignmentCounsellorsLoading,
    isError: assignmentCounsellorsError,
  } = useGetAdmissionInquiryAssignableCounsellorsQuery(
    { admissionOfferingId: assignmentInquiry?.admissionOfferingId ?? undefined },
    { skip: !canAssign || !assignmentInquiry?.admissionOfferingId }
  );

  const changeFilter = (field: string, value: string) => {
    if (field === 'search') setSearch(value);
    if (field === 'cycleId') {
      setCycleId(value);
      setOfferingId('');
    }
    if (field === 'offeringId') setOfferingId(value);
    if (field === 'source')
      setSource(value === '' ? '' : (Number(value) as AdmissionInquirySource));
    if (field === 'workQueue')
      setWorkQueue(value === '' ? '' : (Number(value) as AdmissionInquiryWorkQueue));
    if (field === 'ownerId') setOwnerId(value);
  };

  const resetFilters = () => {
    setSearch('');
    setCycleId('');
    setOfferingId('');
    setSource('');
    setWorkQueue('');
    setOwnerId('');
  };
  const statuses = group === 'active' ? ACTIVE_STATUSES : HANDOFF_STATUSES;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Inquiry pipeline"
        description="Work prospective-family inquiries by status, ownership, SLA, and next action."
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'CRM', href: studentPaths.enrollment.inquiries },
          { name: 'Pipeline' },
        ]}
      />
      <AdmissionInquiryManagementDrawer
        inquiry={selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
      />
      <AdmissionInquiryAssignmentDialog
        inquiry={assignmentInquiry}
        counsellors={assignmentCounsellors}
        counsellorsLoading={assignmentCounsellorsLoading}
        counsellorsError={assignmentCounsellorsError}
        onClose={() => setAssignmentInquiry(null)}
      />
      <AdmissionInquiryCommunicationDialog
        inquiry={communicationInquiry}
        canSend={canSendCommunication}
        onClose={() => setCommunicationInquiry(null)}
      />
      <AdmissionInquiryFilters
        search={search}
        cycleId={cycleId}
        offeringId={offeringId}
        status=""
        source={source}
        workQueue={workQueue}
        ownerId={ownerId}
        currentUserId={currentUserId}
        cycles={cycles?.items ?? []}
        offerings={offerings?.items ?? []}
        counsellors={counsellors}
        showStatus={false}
        onChange={changeFilter}
        onReset={resetFilters}
      />
      {(cyclesLoading || cyclesError) && (
        <Typography variant="caption" color={cyclesError ? 'error' : 'text.secondary'}>
          {cyclesError ? 'Cycle choices could not be loaded.' : 'Loading cycle choices…'}
        </Typography>
      )}
      <Paper variant="outlined" sx={{ px: 1, borderRadius: 2 }}>
        <Tabs
          value={group}
          onChange={(_, value: PipelineGroup) => setGroup(value)}
          aria-label="Inquiry pipeline groups"
        >
          <Tab value="active" label="Active inquiries" />
          <Tab value="handoff" label="Handoffs and closed" />
        </Tabs>
      </Paper>
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Stack direction="row" spacing={1.5} sx={{ minWidth: 'max-content', height: 1, pb: 1 }}>
          {statuses.map((status) => (
            <AdmissionInquiryPipelineLane
              key={status}
              status={status}
              filters={filters}
              canManage={canManage}
              canAssign={canAssign}
              canCommunicate={canCommunicate}
              onManage={setSelectedInquiry}
              onAssign={setAssignmentInquiry}
              onCommunicate={setCommunicationInquiry}
            />
          ))}
        </Stack>
      </Scrollbar>
    </Box>
  );
}

type LaneProps = {
  status: AdmissionInquiryStatus;
  filters: PipelineFilters;
  canManage: boolean;
  canAssign: boolean;
  canCommunicate: boolean;
  onManage: (inquiry: AdmissionInquiry) => void;
  onAssign: (inquiry: AdmissionInquiry) => void;
  onCommunicate: (inquiry: AdmissionInquiry) => void;
};

function AdmissionInquiryPipelineLane(props: LaneProps) {
  const {
    status,
    filters,
    canManage,
    canAssign,
    canCommunicate,
    onManage,
    onAssign,
    onCommunicate,
  } = props;
  const { data, isLoading, isError, refetch } = useGetAdmissionInquiriesQuery({
    ...filters,
    status,
    skipCount: 0,
    maxResultCount: 25,
  });

  return (
    <Paper
      variant="outlined"
      data-testid={`inquiry-pipeline-lane-${status}`}
      sx={{ width: 310, minWidth: 310, height: 1, display: 'flex', flexDirection: 'column' }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider' }}
      >
        <Label color={statusColors[status]}>{inquiryStatusLabel(status)}</Label>
        <Typography variant="caption" color="text.secondary">
          {data?.totalCount ?? 0}
        </Typography>
      </Stack>
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={1} sx={{ p: 1 }}>
          {isLoading && [0, 1, 2].map((item) => <Skeleton key={item} height={142} />)}
          {isError && (
            <Stack spacing={1} alignItems="flex-start" sx={{ p: 1 }}>
              <Typography variant="body2" color="error">
                This lane could not be loaded.
              </Typography>
              <Button size="small" startIcon={<Iconify icon="mdi:refresh" />} onClick={refetch}>
                Retry
              </Button>
            </Stack>
          )}
          {!isLoading && !isError && data?.items.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
              No inquiries in this stage.
            </Typography>
          )}
          {data?.items.map((inquiry) => (
            <AdmissionInquiryPipelineCard
              key={inquiry.id}
              inquiry={inquiry}
              canManage={canManage}
              canAssign={canAssign}
              canCommunicate={canCommunicate}
              onManage={onManage}
              onAssign={onAssign}
              onCommunicate={onCommunicate}
            />
          ))}
          {(data?.totalCount ?? 0) > 25 && (
            <Typography variant="caption" color="text.secondary" sx={{ px: 0.5 }}>
              Showing the 25 most recent inquiries. Use filters to narrow this lane.
            </Typography>
          )}
        </Stack>
      </Scrollbar>
    </Paper>
  );
}

type CardProps = Omit<LaneProps, 'status' | 'filters'> & { inquiry: AdmissionInquiry };

function AdmissionInquiryPipelineCard(props: CardProps) {
  const { inquiry, canManage, canAssign, canCommunicate, onManage, onAssign, onCommunicate } =
    props;
  const work = inquiryWorkState(inquiry);

  return (
    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {inquiry.applicantName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {inquiry.inquiryNumber}
            </Typography>
          </Box>
          {(canManage || canAssign || canCommunicate) && (
            <ThreeDotsActions
              placement="right-top"
              moreLabel={`Actions for ${inquiry.inquiryNumber}`}
              actions={({ popover }) => (
                <MenuList dense>
                  {canManage && (
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        onManage(inquiry);
                      }}
                    >
                      <Iconify icon="mdi:clipboard-account-outline" sx={{ mr: 1 }} />
                      Manage inquiry
                    </MenuItem>
                  )}
                  {canAssign && inquiry.admissionOfferingId && (
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        onAssign(inquiry);
                      }}
                    >
                      <Iconify icon="mdi:account-arrow-right-outline" sx={{ mr: 1 }} />
                      {inquiry.assignedCounsellorId ? 'Reassign counsellor' : 'Assign counsellor'}
                    </MenuItem>
                  )}
                  {canCommunicate && (
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        onCommunicate(inquiry);
                      }}
                    >
                      <Iconify icon="mdi:message-text-outline" sx={{ mr: 1 }} />
                      Compose communication
                    </MenuItem>
                  )}
                </MenuList>
              )}
            />
          )}
        </Stack>
        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
          <Label color={work.color}>{work.label}</Label>
          <Label color="default">{inquirySourceLabel(inquiry.source)}</Label>
        </Stack>
        {work.detail && (
          <Typography variant="caption" color="text.secondary">
            {work.detail}
          </Typography>
        )}
        <Box>
          <Typography variant="body2" noWrap>
            {inquiry.admissionOfferingCode || 'Offering not selected'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {inquiry.admissionCycleName}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" noWrap>
          {inquiry.assignedCounsellorName || 'Unassigned'} ·{' '}
          {fDateTime(inquiry.lastActivityAt || inquiry.creationTime) || 'No activity date'}
        </Typography>
        {inquiry.applicantId && (
          <Button
            component={NextLink}
            href={`/student/admissions/applicants/${inquiry.applicantId}`}
            size="small"
            variant="text"
            endIcon={<Iconify icon="mdi:arrow-right" />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Applicant 360
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
