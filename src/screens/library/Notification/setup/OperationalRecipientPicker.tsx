import { useState } from 'react';
import { Alert, Stack } from '@mui/material';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useLazySearchLibraryOperationalRecipientsQuery } from 'src/redux/library/notification-recipient-api';

export type SavedOperationalRecipient = {
  userId: string;
  userName?: string | null;
  displayName?: string | null;
  isEligible?: boolean;
  unavailableReason?: string | null;
};
export function OperationalRecipientPicker({
  ids,
  saved,
  disabled,
  onChange,
}: {
  ids: string[];
  saved: SavedOperationalRecipient[];
  disabled: boolean;
  onChange: (ids: string[]) => void;
}) {
  const [search] = useLazySearchLibraryOperationalRecipientsQuery();
  const [known, setKnown] = useState<SavedOperationalRecipient[]>([]);
  const selected = ids.map(
    (id) => [...saved, ...known].find((item) => item.userId === id) || { userId: id }
  );
  return (
    <Stack spacing={1}>
      <PaginatedSearchSelect<SavedOperationalRecipient, true>
        multiple
        label="Operational recipients"
        value={selected}
        disabled={disabled}
        fullWidth
        size="small"
        minChars={2}
        debounceMs={350}
        fetchOptions={async (filter) =>
          disabled || filter.trim().length < 2
            ? { data: [], hasMore: false }
            : { data: await search(filter).unwrap(), hasMore: false }
        }
        filterOptions={(options) => options}
        isOptionEqualToValue={(option, value) => option.userId === value.userId}
        getOptionKey={(option) => option.userId}
        getOptionLabel={(option) =>
          option.displayName || option.userName || `Account details unavailable (${option.userId})`
        }
        onChange={(_, values) => {
          setKnown(values);
          onChange(values.map((value) => value.userId));
        }}
        helperText="Search at least two characters. Up to 50 eligible accounts are shown; refine the search if needed. Only selected accounts receive operational alerts."
      />
      {selected.some(
        (item) => item.isEligible === false || (!item.displayName && !item.userName)
      ) && (
        <Alert severity="warning">
          Some configured accounts are unavailable or no longer eligible. Review them before
          changing recipients. Other setup changes preserve the saved IDs.
        </Alert>
      )}
    </Stack>
  );
}
