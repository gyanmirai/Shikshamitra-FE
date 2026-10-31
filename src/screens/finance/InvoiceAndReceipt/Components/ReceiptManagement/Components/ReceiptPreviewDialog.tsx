import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import React, { useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import PdfPreview from 'src/components/preview-document/pdf-preview';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';
import { useDownloadReceiptPdfMutation } from 'src/redux/feeCollection/feeCollection';
import {
  Box,
  Stack,
  Button,
  Skeleton,
  Typography,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  FEE_RECEIPT_KIND_COLORS,
  FEE_RECEIPT_KIND_LABELS,
  useGetFeeReceiptDetailQuery,
  FEE_RECEIPT_VERIFICATION_LABELS,
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

  return (
    <CustomDialog
      titleInfo="Review the saved receipt details and its PDF document."
      open
      handleClose={onClose}
      title={
        <Stack
          component="span"
          direction="row"
          spacing={1}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
        >
          <Box component="span" sx={{ overflowWrap: 'anywhere' }}>
            {receipt?.receiptNumber || 'Receipt Preview'}
          </Box>
          {receiptKindMeta && (
            <Label color={receiptKindMeta.color}>
              {receipt?.receiptKindLabel || receiptKindMeta.label}
            </Label>
          )}
        </Stack>
      }

      maxWidth="lg"
      hasForm={false}
      guardUnsavedChanges={false}
      paperProps={{
        sx: {
          backgroundImage: 'none',
          height: '90dvh',
          maxHeight: 'calc(100dvh - 32px)',
          m: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' },
        },
      }}
    >
      <DialogScrollContent>
        {isLoading ? (
          <Stack spacing={2} role="status" aria-label="Loading receipt details">
            <Skeleton variant="rounded" height={150} />
            <Skeleton variant="rounded" height={350} />
          </Stack>
        ) : !receipt ? (
          <Box>Receipt not found.</Box>
        ) : (
          <Stack spacing={2}>
            <DetailSection
              title="Receipt Details"
              icon="mdi:receipt-text-outline"
              helpText="Recorded receipt amount, payment method, and links between provisional documents and receipts."
            >
              <DetailGrid>
                <DetailField
                  label="Receipt date"
                  value={receipt.receiptDate ? fDateTime(receipt.receiptDate) : null}
                />
                <DetailField
                  label="Amount paid"
                  value={formatNumber(receipt.totalPaidAmount, 'INR')}
                />
                {receipt.receiptScope === 3 && (
                  <>
                    <DetailField label="Receipt covers" value="Fees and charges" />
                    <DetailField
                      label="Fees including late fees"
                      value={formatNumber(receipt.feePaidAmount, 'INR')}
                    />
                    <DetailField
                      label="Charges"
                      value={formatNumber(receipt.chargePaidAmount, 'INR')}
                    />
                  </>
                )}
                <DetailField label="Academic year" value={receipt.academicYearName} />
                <DetailField
                  label="Payment method"
                  value={receipt.paymentMethodLabel || 'Not recorded'}
                />
                {FEE_RECEIPT_VERIFICATION_LABELS[
                  receipt.verificationStatus as keyof typeof FEE_RECEIPT_VERIFICATION_LABELS
                ] && (
                  <DetailField
                    label="Verification"
                    value={
                      FEE_RECEIPT_VERIFICATION_LABELS[
                        receipt.verificationStatus as keyof typeof FEE_RECEIPT_VERIFICATION_LABELS
                      ]
                    }
                  />
                )}
                {receipt.linkedFinalReceiptNumber && (
                  <DetailField label="Receipt" value={receipt.linkedFinalReceiptNumber} />
                )}
                {receipt.linkedProvisionalReceiptNumber && (
                  <DetailField
                    label="Provisional receipt"
                    value={receipt.linkedProvisionalReceiptNumber}
                  />
                )}
                {receipt.siblingReceiptNumber && (
                  <DetailField label="Related receipt" value={receipt.siblingReceiptNumber} />
                )}
                {receipt.remarks && (
                  <DetailField fullWidth label="Remarks" value={receipt.remarks} />
                )}
              </DetailGrid>
            </DetailSection>
            <DetailSection
              title="Student Information"
              icon="mdi:account-school-outline"
              helpText="Student and academic context associated with this receipt."
            >
              <DetailGrid>
                <DetailField label="Student name" value={receipt.studentName} />
                <DetailField label="GR number" value={receipt.grNo} />
                <DetailField
                  label="Class / division"
                  value={[receipt.className, receipt.division].filter(Boolean).join(' / ')}
                />
                <DetailField label="Roll number" value={receipt.rollNo} />
                <DetailField label="Board" value={receipt.boardName} />
                <DetailField label="Medium" value={receipt.mediumName} />
              </DetailGrid>
            </DetailSection>
            <DetailSection
              title="Receipt Document"
              icon="mdi:file-document-outline"
              helpText="Preview and download the printable PDF for this receipt number."
            >
              {isPdfLoading ? (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  spacing={1}
                  sx={{ minHeight: 240 }}
                  role="status"
                >
                  <CircularProgress size={28} />
                  <Typography variant="body2" color="text.secondary">
                    Loading receipt preview...
                  </Typography>
                </Stack>
              ) : receiptBlobUrl ? (
                <PdfPreview url={receiptBlobUrl} title="Fee Receipt" />
              ) : (
                <Box>Receipt preview is not available right now.</Box>
              )}
            </DetailSection>
          </Stack>
        )}
      </DialogScrollContent>
      <DialogActions sx={{ px: 2, py: 1.5, gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          component="a"
          href={receiptBlobUrl || undefined}
          download={receipt?.pdfFileName || `Receipt-${receipt?.receiptNumber || receiptId}.pdf`}
          disabled={!receiptBlobUrl}
          variant="contained"
          size="small"
          startIcon={<Iconify icon="mdi:download" />}
        >
          Download PDF
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default ReceiptPreviewDialog;
