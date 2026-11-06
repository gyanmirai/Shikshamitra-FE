'use client';

import type { ParentRegistrationEmailHistory } from 'src/redux/student/admissions/admission-parent-registration-types';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { FormSectionCard } from 'src/components/form-section-card';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import {
  Box,
  Alert,
  Stack,
  Button,
  Drawer,
  Divider,
  Skeleton,
  IconButton,
  Typography,
} from '@mui/material';

const linkStatusLabels: Record<string, string> = {
  Invited: 'Awaiting parent',
  InProgress: 'In progress',
  ReadyForReview: 'Ready for review',
  Revoked: 'Revoked',
  TakenOver: 'Taken over',
  Applied: 'Completed',
  Closed: 'Closed',
  Expired: 'Expired',
};

const attemptStatusLabels: Record<string, string> = {
  Pending: 'Email queued',
  Sending: 'Sending email',
  PendingApproval: 'Awaiting approval',
  Unknown: 'Delivery unconfirmed',
  Cancelled: 'Email cancelled',
  Queued: 'Email queued',
  Sent: 'Email sent',
  Delivered: 'Delivered',
  Read: 'Read',
  Failed: 'Email failed',
  Bounced: 'Email bounced',
  Skipped: 'Email skipped',
};

export function ParentRegistrationEmailHistoryDrawer({
  open,
  onClose,
  history,
  isLoading,
  isError,
  onRetry,
}: {
  open: boolean;
  onClose: () => void;
  history?: ParentRegistrationEmailHistory[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': 'parent-registration-email-history-title',
          sx: {
            width: { xs: 1, sm: 560 },
            maxWidth: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1.5 }}>
        <Typography id="parent-registration-email-history-title" variant="h6">
          Email History
        </Typography>
        <InfoTooltipIcon
          label="Email history information"
          title="Recorded email attempts for parent registration links. Sent means the email sender accepted the message; inbox delivery is not confirmed."
        />
        <Box sx={{ flex: 1 }} />
        <IconButton aria-label="Close email history" onClick={onClose}>
          <Iconify icon={GlobalIcons.cancel} />
        </IconButton>
      </Stack>
      <Divider />
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ p: 2 }}>
          {isLoading ? (
            <Stack spacing={2} aria-label="Loading email history">
              <Skeleton height={104} variant="rounded" />
              <Skeleton height={164} variant="rounded" />
            </Stack>
          ) : isError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={onRetry}>
                  Retry
                </Button>
              }
            >
              Email history could not be loaded.
            </Alert>
          ) : !history?.length ? (
            <EmptyContent
              title="No email history yet"
              description="Send a registration email to see its status and attempts here."
            />
          ) : (
            <Stack spacing={2}>
              {history.map((item, index) => (
                <FormSectionCard
                  key={item.registrationId}
                  title={
                    index === 0
                      ? 'Latest Link'
                      : item.purpose === 'correction'
                        ? 'Correction Link'
                        : 'Previous Link'
                  }
                  icon={index === 0 ? GlobalIcons.email : GlobalIcons.history}
                  descriptionTooltip="Shows the saved recipient, parent-link status and recorded email attempts."
                  action={
                    <Label color={item.linkStatus === 'ReadyForReview' ? 'success' : 'default'}>
                      {linkStatusLabels[item.linkStatus] || item.linkStatus}
                    </Label>
                  }
                >
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="body2">
                        {item.recipientRelationshipLabel || item.recipientRelationship} ·{' '}
                        {item.recipientName}
                      </Typography>
                      <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                        {item.recipientEmail || 'Email unavailable'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Link expires {fDateTime(item.expiresAt)}
                      </Typography>
                      {item.lastSavedAt && (
                        <Typography variant="caption" color="text.secondary">
                          Parent last saved {fDateTime(item.lastSavedAt)}
                        </Typography>
                      )}
                      {item.handedInAt && (
                        <Typography variant="caption" color="text.secondary">
                          Sent to school {fDateTime(item.handedInAt)}
                        </Typography>
                      )}
                    </Box>
                    {item.notes && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Instructions for the parent
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                        >
                          {item.notes}
                        </Typography>
                      </Box>
                    )}
                    <Divider />
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Send History</Typography>
                      {item.attempts.map((attempt, attemptIndex) => (
                        <Stack
                          key={`${item.registrationId}-${attempt.attemptNumber}-${attemptIndex}`}
                          spacing={0.25}
                          sx={{ minWidth: 0 }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            flexWrap="wrap"
                            alignItems="center"
                          >
                            <Typography variant="body2">
                              {attemptStatusLabels[attempt.status] || attempt.status}
                            </Typography>
                            {attempt.attemptedAt && (
                              <Typography variant="caption" color="text.secondary">
                                {fDateTime(attempt.attemptedAt)}
                              </Typography>
                            )}
                          </Stack>
                          {attempt.destination && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ overflowWrap: 'anywhere' }}
                            >
                              To {attempt.destination}
                            </Typography>
                          )}
                          {attempt.status === 'Sent' && (
                            <Typography variant="caption" color="text.secondary">
                              Accepted by the email sender. Inbox delivery is not confirmed.
                            </Typography>
                          )}
                          {attempt.safeMessage && (
                            <Typography
                              variant="caption"
                              color={attempt.status === 'Failed' ? 'error' : 'text.secondary'}
                              role={attempt.status === 'Failed' ? 'alert' : undefined}
                            >
                              {attempt.safeMessage}
                            </Typography>
                          )}
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </FormSectionCard>
              ))}
            </Stack>
          )}
        </Box>
      </Scrollbar>
      <Divider />
      <Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
        >
          Close
        </Button>
      </Stack>
    </Drawer>
  );
}
