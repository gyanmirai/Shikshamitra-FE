import { Box, Grid, Typography } from '@mui/material';

import type { IStudentFeeData } from '../type';

export default function StudentRefundInfo({ student }: { student: IStudentFeeData }) {
  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
      {/* Heading */}
      <Typography variant="h6" mb={1} color="primary.main">
        Student Information
      </Typography>

      <Grid container spacing={2}>
        {/* Student Name */}
        <Grid size={{ xs: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Student Name
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {student?.name}
          </Typography>
        </Grid>

        {/* Roll No */}
        <Grid size={{ xs: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Roll No.
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {student?.rollNo}
          </Typography>
        </Grid>

        {/* Board */}
        <Grid size={{ xs: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Board
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {student?.board}
          </Typography>
        </Grid>

        {/* Total Paid Fees */}
        <Grid size={{ xs: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Total Paid Fees
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            ₹ {student?.totalPaidFees?.toLocaleString()}
          </Typography>
        </Grid>

        {/* Class / Division */}
        <Grid size={{ xs: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Class/Division
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {student?.class}-{student?.division}
          </Typography>
        </Grid>

        {/* Medium */}
        <Grid size={{ xs: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Medium
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {student?.medium}
          </Typography>
        </Grid>

        {/* Total Pending Fees */}
        <Grid size={{ xs: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Total Pending Fees
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            ₹ {student?.totalPendingFees?.toLocaleString()}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
