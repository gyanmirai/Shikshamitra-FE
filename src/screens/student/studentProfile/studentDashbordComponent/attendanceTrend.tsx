import { Card, Typography } from '@mui/material';
import { EmptyContent } from 'src/components/empty-content';

const AttendanceTrend = () => (
  <Card sx={{ p: 1.5, boxShadow: 'none', border: 1, borderColor: 'divider', borderRadius: 2 }}>
    <Typography variant="h6">Attendance Trend</Typography>
    <EmptyContent
      title="Attendance trend is not available"
      description="Open Attendance to review this student's recorded attendance."
      sx={{ py: 3 }}
    />
  </Card>
);

export default AttendanceTrend;
