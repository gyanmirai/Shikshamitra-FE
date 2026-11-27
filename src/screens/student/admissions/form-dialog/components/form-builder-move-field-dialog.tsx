import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import type { getFieldMoveDestinations } from '../form-builder-field-move';

type Props = {
  name: string;
  address: boolean;
  destinations: ReturnType<typeof getFieldMoveDestinations>;
  onClose: () => void;
  onMove: (sectionId: string) => string | undefined;
};

export function FormBuilderMoveFieldDialog({
  name,
  address,
  destinations,
  onClose,
  onMove,
}: Props) {
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');
  const enabled = destinations.some((option) => !option.reason);
  return (
    <ConfirmDialog
      open
      icon={null}
      title={address ? 'Move address fields' : 'Move field'}
      onClose={onClose}
      content={
        <Stack spacing={1.5}>
          <Typography variant="body2">
            {address ? `Move ${name} together to another section.` : name}
          </Typography>
          <CustomSelect
            fullWidth
            size="small"
            label="Destination section"
            options={destinations}
            groupKey={destinations.some((option) => option.group) ? 'group' : undefined}
            disabledValues={destinations
              .filter((option) => option.reason)
              .map((option) => option.value)}
            disabledReasonKey="reason"
            disabled={!destinations.length}
            value={destination}
            error={Boolean(error)}
            helperText={
              error || (!enabled ? 'There are no eligible destination sections.' : undefined)
            }
            onChange={(value) => {
              setDestination(String(value));
              setError('');
            }}
          />
        </Stack>
      }
      action={
        <Button
          type="button"
          variant="contained"
          startIcon={<Iconify icon="mdi:transfer" />}
          disabled={!enabled || !destination}
          onClick={() => setError(onMove(destination) ?? '')}
        >
          {address ? 'Move fields' : 'Move field'}
        </Button>
      }
    />
  );
}
