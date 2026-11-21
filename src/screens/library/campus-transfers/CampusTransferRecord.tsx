'use client';

import { GlobalIcons } from 'src/utils/icons';
import { formatDateOnly } from 'src/utils/date-only';
import { libraryPaths } from 'src/constants/library-menus';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/components/detail-view';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetTransferDetailQuery } from 'src/redux/library/campus-transfer-api';
import { Box, Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';

import CampusReceiptForm from './CampusReceiptForm';
import { useCampusTransferAccess } from './useCampusTransferAccess';
import { copyConditionLabel } from '../circulation/events/copy-event-display';

export default function CampusTransferRecord({ id }: { id: string }) {
  const { canRead, canReceive } = useCampusTransferAccess();
  const query = useGetTransferDetailQuery(id, { skip: !canRead, refetchOnMountOrArgChange: true });
  const detail = canRead && !query.isError ? query.currentData : undefined;
  const row = detail?.transfer;
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={row ? row.reason : 'Campus Transfer'}
        isBack
        sx={{ px: 1 }}
        links={[
          { name: 'Library', href: libraryPaths.dashboard },
          { name: 'Campus Transfers', href: libraryPaths.campusTransfers },
          { name: 'Transfer' },
        ]}
      />
      <Stack spacing={2} sx={{ minHeight: 0, overflow: 'auto', flex: 1, p: 1 }}>
        {query.isFetching && <LinearProgress aria-label="Loading campus transfer" />}
        {query.isError && (
          <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
            Could not load the transfer. Check the record and your Library access.
          </Alert>
        )}
        {row && detail && (
          <>
            <FormSectionCard title="Transfer details" icon={GlobalIcons.documentIcon}>
              <DetailGrid>
                <DetailField
                  label="Source"
                  value={`${row.source.campus} / ${row.source.section}`}
                />
                <DetailField
                  label="Destination"
                  value={`${row.destination.campus} / ${row.destination.section} / ${row.destinationShelf.name}`}
                />
                <DetailField label="Dispatched" value={formatDateOnly(row.dispatchedOn)} />
                <DetailField label="In transit" value={detail.pendingCount} />
              </DetailGrid>
            </FormSectionCard>
            <FormSectionCard title="Dispatched copies" icon={GlobalIcons.issueBook}>
              <CustomizableTable
                tableId="library-campus-transfer-copies"
                data={detail.copies}
                columns={[
                  { id: 'accessionNumber', label: 'Accession', rowHeader: true },
                  { id: 'title', label: 'Title' },
                  {
                    id: 'condition',
                    label: 'Receipt condition',
                    render: (value: number | null) =>
                      value == null ? 'In transit' : copyConditionLabel(value),
                  },
                ]}
                isSearch={false}
                isFilter={false}
                showExport={false}
              />
            </FormSectionCard>
            {canReceive && (
              <CampusReceiptForm key={row.id} detail={detail} refresh={query.refetch} />
            )}
            <FormSectionCard title="Receipts" icon={GlobalIcons.documentIcon}>
              {detail.receipts.length ? (
                <Stack component="ul" spacing={1} sx={{ pl: 2, my: 0 }}>
                  {detail.receipts.map((receipt) => (
                    <Typography key={receipt.id} component="li" variant="body2">
                      {formatDateOnly(receipt.receivedOn)} ·{' '}
                      {receipt.copies.map((copy) => copy.accessionNumber).join(', ')}
                      {receipt.notes && ` · ${receipt.notes}`}
                    </Typography>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2">No copies have been received.</Typography>
              )}
            </FormSectionCard>
          </>
        )}
      </Stack>
    </Box>
  );
}
