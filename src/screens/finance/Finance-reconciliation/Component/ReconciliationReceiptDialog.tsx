'use client';

import type { DialogProps } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Stack, Button, Typography, DialogActions, CircularProgress } from '@mui/material';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import PdfPreview from 'src/components/preview-document/pdf-preview';

interface ReconciliationReceiptData {
  id: string;
  receiptNumber: string;
  finalReceiptNumber?: string | null;
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
  if (!open) return null;

  const pdfActionsDisabled = !receiptData || isLoading || !receiptBlobUrl;

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title="Receipt Details"
      titleInfo="View or download the receipt for this payment record."
      maxWidth="md"
      hasForm={false}
      guardUnsavedChanges={false}
      {...props}
    >
      <DialogScrollContent>
        {!receiptData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress aria-label="Loading receipt details" />
          </Box>
        ) : (
          <Stack spacing={2}>
            <DetailSection
              title="Receipt Information"
              icon={GlobalIcons.receiptIcon}
              helpText="The receipt number, date and student details recorded for this payment."
            >
              <DetailGrid>
                <DetailField
                  label="Receipt number"
                  value={receiptData.finalReceiptNumber || receiptData.receiptNumber}
                />
                <DetailField label="Receipt date" value={receiptData.receiptDate} />
                <DetailField label="Student name" value={receiptData.studentName} />
                <DetailField label="GR number" value={String(receiptData.grNumber)} />
                <DetailField label="Roll number" value={String(receiptData.rollNumber)} />
                <DetailField label="Class" value={receiptData.class} />
                <DetailField label="Division" value={receiptData.division} />
                <DetailField label="Board" value={receiptData.board} />
                <DetailField label="Medium" value={receiptData.medium} />
              </DetailGrid>
            </DetailSection>

            <DetailSection
              title="Payment Details"
              icon={GlobalIcons.paymentSummary}
              helpText="The recorded payment method, receipt amount in INR and verification status."
            >
              <DetailGrid>
                <DetailField label="Payment method" value={receiptData.paymentMethodLabel} />
                <DetailField label="Amount" value={formatNumber(receiptData.amount, 'INR')} />
                <DetailField label="Status" value={receiptData.statusLabel} />
              </DetailGrid>
            </DetailSection>

            {receiptData.remarks && (
              <DetailSection
                title="Remarks"
                icon={GlobalIcons.notebook}
                helpText="Remarks recorded for this payment verification."
              >
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                >
                  {receiptData.remarks}
                </Typography>
              </DetailSection>
            )}

            <DetailSection
              title="Receipt PDF"
              icon={GlobalIcons.pdf}
              helpText="Preview the receipt document. Use the footer actions to open or download it."
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={40} aria-label="Loading receipt PDF" />
                </Box>
              ) : receiptBlobUrl ? (
                <PdfPreview url={receiptBlobUrl} title="Receipt" showPageText={false} />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  PDF preview not available
                </Typography>
              )}
            </DetailSection>
          </Stack>
        )}
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)', flexWrap: 'wrap', rowGap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          disabled={pdfActionsDisabled || !onOpenInNewTab}
          startIcon={<Iconify icon="mdi:open-in-new" width={18} />}
          onClick={onOpenInNewTab}
        >
          Open in new tab
        </Button>
        <Button
          variant="outlined"
          size="small"
          disabled={pdfActionsDisabled || !onDownload}
          startIcon={<Iconify icon={GlobalIcons.download} width={18} />}
          onClick={onDownload}
        >
          Download
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default ReconciliationReceiptDialog;
