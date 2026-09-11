'use client';

import type { RootState } from 'src/redux/store';
import { useMemo, useState, useDeferredValue } from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Button } from '@mui/material';
import { useGetAdmissionCyclesQuery } from 'src/redux/student/admissions/admission-cycles-api';
import { useGetAdmissionOfferingsQuery } from 'src/redux/student/admissions/admission-offerings-api';
import {
  type AdmissionInquiry,
  type AdmissionInquirySource,
  type AdmissionInquiryStatus,
  useGetAdmissionInquiriesQuery,
  useMarkAdmissionInquiryContactedMutation,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { AdmissionQueryError } from './admission-query-error';
import AdmissionInquiryDialog from './admission-inquiry-dialog';
import { AdmissionInquiryManagementDrawer } from './inquiry-management/admission-inquiry-management-drawer';
import { AdmissionInquiryFilters } from './inquiry-management/admission-inquiry-filters';
import { buildAdmissionInquiryColumns } from './inquiry-management/admission-inquiry-columns';

export default function AdmissionInquiriesScreen() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | AdmissionInquiryStatus>('');
  const [source, setSource] = useState<'' | AdmissionInquirySource>('');
  const [cycleId, setCycleId] = useState('');
  const [offeringId, setOfferingId] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedInquiry, setSelectedInquiry] = useState<AdmissionInquiry | null>(null);
  const deferredSearch = useDeferredValue(search.trim());
  const createDialog = useBoolean();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManage = hasGrantedPermission(permissions, 'Students.Admissions.Inquiries.Manage');
  const { data, isLoading, isError, refetch } = useGetAdmissionInquiriesQuery({
    maxResultCount: rowsPerPage,
    skipCount: page * rowsPerPage,
    search: deferredSearch || undefined,
    status: status === '' ? undefined : status,
    source: source === '' ? undefined : source,
    admissionCycleId: cycleId || undefined,
    admissionOfferingId: offeringId || undefined,
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
  const [markContacted, { isLoading: markingContacted }] =
    useMarkAdmissionInquiryContactedMutation();
  const columns = useMemo(
    () => buildAdmissionInquiryColumns({
      canManage,
      isMarkingContacted: markingContacted,
      onManage: setSelectedInquiry,
      onMarkContacted: (inquiry) => {
        markContacted(inquiry.id).unwrap()
          .then(() => shikshaMitraToast.success({ message: 'Inquiry marked contacted' }))
          .catch(() => shikshaMitraToast.error({ message: 'Unable to update inquiry' }));
      },
    }),
    [canManage, markContacted, markingContacted]
  );

  const changeFilter = (field: string, value: string) => {
    setPage(0);
    if (field === 'search') setSearch(value);
    if (field === 'cycleId') setCycleId(value);
    if (field === 'offeringId') setOfferingId(value);
    if (field === 'status') setStatus(value === '' ? '' : Number(value) as AdmissionInquiryStatus);
    if (field === 'source') setSource(value === '' ? '' : Number(value) as AdmissionInquirySource);
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Admission inquiries"
        description="Capture, qualify, and trace prospective applicants through the enrollment funnel."
        links={[
          { name: 'Students', href: '/student' },
          { name: 'Admissions', href: '/student/admissions' },
          { name: 'Inquiries' },
        ]}
        sx={{ mb: 3 }}
        action={
          canManage ? (
            <Button variant="contained" onClick={createDialog.onTrue}>
              New inquiry
            </Button>
          ) : undefined
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
        inquiry={selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
      />
      {isError && (
        <AdmissionQueryError
          onRetry={() => {
            refetch();
          }}
        />
      )}
      <AdmissionInquiryFilters
        search={search}
        cycleId={cycleId}
        offeringId={offeringId}
        status={status}
        source={source}
        cycles={cycles?.items ?? []}
        offerings={offerings?.items ?? []}
        onChange={changeFilter}
      />
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
    </Box>
  );
}
