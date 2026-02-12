import { Box, Grid } from '@mui/material';

import AdminLists from './lists';
import AdminCharts from './charts';
import Birthdays from './birthdays';
import AdminKPICards from './kpi-cards';
import HouseDistribution from './house-distribution';

const AdminDashboard = () => (
  <Box>
    <Grid container spacing={1}>
      {/* 1. Upgrade Top KPI Cards */}
      <Grid size={{ xs: 12 }}>
        <AdminKPICards />
      </Grid>

      {/* 2. Improve Enrollment & 4. Exam Status & 5. Participation */}
      <Grid size={{ xs: 12 }}>
        <AdminCharts />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Grid container spacing={1}>
          {/* 6. House Distribution */}
          <Grid size={{ xs: 12, md: 6 }}>
            <HouseDistribution />
          </Grid>
          {/* 7. Upgraded Birthdays */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Birthdays />
          </Grid>
        </Grid>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <AdminLists />
      </Grid>
    </Grid>
  </Box>
);

export default AdminDashboard;
