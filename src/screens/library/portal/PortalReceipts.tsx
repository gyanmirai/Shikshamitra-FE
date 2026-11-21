import type { PortalReceipt } from 'src/redux/library/library-portal-api';

import { useState } from 'react';
import { formatDateOnly } from 'src/utils/date-only';
import CustomSelect from 'src/components/custom-select';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Paper, Button, Typography } from '@mui/material';
import {
  usePortalLibraryReceiptsQuery,
  usePortalLibraryReceiptYearsQuery,
  useDownloadPortalLibraryReceiptMutation,
} from 'src/redux/library/library-portal-api';

import { portalPageSize, PortalPageStatus, PortalPageControls } from './PortalPageControls';

const verificationLabels: Record<string, string> = {
  PendingVerification: 'Pending verification',
  Verified: 'Verified',
  Rejected: 'Rejected',
};

export default function PortalReceipts({ studentId }: { studentId: string }) {
  const [choice, select] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [activeDownload, setActiveDownload] = useState<string>();
  const [download] = useDownloadPortalLibraryReceiptMutation();
  const years = usePortalLibraryReceiptYearsQuery(studentId, { refetchOnMountOrArgChange: true });
  const options = years.isError ? [] : (years.currentData ?? []);
  const academicYearId =
    options.length === 1 ? options[0].id : options.find((year) => year.id === choice)?.id || '';
  const result = usePortalLibraryReceiptsQuery(
    { studentId, academicYearId, page, pageSize: portalPageSize },
    { skip: !academicYearId, refetchOnMountOrArgChange: true }
  );
  const data = result.isError ? undefined : result.currentData;
  const savePdf = async (receipt: PortalReceipt) => {
    if (!academicYearId || activeDownload) return;
    setActiveDownload(receipt.id);
    setError('');
    try {
      const pdf = await download({ studentId, academicYearId, receiptId: receipt.id }).unwrap();
      const url = URL.createObjectURL(pdf);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${receipt.id}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (problem) {
      setError(parseApiProblemDetail(problem).detail || 'Could not download this receipt.');
    } finally {
      setActiveDownload(undefined);
    }
  };
  return (
    <>
      <PortalPageStatus busy={years.isFetching} error={years.isError} retry={years.refetch} />
      {years.currentData && !years.isError && !options.length && (
        <Alert severity="info">No receipt years are available.</Alert>
      )}
      {options.length === 1 && (
        <Typography variant="body2">Receipt academic year {options[0].name}</Typography>
      )}
      {options.length > 1 && (
        <CustomSelect
          label="Receipt academic year"
          name="receiptYear"
          value={academicYearId}
          options={options}
          size="small"
          disabled={Boolean(activeDownload)}
          onChange={(year) => {
            select(String(year));
            setPage(1);
            setError('');
          }}
        />
      )}
      {academicYearId && (
        <PortalPageStatus busy={result.isFetching} error={result.isError} retry={result.refetch} />
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {data && !data.items.length && (
        <Typography variant="body2">
          No Library receipts were recorded in this academic year.
        </Typography>
      )}
      {data?.items.map((receipt) => (
        <Paper key={receipt.id} variant="outlined" sx={{ p: 1.5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            spacing={1}
          >
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">{receipt.number}</Typography>
              <Typography variant="body2">
                {formatDateOnly(receipt.receivedOn)} ·{' '}
                {receipt.kind === 'ProvisionalCharge' || receipt.kind === 'ProvisionalFee'
                  ? 'Provisional receipt'
                  : 'Receipt'}
              </Typography>
              {verificationLabels[receipt.verificationStatus] && (
                <Typography variant="body2">
                  {verificationLabels[receipt.verificationStatus]}
                </Typography>
              )}
            </Stack>
            <Button
              size="small"
              aria-label={`Download PDF for receipt ${receipt.number}`}
              disabled={Boolean(activeDownload)}
              loading={activeDownload === receipt.id}
              onClick={() => savePdf(receipt)}
            >
              Download PDF
            </Button>
          </Stack>
        </Paper>
      ))}
      <PortalPageControls data={data} setPage={setPage} />
    </>
  );
}
