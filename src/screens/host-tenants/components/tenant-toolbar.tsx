import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';

type TenantToolbarProps = {
  status: string;
  onStatusChange: (status: string) => void;
  canView: boolean;
  canCreate: boolean;
  onCreate: () => void;
};

export default function TenantToolbar({
  status,
  onStatusChange,
  canView,
  canCreate,
  onCreate,
}: TenantToolbarProps) {
  return (
    <Paper
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1,
        px: 1,
        py: 1,
        flexShrink: 0,
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
      }}
    >
      {canView && (
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          sx={{ width: { xs: 1, sm: 200 } }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      )}
      <Button
        variant="contained"
        disabled={!canCreate}
        onClick={onCreate}
        startIcon={<Iconify icon="mdi:plus" />}
        sx={{ width: { xs: 1, sm: 'auto' }, ml: { sm: 'auto' } }}
      >
        Add tenant
      </Button>
    </Paper>
  );
}
