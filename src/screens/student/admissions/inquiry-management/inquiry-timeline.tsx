import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { Alert, Stack, Skeleton, Typography } from '@mui/material';
import { useGetAdmissionInquiryTimelineQuery } from 'src/redux/student/admissions/admission-inquiries-api';

const iconForActivity = (activityType: string) => {
  if (activityType.includes('Communication')) return 'mdi:message-text-outline';
  if (activityType.includes('FollowUp')) return 'mdi:calendar-clock-outline';
  if (activityType.includes('Contact')) return 'mdi:phone-outline';
  if (activityType.includes('Assigned')) return 'mdi:account-arrow-right-outline';
  if (activityType.includes('Qualification')) return 'mdi:check-decagram-outline';
  return 'mdi:history';
};

export function InquiryTimeline({ inquiryId }: { inquiryId: string }) {
  const query = useGetAdmissionInquiryTimelineQuery(inquiryId);
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1">Timeline and communications</Typography>
      {query.isLoading && <Skeleton height={96} />}
      {query.isError && <Alert severity="error">Timeline could not be loaded.</Alert>}
      {query.data?.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No activity has been recorded yet.
        </Typography>
      )}
      {query.data?.map((item) => (
        <Stack key={item.id} direction="row" spacing={1.25} alignItems="flex-start">
          <Iconify
            icon={iconForActivity(item.activityType)}
            sx={{ mt: 0.25, color: 'text.secondary' }}
          />
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="body2">{item.description}</Typography>
            <Typography variant="caption" color="text.secondary">
              {fDateTime(item.occurredAt)}
            </Typography>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
