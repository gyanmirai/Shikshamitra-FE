import { Stack, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';

interface AutoApplyButtonProps {
  disabled?: boolean;
  onAutoApply: () => void;
  onClear: () => void;
}

const AutoApplyButton = ({ disabled, onAutoApply, onClear }: AutoApplyButtonProps) => (
  <Stack direction="row" spacing={1} justifyContent="flex-end">
    <Button
      size="small"
      variant="outlined"
      color="inherit"
      disabled={disabled}
      startIcon={<Iconify icon="mdi:eraser-variant" />}
      onClick={onClear}
    >
      Clear
    </Button>
    <Button
      size="small"
      variant="soft"
      color="info"
      disabled={disabled}
      startIcon={<Iconify icon="mdi:auto-fix" />}
      onClick={onAutoApply}
    >
      Auto Apply Adjustment
    </Button>
  </Stack>
);

export default AutoApplyButton;
