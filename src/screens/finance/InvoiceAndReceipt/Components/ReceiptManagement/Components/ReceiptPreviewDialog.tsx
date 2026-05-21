import type { LabelColor } from 'src/components/label';

import React, { useCallback } from 'react';
import { Label } from 'src/components/label';
import PrintIcon from '@mui/icons-material/Print';
import CustomDialog from 'src/components/customDialog';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Chip, Divider, Tooltip, Skeleton, Typography, IconButton } from '@mui/material';
import {
  FeeReceiptKind,
  FEE_RECEIPT_BASE_URL,
  FEE_RECEIPT_KIND_COLORS,
  FEE_RECEIPT_KIND_LABELS,
  useGetFeeReceiptDetailQuery,
  FeeReceiptVerificationStatus,
} from 'src/redux/invoiceAndReceipt/feeReceiptApi';

interface ReceiptPreviewDialogProps {
  receiptId: string;
  onClose: () => void;
}

const ReceiptPreviewDialog: React.FC<ReceiptPreviewDialogProps> = ({ receiptId, onClose }) => {
  const { data: receipt, isLoading } = useGetFeeReceiptDetailQuery(receiptId);

  const pdfUrl = `${process.env.NEXT_PUBLIC_API_URL}/api${FEE_RECEIPT_BASE_URL}/${receiptId}/pdf`;

  const handleDownload = useCallback(() => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `receipt-${receipt?.receiptNumber ?? receiptId}.pdf`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [pdfUrl, receipt, receiptId]);

  const handlePrint = useCallback(() => {
    window.open(pdfUrl, '_blank');
  }, [pdfUrl]);

  const handleOpenInNew = useCallback(() => {
    window.open(pdfUrl, '_blank');
  }, [pdfUrl]);

  const kindColor = receipt
    ? (FEE_RECEIPT_KIND_COLORS[receipt.receiptKind] as LabelColor)
    : 'default';
  const kindLabel = receipt ? FEE_RECEIPT_KIND_LABELS[receipt.receiptKind] : '';

  const title = (
    <Box display="flex" alignItems="center" gap={1.5}>
      <Typography variant="h6" fontWeight={700}>
        Receipt Preview
      </Typography>
      {receipt && (
        <Label variant="soft" color={kindColor}>
          {kindLabel}
        </Label>
      )}
      {receipt?.verificationStatus === FeeReceiptVerificationStatus.PendingVerification && (
        <Chip
          label="Pending Verification"
          size="small"
          color="warning"
          sx={{ height: 20, fontSize: 11 }}
        />
      )}
      {receipt?.verificationStatus === FeeReceiptVerificationStatus.Verified && (
        <Chip label="Verified" size="small" color="success" sx={{ height: 20, fontSize: 11 }} />
      )}
      {receipt?.verificationStatus === FeeReceiptVerificationStatus.Rejected && (
        <Chip label="Rejected" size="small" color="error" sx={{ height: 20, fontSize: 11 }} />
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
        <Box display="flex" flexDirection="column" gap={2} p={1}>
          {/* ── Action buttons ────────────────────────────────────────────── */}
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Tooltip title="Download PDF">
              <IconButton onClick={handleDownload} size="small" color="primary">
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton onClick={handlePrint} size="small">
                <PrintIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open in new tab">
              <IconButton onClick={handleOpenInNew} size="small">
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Divider />

          {/* ── Receipt details ───────────────────────────────────────────── */}
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.5}>
            <DetailRow label="Receipt Number" value={receipt.receiptNumber} />
            <DetailRow
              label="Receipt Date"
              value={new Date(receipt.receiptDate).toLocaleDateString('en-IN')}
            />
            <DetailRow label="Student" value={receipt.studentName} />
            <DetailRow label="GR No." value={receipt.grNo?.toString() ?? '—'} />
            <DetailRow
              label="Class"
              value={[receipt.className, receipt.division].filter(Boolean).join(' / ') || '—'}
            />
            <DetailRow label="Roll No." value={receipt.rollNo ?? '—'} />
            <DetailRow
              label="Amount Paid"
              value={`₹ ${receipt.totalPaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              bold
            />
            <DetailRow label="Academic Year" value={receipt.academicYearName ?? '—'} />
          </Box>

          {/* ── Provisional fee specific info ─────────────────────────────── */}
          {receipt.receiptKind === FeeReceiptKind.ProvisionalFee && (
            <>
              <Divider />
              <Box
                sx={{
                  bgcolor: 'warning.lighter',
                  borderRadius: 1,
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'warning.light',
                }}
              >
                <Typography variant="body2" color="warning.darker" fontWeight={600}>
                  Provisional Receipt — Subject to Realisation
                </Typography>
                <Typography variant="caption" color="warning.dark" display="block" mt={0.5}>
                  This is a kachi (provisional) receipt. A final receipt will be issued once the
                  payment instrument has been cleared by the bank.
                </Typography>
                {receipt.linkedFinalReceiptId ? (
                  <Typography
                    variant="caption"
                    color="success.dark"
                    display="block"
                    mt={0.5}
                    fontWeight={600}
                  >
                    Final Receipt Issued: {receipt.linkedFinalReceiptNumber}
                  </Typography>
                ) : (
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    Final receipt not yet issued.
                  </Typography>
                )}
              </Box>
            </>
          )}

          {/* ── ProvisionalCharge specific info ───────────────────────────── */}
          {receipt.receiptKind === FeeReceiptKind.ProvisionalCharge && (
            <>
              <Divider />
              <Box
                sx={{
                  bgcolor: 'info.lighter',
                  borderRadius: 1,
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'info.light',
                }}
              >
                <Typography variant="body2" color="info.darker" fontWeight={600}>
                  Charge Acknowledgement Receipt
                </Typography>
                <Typography variant="caption" color="info.dark" display="block" mt={0.5}>
                  This receipt covers charge payments only and is separate from any fee receipt
                  issued for the same visit.
                </Typography>
              </Box>
            </>
          )}

          {/* ── Sibling receipt ───────────────────────────────────────────── */}
          {receipt.siblingReceiptNumber && (
            <Box
              sx={{
                bgcolor: 'background.neutral',
                borderRadius: 1,
                p: 1,
                fontSize: 12,
                color: 'text.secondary',
              }}
            >
              Related receipt from same visit:{' '}
              <Typography component="span" variant="caption" fontWeight={700} color="text.primary">
                {receipt.siblingReceiptNumber}
              </Typography>
            </Box>
          )}

          {receipt.remarks && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Remarks: {receipt.remarks}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </CustomDialog>
  );
};

// ── Helper component ────────────────────────────────────────────────────────

const DetailRow: React.FC<{ label: string; value: string; bold?: boolean }> = ({
  label,
  value,
  bold,
}) => (
  <Box>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={bold ? 700 : 400}>
      {value}
    </Typography>
  </Box>
);

export default ReceiptPreviewDialog;
