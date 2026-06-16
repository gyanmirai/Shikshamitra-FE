import React from 'react';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { Card, Stack, Button, CardHeader, Typography } from '@mui/material';

const teacherRows: any[] = [];

const SubjectsTeachersStudentDashboard = () => {
  const [openViewAll, setOpenViewAll] = React.useState(false);

  const columns: any[] = [
    { id: 'teacher', label: 'Teacher', align: 'left' },
    { id: 'subject', label: 'Subject', align: 'left' },
    { id: 'code', label: 'Code', align: 'center' },
  ];

  return (
    <>
      <Card
        sx={{
          boxShadow: (theme) => theme.shadows[2],
          borderRadius: 2,
          height: 480,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardHeader
          title="Assigned Teachers"
          titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
          action={
            <Button
              size="small"
              color="inherit"
              onClick={() => setOpenViewAll(true)}
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
              sx={{ fontWeight: 600, color: 'text.secondary' }}
            >
              View all
            </Button>
          }
          sx={{ pb: 0, flexShrink: 0, mt: -1, ml: -1, mb: 2 }}
        />

        <Stack sx={{ p: 3, flexGrow: 1, justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No assigned teacher data found.
          </Typography>
        </Stack>
      </Card>

      <CustomDialog
        open={openViewAll}
        handleClose={() => setOpenViewAll(false)}
        title="Assigned Teachers"
        maxWidth="md"
      >
        <CustomizableTable
          columns={columns}
          data={teacherRows}
          tableId="assigned-teachers-table"
          noDataText="No assigned teacher data found."
          isSearch={false}
          isFilter={false}
          isPagination={false}
          wrapperProps={{ sx: { height: '50vh' }, padding: 1 }}
        />
      </CustomDialog>
    </>
  );
};

export default SubjectsTeachersStudentDashboard;
