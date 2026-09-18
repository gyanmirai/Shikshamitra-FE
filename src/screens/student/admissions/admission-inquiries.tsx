'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Stack, Button, Checkbox, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { useMemo, useState, useEffect, useDeferredValue } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetAdmissionCyclesQuery } from 'src/redux/student/admissions/admission-cycles-api';
import { useGetAdmissionOfferingsQuery } from 'src/redux/student/admissions/admission-offerings-api';
import {
  type AdmissionInquiry,
  type AdmissionInquirySource,
  type AdmissionInquiryStatus,
  useGetAdmissionInquiriesQuery,
  useLazyExportAdmissionInquiriesQuery,
  useGetAdmissionInquiryQuery,
  type AdmissionInquiryWorkQueue,
  useMarkAdmissionInquiryContactedMutation,
  useGetAdmissionInquiryAssignableCounsellorsQuery,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { getAdmissionInquiryAccess } from './inquiry-access';
import { AdmissionQueryError } from './admission-query-error';
import AdmissionInquiryDialog from './admission-inquiry-dialog';
import { buildAdmissionInquiryColumns } from './inquiry-management/admission-inquiry-columns';
import { AdmissionInquiryManagementDrawer } from './inquiry-management/admission-inquiry-management-drawer';
import { AdmissionInquiryAssignmentDialog } from './inquiry-management/admission-inquiry-assignment-dialog';
import { AdmissionInquiryBulkAssignmentDialog } from './inquiry-management/admission-inquiry-bulk-assignment-dialog';
import { AdmissionInquiryCommunicationDialog } from './inquiry-management/admission-inquiry-communication-dialog';
import {
  MY_INQUIRIES_FILTER,
  AdmissionInquiryFilters,
  UNASSIGNED_INQUIRIES_FILTER,
} from './inquiry-management/admission-inquiry-filters';

export default function AdmissionInquiriesScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedInquiryId = searchParams.get('inquiryId') ?? '';
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [status, setStatus] = useState<'' | AdmissionInquiryStatus>(() => {
    const rawValue = searchParams.get('status');
    if (rawValue === null) return '';
    const value = Number(rawValue);
    return Number.isInteger(value) && value >= 0 && value <= 8
      ? (value as AdmissionInquiryStatus)
      : '';
  });
  const [source, setSource] = useState<'' | AdmissionInquirySource>(() => {
    const rawValue = searchParams.get('source');
    if (rawValue === null) return '';
    const value = Number(rawValue);
    return Number.isInteger(value) && value >= 0 && value <= 9
      ? (value as AdmissionInquirySource)
      : '';
  });
  const [workQueue, setWorkQueue] = useState<'' | AdmissionInquiryWorkQueue>(() => {
    const value = Number(searchParams.get('queue'));
    return [1, 2, 3, 4].includes(value) ? (value as AdmissionInquiryWorkQueue) : '';
  });
  const [ownerId, setOwnerId] = useState(() => searchParams.get('owner') ?? '');
  const [cycleId, setCycleId] = useState(() => searchParams.get('cycle') ?? '');
  const [offeringId, setOfferingId] = useState(() => searchParams.get('offering') ?? '');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedInquiry, setSelectedInquiry] = useState<AdmissionInquiry | null>(null);
  const [assignmentInquiry, setAssignmentInquiry] = useState<AdmissionInquiry | null>(null);
  const [communicationInquiry, setCommunicationInquiry] = useState<AdmissionInquiry | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAssignmentOpen, setBulkAssignmentOpen] = useState(false);
  const [sorts, setSorts] = useState<
    Array<{ column: string; direction: 'asc' | 'desc'; originalId?: string }>
  >([]);
  const deferredSearch = useDeferredValue(search.trim());
  const createDialog = useBoolean();

  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    const setOrDelete = (key: string, value: string | number) => {
      if (value === '') next.delete(key);
      else next.set(key, String(value));
    };
    setOrDelete('search', search);
    setOrDelete('status', status);
    setOrDelete('source', source);
    setOrDelete('queue', workQueue);
    setOrDelete('owner', ownerId);
    setOrDelete('cycle', cycleId);
    setOrDelete('offering', offeringId);
    const query = next.toString();
    if (query !== searchParams.toString())
      router.replace(
        query ? `${studentPaths.enrollment.inquiries}?${query}` : studentPaths.enrollment.inquiries
      );
  }, [cycleId, offeringId, ownerId, router, search, searchParams, source, status, workQueue]);
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
  const { data, isLoading, isError, refetch } = useGetAdmissionInquiriesQuery({
    maxResultCount: rowsPerPage,
    skipCount: page * rowsPerPage,
    search: deferredSearch || undefined,
    status: status === '' ? undefined : status,
    source: source === '' ? undefined : source,
    admissionCycleId: cycleId || undefined,
    admissionOfferingId: offeringId || undefined,
    assignedCounsellorId,
    isAssigned: ownerId === UNASSIGNED_INQUIRIES_FILTER ? false : undefined,
    workQueue: workQueue === '' ? undefined : workQueue,
    sorting: sorts[0] ? `${sorts[0].column} ${sorts[0].direction}` : undefined,
  });
  const { data: linkedInquiry } = useGetAdmissionInquiryQuery(linkedInquiryId, {
    skip: !linkedInquiryId,
  });
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
  const [markContacted, { isLoading: markingContacted }] =
    useMarkAdmissionInquiryContactedMutation();
  const [exportInquiries, exportState] = useLazyExportAdmissionInquiriesQuery();
  const listFilters = {
    search: deferredSearch || undefined,
    status: status === '' ? undefined : status,
    source: source === '' ? undefined : source,
    admissionCycleId: cycleId || undefined,
    admissionOfferingId: offeringId || undefined,
    assignedCounsellorId,
    isAssigned: ownerId === UNASSIGNED_INQUIRIES_FILTER ? false : undefined,
    workQueue: workQueue === '' ? undefined : workQueue,
    sorting: sorts[0] ? `${sorts[0].column} ${sorts[0].direction}` : undefined,
  };

  const downloadExport = async () => {
    try {
      const blob = await exportInquiries(listFilters).unwrap();
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
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_value: unknown, row) => {
        const inquiry = row as AdmissionInquiry;
        return (
          <Checkbox
            size="small"
            inputProps={{ 'aria-label': `Select ${inquiry.inquiryNumber}` }}
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
    const sortable = new Set([
      'inquiryNumber',
      'applicantName',
      'status',
      'source',
      'lastActivityAt',
    ]);
    const inquiryColumns = buildAdmissionInquiryColumns({
      canManage,
      canAssign,
      canCommunicate,
      isMarkingContacted: markingContacted,
      counsellorNames: Object.fromEntries(
        counsellors.map((counsellor) => [counsellor.id, counsellor.name || counsellor.userName])
      ),
      onManage: (inquiry) => {
        setSelectedInquiry(inquiry);
        const next = new URLSearchParams(searchParams.toString());
        next.set('inquiryId', inquiry.id);
        router.push(`${studentPaths.enrollment.inquiries}?${next.toString()}`);
      },
      onAssign: setAssignmentInquiry,
      onCommunicate: setCommunicationInquiry,
      onMarkContacted: (inquiry) => {
        markContacted(inquiry.id)
          .unwrap()
          .then(() =>
            shikshaMitraToast.success({
              message: `${inquiry.inquiryNumber} was marked contacted.`,
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
    router,
    searchParams,
    selectedIds,
  ]);

  const changeFilter = (field: string, value: string) => {
    setPage(0);
    if (field === 'search') setSearch(value);
    if (field === 'cycleId') {
      setCycleId(value);
      setOfferingId('');
    }
    if (field === 'offeringId') setOfferingId(value);
    if (field === 'status')
      setStatus(value === '' ? '' : (Number(value) as AdmissionInquiryStatus));
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
    setStatus('');
    setSource('');
    setWorkQueue('');
    setOwnerId('');
    setPage(0);
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Admission inquiries"
        description="Capture, qualify, and trace prospective applicants through the enrollment funnel."
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Inquiries' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              disabled={exportState.isFetching}
              startIcon={<Iconify icon="mdi:file-export-outline" />}
              onClick={downloadExport}
            >
              {exportState.isFetching ? 'Exporting…' : 'Export all'}
            </Button>
            {canManage && (
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="mdi:plus" />}
                onClick={createDialog.onTrue}
              >
                New inquiry
              </Button>
            )}
          </Stack>
        }
      />
      <AdmissionInquiryDialog
        open={createDialog.value}
        onClose={createDialog.onFalse}
        cycles={cycles?.items}
        cyclesLoading={cyclesLoading}
        cyclesError={cyclesError}
      />
      <AdmissionInquiryManagementDrawer
        inquiry={selectedInquiry ?? linkedInquiry ?? null}
        onClose={() => {
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
          <AdmissionInquiryFilters
            search={search}
            cycleId={cycleId}
            offeringId={offeringId}
            status={status}
            source={source}
            workQueue={workQueue}
            ownerId={ownerId}
            currentUserId={currentUserId}
            cycles={cycles?.items ?? []}
            offerings={offerings?.items ?? []}
            counsellors={counsellors}
            onChange={changeFilter}
            onReset={resetFilters}
          />
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
              serverSideSort
              serverSideSortMode="single"
              sorts={sorts}
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
              isSearch={false}
              isFilter={false}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
