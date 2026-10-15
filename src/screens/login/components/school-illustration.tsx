import Box from '@mui/material/Box';

import { SchoolBuilding } from './school-building';
import { CampusGardens, CampusLandscape } from './campus-landscape';

export function SchoolIllustration() {
  return (
    <Box
      component="svg"
      viewBox="8 20 550 310"
      aria-hidden="true"
      focusable="false"
      sx={{ width: 1, height: 'auto', display: 'block' }}
    >
      <CampusLandscape />
      <SchoolBuilding />
      <CampusGardens />
    </Box>
  );
}
