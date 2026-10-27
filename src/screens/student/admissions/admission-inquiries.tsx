'use client';

import type { RootState } from 'src/redux/store';
import type { IParams } from 'src/components/customizabaleTable/types';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Button, DialogActions, LinearProgress } from '@mui/material';
import { academicClassFilterInput } from 'src/utils/student-academic-filter-query';
import {
  type AdmissionInquiry,
  useGetAdmissionInquiryQuery,
  useGetAdmissionInquiriesQuery,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { getAdmissionInquiryAccess } from './inquiry-access';
import { AdmissionQueryError } from './admission-query-error';
import { formatAdmissionReference } from './admission-reference';
import { InquiryTimeline } from './inquiry-management/inquiry-timeline';
import { useInquiryHandoff } from './inquiry-management/use-inquiry-handoff';
import { InquiryFollowUpDialog } from './inquiry-management/inquiry-follow-up-dialog';
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
  const academic = useAdmissionAcademicFilters();
  const previousYear = useRef(academic.academicYearId);
  const yearChanging = previousYear.current !== academic.academicYearId;
  useEffect(() => {
    if (!yearChanging) return;
    previousYear.current = academic.academicYearId;
    setPage(0);
    academic.update('board', '');
  }, [academic, yearChanging]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedInquiryId = searchParams.get('inquiryId') ?? '';
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [tableFilters, setTableFilters] = useState<IParams['filters']>(() =>
    createInitialAdmissionInquiryTableFilters(searchParams)
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedInquiry, setSelectedInquiry] = useState<AdmissionInquiry | null>(null);
  const [followUpInquiry, setFollowUpInquiry] = useState<AdmissionInquiry | null>(null);
  const [historyInquiry, setHistoryInquiry] = useState<AdmissionInquiry | null>(null);
  const [dismissedInquiryId, setDismissedInquiryId] = useState('');
  const [scopeLoading, setScopeLoading] = useState(true);
  const [sorts, setSorts] = useState<
    Array<{ column: string; direction: 'asc' | 'desc'; originalId?: string }>
  >([]);
  const handoff = useInquiryHandoff();

  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    const setOrDelete = (key: string, value?: string) => {
      if (!value) next.delete(key);
      else next.set(key, value);
    };
    setOrDelete('search', search);
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
  }, [router, search, searchParams, tableFilters]);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.sub as string | undefined
  );
  const { canManage } = getAdmissionInquiryAccess(permissions);
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
    }
  );
  const { data: linkedInquiry } = useGetAdmissionInquiryQuery(linkedInquiryId, {
    skip: !linkedInquiryId,
  });
  const rowOptions = useMemo(
    () => buildAdmissionInquiryRowOptions(data?.items ?? []),
    [data?.items]
  );
  const openInquiry = useCallback(
    (inquiry: AdmissionInquiry) => {
      setDismissedInquiryId('');
      setSelectedInquiry(inquiry);
      const next = new URLSearchParams(searchParams.toString());
      next.set('inquiryId', inquiry.id);
      router.push(`${studentPaths.enrollment.inquiries}?${next.toString()}`);
    },
    [router, searchParams]
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
    selectedInquiry ??
    (linkedInquiryId && linkedInquiryId !== dismissedInquiryId ? linkedInquiry : null) ??
    null;
  if (activeInquiry) {
    return (
      <AdmissionInquiryManagementPage
        inquiry={activeInquiry}
        onClose={() => {
          setDismissedInquiryId(activeInquiry.id);
          setSelectedInquiry(null);
          const next = new URLSearchParams(searchParams.toString());
          next.delete('inquiryId');
          const query = next.toString();
          router.push(
            query
              ? `${studentPaths.enrollment.inquiries}?${query}`
              : studentPaths.enrollment.inquiries
          );
        }}
      />
    );
  }
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
        heading="Admission inquiries"
        description="Capture open-admission inquiries, edit their forms, and record follow-up notes separately."
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
                aria-label="New inquiry"
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
                  New inquiry
                </Box>
              </Button>
            )}
          </Stack>
        }
      />
      <AdmissionAcademicFilters
        onLoadingChange={setScopeLoading}
        boardId={academic.boardId}
        mediumId={academic.mediumId}
        standardId={academic.standardId}
        onClear={academic.clear}
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
        {handoff.moving && <LinearProgress aria-label="Moving inquiry to the next stage" />}
        <CustomizableTable
          tableId="admission-inquiries"
          tableTitle="Admission inquiries"
          wrapperProps={{ sx: { height: 1, flex: 1, minHeight: 0, minWidth: 0 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          columns={columns}
          data={skipList || scopeLoading ? [] : (data?.items ?? [])}
          isRefreshing={
            Boolean(data) && isFetching && !scopeLoading && !skipList && !handoff.moving
          }
          errorContent={
            isError && !skipList && !scopeLoading && !data?.items.length ? (
              <AdmissionQueryError onRetry={() => refetch()} />
            ) : undefined
          }
          isLoading={
            yearChanging ||
            scopeLoading ||
            (handoff.moving && !data?.items.length) ||
            (!skipList && !isError && (isLoading || !data))
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
            placeholder: 'Search by applicant, inquiry no. or phone',
            inputProps: { 'aria-label': 'Search admission inquiries' },
          }}
          noDataText={
            skipList
              ? 'Select an available academic year, Board and Medium to view inquiries'
              : search || tableFilters.length
                ? 'No inquiries match the selected search or filters'
                : dashboardFollowUps
                  ? 'No inquiry follow-ups are due in this scope'
                  : 'No inquiries awaiting admission handoff'
          }
        />
      </Box>
      <InquiryFollowUpDialog inquiry={followUpInquiry} onClose={() => setFollowUpInquiry(null)} />
      {historyInquiry && (
        <CustomDialog
          open
          fullWidth
          maxWidth="md"
          hasForm={false}
          guardUnsavedChanges={false}
          title={`Handling history: ${historyInquiry.applicantName}`}
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
