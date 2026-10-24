import type { FeeReceiptDetail, ChargeReceiptDetail } from 'src/redux/feeCollection/feeCollection';

import { Iconify } from 'src/components/iconify';
import { Stack, Button, Skeleton, Typography } from '@mui/material';
import PdfPreview from 'src/components/preview-document/pdf-preview';

interface UnifiedReceiptDisplayProps {
  feeReceipt: FeeReceiptDetail | undefined;
  chargeReceipt: ChargeReceiptDetail | undefined;
  feeIsLoading: boolean;
  chargeIsLoading: boolean;
  feeBlobUrl: string | null;
  chargeBlobUrl: string | null;
  onOpenFeeInNewTab: () => void;
  onDownloadFee: () => void;
  onOpenChargeInNewTab: () => void;
  onDownloadCharge: () => void;
}

export default function UnifiedReceiptDisplay({
  feeReceipt,
  chargeReceipt,
  feeIsLoading,
  chargeIsLoading,
  feeBlobUrl,
  chargeBlobUrl,
  onOpenFeeInNewTab,
  onDownloadFee,
  onOpenChargeInNewTab,
  onDownloadCharge,
}: UnifiedReceiptDisplayProps) {
  const renderReceipt = (isFee: boolean) => {
    const receipt = isFee ? feeReceipt : chargeReceipt;
    const isLoading = isFee ? feeIsLoading : chargeIsLoading;
    const blobUrl = isFee ? feeBlobUrl : chargeBlobUrl;
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
        ) : blobUrl ? (
          <>
            <PdfPreview url={blobUrl} title={`${name} Receipt`} />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                size="small"
                startIcon={<Iconify icon="mdi:open-in-new" />}
                onClick={isFee ? onOpenFeeInNewTab : onOpenChargeInNewTab}
              >
                Open
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:download" />}
                onClick={isFee ? onDownloadFee : onDownloadCharge}
              >
                Download
              </Button>
            </Stack>
          </>
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
