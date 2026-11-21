import type { NotificationRecipient } from 'src/redux/library/notification-types';

import { Alert, Stack } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useLazySearchLibraryNotificationRecipientsQuery } from 'src/redux/library/notification-recipient-api';

export function NotificationRecipientPicker({
  value,
  disabled,
  error,
  onChange,
  onBlur,
}: {
  value: NotificationRecipient[];
  disabled: boolean;
  error?: string;
  onChange: (values: NotificationRecipient[]) => void;
  onBlur: () => void;
}) {
  const [search] = useLazySearchLibraryNotificationRecipientsQuery();
  return (
    <Stack spacing={1}>
      <ShakingTextField error={Boolean(error)}>
        <PaginatedSearchSelect<NotificationRecipient, true>
          multiple
          label="Library members"
          required
          size="small"
          fullWidth
          value={value}
          disabled={disabled}
          minChars={2}
          debounceMs={350}
          filterOptions={(options) => options}
          getOptionLabel={(item) =>
            [
              item.memberName,
              item.memberIdentifier,
              item.role === 0 ? 'Student' : 'Staff',
              item.eligibilityReason,
            ]
              .filter(Boolean)
              .join(' · ')
          }
          getOptionDisabled={(item) => !item.isEligibleForNotification}
          isOptionEqualToValue={(option, selected) => option.id === selected.id}
          getOptionKey={(option) => option.id}
          fetchOptions={async (query, page) => {
            if (disabled || query.trim().length < 2) return { data: [], hasMore: false };
            const response = await search({ search: query, page, pageSize: 20 }).unwrap();
            return { data: response.items, hasMore: page * 20 < response.totalCount };
          }}
          onChange={(_, selected) => onChange(selected)}
          onBlur={onBlur}
          error={Boolean(error)}
          helperText={
            error ||
            'Search at least two characters by name or printed member ID. Selected members remain selected across searches.'
          }
        />
      </ShakingTextField>
      {value.some((member) => !member.isActiveMembership && member.hasRecoverableObligation) && (
        <Alert severity="info">
          Some members have inactive membership and an outstanding obligation. Delivery still
          requires an eligible recovery event and record context; a general message may be skipped.
          Run eligible reminders for actual outstanding records.
        </Alert>
      )}
    </Stack>
  );
}
