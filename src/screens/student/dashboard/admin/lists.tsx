import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { Grid, Card, Stack, Button, CardHeader, Typography } from '@mui/material';

const AdminLists = () => {
  const [openViewAll, setOpenViewAll] = useState(false);

  const examColumns: any[] = [
    { id: 'details', label: 'Exam Name', align: 'left' },
    { id: 'displayDate', label: 'Date', align: 'left', type: 'date', filterType: 'date' },
    { id: 'time', label: 'Time', align: 'left', filterType: 'time' },
    { id: 'type', label: 'Type', align: 'left' },
    { id: 'students', label: 'Registered', align: 'left' },
    { id: 'status', label: 'Status', align: 'left', filterType: 'enum' },
  ];

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: 480, display: 'flex', flexDirection: 'column' }}>
          <CardHeader
            title="Upcoming & Recent Exams"
            titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
            action={
              <Button
                size="small"
                onClick={() => setOpenViewAll(true)}
                color="inherit"
                endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
                sx={{ fontWeight: 600, color: 'text.secondary' }}
              >
                View all
              </Button>
            }
            sx={{ pb: 0, flexShrink: 0, mt: -1, ml: -1 }}
          />

          <Stack sx={{ p: 3, flexGrow: 1, justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No exam data found.
            </Typography>
          </Stack>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 1 }}>
        <Card sx={{ height: 480, display: 'flex', flexDirection: 'column' }}>
          <CardHeader
            title="Student Enrollment"
            subheader="Recent applications"
            sx={{ mt: -1, ml: -1 }}
          />

          <Stack sx={{ p: 3, flexGrow: 1, justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No recent enrollment data found.
            </Typography>
          </Stack>
        </Card>
      </Grid>

      <CustomDialog
        open={openViewAll}
        handleClose={() => setOpenViewAll(false)}
        title="Upcoming & Recent Exams"
        maxWidth="lg"
      >
        <CustomizableTable
          columns={examColumns}
          data={[]}
          tableId="upcoming-exams-table"
          noDataText="No exam data found."
          isSearch={false}
          isFilter
          isPagination={false}
          wrapperProps={{ sx: { height: '60vh' }, padding: 1 }}
        />
      </CustomDialog>
    </Grid>
  );
};

export default AdminLists;
