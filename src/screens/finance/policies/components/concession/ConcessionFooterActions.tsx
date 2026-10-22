'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button } from '@mui/material';

interface ConcessionFooterActionsProps {
  isSaving: boolean;
  onCancel: () => void;
  isEditing?: boolean;
  disabled?: boolean;
}

export default function ConcessionFooterActions({
  isSaving,
  onCancel,
  isEditing = false,
  disabled = false,
}: ConcessionFooterActionsProps) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.75,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        flexShrink: 0,
      }}
    >
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={onCancel}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          loading={isSaving}
          type="submit"
          size="small"
          disabled={isSaving || disabled}
          startIcon={
            <Iconify icon={isEditing ? GlobalIcons.edit : GlobalIcons.submit} width={18} />
          }
        >
          Submit
        </Button>
      </Stack>
    </Box>
  );
}
