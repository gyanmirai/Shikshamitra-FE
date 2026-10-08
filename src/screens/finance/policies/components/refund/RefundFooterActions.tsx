'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button } from '@mui/material';

export default function RefundFooterActions({
  isSaving,
  disabled = false,
  onCancel,
}: {
  isSaving: boolean;
  disabled?: boolean;
  onCancel: () => void;
}) {
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
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
          size="small"
          disabled={isSaving}
          onClick={onCancel}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          type="submit"
          loading={isSaving}
          disabled={isSaving || disabled}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Submit
        </Button>
      </Stack>
    </Box>
  );
}
