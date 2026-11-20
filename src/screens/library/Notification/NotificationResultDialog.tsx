import type { IColumn } from 'src/components/customizabaleTable/types';
import type { NotificationSendResult } from 'src/redux/library/notification-types';

import { fDate } from 'src/utils/format-time';
import CustomizableTable from 'src/components/customizabaleTable';
import { Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { NotificationStatus } from './notification-display';

export function NotificationResultDialog({
  result,
  onClose,
}: {
  result: NotificationSendResult;
  onClose: () => void;
}) {
  const columns: IColumn[] = [
    { id: 'recipientName', label: 'Recipient', rowHeader: true },
    { id: 'channel', label: 'Channel' },
    { id: 'status', label: 'Outcome', render: (value) => <NotificationStatus status={value} /> },
    { id: 'errorMessage', label: 'Delivery information' },
  ];
  return (
    <CustomDialog
      open
      maxWidth="md"
      hasForm={false}
      guardUnsavedChanges={false}
      handleClose={onClose}
      title="Notification Outcomes"
      titleInfo="Counts describe delivery records, which may differ from the number of selected members. Queued emails are still waiting for delivery processing."
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          {result.runDate && (
            <Typography variant="body2">
              Reminder date: {fDate(result.runDate.slice(0, 10))}
            </Typography>
          )}
          <Typography variant="body2" role="status">
            Attempted: {result.attempted} · Queued: {result.queued} · Sent: {result.sent} · Skipped:{' '}
            {result.skipped} · Failed: {result.failed}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sent records reflect the channel outcome. Email acceptance does not prove that a person
            read it. Duplicate suppression can produce no new delivery records.
          </Typography>
          <CustomizableTable
            tableId="library-notification-results"
            data={result.items}
            columns={columns.map((column) => ({ ...column, isSort: false, isFilter: false }))}
            isSearch={false}
            isFilter={false}
            showExport={false}
            noDataText="No new delivery records were produced. Review eligibility and existing delivery history."
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button size="small" variant="outlined" color="inherit" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
