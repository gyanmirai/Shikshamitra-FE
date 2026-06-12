'use client';

import type { ChargeReceiptDetail } from 'src/redux/feeCollection/feeCollection';

import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import {
  Box,
  Card,
  Chip,
  Table,
  Button,
  TableRow,
  Skeleton,
  TableBody,
  TableCell,
  TableHead,
  Typography,
} from '@mui/material';

interface ChargeReceiptDisplayProps {
  receipt: ChargeReceiptDetail | undefined;
  isLoading: boolean;
  blobUrl: string | null;
  onOpenInNewTab: () => void;
  onDownload: () => void;
}

function ChargeReceiptDisplay({
  receipt,
  isLoading,
  blobUrl,
  onOpenInNewTab,
  onDownload,
}: ChargeReceiptDisplayProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton height={120} />
        <Skeleton height={200} />
        <Skeleton height={150} />
      </Box>
    );
  }

  if (!receipt) {
    return (
      <Typography variant="body2" color="text.secondary">
        Charge receipt data is not available
      </Typography>
    );
  }

  const { auditSummary } = receipt;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Charge Receipt Header Card */}
      <Card
        sx={{
          p: 2,
          bgcolor: alpha('#FF9C3B', 0.08),
          borderLeft: `4px solid #FF9C3B`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Iconify icon="mdi:file-document-check" width={22} sx={{ color: 'warning.main' }} />
            <Typography variant="subtitle2" fontWeight={700}>
              Charge Receipt
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Receipt #{receipt.receiptNumber}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Collected at: {new Date(receipt.collectedAt).toLocaleString('en-IN')}
          </Typography>
        </Box>
        <Box textAlign="right">
          <Typography variant="h6" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
            ₹{formatNumber(receipt.totalAmount)}
          </Typography>
          <Chip label="Charge" size="small" color="warning" variant="soft" sx={{ mt: 0.5 }} />
        </Box>
      </Card>

      {/* Paid Charges Table */}
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          fontWeight={700}
          mb={1}
          display="block"
        >
          Paid Charges
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha('#000', 0.04) }}>
              <TableCell>Charge Name</TableCell>
              <TableCell align="right">Amount Paid</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(receipt.paidCharges ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No charges paid
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              receipt.paidCharges.map((charge) => (
                <TableRow key={charge.chargeId}>
                  <TableCell>{charge.chargeName}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    ₹{formatNumber(charge.amountPaid)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Audit Summary */}
      {auditSummary && (
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            fontWeight={700}
            mb={1}
            display="block"
          >
            Transaction Summary
          </Typography>
          <Card sx={{ p: 1.5, bgcolor: alpha('#000', 0.02) }}>
            <Typography variant="body2" fontWeight={600} mb={1}>
              {auditSummary.headline}
            </Typography>
            {(auditSummary.changedFields ?? []).length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  Changes Made:
                </Typography>
                {auditSummary.changedFields.map((field, idx) => (
                  <Typography key={idx} variant="caption" color="text.secondary" display="block">
                    • {field.field}: {field.oldValue} → {field.newValue}
                  </Typography>
                ))}
              </Box>
            )}
          </Card>
        </Box>
      )}

      {/* PDF Viewer */}
      {blobUrl && (
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            fontWeight={700}
            mb={1}
            display="block"
          >
            PDF Preview
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: 400,
              border: `1px solid ${alpha('#000', 0.1)}`,
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <iframe
              title="Charge Receipt PDF"
              src={blobUrl}
              style={{ border: 'none', width: '100%', height: '100%' }}
            />
          </Box>
          <Box display="flex" gap={1} mt={1.5}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="solar:open-in-new-window-bold" width={16} />}
              onClick={onOpenInNewTab}
            >
              Open in New Tab
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="solar:download-minimalistic-bold" width={16} />}
              onClick={onDownload}
            >
              Download PDF
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default ChargeReceiptDisplay;
