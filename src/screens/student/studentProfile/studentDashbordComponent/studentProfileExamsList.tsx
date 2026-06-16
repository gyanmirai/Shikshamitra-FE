import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { Card, Stack, Button, CardHeader, Typography } from '@mui/material';

const examRows: any[] = [];

const StudentExamsList = () => {
  const [openViewAll, setOpenViewAll] = useState(false);

  const columns: any[] = [
    { id: 'details', label: 'Exam Name', align: 'left' },
    { id: 'displayDate', label: 'Date', align: 'left' },
    { id: 'time', label: 'Time', align: 'left' },
    { id: 'type', label: 'Type', align: 'left' },
    { id: 'room', label: 'Room', align: 'left' },
    { id: 'status', label: 'Status', align: 'left', filterType: 'enum' },
  ];

  return (
    <Card
      sx={{
        borderRadius: 2,
        height: 480,
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      <CardHeader
        title="Upcoming & Recent Exams"
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
          No exam data found.
        </Typography>
      </Stack>

      <CustomDialog
        open={openViewAll}
        handleClose={() => setOpenViewAll(false)}
        title="All Exams"
        maxWidth="md"
      >
        <CustomizableTable
          columns={columns}
          data={examRows}
          tableId="student-exams-table"
          noDataText="No exam data found."
          isSearch={false}
          isFilter={false}
          isPagination={false}
          wrapperProps={{ sx: { height: '50vh' }, padding: 1 }}
        />
      </CustomDialog>
    </Card>
  );
};

export default StudentExamsList;
