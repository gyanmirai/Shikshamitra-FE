import type { FeeReceiptDetail, ChargeReceiptDetail } from 'src/redux/feeCollection/feeCollection';

import PdfPreview from 'src/components/preview-document/pdf-preview';
import { Stack, Alert, Button, Skeleton, Typography } from '@mui/material';

interface UnifiedReceiptDisplayProps {
  feeReceipt: FeeReceiptDetail | undefined;
  chargeReceipt: ChargeReceiptDetail | undefined;
  feeIsLoading: boolean;
  chargeIsLoading: boolean;
  feeBlobUrl: string | null;
  chargeBlobUrl: string | null;
  feeError?: string | null;
  chargeError?: string | null;
  onRetryFee?: () => void;
  onRetryCharge?: () => void;
}

export default function UnifiedReceiptDisplay({
  feeReceipt,
  chargeReceipt,
  feeIsLoading,
  chargeIsLoading,
  feeBlobUrl,
  chargeBlobUrl,
  feeError,
  chargeError,
  onRetryFee,
  onRetryCharge,
}: UnifiedReceiptDisplayProps) {
  const renderReceipt = (isFee: boolean) => {
    const receipt = isFee ? feeReceipt : chargeReceipt;
    const isLoading = isFee ? feeIsLoading : chargeIsLoading;
    const blobUrl = isFee ? feeBlobUrl : chargeBlobUrl;
    const error = isFee ? feeError : chargeError;
    const onRetry = isFee ? onRetryFee : onRetryCharge;
    const name = isFee ? (feeReceipt?.combined ? 'Combined Fee And Charge' : 'Fee') : 'Charge';
    if (!receipt && !isLoading) return null;

    return (
      <Stack
        component="section"
        key={isFee ? 'fee' : 'charge'}
        aria-label={`${name} Receipt`}
        spacing={1}
      >
        {isLoading ? (
          <Stack spacing={1} role="status" aria-label={`Loading ${name.toLowerCase()} receipt`}>
            <Skeleton height={60} />
            <Skeleton height={160} />
          </Stack>
        ) : error ? (
          <Alert
            severity="warning"
            action={
              onRetry && (
                <Button size="small" onClick={onRetry}>
                  Retry receipt
                </Button>
              )
            }
          >
            {error}
          </Alert>
        ) : blobUrl ? (
          <PdfPreview url={blobUrl} title={`${name} Receipt`} showPageText={false} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {name} receipt preview is unavailable.
          </Typography>
        )}
      </Stack>
    );
  };

  return (
    <Stack spacing={2}>
      {renderReceipt(true)}
      {renderReceipt(false)}
    </Stack>
  );
}
