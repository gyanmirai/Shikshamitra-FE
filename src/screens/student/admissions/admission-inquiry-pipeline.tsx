'use client';

import type { RootState } from 'src/redux/store';
import type { IParams } from 'src/components/customizabaleTable/types';
import type {
  AdmissionInquiry,
  AdmissionInquirySource,
  AdmissionInquiryStatus,
  AdmissionInquiryWorkQueue,
  AdmissionInquiryListInput,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/use-tabs';
import { CustomTabs } from 'src/components/custom-tabs';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Tab, Card, Stack, Typography } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useGetAdmissionCyclesQuery } from 'src/redux/student/admissions/admission-cycles-api';
import { useGetAdmissionOfferingsQuery } from 'src/redux/student/admissions/admission-offerings-api';
import {
  useGetAdmissionInquiriesQuery,
  useMarkAdmissionInquiryContactedMutation,
  useGetAdmissionInquiryAssignableCounsellorsQuery,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { getAdmissionInquiryAccess } from './inquiry-access';
import { AdmissionQueryError } from './admission-query-error';
import { formatAdmissionReference } from './admission-reference';
import { INQUIRY_STATUS_OPTIONS } from './inquiry-management/admission-inquiry-list-options';
import { buildAdmissionInquiryColumns } from './inquiry-management/admission-inquiry-columns';
import { AdmissionInquiryManagementPage } from './inquiry-management/admission-inquiry-management-page';
import {
  AdmissionAcademicFilters,
  useAdmissionAcademicFilters,
} from './admission-academic-filters';
import { AdmissionInquiryAssignmentDialog } from './inquiry-management/admission-inquiry-assignment-dialog';
import { AdmissionInquiryCommunicationDialog } from './inquiry-management/admission-inquiry-communication-dialog';
import {
  MY_INQUIRIES_FILTER,
  AdmissionInquiryFilters,
  UNASSIGNED_INQUIRIES_FILTER,
} from './inquiry-management/admission-inquiry-filters';
import {
  isAdmissionInquiryEnumFilter,
  buildAdmissionInquiryListFilters,
  normalizeAdmissionInquiryTableFilters,
  ADMISSION_INQUIRY_FILTER_QUERY_PARAMS,
  createInitialAdmissionInquiryTableFilters,
} from './inquiry-management/admission-inquiry-table-filters';

type PipelineGroup = 'active' | 'handoff';

const PIPELINE_TABS: { value: PipelineGroup; label: string }[] = [
  { value: 'active', label: 'Active inquiries' },
  { value: 'handoff', label: 'Handoffs and closed' },
];

const PIPELINE_STATUSES: Record<PipelineGroup, AdmissionInquiryStatus[]> = {
  active: [0, 1, 2, 3],
  handoff: [4, 5, 6, 7, 8],
};

const PIPELINE_DOMAIN_FILTER_COLUMNS = new Set([
  'admissionOfferingId',
  'assignedCounsellorId',
  'source',
]);

const PIPELINE_TABLE_FILTER_COLUMNS = new Set([
  'inquiryNumber',
  'applicantName',
  'normalizedPhone',
  'email',
  'status',
]);

const normalizePipelineGroup = (value: string | null): PipelineGroup =>
  value === 'handoff' ? 'handoff' : 'active';

const parseSource = (value: string | null): '' | AdmissionInquirySource => {
  const parsed = Number(value);
  return value !== null && Number.isInteger(parsed) && parsed >= 0 && parsed <= 9
    ? (parsed as AdmissionInquirySource)
    : '';
};

const parseWorkQueue = (value: string | null): '' | AdmissionInquiryWorkQueue => {
  const parsed = Number(value);
  return value !== null && Number.isInteger(parsed) && parsed >= 1 && parsed <= 4
    ? (parsed as AdmissionInquiryWorkQueue)
    : '';
};

export default function AdmissionInquiryPipelineScreen() {
  const academic = useAdmissionAcademicFilters();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeQuery = searchParams.toString();
  const {
    value: tabValue,
    setValue: setTabValue,
    onChange: onTabChange,
  } = useTabs(normalizePipelineGroup(searchParams.get('view')));
  const group = normalizePipelineGroup(String(tabValue));
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [cycleId, setCycleId] = useState(() => searchParams.get('cycle') ?? '');
  const [offeringId, setOfferingId] = useState(() => searchParams.get('offering') ?? '');
  const [source, setSource] = useState<'' | AdmissionInquirySource>(() =>
    parseSource(searchParams.get('source'))
  );
  const [workQueue, setWorkQueue] = useState<'' | AdmissionInquiryWorkQueue>(() =>
    parseWorkQueue(searchParams.get('queue'))
  );
  const [ownerId, setOwnerId] = useState(() => searchParams.get('owner') ?? '');
  const [tableFilters, setTableFilters] = useState<IParams['filters']>(() =>
    createInitialAdmissionInquiryTableFilters(searchParams).filter((filter) =>
      PIPELINE_TABLE_FILTER_COLUMNS.has(filter.column)
    )
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sorts, setSorts] = useState<IParams['sorts']>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<AdmissionInquiry | null>(null);
  const [assignmentInquiry, setAssignmentInquiry] = useState<AdmissionInquiry | null>(null);
  const [communicationInquiry, setCommunicationInquiry] = useState<AdmissionInquiry | null>(null);
  const applyingRouteStateRef = useRef(false);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.sub as string | undefined
  );
  const { canManage, canAssign } = getAdmissionInquiryAccess(permissions);
  const canCommunicate =
    canManage && hasGrantedPermission(permissions, 'Communication.Campaigns.Add');
  const canSendCommunication = hasGrantedPermission(permissions, 'Communication.Campaigns.Send');

  useEffect(() => {
    const params = new URLSearchParams(routeQuery);
    applyingRouteStateRef.current = true;
    setTabValue(normalizePipelineGroup(params.get('view')));
    setSearch(params.get('search') ?? '');
    setCycleId(params.get('cycle') ?? '');
    setOfferingId(params.get('offering') ?? '');
    setSource(parseSource(params.get('source')));
    setWorkQueue(parseWorkQueue(params.get('queue')));
    setOwnerId(params.get('owner') ?? '');
    setTableFilters(
      createInitialAdmissionInquiryTableFilters(params).filter((filter) =>
        PIPELINE_TABLE_FILTER_COLUMNS.has(filter.column)
      )
    );
  }, [routeQuery, setTabValue]);

  useEffect(() => {
    if (applyingRouteStateRef.current) {
      applyingRouteStateRef.current = false;
      return;
    }
    const next = new URLSearchParams(routeQuery);
    const setOrDelete = (key: string, value?: string) => {
      if (!value) next.delete(key);
      else next.set(key, value);
    };
    setOrDelete('view', group);
    setOrDelete('search', search);
    setOrDelete('cycle', cycleId);
    setOrDelete('offering', offeringId);
    setOrDelete('source', source === '' ? undefined : String(source));
    setOrDelete('queue', workQueue === '' ? undefined : String(workQueue));
    setOrDelete('owner', ownerId);
    Object.entries(ADMISSION_INQUIRY_FILTER_QUERY_PARAMS).forEach(([column, parameter]) => {
      if (!PIPELINE_TABLE_FILTER_COLUMNS.has(column)) return;
      const filter = tableFilters.find((item) => item.column === column);
      setOrDelete(parameter, filter ? String(filter.value) : undefined);
      if (!isAdmissionInquiryEnumFilter(column)) setOrDelete(`${parameter}Op`, filter?.type);
    });
    const query = next.toString();
    if (query !== routeQuery)
      router.replace(
        query ? `${studentPaths.enrollment.pipeline}?${query}` : studentPaths.enrollment.pipeline
      );
  }, [
    cycleId,
    group,
    offeringId,
    ownerId,
    routeQuery,
    router,
    search,
    source,
    tableFilters,
    workQueue,
  ]);

  const assignedCounsellorId =
    ownerId === MY_INQUIRIES_FILTER
      ? currentUserId
      : ownerId && ownerId !== UNASSIGNED_INQUIRIES_FILTER
        ? ownerId
        : undefined;
  const tableListFilters = buildAdmissionInquiryListFilters(tableFilters, search, currentUserId, {
    excludePostApplication: false,
  });
  const sharedFilters: AdmissionInquiryListInput = {
    ...tableListFilters,
    academicYearId: academic.academicYearId,
    boardId: academic.boardId || undefined,
    mediumId: academic.mediumId || undefined,
    standardId: academic.standardId || undefined,
    admissionCycleId: cycleId || undefined,
    admissionOfferingId: offeringId || undefined,
    source: source === '' ? undefined : source,
    workQueue: workQueue === '' ? undefined : workQueue,
    assignedCounsellorId,
    isAssigned: ownerId === UNASSIGNED_INQUIRIES_FILTER ? false : undefined,
  };
  const sorting = sorts[0] ? `${sorts[0].column} ${sorts[0].direction}` : undefined;
  const queryInput: AdmissionInquiryListInput = {
    ...sharedFilters,
    pipelineGroup: group,
    skipCount: page * rowsPerPage,
    maxResultCount: rowsPerPage,
    sorting,
  };
  const otherGroup: PipelineGroup = group === 'active' ? 'handoff' : 'active';
  const { currentData, isLoading, isFetching, isError, refetch } = useGetAdmissionInquiriesQuery(
    queryInput,
    { skip: !academic.academicYearId }
  );
  const { currentData: otherGroupData } = useGetAdmissionInquiriesQuery(
    {
      ...sharedFilters,
      pipelineGroup: otherGroup,
      skipCount: 0,
      maxResultCount: 1,
    },
    { skip: !academic.academicYearId }
  );
  const groupCounts: Record<PipelineGroup, number> = {
    active: group === 'active' ? (currentData?.totalCount ?? 0) : (otherGroupData?.totalCount ?? 0),
    handoff:
      group === 'handoff' ? (currentData?.totalCount ?? 0) : (otherGroupData?.totalCount ?? 0),
  };

  const { data: cycles } = useGetAdmissionCyclesQuery(
    { maxResultCount: 100, skipCount: 0 },
    { refetchOnMountOrArgChange: true }
  );
  const { data: offerings } = useGetAdmissionOfferingsQuery({ maxResultCount: 100, skipCount: 0 });
  const visibleOfferings = useMemo(
    () =>
      (offerings?.items ?? []).filter(
        (offering) => !cycleId || offering.admissionCycleId === cycleId
      ),
    [cycleId, offerings?.items]
  );
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
  const [markContacted, { isLoading: markingContacted }] =
    useMarkAdmissionInquiryContactedMutation();

  const changeFilter = (
    field: 'search' | 'cycleId' | 'offeringId' | 'status' | 'source' | 'workQueue' | 'ownerId',
    value: string
  ) => {
    setPage(0);
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
    setPage(0);
    setCycleId('');
    setOfferingId('');
    setSource('');
    setWorkQueue('');
    setOwnerId('');
  };

  const openInquiry = useCallback((inquiry: AdmissionInquiry) => setSelectedInquiry(inquiry), []);
  const openEditInquiry = useCallback(
    (inquiry: AdmissionInquiry) => {
      const next = new URLSearchParams();
      next.set(
        'returnTo',
        `${studentPaths.enrollment.pipeline}${routeQuery ? `?${routeQuery}` : ''}`
      );
      router.push(`${studentPaths.enrollment.inquiryEdit(inquiry.id)}?${next.toString()}`);
    },
    [routeQuery, router]
  );
  const openApplicant360 = useCallback(
    (inquiry: AdmissionInquiry) => {
      if (!inquiry.applicantId) return;
      router.push(
        `${studentPaths.enrollment.root}/applicants/${inquiry.applicantId}?inquiryId=${encodeURIComponent(inquiry.id)}`
      );
    },
    [router]
  );
  const columns = useMemo(() => {
    const sortable = new Set(['inquiryNumber', 'applicantName', 'status', 'source']);
    const visibleStatuses = new Set(PIPELINE_STATUSES[group]);
    return buildAdmissionInquiryColumns({
      canManage,
      canAssign,
      canCommunicate,
      isMarkingContacted: markingContacted,
      counsellorNames: Object.fromEntries(
        counsellors.map((counsellor) => [counsellor.id, counsellor.name || counsellor.userName])
      ),
      counsellorOptions: counsellors.map((counsellor) => ({
        label: counsellor.name || counsellor.userName,
        value: counsellor.id,
      })),
      offeringOptions: visibleOfferings.map((offering) => ({
        label: `${offering.code} · ${offering.admissionCycleName}`,
        value: offering.id,
      })),
      onOpenApplicant360: openApplicant360,
      onManage: openEditInquiry,
      onAssign: setAssignmentInquiry,
      onCommunicate: setCommunicationInquiry,
      onMarkContacted: (inquiry) => {
        markContacted(inquiry.id)
          .unwrap()
          .then(() =>
            shikshaMitraToast.success({
              message: `${formatAdmissionReference(inquiry.inquiryNumber)} was marked contacted.`,
            })
          )
          .catch((error) =>
            shikshaMitraToast.error({
              message:
                parseApiProblemDetail(error).detail ||
                'Unable to update this inquiry. Open it and record the contact note instead.',
            })
          );
      },
    }).map((column) => ({
      ...column,
      isSort: column.isSort === false ? false : sortable.has(column.id),
      isFilter: PIPELINE_DOMAIN_FILTER_COLUMNS.has(column.id) ? false : column.isFilter,
      ...(column.id === 'status'
        ? {
            enumOptions: INQUIRY_STATUS_OPTIONS.filter((option) =>
              visibleStatuses.has(Number(option.value) as AdmissionInquiryStatus)
            ),
          }
        : {}),
    }));
  }, [
    canAssign,
    canCommunicate,
    canManage,
    counsellors,
    group,
    markContacted,
    markingContacted,
    openApplicant360,
    openEditInquiry,
    visibleOfferings,
  ]);

  if (selectedInquiry) {
    return (
      <AdmissionInquiryManagementPage
        inquiry={selectedInquiry}
        origin="pipeline"
        onClose={() => setSelectedInquiry(null)}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Inquiry Pipeline"
        description="Work prospective-family inquiries by status, ownership, SLA, and next action."
        slotProps={{
          action: {},
          heading: {},
          moreLink: {},
          breadcrumbs: { display: { xs: 'none', md: 'flex' } },
        }}
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Inquiry Pipeline' },
        ]}
      />

      <AdmissionAcademicFilters
        boardId={academic.boardId}
        mediumId={academic.mediumId}
        standardId={academic.standardId}
        onClear={academic.clear}
        onChange={(key, value) => {
          setPage(0);
          setOfferingId('');
          academic.update(key, value);
        }}
      />

      <AdmissionInquiryFilters
        search=""
        cycleId={cycleId}
        offeringId={offeringId}
        status=""
        source={source}
        workQueue={workQueue}
        ownerId={ownerId}
        currentUserId={currentUserId}
        cycles={cycles?.items ?? []}
        offerings={visibleOfferings}
        counsellors={counsellors}
        showSearch={false}
        showStatus={false}
        onChange={changeFilter}
        onReset={resetFilters}
      />

      <Card sx={{ px: 1, borderRadius: 2, boxShadow: 'var(--shadows-4)', flexShrink: 0 }}>
        <CustomTabs
          value={group}
          onChange={(event, value) => {
            onTabChange(event, value);
            setTableFilters((current) => current.filter((filter) => filter.column !== 'status'));
            setPage(0);
          }}
          aria-label="Inquiry pipeline groups"
          variant="scrollable"
          scrollButtons="auto"
        >
          {PIPELINE_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2">{tab.label}</Typography>
                  <Label color={tab.value === 'active' ? 'info' : 'default'}>
                    {groupCounts[tab.value]}
                  </Label>
                </Stack>
              }
            />
          ))}
        </CustomTabs>
      </Card>

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

      {isError ? (
        <AdmissionQueryError
          onRetry={() => {
            refetch();
          }}
        />
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <CustomizableTable
            tableId="admission-inquiry-pipeline"
            tableTitle={`${PIPELINE_TABS.find((tab) => tab.value === group)?.label} pipeline`}
            wrapperProps={{ sx: { height: 1 } }}
            tableContainerProps={{ sx: { height: 1 } }}
            columns={columns}
            data={currentData?.items ?? []}
            isLoading={isLoading || (!currentData && isFetching)}
            noDataText={`No ${group === 'active' ? 'active inquiries' : 'handoffs or closed inquiries'} found`}
            serverSidePagination
            serverSideSearch
            serverSideSort
            serverSideFilter
            serverSideSortMode="single"
            searchTerm={search}
            filters={tableFilters}
            sorts={sorts}
            onServerSearch={(nextSearch) => {
              setPage(0);
              setSearch(nextSearch);
            }}
            onServerFilter={(nextFilters) => {
              setPage(0);
              setTableFilters(normalizeAdmissionInquiryTableFilters(nextFilters));
            }}
            onServerSort={(_, nextSorts) => {
              setPage(0);
              setSorts(nextSorts);
            }}
            totalCount={currentData?.totalCount ?? 0}
            page={page}
            rowsPerPage={rowsPerPage}
            defaultRowsPerPage={25}
            rowsPerPageOptions={[10, 25, 100]}
            onServerPagination={(nextPage, nextRowsPerPage) => {
              setPage(nextPage - 1);
              setRowsPerPage(nextRowsPerPage);
            }}
            isPagination
            handleRowClick={(row) => openInquiry(row as AdmissionInquiry)}
            rowProps={(row) => {
              const inquiry = row as AdmissionInquiry;
              return {
                tabIndex: 0,
                role: 'link',
                'aria-label': `Open ${formatAdmissionReference(inquiry.inquiryNumber)}`,
                onKeyDown: (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openInquiry(inquiry);
                  }
                },
                sx: { cursor: 'pointer' },
              };
            }}
            searchFieldProps={{ placeholder: 'Search pipeline' }}
          />
        </Box>
      )}
    </Box>
  );
}
