import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { Card, Stack, Button, CardHeader, Typography } from '@mui/material';

const homeworkRows: any[] = [];

const StudentHomeworkAssignments = () => {
  const [openViewAll, setOpenViewAll] = useState(false);

  const columns: any[] = [
    { id: 'title', label: 'Homework', align: 'left' },
    { id: 'subject', label: 'Subject', align: 'left' },
    { id: 'displayDate', label: 'Due Date', align: 'left' },
    { id: 'time', label: 'Time', align: 'left' },
    { id: 'status', label: 'Status', align: 'left' },
    { id: 'type', label: 'Type', align: 'left' },
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
          title="Homework & Assignments"
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
            No homework data found.
          </Typography>
        </Stack>
      </Card>

      <CustomDialog
        open={openViewAll}
        handleClose={() => setOpenViewAll(false)}
        title="Homework & Assignments"
        maxWidth="md"
      >
        <CustomizableTable
          columns={columns}
          data={homeworkRows}
          tableId="homework-assignments-table"
          noDataText="No homework data found."
          isSearch={false}
          isFilter={false}
          isPagination={false}
          wrapperProps={{ sx: { height: '50vh' }, padding: 1 }}
        />
      </CustomDialog>
    </>
  );
};

export default StudentHomeworkAssignments;
