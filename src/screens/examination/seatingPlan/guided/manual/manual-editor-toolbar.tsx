import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

interface ManualEditorToolbarProps {
  assigned: number;
  total: number;
  canUndo: boolean;
  canRedo: boolean;
  isReadOnly: boolean;
  onAutoArrange: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

export function ManualEditorToolbar({
  assigned,
  total,
  canUndo,
  canRedo,
  isReadOnly,
  onAutoArrange,
  onUndo,
  onRedo,
  onClear,
}: ManualEditorToolbarProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'stretch', md: 'center' }}
      justifyContent="space-between"
      spacing={1}
      sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Stack spacing={0.25}>
        <Typography variant="subtitle1">Classroom seating editor</Typography>
        <Typography variant="body2" color="text.secondary" aria-live="polite">
          {assigned} of {total} students assigned
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="mdi:auto-fix" />}
          disabled={isReadOnly || total === 0}
          onClick={onAutoArrange}
          sx={{ minHeight: 44 }}
        >
          Auto-arrange all
        </Button>
        <Button
          variant="text"
          startIcon={<Iconify icon="mdi:undo" />}
          disabled={isReadOnly || !canUndo}
          onClick={onUndo}
          sx={{ minHeight: 44 }}
        >
          Undo
        </Button>
        <Button
          variant="text"
          startIcon={<Iconify icon="mdi:redo" />}
          disabled={isReadOnly || !canRedo}
          onClick={onRedo}
          sx={{ minHeight: 44 }}
        >
          Redo
        </Button>
        <Button
          variant="text"
          disabled={isReadOnly || assigned === 0}
          onClick={onClear}
          sx={{ minHeight: 44, color: 'error.dark' }}
        >
          Clear placements
        </Button>
      </Stack>
    </Stack>
  );
}
