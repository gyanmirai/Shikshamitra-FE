import { Iconify } from 'src/components/iconify';
import { Box, SpeedDial, SpeedDialIcon, SpeedDialAction } from '@mui/material';

// ----------------------------------------------------------------------

export default function QuickActions() {
  const actions = [
    { icon: <Iconify icon="material-symbols:add-home-rounded" />, name: 'Create Class' },
    { icon: <Iconify icon="material-symbols:person-add-rounded" />, name: 'Assign Teacher' },
    { icon: <Iconify icon="material-symbols:school-rounded" />, name: 'Promote Students' },
    { icon: <Iconify icon="material-symbols:merge-type" />, name: 'Merge Division' },
    { icon: <Iconify icon="material-symbols:download-rounded" />, name: 'Export CSV' },
  ];

  return (
    <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1200 }}>
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ '& .MuiFab-primary': { width: 56, height: 56 } }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} />
        ))}
      </SpeedDial>
    </Box>
  );
}
