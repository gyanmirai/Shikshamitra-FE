import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { Grid, Card, Stack, Button, CardHeader, Typography } from '@mui/material';

const TeacherLists = () => {
  const [openExamsDialog, setOpenExamsDialog] = useState(false);
  const [openStudentsDialog, setOpenStudentsDialog] = useState(false);

  const examColumns: any[] = [
    { id: 'subject', label: 'Subject', align: 'left' },
    { id: 'date', label: 'Date', align: 'left' },
    { id: 'time', label: 'Time', align: 'left' },
    { id: 'class', label: 'Class', align: 'left' },
    { id: 'status', label: 'Status', sticky: true, align: 'left' },
  ];

  const studentColumns: any[] = [
    { id: 'name', label: 'Student Name', align: 'left' },
    { id: 'class', label: 'Class', align: 'left' },
    { id: 'reason', label: 'Reason', align: 'left' },
    { id: 'date', label: 'Date', align: 'left' },
    { id: 'status', label: 'Status', align: 'left', sticky: true },
  ];

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="Upcoming Exams"
              action={
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => setOpenExamsDialog(true)}
                  endIcon={
                    <Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />
                  }
                >
                  View all exams
                </Button>
              }
            />
            <Stack spacing={2} sx={{ p: 3, minHeight: 160, justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No upcoming exams found.
              </Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }} sx={{ mb: 1 }}>
          <Card>
            <CardHeader
              title="Absent Students Today"
              subheader="Track student attendance"
              action={
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => setOpenStudentsDialog(true)}
                  endIcon={
                    <Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />
                  }
                >
                  View all students
                </Button>
              }
            />
            <Stack spacing={2} sx={{ p: 3, minHeight: 160, justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No absent student data found.
              </Typography>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <CustomDialog
        open={openExamsDialog}
        handleClose={() => setOpenExamsDialog(false)}
        title="All Exams"
        maxWidth="md"
      >
        <CustomizableTable
          tableId="teacher-dashboard-exams"
          columns={examColumns}
          data={[]}
          noDataText="No exams found."
        />
      </CustomDialog>

      <CustomDialog
        open={openStudentsDialog}
        handleClose={() => setOpenStudentsDialog(false)}
        title="Absent Students"
        maxWidth="md"
      >
        <CustomizableTable
          tableId="teacher-dashboard-absent-students"
          columns={studentColumns}
          data={[]}
          noDataText="No absent students found."
        />
      </CustomDialog>
    </>
  );
};

export default TeacherLists;
