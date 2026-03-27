import React from 'react';
import { motion } from 'framer-motion';
import { Box, Grid } from '@mui/material';
import AllInfoCalendar from 'src/screens/mainDashboard/admin/Components/AllInfoCalendar';

import EmployeeProfileOverview from './profileDashboardComponent/ProfileOverview';
import ProfileDashboardAttendance from './profileDashboardComponent/ProfileDashboardAttendance';
import ProfileDashboardAttendanceTrend from './profileDashboardComponent/ProfileDashboardAttendanceTrend';

const enterCurve = [0.22, 1, 0.36, 1] as const;

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const slideUpItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: enterCurve } },
};

const EmployeeProfileDashboard = ({ editData }: { editData: any }) => (
  <Box sx={{ pb: 1 }}>
    <motion.div variants={staggerContainer} initial="hidden" animate="show">
      <Grid container spacing={1} sx={{ alignItems: 'stretch' }}>
        <Grid size={12}>
          <motion.div variants={slideUpItem}>
            <EmployeeProfileOverview />
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div variants={slideUpItem} style={{ height: '100%' }}>
            <ProfileDashboardAttendance />
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div variants={slideUpItem} style={{ height: '100%' }}>
            <AllInfoCalendar />
          </motion.div>
        </Grid>

        <Grid size={12}>
          <motion.div variants={slideUpItem}>
            <ProfileDashboardAttendanceTrend />
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  </Box>
);

export default EmployeeProfileDashboard;
