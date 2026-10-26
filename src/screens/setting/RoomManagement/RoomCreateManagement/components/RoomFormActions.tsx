import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import SubmitButton from 'src/components/submit-button';
import { Box, Button, DialogActions } from '@mui/material';

import { RoomPreviewSection } from './RoomPreviewSection';

import type { RoomFormValues } from '../types/room-form';

interface Props {
  values: RoomFormValues;
  saving: boolean;
  submitDisabled: boolean;
  onClose: () => void;
}

export function RoomFormActions({ values, saving, submitDisabled, onClose }: Props) {
  return (
    <DialogActions
      disableSpacing
      sx={{ p: 2, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap', gap: 1 }}
    >
      <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: 'auto' } }}>
        <RoomPreviewSection values={values} disabled={saving} />
      </Box>
      <Button
        type="button"
        size="small"
        variant="outlined"
        disabled={saving}
        startIcon={<Iconify icon={GlobalIcons.cancel} />}
        onClick={onClose}
      >
        Cancel
      </Button>
      <SubmitButton loading={saving} disabled={submitDisabled} />
    </DialogActions>
  );
}
