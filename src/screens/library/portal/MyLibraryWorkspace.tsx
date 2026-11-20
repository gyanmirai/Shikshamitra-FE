'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { RouterLink } from 'src/routes/components';
import { libraryPersonalPaths } from 'src/constants/library-personal';
import { useSearchParams } from 'src/routes/hooks/use-search-params';
import { CustomTabs } from 'src/components/custom-tabs';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { usePortalLibraryStudentsQuery } from 'src/redux/library/library-portal-api';
import { Box, Tab, Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';

import PortalReceipts from './PortalReceipts';
import PortalCatalogue from './PortalCatalogue';
import { PortalLoans, PortalRequests } from './PortalActivity';

const libraryTabs = [
  { value: 'catalogue', label: 'Browse books' },
  { value: 'loans', label: 'Loans' },
  { value: 'reservations', label: 'Reservations' },
  { value: 'receipts', label: 'Receipts' },
];

export default function MyLibraryWorkspace() {
  const [chosen, select] = useState('');
  const auth = useSelector((state: RootState) => state.auth);
  const query = usePortalLibraryStudentsQuery(undefined, { refetchOnMountOrArgChange: true });
  const students = query.isError ? [] : (query.currentData ?? []);
  const selected =
    students.length === 1 ? students[0] : students.find((row) => row.studentId === chosen);
  const canReserve = hasGrantedPermission(auth.permissions, 'Library.Portal.Reserve');
  const canReadReceipts = hasGrantedPermission(
    auth.permissions,
    'Finance.Fees.InvoiceReceipt.View'
  );
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="My Library"
        links={[{ name: 'My Account' }, { name: 'My Library' }]}
        sx={{ px: 1 }}
      />
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1 }}>
        {query.isFetching && <LinearProgress aria-label="Checking linked students" />}
        {query.isError ? (
          <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
            Could not check your linked students. Contact the school if access has changed.
          </Alert>
        ) : (
          <>
            {!query.isFetching && !students.length && (
              <Alert severity="info">Your account has no student linked to My Library.</Alert>
            )}
            {students.length > 1 && (
              <CustomSelect
                label="Student"
                name="studentId"
                value={chosen}
                options={students.map((row) => ({ id: row.studentId, name: row.name }))}
                size="small"
                onChange={(id) => select(String(id))}
              />
            )}
            {selected && (
              <Stack spacing={1.5}>
                <Typography variant="subtitle1">{selected.name}</Typography>
                <PortalStudentView
                  key={selected.studentId}
                  studentId={selected.studentId}
                  canReserve={canReserve}
                  canReadReceipts={canReadReceipts}
                />
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
}

function PortalStudentView({
  studentId,
  canReserve,
  canReadReceipts,
}: {
  studentId: string;
  canReserve: boolean;
  canReadReceipts: boolean;
}) {
  const active = useSearchParams().get('tab');
  const tabs = libraryTabs.filter(({ value }) => value !== 'receipts' || canReadReceipts);
  const tab = tabs.find(({ value }) => value === active)?.value ?? 'catalogue';
  return (
    <>
      <CustomTabs value={tab} aria-label="My Library" variant="scrollable">
        {tabs.map(({ value, label }) => (
          <Tab
            key={value}
            label={label}
            value={value}
            id={`my-library-${value}`}
            aria-controls="my-library-panel"
            component={RouterLink}
            href={`${libraryPersonalPaths.library}?tab=${value}`}
          />
        ))}
      </CustomTabs>
      <Stack
        id="my-library-panel"
        role="tabpanel"
        aria-labelledby={`my-library-${tab}`}
        spacing={1.5}
      >
        {tab === 'catalogue' && <PortalCatalogue studentId={studentId} canReserve={canReserve} />}
        {tab === 'loans' && <PortalLoans studentId={studentId} />}
        {tab === 'reservations' && <PortalRequests studentId={studentId} />}
        {tab === 'receipts' && <PortalReceipts studentId={studentId} />}
      </Stack>
    </>
  );
}
