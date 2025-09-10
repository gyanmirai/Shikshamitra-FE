import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';

// ----------------------------------------------------------------------

type Props = {
  handleProps?: any;
  totalTasks?: number;
  columnName: string;
};

export function HeaderToolBar({ columnName, totalTasks, handleProps }: Props) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Label
        sx={{
          borderRadius: '50%',
          borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.24),
        }}
      >
        {totalTasks}
      </Label>

      <Typography variant="subtitle1">{columnName}</Typography>

      <IconButton size="small" {...handleProps}>
        <Iconify icon="nimbus:drag-dots" />
      </IconButton>
    </Stack>
  );
}
