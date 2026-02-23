'use client';

import { useState } from 'react';
import { Box, Grid } from '@mui/material';

import KPIOverview from './components/KPIOverview';
import AlertsPanel from './components/AlertsPanel';
import ManagementCharts from './components/ManagementCharts';
import ClassDetailDrawer from './components/ClassDetailDrawer';
import ClassOverviewTable from './components/ClassOverviewTable';

const AdminClassManagementDashboard = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const handleRowClick = (row: any) => {
    setSelectedClass(row);
    setOpenDrawer(true);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setSelectedClass(null);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <KPIOverview />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ManagementCharts />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <AlertsPanel />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ClassOverviewTable onRowClick={handleRowClick} />
        </Grid>
      </Grid>

      <ClassDetailDrawer
        open={openDrawer}
        onClose={handleCloseDrawer}
        className={selectedClass?.className}
      />

      {/* <QuickActions /> */}
    </Box>
  );
};

export default AdminClassManagementDashboard;
