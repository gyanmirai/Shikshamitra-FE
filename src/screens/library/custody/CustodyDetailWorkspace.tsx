'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import { GlobalIcons } from 'src/utils/icons';
import { formatDateOnly } from 'src/utils/date-only';
import { libraryPaths } from 'src/constants/library-menus';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetCustodyDetailQuery } from 'src/redux/library/custody-api';
import { Box, Chip, Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';

import { useCustodyAccess } from './useCustodyAccess';
import { CustodyReturnForm, custodyReturnConditions } from './CustodyReturnForm';

const copyColumns: IColumn[] = [
  { id: 'accessionNumber', label: 'Accession', rowHeader: true },
  { id: 'title', label: 'Title', minWidth: 150 },
  {
    id: 'returnReceiptId',
    label: 'Custody status',
    render: (value: string | null) => (
      <Chip
        size="small"
        color={value ? 'success' : 'warning'}
        label={value ? 'Received' : 'Outstanding'}
      />
    ),
  },
  {
    id: 'returnedCondition',
    label: 'Condition on return',
    render: (value: number | null) =>
      custodyReturnConditions.find((condition) => condition.id === value)?.name || '—',
  },
];

export default function CustodyDetailWorkspace({ id }: { id: string }) {
  const access = useCustodyAccess();
  const query = useGetCustodyDetailQuery(id, {
    skip: !access.canRead,
    refetchOnMountOrArgChange: true,
  });
  const detail = access.canRead && !query.isError ? query.currentData : undefined;
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Custody Handoff"
        links={[
          { name: 'Library', href: libraryPaths.dashboard },
          { name: 'Classroom Custody', href: libraryPaths.custody },
          { name: 'Custody Handoff' },
        ]}
        sx={{ px: 1 }}
      />
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1 }}>
        {query.isFetching && <LinearProgress aria-label="Loading classroom custody" />}
        {query.isError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          >
            Could not load this custody record.
          </Alert>
        )}
        {detail && (
          <>
            <FormSectionCard title={detail.handoff.purpose} icon={GlobalIcons.documentIcon}>
              <Stack spacing={1}>
                <Typography variant="body2">
                  {[detail.handoff.custodian, detail.handoff.className, detail.handoff.roomName]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Handed off {formatDateOnly(detail.handoff.handedOffOn)}
                  {detail.handoff.expectedReturnOn
                    ? ` · Expected ${formatDateOnly(detail.handoff.expectedReturnOn)}`
                    : ''}
                </Typography>
                <Typography variant="subtitle2">
                  {detail.pendingCount} of {detail.handoff.copyCount} copies outstanding
                </Typography>
              </Stack>
            </FormSectionCard>
            <Box sx={{ height: 360 }}>
              <CustomizableTable
                variant="embedded"
                tableId="library-custody-detail-copies"
                columns={copyColumns}
                data={detail.copies.map((copy) => ({ ...copy, id: copy.copyId }))}
                wrapperProps={{ sx: { height: 1 } }}
                tableContainerProps={{ sx: { height: 1 } }}
                isFilter={false}
                showExport={false}
              />
            </Box>
            {access.canReturn && (
              <CustodyReturnForm key={detail.handoff.id} detail={detail} refresh={query.refetch} />
            )}
            {detail.receipts.length > 0 && (
              <FormSectionCard title="Return receipts" icon={GlobalIcons.history}>
                <Stack component="ul" spacing={1.25} sx={{ my: 0, pl: 2 }}>
                  {detail.receipts.map((receipt) => (
                    <Stack component="li" key={receipt.id} spacing={0.25}>
                      <Typography variant="subtitle2">
                        {formatDateOnly(receipt.receivedOn)} · {receipt.copies.length}{' '}
                        {receipt.copies.length === 1 ? 'copy' : 'copies'}
                      </Typography>
                      <Typography variant="body2">
                        {receipt.copies.map((copy) => copy.accessionNumber).join(', ')}
                      </Typography>
                      {receipt.notes && (
                        <Typography variant="body2" color="text.secondary">
                          {receipt.notes}
                        </Typography>
                      )}
                    </Stack>
                  ))}
                </Stack>
              </FormSectionCard>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
}
