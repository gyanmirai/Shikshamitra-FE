import type { AcademicNotificationReview } from 'src/redux/academic-notifications/manual-types';

import { GlobalIcons } from 'src/utils/icons';
import { sanitizeHtml } from 'src/utils/sanitize-html';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Alert, Stack, Divider, Typography } from '@mui/material';
import { deliveryReason } from 'src/redux/academic-notifications/delivery-adapters';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';
import { notificationLabel, notificationChannelLabels } from 'src/redux/academic-notifications/response-adapters';

type ReviewDetails = Pick<AcademicNotificationReview, 'eligibleRecipientCount' | 'channels' | 'samples' | 'blockingIssues'>
  & Partial<Pick<AcademicNotificationReview, 'requiresApproval' | 'reviewToken'>>;

export function AcademicNotificationReviewDetails({ review, stale = false }: { review: ReviewDetails; stale?: boolean }) {
  const samples = review.samples.filter((sample) => sample.isSynthetic && sample.rendered.isSuccess);
  return (
    <>
      <FormSectionCard title={stale ? 'Previous Review' : 'Recipient Review'} icon={GlobalIcons.family}
        descriptionTooltip="Counts are calculated for the selected record and its saved notification rules.">
        <Typography variant="body2">{review.eligibleRecipientCount} eligible recipients</Typography>
        {review.requiresApproval && <Alert severity="info">This send requires staff approval.</Alert>}
        {review.channels.map((channel) => (
          <Stack key={channel.channel} spacing={0.5}>
            <Typography variant="subtitle2">{notificationChannelLabels[channel.channel]}</Typography>
            <Typography variant="body2">{channel.readyDeliveryCount} ready deliveries</Typography>
            {channel.exclusions.map(({ code, count }) => (
              <Typography color="text.secondary" variant="caption" key={code}>{deliveryReason(code)} · {count} excluded</Typography>
            ))}
          </Stack>
        ))}
        {review.blockingIssues.map((issue) => <Alert key={issue} severity="warning">{deliveryReason(issue)}</Alert>)}
        {review.reviewToken === null && <Alert severity="warning">There are no deliveries available to confirm.</Alert>}
      </FormSectionCard>
      {!!samples.length && (
        <FormSectionCard title="Message Samples" icon={GlobalIcons.documentIcon}
          descriptionTooltip="Sample values show the approved wording for each channel and recipient type.">
          {samples.map((sample, index) => (
            <Stack gap={0.5} key={sample.revisionId} sx={{ overflowWrap: 'anywhere' }}>
              {index > 0 && <Divider sx={{ mb: 0.5 }} />}
              <Typography color="text.secondary" variant="caption">
                {notificationChannelLabels[sample.channel]} · {notificationLabel(sample.recipientKind)} · {sample.languageCode} · Sample data
              </Typography>
              <Typography variant="subtitle2">{sample.rendered.subject}</Typography>
              {sample.channel === CommunicationChannelType.Email ? (
                <Box dangerouslySetInnerHTML={{ __html: sanitizeHtml(sample.rendered.body) }} />
              ) : (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{sample.rendered.body}</Typography>
              )}
            </Stack>
          ))}
        </FormSectionCard>
      )}
    </>
  );
}
