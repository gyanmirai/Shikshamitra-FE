import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
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

type FeeReceiptKind = keyof typeof FEE_RECEIPT_KIND_COLORS;

const isFeeReceiptKind = (value: unknown): value is FeeReceiptKind =>
  typeof value === 'number' && value in FEE_RECEIPT_KIND_COLORS;

const getReceiptKindMeta = (
  value: unknown
): {
  color: LabelColor;
  label: string;
} | null => {
  if (!isFeeReceiptKind(value)) return null;

  return {
    color: FEE_RECEIPT_KIND_COLORS[value] as LabelColor,
    label: FEE_RECEIPT_KIND_LABELS[value],
  };
};

const ReceiptPreviewDialog: React.FC<ReceiptPreviewDialogProps> = ({ receiptId, onClose }) => {
  const { data: receipt, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeReceiptDetailQuery,
    params: { id: receiptId },
    options: { skip: !receiptId },
  });
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
    let objectUrl: string | null = null;

    if (!receiptId) {
      setReceiptBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return () => {
        isActive = false;
      };
    }

    const loadPdf = async () => {
      try {
        const blob = await downloadFeeReceiptPdf({ receiptId }).unwrap();
        if (!isActive) return;

        objectUrl = URL.createObjectURL(blob);
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
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [downloadFeeReceiptPdf, receiptId]);

  const receiptKindMeta = getReceiptKindMeta(receipt?.receiptKind);

  const title = (
    <Box display="flex" flexDirection="column" gap={0.5} flexGrow={1}>
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="h6" fontWeight={700}>
          {receipt?.studentName || 'Receipt Preview'} {receipt?.grNo ? `(${receipt.grNo})` : ''}
        </Typography>
        <CustomTooltip
          arrow
          placement="right"
          sx={{ textAlign: 'justify' }}
          title="You can update the subject details including name and color."
        >
          <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
        </CustomTooltip>
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        {receipt && (
          <Label
            variant="soft"
            color={receiptKindMeta?.color ?? 'default'}
            sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600 }}
          >
            {receiptKindMeta?.label ?? ''}
          </Label>
        )}
        <Typography variant="caption" color="text.secondary">
          {receipt?.className ?? ''}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <CustomDialog
      open
      handleClose={onClose}
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <Typography variant="h5">{title}</Typography>
        </Box>
      }
      maxWidth="md"
      hasForm={false}
    >
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
