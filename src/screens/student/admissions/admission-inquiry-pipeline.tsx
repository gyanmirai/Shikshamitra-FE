'use client';

import type { RootState } from 'src/redux/store';
import type { IParams } from 'src/components/customizabaleTable/types';

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomizableTable from 'src/components/customizabaleTable';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  type AdmissionInquiry,
  useGetAdmissionInquiriesQuery,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { AdmissionQueryError } from './admission-query-error';
import { formatAdmissionReference } from './admission-reference';
import { ADMISSION_APPLICATION_PERMISSIONS } from './admission-application-permissions';
import { buildAdmissionInquiryColumns } from './inquiry-management/admission-inquiry-columns';
import { buildAdmissionInquiryRowOptions } from './inquiry-management/admission-inquiry-list-options';
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

export default function AdmissionInquiryPipelineScreen() {
  const academic = useAdmissionAcademicFilters();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [tableFilters, setTableFilters] = useState<IParams['filters']>(() =>
    createInitialAdmissionInquiryTableFilters(searchParams)
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sorts, setSorts] = useState<
    Array<{ column: string; direction: 'asc' | 'desc'; originalId?: string }>
  >([]);

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
    next.delete('view');
    next.delete('inquiryId');
    const query = next.toString();
    if (query !== searchParams.toString())
      router.replace(
        query ? `${studentPaths.enrollment.pipeline}?${query}` : studentPaths.enrollment.pipeline
      );
  }, [router, search, searchParams, tableFilters]);
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.sub as string | undefined
  );
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canOpenApplication = hasGrantedPermission(
    permissions,
    ADMISSION_APPLICATION_PERMISSIONS.view
  );
  const listFilters = buildAdmissionInquiryListFilters(tableFilters, search, currentUserId);
  const {
    currentData: data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAdmissionInquiriesQuery(
    {
      ...listFilters,
      isTransferred: true,
      excludePostApplication: false,
      academicYearId: academic.academicYearId,
      boardId: academic.boardId || undefined,
      mediumId: academic.mediumId || undefined,
      standardId: academic.standardId || undefined,
      maxResultCount: rowsPerPage,
      skipCount: page * rowsPerPage,
      sorting: sorts[0] ? `${sorts[0].column} ${sorts[0].direction}` : undefined,
    },
    { skip: !academic.academicYearId }
  );
  const rowOptions = useMemo(
    () => buildAdmissionInquiryRowOptions(data?.items ?? []),
    [data?.items]
  );
  const openInquiry = useCallback(
    (inquiry: AdmissionInquiry) => {
      if (canOpenApplication && inquiry.applicationId)
        router.push(`${studentPaths.enrollment.applications}/${inquiry.applicationId}`);
    },
    [canOpenApplication, router]
  );
  const columns = useMemo(() => {
    const sortable = new Set(['inquiryNumber', 'applicantName', 'status', 'source']);
    return buildAdmissionInquiryColumns({
      canManage: false,
      canMove: false,
      isMoving: false,
      pipeline: true,
      canOpenApplication,
      ...rowOptions,
      onManage: openInquiry,
      onMove: openInquiry,
    }).map((column) => ({
      ...column,
      isSort: column.isSort === false ? false : sortable.has(column.id),
    }));
  }, [canOpenApplication, rowOptions, openInquiry]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Pipeline"
        description="Continue admission applications started from Interested inquiries."
        slotProps={{
          action: {},
          heading: {},
          moreLink: {},
          breadcrumbs: { display: { xs: 'none', md: 'flex' } },
        }}
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Pipeline' },
        ]}
      />
      <AdmissionAcademicFilters
        boardId={academic.boardId}
        mediumId={academic.mediumId}
        standardId={academic.standardId}
        onClear={academic.clear}
        onChange={(key, value) => {
          setPage(0);
          academic.update(key, value);
        }}
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
            tableTitle="Pipeline"
            wrapperProps={{ sx: { height: 1 } }}
            tableContainerProps={{ sx: { height: 1 } }}
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading || (!data && isFetching)}
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
            totalCount={data?.totalCount ?? 0}
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
                tabIndex: canOpenApplication && inquiry.applicationId ? 0 : -1,
                role: 'link',
                'aria-disabled': !canOpenApplication || !inquiry.applicationId,
                'aria-label': `Open ${formatAdmissionReference(inquiry.inquiryNumber)}`,
                onKeyDown: (event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openInquiry(inquiry);
                  }
                },
                sx: { cursor: canOpenApplication && inquiry.applicationId ? 'pointer' : 'default' },
              };
            }}
            searchFieldProps={{
              placeholder: 'Search Pipeline by applicant, inquiry no. or phone',
              inputProps: { 'aria-label': 'Search Pipeline' },
            }}
            noDataText={
              search || tableFilters.length
                ? 'No inquiries match the selected search or filters'
                : 'No inquiries have moved to Pipeline yet'
            }
          />
        </Box>
      )}
    </Box>
  );
}
