'use client';

import Grid2 from '@mui/material/Unstable_Grid2';

import { AppCurrentDownload } from 'src/screens/hr/dashboard/app-current-download';

const OverallGrades = () => (
  <Grid2 container spacing={3}>
    <Grid2 xs={12} md={6}>
      <AppCurrentDownload
        title="Grade breakdown"
        chart={{
          series: [
            { label: 'Assignments', value: 12244 },
            { label: 'Participation', value: 53345 },
            { label: 'Quizzes', value: 44313 },
          ],
        }}
      />
    </Grid2>
  </Grid2>
);

export default OverallGrades;
