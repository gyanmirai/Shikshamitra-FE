'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Stack, Button, Checkbox, Typography } from '@mui/material';
import { useGetAdmissionOfferingsQuery } from 'src/redux/student/admissions/admission-offerings-api';
import {
  type AdmissionInquiry,
  useGetAdmissionInquiryQuery,
  useGetAdmissionInquiriesQuery,
  useLazyExportAdmissionInquiriesQuery,
  useMarkAdmissionInquiryContactedMutation,
  useGetAdmissionInquiryAssignableCounsellorsQuery,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { getAdmissionInquiryAccess } from './inquiry-access';
import { AdmissionQueryError } from './admission-query-error';
import { formatAdmissionReference } from './admission-reference';
import AdmissionInquiryDialog from './admission-inquiry-dialog';
import { AdmissionUnmatchedInquiryDrawer } from './admission-unmatched-inquiry-drawer';
import { buildAdmissionInquiryColumns } from './inquiry-management/admission-inquiry-columns';
import { AdmissionInquiryManagementDrawer } from './inquiry-management/admission-inquiry-management-drawer';
import { AdmissionInquiryAssignmentDialog } from './inquiry-management/admission-inquiry-assignment-dialog';
import { AdmissionInquiryCommunicationDialog } from './inquiry-management/admission-inquiry-communication-dialog';
import { AdmissionInquiryBulkAssignmentDialog } from './inquiry-management/admission-inquiry-bulk-assignment-dialog';
import {
  isAdmissionInquiryEnumFilter,
  buildAdmissionInquiryListFilters,
  normalizeAdmissionInquiryTableFilters,
  ADMISSION_INQUIRY_FILTER_QUERY_PARAMS,
  createInitialAdmissionInquiryTableFilters,
} from './inquiry-management/admission-inquiry-table-filters';

export default function AdmissionInquiriesScreen() {
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
  const [dismissedInquiryId, setDismissedInquiryId] = useState('');
  const [assignmentInquiry, setAssignmentInquiry] = useState<AdmissionInquiry | null>(null);
  const [communicationInquiry, setCommunicationInquiry] = useState<AdmissionInquiry | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAssignmentOpen, setBulkAssignmentOpen] = useState(false);
  const [sorts, setSorts] = useState<
    Array<{ column: string; direction: 'asc' | 'desc'; originalId?: string }>
  >([]);
  const createDialog = useBoolean();
  const unmatchedDialog = useBoolean();

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
  const { canManage, canAssign } = getAdmissionInquiryAccess(permissions);
  const canCommunicate =
    canManage && hasGrantedPermission(permissions, 'Communication.Campaigns.Add');
  const canSendCommunication = hasGrantedPermission(permissions, 'Communication.Campaigns.Send');
  const listFilters = buildAdmissionInquiryListFilters(tableFilters, search, currentUserId);
  const { data, isLoading, isError, refetch } = useGetAdmissionInquiriesQuery({
    ...listFilters,
    maxResultCount: rowsPerPage,
    skipCount: page * rowsPerPage,
    sorting: sorts[0] ? `${sorts[0].column} ${sorts[0].direction}` : undefined,
  });
  const { data: linkedInquiry } = useGetAdmissionInquiryQuery(linkedInquiryId, {
    skip: !linkedInquiryId,
  });
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
  const [markContacted, { isLoading: markingContacted }] =
    useMarkAdmissionInquiryContactedMutation();
  const [exportInquiries, exportState] = useLazyExportAdmissionInquiriesQuery();
  const exportFilters = {
    ...listFilters,
    sorting: sorts[0] ? `${sorts[0].column} ${sorts[0].direction}` : undefined,
  };

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

  const openApplicant360 = useCallback(
    (inquiry: AdmissionInquiry) => {
      if (!inquiry.applicantId) return;
      router.push(
        `${studentPaths.enrollment.root}/applicants/${inquiry.applicantId}?inquiryId=${encodeURIComponent(inquiry.id)}`
      );
    },
    [router]
  );

  const downloadExport = async () => {
    try {
      const blob = await exportInquiries(exportFilters).unwrap();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admission-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to export admission inquiries.',
      });
    }
  };
  const columns = useMemo(() => {
    const rows = data?.items ?? [];
    const visibleIds = rows.map((row) => row.id);
    const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length;
    const selectionColumn: IColumn = {
      id: 'selection',
      label: (
        <Checkbox
          size="small"
          inputProps={{ 'aria-label': 'Select all inquiries on this page' }}
          checked={visibleIds.length > 0 && selectedVisibleCount === visibleIds.length}
          indeterminate={selectedVisibleCount > 0 && selectedVisibleCount < visibleIds.length}
          onChange={(_, checked) =>
            setSelectedIds((current) =>
              checked
                ? Array.from(new Set([...current, ...visibleIds])).slice(0, 100)
                : current.filter((id) => !visibleIds.includes(id))
            )
          }
        />
      ),
      width: 52,
      sticky: true,
      stickyPosition: 'left',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_value: unknown, row) => {
        const inquiry = row as AdmissionInquiry;
        return (
          <Checkbox
            size="small"
            inputProps={{
              'aria-label': `Select ${formatAdmissionReference(inquiry.inquiryNumber)}`,
            }}
            checked={selectedIds.includes(inquiry.id)}
            disabled={!selectedIds.includes(inquiry.id) && selectedIds.length >= 100}
            onClick={(event) => event.stopPropagation()}
            onChange={(_event, checked) =>
              setSelectedIds((current) =>
                checked ? [...current, inquiry.id] : current.filter((id) => id !== inquiry.id)
              )
            }
          />
        );
      },
    };
    const sortable = new Set(['inquiryNumber', 'applicantName', 'status', 'source']);
    const inquiryColumns = buildAdmissionInquiryColumns({
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
      offeringOptions: (offerings?.items ?? []).map((offering) => ({
        label: `${offering.code} · ${offering.admissionCycleName}`,
        value: offering.id,
      })),
      onOpenApplicant360: openApplicant360,
      onManage: openInquiry,
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
    }));
    return canAssign ? [selectionColumn, ...inquiryColumns] : inquiryColumns;
  }, [
    canAssign,
    canCommunicate,
    canManage,
    counsellors,
    data?.items,
    markContacted,
    markingContacted,
    offerings?.items,
    openApplicant360,
    openInquiry,
    selectedIds,
  ]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Admission inquiries"
        description="Capture, qualify, and trace prospective applicants through the enrollment funnel."
        slotProps={{
          action: {},
          heading: {},
          moreLink: {},
          breadcrumbs: { display: { xs: 'none', md: 'flex' } },
        }}
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Inquiries' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              aria-label="Export all inquiries"
              size="small"
              variant="outlined"
              disabled={exportState.isFetching}
              startIcon={<Iconify icon="mdi:file-export-outline" />}
              onClick={downloadExport}
              sx={{
                minWidth: { xs: 40, sm: 64 },
                px: { xs: 1, sm: 1.5 },
                '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {exportState.isFetching ? 'Exporting…' : 'Export all'}
              </Box>
            </Button>
            {canManage && (
              <Button size="small" variant="outlined" startIcon={<Iconify icon="mdi:help-circle-outline" />}
                onClick={unmatchedDialog.onTrue}>
                Offering unknown
              </Button>
            )}
            {canManage && (
              <Button
                aria-label="New inquiry"
                size="small"
                variant="contained"
                startIcon={<Iconify icon="mdi:plus" />}
                onClick={createDialog.onTrue}
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
      <AdmissionInquiryDialog open={createDialog.value} onClose={createDialog.onFalse} />
      <AdmissionUnmatchedInquiryDrawer open={unmatchedDialog.value} onClose={unmatchedDialog.onFalse} />
      <AdmissionInquiryManagementDrawer
        inquiry={
          selectedInquiry ??
          (linkedInquiryId && linkedInquiryId !== dismissedInquiryId ? linkedInquiry : null) ??
          null
        }
        onClose={() => {
          setDismissedInquiryId(selectedInquiry?.id ?? linkedInquiryId);
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
      <AdmissionInquiryBulkAssignmentDialog
        inquiryIds={bulkAssignmentOpen ? selectedIds : []}
        counsellors={counsellors}
        onClose={() => setBulkAssignmentOpen(false)}
        onCompleted={() => setSelectedIds([])}
      />
      {isError ? (
        <AdmissionQueryError
          onRetry={() => {
            refetch();
          }}
        />
      ) : (
        <>
          {selectedIds.length > 0 && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              sx={{ px: 1, py: 0.75, border: 1, borderColor: 'divider', borderRadius: 1 }}
            >
              <Typography variant="body2" sx={{ flex: 1 }}>
                {selectedIds.length} selected
                {selectedIds.length === 100 ? ' · maximum bulk size reached' : ''}
              </Typography>
              <Button size="small" onClick={() => setSelectedIds([])}>
                Clear
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="mdi:account-arrow-right-outline" />}
                onClick={() => setBulkAssignmentOpen(true)}
              >
                Assign selected
              </Button>
            </Stack>
          )}
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <CustomizableTable
              tableId="admission-inquiries"
              tableTitle="Admission inquiries"
              wrapperProps={{ sx: { height: 1 } }}
              tableContainerProps={{ sx: { height: 1 } }}
              columns={columns}
              data={data?.items ?? []}
              isLoading={isLoading}
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
              searchFieldProps={{ placeholder: 'Search inquiries' }}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
