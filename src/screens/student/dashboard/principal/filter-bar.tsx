import { Box } from '@mui/material';
import ClassDivisionFilter from './class-division-filter';

const FilterBar = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mb: 2,
      p: 2,
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: (theme) => theme.customShadows?.z1 || 1,
    }}
  >
    <Box sx={{ display: 'flex', gap: 1 }}>
      <ClassDivisionFilter />
    </Box>
  </Box>
);

export default FilterBar;
