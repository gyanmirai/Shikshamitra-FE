'use client';

import type { DialogProps } from '@mui/material';

import React from 'react';
import { Close } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { InfoItem } from 'src/components/info-item';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Card,
  Grid,
  Button,
  Dialog,
  Divider,
  Typography,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  CircularProgress,
} from '@mui/material';

interface ReconciliationReceiptData {
  id: string;
  receiptNumber: string;
  studentName: string;
  studentId: string;
  amount: number;
  paymentMethod: string;
  paymentMethodLabel: string;
  receiptDate: string;
  grNumber: number;
  rollNumber: number;
  class: string;
  division: string;
  board: string;
  medium: string;
  status: number;
  statusLabel: string;
  remarks?: string;
}

interface ReconciliationReceiptDialogProps extends Omit<DialogProps, 'open' | 'onClose'> {
  open: boolean;
  onClose: () => void;
  receiptData: ReconciliationReceiptData | null;
  receiptBlobUrl: string | null;
  isLoading?: boolean;
  onDownload?: () => void;
  onOpenInNewTab?: () => void;
}

// Helper component for receipt info row

const ReconciliationReceiptDialog = ({
  open,
  onClose,
  receiptData,
  receiptBlobUrl,
  isLoading = false,
  onDownload,
  onOpenInNewTab,
  ...props
}: ReconciliationReceiptDialogProps) => {
  const theme = useTheme();

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth {...props}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={700}>
              Receipt Details
            </Typography>
            <CustomTooltip title="View or download the receipt for this payment record.">
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              aria-label="close"
              onClick={() => onClose()}
              sx={{
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  transform: 'scale(1.1)',
                },
              }}
            >
              <Close sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <Divider />
      <Scrollbar sx={{ maxHeight: 'calc(100dvh - 260px)' }}>
        <DialogContent sx={{ p: 2 }}>
          {!receiptData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Receipt Information Card */}
              <Card sx={{ p: 3, boxShadow: 'var(--shadows-10)', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3, color: 'text.primary' }}>
                  Receipt Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      icon={<Iconify icon="mdi:receipt" />}
                      label="Receipt Number"
                      value={receiptData.receiptNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      icon={<Iconify icon="mdi:calendar" />}
                      label="Receipt Date"
                      value={receiptData.receiptDate}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      icon={<Iconify icon="mdi:account" />}
                      label="Student Name"
                      value={receiptData.studentName}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      icon={<Iconify icon="mdi:identifier" />}
                      label="GR Number"
                      value={String(receiptData.grNumber)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      icon={<Iconify icon="mdi:numeric" />}
                      label="Roll Number"
                      value={String(receiptData.rollNumber)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      icon={<Iconify icon="mdi:book" />}
                      label="Class"
                      value={receiptData.class}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      icon={<Iconify icon="mdi:group" />}
                      label="Division"
                      value={receiptData.division}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      icon={<Iconify icon="mdi:school" />}
                      label="Board"
                      value={receiptData.board}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      icon={<Iconify icon="mdi:language" />}
                      label="Medium"
                      value={receiptData.medium}
                    />
                  </Grid>
                </Grid>
              </Card>

              {/* Payment Details Card */}
              <Card sx={{ p: 3, boxShadow: 'var(--shadows-10)', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3, color: 'text.primary' }}>
                  Payment Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      icon={<Iconify icon="mdi:credit-card" />}
                      label="Payment Method"
                      value={receiptData.paymentMethodLabel}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      icon={<Iconify icon="mdi:cash" />}
                      label="Amount"
                      value={`₹${receiptData.amount.toLocaleString('en-IN')}`}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      icon={<Iconify icon="mdi:check-circle" />}
                      label="Status"
                      value={receiptData.statusLabel}
                    />
                  </Grid>
                </Grid>
              </Card>

              {/* Remarks (if any) */}
              {receiptData.remarks && (
                <Card sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.08) }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>
                    Remarks
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {receiptData.remarks}
                  </Typography>
                </Card>
              )}

              {/* Receipt PDF Preview */}
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Receipt PDF
                </Typography>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={40} />
                  </Box>
                ) : receiptBlobUrl ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box
                      component="iframe"
                      src={receiptBlobUrl}
                      sx={{
                        width: '100%',
                        height: 400,
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        borderRadius: 1,
                      }}
                    />
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon="mdi:open-in-new" />}
                        onClick={onOpenInNewTab}
                      >
                        Open in New Tab
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon="mdi:download" />}
                        onClick={onDownload}
                      >
                        Download
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    PDF preview not available
                  </Typography>
                )}
              </Card>
            </Box>
          )}
        </DialogContent>
      </Scrollbar>

      <DialogActions sx={{ borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.45)}` }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReconciliationReceiptDialog;
