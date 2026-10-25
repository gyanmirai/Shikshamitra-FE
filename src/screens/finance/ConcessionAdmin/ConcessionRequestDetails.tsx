import type { ReactNode } from 'react';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { fDateTime } from 'src/utils/format-time';
import { formatNumber } from 'src/utils/formate_number';
import CancelButton from 'src/components/cancel-button';
import { Stack, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';

import type { IConcessionRequestItem } from './type';

export default function ConcessionRequestDetails({
  open,
  onClose,
  item,
  status,
  documents,
}: {
  open: boolean;
  onClose: () => void;
  item: IConcessionRequestItem;
  status: ReactNode;
  documents: ReactNode;
}) {
  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={item.concessionTypeName}
      titleInfo="Review the saved concession amounts, supporting documents and recorded activity."
      hasForm={false}
      guardUnsavedChanges={false}
      maxWidth="md"
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <DetailSection
            title="Request Information"
            icon={GlobalIcons.receiptIcon}
            helpText="Recorded request status, amounts and remarks. Approval and reversal totals are supplied by the server."
          >
            <DetailGrid>
              <DetailField label="Status" value={status} />
              <DetailField
                label="Requested on"
                value={fDateTime(item.createdAt, 'DD MMM YYYY, h:mm:ss a')}
              />
              <DetailField
                label="Requested amount"
                value={formatNumber(item.totalRequestedAmount ?? item.totalAmount, 'INR')}
              />
              <DetailField
                label="Approved amount"
                value={formatNumber(item.totalApprovedAmount, 'INR')}
              />
              <DetailField
                label="Reversed amount"
                value={formatNumber(item.totalReversedAmount, 'INR')}
              />
              <DetailField
                label="Net approved amount"
                value={formatNumber(item.netApprovedAmount, 'INR')}
              />
              {item.message && <DetailField fullWidth label="Remark" value={item.message} />}
            </DetailGrid>
          </DetailSection>
          <DetailSection
            title="Supporting Documents"
            icon={GlobalIcons.doc}
            helpText="Required evidence and uploaded documents for this request. Preview access follows your document permissions."
          >
            {documents}
          </DetailSection>
          {!!item.refundRequests?.length && (
            <DetailSection
              title="Linked Refund Requests"
              icon={GlobalIcons.retrunIcon}
              helpText="Refund requests created from the paid part of this concession. Each refund has a separate review and payout workflow."
            >
              <Stack spacing={1}>
                {item.refundRequests.map((refund) => (
                  <Stack
                    key={refund.refundRequestId}
                    direction="row"
                    gap={1}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                      {refund.voucherNumber} · {formatNumber(refund.amount, 'INR')}
                    </Typography>
                    <Label color={refund.status === 'Processed' ? 'success' : 'info'}>
                      {refund.status}
                    </Label>
                  </Stack>
                ))}
              </Stack>
            </DetailSection>
          )}
          {!!item.timeline?.length && (
            <DetailSection
              title="Activity"
              icon={GlobalIcons.history}
              helpText="Recorded creation, submission, decision and reversal events, shown in the local time zone."
            >
              <Stack spacing={1.5}>
                {item.timeline.map((event, index) => (
                  <Stack key={`${event.action}-${event.occurredAt}-${index}`} spacing={0.5}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      gap={0.5}
                    >
                      <Typography
                        variant="body2"
                        sx={{ textTransform: 'capitalize', overflowWrap: 'anywhere' }}
                      >
                        {event.action}
                        {event.amount ? ` · ${formatNumber(event.amount, 'INR')}` : ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {fDateTime(event.occurredAt, 'DD MMM YYYY, h:mm:ss a')}
                      </Typography>
                    </Stack>
                    {event.reason && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ overflowWrap: 'anywhere' }}
                      >
                        {event.reason}
                      </Typography>
                    )}
                  </Stack>
                ))}
              </Stack>
            </DetailSection>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <CancelButton buttonText="Close" onClick={onClose} />
      </DialogActions>
    </CustomDialog>
  );
}
