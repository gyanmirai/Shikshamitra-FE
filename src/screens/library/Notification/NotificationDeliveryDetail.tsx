import type { LibraryNotificationHistory } from 'src/redux/library/library-adapters';

import { GlobalIcons } from 'src/utils/icons';
import { fDateTime } from 'src/utils/format-time';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { notificationZone, NotificationStatus } from './notification-display';

export function NotificationDeliveryDetail({
  item,
  onClose,
}: {
  item: LibraryNotificationHistory;
  onClose: () => void;
}) {
  return (
    <CustomDialog
      open
      hasForm={false}
      maxWidth="sm"
      title="Notification Delivery"
      titleInfo="Delivery evidence is recorded separately from queue submission and recipient read state."
      guardUnsavedChanges={false}
      handleClose={onClose}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <Typography variant="caption">Times shown in {notificationZone()}</Typography>
          <FormSectionCard
            title="Delivery Evidence"
            icon={GlobalIcons.history}
            descriptionTooltip="Actual delivery attempts, recipient relationship and read receipt when supported."
          >
            <NotificationStatus status={item.status} />
            {[
              ['Event', item.eventName],
              ['Recipient', item.recipientName || 'Name unavailable'],
              ['Recipient kind', item.recipientKind || 'Not recorded'],
              ['Relationship', item.recipientRelationship || 'Not recorded'],
              ['Channel', item.channel],
              ['Attempts', item.attemptCount ?? 'Not recorded'],
              ['Created', fDateTime(item.creationTime)],
              ['Sent', fDateTime(item.sentAt) || 'Not sent'],
              ['Next attempt', fDateTime(item.nextAttemptAt) || 'Not scheduled'],
              ['Read', fDateTime(item.readAt) || 'Not recorded'],
              ['Delivery information', item.errorMessage || 'No error recorded'],
            ].map(([label, value]) => (
              <Stack key={label} spacing={0.25}>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {value}
                </Typography>
              </Stack>
            ))}
          </FormSectionCard>
          <FormSectionCard
            title="Message Content"
            icon={GlobalIcons.email}
            descriptionTooltip="The stored content for this recipient, after supported variables were rendered."
          >
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {item.subject}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {item.message}
            </Typography>
          </FormSectionCard>
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
