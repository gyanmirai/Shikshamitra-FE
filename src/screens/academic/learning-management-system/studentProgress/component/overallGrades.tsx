'use client';

import { Grid } from '@mui/material';
import { AppCurrentDownload } from 'src/screens/hr/dashboard/app-current-download';

const OverallGrades = () => (
  <Grid container spacing={3}>
    <Grid size={{ xs: 12, md: 6 }}>
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
    </Grid>
  </Grid>
);

export default OverallGrades;
