'use client';

import type { RootState, AppDispatch } from 'src/redux/store';
import type { IParams } from 'src/components/customizabaleTable/types';

import { Iconify } from 'src/components/iconify';
import { useDispatch, useSelector } from 'react-redux';
import CustomTooltip from 'src/components/custom-tooltip';
import { studentPaths } from 'src/constants/student-menu';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomizableTable from 'src/components/customizabaleTable';
import { useUrlFilterValue } from 'src/hooks/use-url-filter-value';
import { skeletonReducedMotionSx } from 'src/theme/styles/skeleton';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { academicClassFilterInput } from 'src/utils/student-academic-filter-query';
import { Box, Stack, Button, Skeleton, IconButton, DialogActions } from '@mui/material';
import {
  type AdmissionInquiry,
  useGetAdmissionInquiryQuery,
  useGetAdmissionInquiriesQuery,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { getAdmissionInquiryAccess } from './inquiry-access';
import { AdmissionQueryError } from './admission-query-error';
import { formatAdmissionReference } from './admission-reference';
import { InquiryTimeline } from './inquiry-management/inquiry-timeline';
import { inquiryDateRange } from './inquiry-management/inquiry-date-range';
import { useInquiryHandoff } from './inquiry-management/use-inquiry-handoff';
import { InquiryFollowUpDialog } from './inquiry-management/inquiry-follow-up-dialog';
import { loadInquiryOverviewForm } from './inquiry-management/inquiry-overview-loader';
import { preloadInquiryWorkspace } from './inquiry-management/preload-inquiry-workspace';
import { InquiryHandoffIssueDialog } from './inquiry-management/inquiry-handoff-issue-dialog';
import { buildAdmissionInquiryColumns } from './inquiry-management/admission-inquiry-columns';
import { buildAdmissionInquiryRowOptions } from './inquiry-management/admission-inquiry-list-options';
import { AdmissionInquiryManagementPage } from './inquiry-management/admission-inquiry-management-page';
import {
  AdmissionAcademicFilters,
  useAdmissionAcademicFilters,
} from './admission-academic-filters';
import {
  isAdmissionInquiryEnumFilter,
  buildAdmissionInquiryListFilters,
  normalizeAdmissionInquiryTableFilters,
  ADMISSION_INQUIRY_FILTER_QUERY_PARAMS,
  createInitialAdmissionInquiryTableFilters,
} from './inquiry-management/admission-inquiry-table-filters';

export default function AdmissionInquiriesScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const academic = useAdmissionAcademicFilters();
  const previousYear = useRef(academic.academicYearId);
  const yearChanged = previousYear.current !== academic.academicYearId;
  const yearChanging = Boolean(previousYear.current) && yearChanged;
  useEffect(() => {
    if (!yearChanged) return;
    previousYear.current = academic.academicYearId;
    // Initial session restoration must preserve a deep link's academic filters.
    if (!yearChanging) return;
    setPage(0);
    academic.update('board', '');
  }, [academic, yearChanged, yearChanging]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dateFrom, setDateFrom] = useUrlFilterValue(searchParams.get('dateFrom') ?? '');
  const [dateTo, setDateTo] = useUrlFilterValue(searchParams.get('dateTo') ?? '');
  const dates = useMemo(() => inquiryDateRange(dateFrom, dateTo), [dateFrom, dateTo]);
  const dateUrlKey = `${searchParams.get('dateFrom') ?? ''}|${searchParams.get('dateTo') ?? ''}`;
  const previousDateUrl = useRef(dateUrlKey);
  const restoringDateUrl = previousDateUrl.current !== dateUrlKey;
  const linkedInquiryId = searchParams.get('inquiryId') ?? '';
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [tableFilters, setTableFilters] = useState<IParams['filters']>(() =>
    createInitialAdmissionInquiryTableFilters(searchParams)
  );
  const [page, setPage] = useState(0);
  useEffect(() => {
    if (restoringDateUrl) setPage(0);
    previousDateUrl.current = dateUrlKey;
  }, [dateUrlKey, restoringDateUrl]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedInquiry, setSelectedInquiry] = useState<AdmissionInquiry | null>(null);
  const [followUpInquiry, setFollowUpInquiry] = useState<AdmissionInquiry | null>(null);
  const [historyInquiry, setHistoryInquiry] = useState<AdmissionInquiry | null>(null);
  const [pendingInquiryOrigin, setPendingInquiryOrigin] = useState<string | null>(null);
  useEffect(() => {
    if (pendingInquiryOrigin !== null && linkedInquiryId !== pendingInquiryOrigin) {
      setSelectedInquiry(null);
      setPendingInquiryOrigin(null);
    }
  }, [linkedInquiryId, pendingInquiryOrigin]);
  const [scopeLoading, setScopeLoading] = useState(true);
  const [sorts, setSorts] = useState<
    Array<{ column: string; direction: 'asc' | 'desc'; originalId?: string }>
  >([]);
  const handoff = useInquiryHandoff();

  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    // Let URL-backed controls restore Back/Forward values before synchronizing filters.
    if (restoringDateUrl) return;
    const setOrDelete = (key: string, value?: string) => {
      if (!value) next.delete(key);
      else next.set(key, value);
    };
    setOrDelete('search', search);
    setOrDelete('dateFrom', dates ? dateFrom : undefined);
    setOrDelete('dateTo', dates ? dateTo : undefined);
    Object.entries(ADMISSION_INQUIRY_FILTER_QUERY_PARAMS).forEach(([column, parameter]) => {
      const filter = tableFilters.find((item) => item.column === column);
      setOrDelete(parameter, filter ? String(filter.value) : undefined);
      if (!isAdmissionInquiryEnumFilter(column)) setOrDelete(`${parameter}Op`, filter?.type);
    });
    next.delete('cycle');
    next.delete('queue');
    const query = next.toString();
    if (query !== searchParams.toString())
      router.replace(
        query ? `${studentPaths.enrollment.inquiries}?${query}` : studentPaths.enrollment.inquiries
      );
  }, [router, search, searchParams, tableFilters, dates, dateFrom, dateTo, restoringDateUrl]);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.sub as string | undefined
  );
  const { canView, canManage } = getAdmissionInquiryAccess(permissions);
  const dashboardFollowUps = searchParams.get('dashboard') === 'inquiry-followups';
  const listFilters = buildAdmissionInquiryListFilters(tableFilters, search, currentUserId, {
    excludePostApplication: !dashboardFollowUps,
  });
  const skipList =
    yearChanging ||
    scopeLoading ||
    !academic.academicYearId ||
    (!academic.dashboardScope && (!academic.boardId || !academic.mediumId));
  const {
    currentData: data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAdmissionInquiriesQuery(
    {
      ...listFilters,
      creationTimeFrom: dates?.creationTimeFrom,
      creationTimeBefore: dates?.creationTimeBefore,
      dashboardFollowUpsDue: searchParams.get('dashboard') === 'inquiry-followups' || undefined,
      divisionId: academic.dashboardScope ? searchParams.get('division') || undefined : undefined,
      isTransferred: dashboardFollowUps ? undefined : false,
      academicYearId: academic.academicYearId,
      boardId: academic.boardId || undefined,
      mediumId: academic.mediumId || undefined,
      ...academicClassFilterInput(academic.standardId),
      maxResultCount: rowsPerPage,
      skipCount: page * rowsPerPage,
      sorting: sorts[0] ? `${sorts[0].column} ${sorts[0].direction}` : undefined,
    },
    {
      skip: skipList,
      refetchOnMountOrArgChange: true,
    }
  );
  const {
    currentData: linkedInquiry,
    isError: linkedInquiryError,
    refetch: refetchLinkedInquiry,
  } = useGetAdmissionInquiryQuery(linkedInquiryId, {
    skip: !linkedInquiryId,
  });
  const rowOptions = useMemo(
    () => buildAdmissionInquiryRowOptions(data?.items ?? []),
    [data?.items]
  );
  const openInquiry = useCallback(
    (inquiry: AdmissionInquiry) => {
      if (canView) {
        preloadInquiryWorkspace(dispatch, inquiry.id);
        loadInquiryOverviewForm().catch(() => undefined);
      }
      setPendingInquiryOrigin(linkedInquiryId);
      setSelectedInquiry(inquiry);
      const next = new URL(window.location.href);
      next.searchParams.set('inquiryId', inquiry.id);
      // Selecting an Inquiry changes client state on this route, not its server content.
      window.history.pushState(null, '', next);
    },
    [linkedInquiryId, canView, dispatch]
  );

  const columns = useMemo(() => {
    const sortable = new Set(['inquiryNumber', 'applicantName', 'status', 'source']);
    return buildAdmissionInquiryColumns({
      canManage,
      canMove: handoff.canMove,
      isMoving: handoff.moving,
      movingInquiryId: handoff.movingInquiryId,
      ...rowOptions,
      onManage: openInquiry,
      onFollowUp: setFollowUpInquiry,
      onHistory: setHistoryInquiry,
      onMove: handoff.move,
    }).map((column) => ({
      ...column,
      isSort: column.isSort === false ? false : sortable.has(column.id),
    }));
  }, [
    canManage,
    rowOptions,
    handoff.canMove,
    handoff.moving,
    handoff.movingInquiryId,
    handoff.move,
    openInquiry,
  ]);
  const activeInquiry =
    (pendingInquiryOrigin === linkedInquiryId ? selectedInquiry : null) ??
    (linkedInquiry?.id === linkedInquiryId ? linkedInquiry : null);
  if (activeInquiry) {
    return (
      <AdmissionInquiryManagementPage
        key={activeInquiry.id}
        inquiry={activeInquiry}
        onClose={() => {
          setPendingInquiryOrigin(null);
          setSelectedInquiry(null);
          const next = new URL(window.location.href);
          next.searchParams.delete('inquiryId');
          window.history.pushState(null, '', next);
        }}
      />
    );
  }
  if (linkedInquiryId)
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <CustomBreadcrumbs
          heading="Edit Inquiry"
          description="Review and update the selected inquiry."
          links={[
            { name: 'Inquiries', href: studentPaths.enrollment.inquiries },
            { name: 'Edit Inquiry' },
          ]}
        />
        {linkedInquiryError ? (
          <AdmissionQueryError onRetry={() => refetchLinkedInquiry()} />
        ) : (
          <Stack aria-label="Loading Inquiry" aria-busy="true" spacing={2}>
            <Skeleton variant="rounded" height={84} />
            <Skeleton variant="rounded" height={280} />
          </Stack>
        )}
      </Box>
    );
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        height: 1,
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <CustomBreadcrumbs
        heading="Admission Inquiries"
        description="Capture Open-admission Inquiries, Edit Their Forms, and Record Follow-up Notes Separately."
        slotProps={{
          action: { alignSelf: { xs: 'flex-end', md: 'center' }, maxWidth: '100%' },
          heading: {},
          moreLink: {},
          breadcrumbs: {},
        }}
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Inquiries' },
        ]}
        action={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
            {canManage && (
              <Button
                aria-label="Create Inquiry"
                size="small"
                variant="contained"
                startIcon={<Iconify icon="mdi:plus" />}
                onClick={() =>
                  router.push(
                    searchParams.toString()
                      ? `${studentPaths.enrollment.inquiryNew}?${searchParams.toString()}`
                      : studentPaths.enrollment.inquiryNew
                  )
                }
                sx={{
                  minWidth: { xs: 40, sm: 64 },
                  px: { xs: 1, sm: 1.5 },
                  '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } },
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Inquiry
                </Box>
              </Button>
            )}
          </Stack>
        }
      />
      <AdmissionAcademicFilters
        filterAction={
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ width: { xs: 1, lg: 380 }, minWidth: 0 }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <CustomDateRangePicker
                label="Inquiry dates"
                value={dates?.value ?? [null, null]}
                dateFormat="DD/MM/YYYY"
                singleInput
                slotProps={{ field: { size: 'small', fullWidth: true } }}
                onChange={([from, to]) => {
                  if (!from && !to) {
                    setDateFrom('');
                    setDateTo('');
                    setPage(0);
                    return;
                  }
                  if (!from?.isValid() || !to?.isValid() || from.isAfter(to, 'day')) return;
                  setDateFrom(from.format('YYYY-MM-DD'));
                  setDateTo(to.format('YYYY-MM-DD'));
                  setPage(0);
                }}
              />
            </Box>
            {dates && (
              <CustomTooltip title="Clear inquiry dates">
                <IconButton
                  size="small"
                  aria-label="Clear inquiry dates"
                  sx={{ minWidth: { xs: 44, sm: 30 }, minHeight: { xs: 44, sm: 30 } }}
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                    setPage(0);
                  }}
                >
                  <Iconify icon="mdi:close" />
                </IconButton>
              </CustomTooltip>
            )}
            <CustomTooltip
              title={academic.standardId ? 'Clear Class Selection' : 'All Classes Are Shown'}
              describeChild
            >
              <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0 }}>
                <Button
                  type="button"
                  aria-label="Clear Academic Filters"
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<Iconify icon="mdi:filter-off-outline" width={18} />}
                  disabled={!academic.standardId}
                  onClick={academic.clear}
                >
                  Clear
                </Button>
              </Box>
            </CustomTooltip>
          </Stack>
        }
        onLoadingChange={setScopeLoading}
        boardId={academic.boardId}
        mediumId={academic.mediumId}
        standardId={academic.standardId}
        onChange={(key, value) => {
          setPage(0);
          academic.update(key, value);
        }}
      />
      {isError && !skipList && !scopeLoading && Boolean(data?.items.length) && (
        <AdmissionQueryError
          onRetry={() => {
            refetch();
          }}
        />
      )}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {handoff.moving && (
          <Stack
            role="status"
            aria-label="Moving Inquiry to the Next Stage"
            aria-busy
            direction="row"
            spacing={2}
            sx={{ px: 2, py: 1, ...skeletonReducedMotionSx }}
          >
            <Skeleton width="40%" height={24} />
            <Skeleton width="25%" height={24} />
            <Skeleton width="20%" height={24} />
          </Stack>
        )}
        <CustomizableTable
          tableId="admission-inquiries"
          tableTitle="Admission Inquiries"
          wrapperProps={{ sx: { height: 1, flex: 1, minHeight: 0, minWidth: 0 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          columns={columns}
          data={skipList || scopeLoading ? [] : (data?.items ?? [])}
          isRefreshing={
            Boolean(data) && isFetching && !scopeLoading && !skipList && !handoff.moving
          }
          refreshIndicator="skeleton"
          errorContent={
            isError && !skipList && !scopeLoading && !data?.items.length ? (
              <AdmissionQueryError onRetry={() => refetch()} />
            ) : undefined
          }
          isLoading={
            yearChanging ||
            scopeLoading ||
            (handoff.moving && !data?.items.length) ||
            (!skipList && !isError && (isLoading || !data || (isFetching && !data.items.length)))
          }
          serverSidePagination
          serverSideSearch
          serverSideSort
          serverSideFilter
          serverSideSortMode="single"
          searchTerm={search}
          filters={tableFilters}
          sorts={sorts}
          onClearCriteria={() => {
            setPage(0);
            setSearch('');
            setTableFilters([]);
          }}
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
          totalCount={skipList || scopeLoading ? 0 : (data?.totalCount ?? 0)}
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
                if (event.target !== event.currentTarget) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openInquiry(inquiry);
                }
              },
              sx: { cursor: 'pointer' },
            };
          }}
          searchFieldProps={{
            placeholder: 'Search by Applicant, Inquiry No. or Phone',
            inputProps: { 'aria-label': 'Search Admission Inquiries' },
          }}
          noDataText={
            skipList
              ? 'Select an Available Academic Year, Board and Medium to View Inquiries'
              : search || tableFilters.length
                ? 'No Inquiries Match the Selected Search or Filters'
                : dashboardFollowUps
                  ? 'No Inquiry Follow-Ups Are Due in This Scope'
                  : 'No Inquiries Awaiting Admission Handoff'
          }
        />
      </Box>
      <InquiryFollowUpDialog inquiry={followUpInquiry} onClose={() => setFollowUpInquiry(null)} />
      <InquiryHandoffIssueDialog
        issue={handoff.issue}
        access={handoff.formAccess}
        onClose={handoff.dismissIssue}
      />
      {historyInquiry && (
        <CustomDialog
          open
          fullWidth
          maxWidth="md"
          hasForm={false}
          guardUnsavedChanges={false}
          title={`Handling History: ${historyInquiry.applicantName}`}
          titleInfo="Review recorded staff handling, follow-up notes and communications for this inquiry."
          handleClose={() => setHistoryInquiry(null)}
        >
          <DialogScrollContent>
            <InquiryTimeline inquiryId={historyInquiry.id} />
          </DialogScrollContent>
          <DialogActions>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="mdi:close" />}
              onClick={() => setHistoryInquiry(null)}
            >
              Close
            </Button>
          </DialogActions>
        </CustomDialog>
      )}
    </Box>
  );
}
