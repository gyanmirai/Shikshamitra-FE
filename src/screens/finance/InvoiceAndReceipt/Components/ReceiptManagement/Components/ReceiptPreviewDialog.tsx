import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import React, { useState, useEffect } from 'react';
import CustomDialog from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Skeleton, Typography, CircularProgress } from '@mui/material';
import { useDownloadReceiptPdfMutation } from 'src/redux/feeCollection/feeCollection';
import {
  FEE_RECEIPT_KIND_COLORS,
  FEE_RECEIPT_KIND_LABELS,
  useGetFeeReceiptDetailQuery,
} from 'src/redux/invoiceAndReceipt/feeReceiptApi';

interface ReceiptPreviewDialogProps {
  receiptId: string;
  onClose: () => void;
}

const ReceiptPreviewDialog: React.FC<ReceiptPreviewDialogProps> = ({ receiptId, onClose }) => {
  const { data: receipt, isLoading } = useGetFeeReceiptDetailQuery(receiptId);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);

  const [downloadFeeReceiptPdf, { isLoading: isPdfLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDownloadReceiptPdfMutation,
    popupConfig: {
      error: true,
      errorMessage: 'Unable to load receipt preview',
      success: false,
    },
  });

  useEffect(() => {
    let isActive = true;

    const loadPdf = async () => {
      try {
        const blob = await downloadFeeReceiptPdf(receiptId).unwrap();
        if (!isActive) return;
        const objectUrl = URL.createObjectURL(blob);
        setReceiptBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return objectUrl;
        });
      } catch {
        if (isActive) setReceiptBlobUrl(null);
      }
    };

    setReceiptBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    loadPdf();

    return () => {
      isActive = false;
    };
  }, [downloadFeeReceiptPdf, receiptId]);

  useEffect(
    () => () => {
      if (receiptBlobUrl) URL.revokeObjectURL(receiptBlobUrl);
    },
    [receiptBlobUrl]
  );

  const kindColor = receipt
    ? (FEE_RECEIPT_KIND_COLORS[receipt.receiptKind] as LabelColor)
    : 'default';
  const kindLabel = receipt ? FEE_RECEIPT_KIND_LABELS[receipt.receiptKind] : '';

  const title = (
    <Box display="flex" alignItems="center" gap={1.5}>
      <Box>
        <Typography variant="h6" fontWeight={700}>
          {receipt?.studentName || 'Receipt Preview'} {receipt?.grNo ? `(${receipt.grNo})` : ''}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {receipt?.className && `Class ${receipt.className},`}
        </Typography>
      </Box>
      {receipt && (
        <Label
          variant="soft"
          color={kindColor}
          sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600, mb: 3 }}
        >
          {kindLabel}
        </Label>
      )}
    </Box>
  );

  return (
    <CustomDialog open handleClose={onClose} title={title} maxWidth="md" hasForm={false}>
      {isLoading ? (
        <Box p={2}>
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={200} />
        </Box>
      ) : !receipt ? (
        <Box p={2}>
          <Typography color="text.secondary">Receipt not found.</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            width: '100%',
            height: { xs: '60vh', sm: '65vh', md: '70vh' },
            maxHeight: 'calc(100vh - 220px)',
            minHeight: 420,
            p: 1,
          }}
        >
          {isPdfLoading ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <CircularProgress size={28} />
              <Typography variant="body2" color="text.secondary">
                Loading receipt preview...
              </Typography>
            </Box>
          ) : receiptBlobUrl ? (
            <iframe
              title="Fee Receipt PDF"
              src={receiptBlobUrl}
              style={{ border: 'none', width: '100%', minHeight: '100%', height: '100%' }}
            />
          ) : (
            <Box p={2}>
              <Typography variant="body2" color="text.secondary">
                Receipt preview is not available right now.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </CustomDialog>
  );
};

export default ReceiptPreviewDialog;
