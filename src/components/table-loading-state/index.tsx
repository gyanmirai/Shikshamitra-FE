import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { TableLoadingIllustration } from 'src/assets/illustrations/table-loading-illustration';

export interface TableLoadingStateProps {
  label?: string;
  tableWidth?: number;
}

export function TableLoadingState({
  label = 'Loading records…',
  tableWidth,
}: TableLoadingStateProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        width: tableWidth || '100%',
        maxWidth: '100%',
        position: 'sticky',
        left: 0,
        height: '100%',
        minHeight: 160,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        p: 2,
      }}
    >
      <TableLoadingIllustration sx={{ maxWidth: { xs: 120, sm: 160 } }} />
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        {label}
      </Typography>
    </Box>
  );
}
