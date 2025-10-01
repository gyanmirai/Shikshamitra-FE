import { Box, Grid, Typography } from '@mui/material';

import type { IStudentFeeData } from '../type';

export default function StudentRefundInfo({ student }: { student: IStudentFeeData }) {
  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
      {/* Heading */}
      <Typography variant="h6" mb={2} color="primary.main">
        Student Information
      </Typography>

      <Grid container spacing={2}>
        {/* Student Name */}
        <Grid size={{ xs: 4 }}>
          <Typography color="text.secondary">Student Name</Typography>
          <Typography sx={{ fontWeight: 300 }} variant="body2">
            {student?.name}
          </Typography>
        </Grid>

        {/* Roll No */}
        <Grid size={{ xs: 4 }}>
          <Typography color="text.secondary">Roll No.</Typography>
          <Typography sx={{ fontWeight: 300 }} variant="body2">
            {student?.rollNo}
          </Typography>
        </Grid>

        {/* Board */}
        <Grid size={{ xs: 4 }}>
          <Typography color="text.secondary">Board</Typography>
          <Typography sx={{ fontWeight: 300 }} variant="body2">
            {student?.board}
          </Typography>
        </Grid>

        {/* Total Paid Fees */}
        <Grid size={{ xs: 4 }}>
          <Typography color="text.secondary">Total Paid Fees</Typography>
          <Typography sx={{ fontWeight: 300 }} variant="body2">
            ₹ {student?.totalPaidFees?.toLocaleString()}
          </Typography>
        </Grid>

        {/* Class / Division */}
        <Grid size={{ xs: 4 }}>
          <Typography color="text.secondary">Class/Division</Typography>
          <Typography sx={{ fontWeight: 300 }} variant="body2">
            {student?.class}-{student?.division}
          </Typography>
        </Grid>

        {/* Medium */}
        <Grid size={{ xs: 4 }}>
          <Typography color="text.secondary">Medium</Typography>
          <Typography sx={{ fontWeight: 300 }} variant="body2">
            {student?.medium}
          </Typography>
        </Grid>

        {/* Total Pending Fees */}
        <Grid size={{ xs: 4 }}>
          <Typography color="text.secondary">Total Pending Fees</Typography>
          <Typography sx={{ fontWeight: 300 }} variant="body2">
            ₹ {student?.totalPendingFees?.toLocaleString()}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
