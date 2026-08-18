'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import NextLink from 'next/link';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Stack, Button, MenuItem, TextField } from '@mui/material';
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

export default function AdmissionInquiriesScreen() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [cycleId, setCycleId] = useState('');
  const [offeringId, setOfferingId] = useState('');
  const createDialog = useBoolean();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManage = hasGrantedPermission(permissions, 'Students.Admissions.Inquiries.Manage');
  const { data, isLoading, isError, refetch } = useGetAdmissionInquiriesQuery({
    maxResultCount: 100,
    skipCount: 0,
    search: search || undefined,
    status: status === '' ? undefined : (Number(status) as AdmissionInquiryStatus),
    source: source === '' ? undefined : (Number(source) as AdmissionInquirySource),
    admissionCycleId: cycleId || undefined,
    admissionOfferingId: offeringId || undefined,
  });
  const { data: cycles } = useGetAdmissionCyclesQuery({ maxResultCount: 100, skipCount: 0 });
  const { data: offerings } = useGetAdmissionOfferingsQuery({ maxResultCount: 100, skipCount: 0 });
  const [markContacted, { isLoading: markingContacted }] =
    useMarkAdmissionInquiryContactedMutation();
  const columns: IColumn[] = [
    {
      id: 'inquiryNumber',
      label: 'Inquiry',
      minWidth: 140,
    },
    {
      id: 'applicantName',
      label: 'Applicant',
      filterType: 'string',
      isFilter: true,
      minWidth: 220,
      render: (value, row) => {
        const inquiry = row as unknown as AdmissionInquiry;
        return inquiry.applicantId ? (
          <NextLink href={`/student/admissions/applicants/${inquiry.applicantId}`}>
            {String(value)}
          </NextLink>
        ) : (
          String(value)
        );
      },
    },
    { id: 'normalizedPhone', label: 'Phone', minWidth: 140 },
    { id: 'email', label: 'Email', minWidth: 220 },
    { id: 'lastActivityAt', label: 'Last activity', minWidth: 160 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      render: (value) =>
        [
          'New',
          'Contacted',
          'Interested',
          'Follow-up',
          'Application started',
          'Converted',
          'Not interested',
          'Lost',
          'Duplicate',
        ][Number(value)],
    },
    {
      id: 'source',
      label: 'Source',
      minWidth: 120,
      render: (value) =>
        [
          'Website',
          'Walk-in',
          'Phone',
          'Referral',
          'Campaign',
          'Import',
          'WhatsApp',
          'Existing parent',
          'Manual',
          'Other',
        ][Number(value)],
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 140,
      render: (_, row) => {
        const inquiry = row as unknown as AdmissionInquiry;
        return canManage && inquiry.status === 0 ? (
          <Button
            size="small"
            variant="outlined"
            disabled={markingContacted}
            onClick={() =>
              markContacted(inquiry.id)
                .unwrap()
                .then(() => shikshaMitraToast.success({ message: 'Inquiry marked contacted' }))
                .catch(() => shikshaMitraToast.error({ message: 'Unable to update inquiry' }))
            }
          >
            Contacted
          </Button>
        ) : null;
      },
    },
  ];
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
      <AdmissionInquiryDialog open={createDialog.value} onClose={createDialog.onFalse} />
      {isError && (
        <AdmissionQueryError
          onRetry={() => {
            refetch();
          }}
        />
      )}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Search applicant or phone"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          sx={{ minWidth: 240 }}
        />
        <TextField
          select
          label="Cycle"
          value={cycleId}
          onChange={(event) => setCycleId(event.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All cycles</MenuItem>
          {(cycles?.items ?? []).map((cycle) => (
            <MenuItem key={cycle.id} value={cycle.id}>
              {cycle.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Offering"
          value={offeringId}
          onChange={(event) => setOfferingId(event.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All offerings</MenuItem>
          {(offerings?.items ?? []).map((offering) => (
            <MenuItem key={offering.id} value={offering.id}>
              {offering.code}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {[
            'New',
            'Contacted',
            'Interested',
            'Follow-up',
            'Application started',
            'Converted',
            'Not interested',
            'Lost',
            'Duplicate',
          ].map((label, value) => (
            <MenuItem key={label} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Source"
          value={source}
          onChange={(event) => setSource(event.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All sources</MenuItem>
          {[
            'Website',
            'Walk-in',
            'Phone',
            'Referral',
            'Campaign',
            'Import',
            'WhatsApp',
            'Existing parent',
            'Manual',
            'Other',
          ].map((label, value) => (
            <MenuItem key={label} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="admission-inquiries"
          tableTitle="Admission inquiries"
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          isPagination
          isSearch={false}
          isFilter={false}
        />
      </Box>
    </Box>
  );
}
