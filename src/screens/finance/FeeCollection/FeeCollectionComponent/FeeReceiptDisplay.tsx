'use client';

import type { FeeReceiptDetail } from 'src/redux/feeCollection/feeCollection';

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

interface FeeReceiptDisplayProps {
  receipt: FeeReceiptDetail | undefined;
  isLoading: boolean;
  blobUrl: string | null;
  onOpenInNewTab: () => void;
  onDownload: () => void;
}

function FeeReceiptDisplay({
  receipt,
  isLoading,
  blobUrl,
  onOpenInNewTab,
  onDownload,
}: FeeReceiptDisplayProps) {
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
        Fee receipt data is not available
      </Typography>
    );
  }

  const { auditSummary } = receipt;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Fee Receipt Header Card */}
      <Card
        sx={{
          p: 2,
          bgcolor: alpha('#2FC966', 0.08),
          borderLeft: `4px solid #2FC966`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Iconify icon="mdi:receipt-text-check" width={22} sx={{ color: 'success.main' }} />
            <Typography variant="subtitle2" fontWeight={700}>
              Fee Receipt
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
          <Chip label="Fee" size="small" color="success" variant="soft" sx={{ mt: 0.5 }} />
        </Box>
      </Card>

      {/* Paid Fee Heads Table */}
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          fontWeight={700}
          mb={1}
          display="block"
        >
          Paid Fee Heads
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha('#000', 0.04) }}>
              <TableCell>Fee Head</TableCell>
              <TableCell align="right">Amount Paid</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(receipt.paidFeeHeads ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No fee heads paid
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              receipt.paidFeeHeads.map((feeHead) => (
                <TableRow key={feeHead.feeHeadId}>
                  <TableCell>{feeHead.feeHeadName}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    ₹{formatNumber(feeHead.amountPaid)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Allocation Details Table */}
      {(receipt.allocationDetails ?? []).length > 0 && (
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            fontWeight={700}
            mb={1}
            display="block"
          >
            Allocation Details
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha('#000', 0.04) }}>
                <TableCell>Fee Head</TableCell>
                <TableCell>Installment</TableCell>
                <TableCell align="right">Pending Before</TableCell>
                <TableCell align="right">Amount Paid</TableCell>
                <TableCell align="right">Pending After</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receipt?.allocationDetails?.map((detail, idx) => (
                <TableRow key={idx}>
                  <TableCell>{detail.feeHeadName}</TableCell>
                  <TableCell>{detail.installmentLabel}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    ₹{formatNumber(detail.pendingBefore)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 600,
                      color: 'success.main',
                    }}
                  >
                    ₹{formatNumber(detail.amountPaid)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    ₹{formatNumber(detail.pendingAfter)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

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
              title="Fee Receipt PDF"
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

export default FeeReceiptDisplay;
