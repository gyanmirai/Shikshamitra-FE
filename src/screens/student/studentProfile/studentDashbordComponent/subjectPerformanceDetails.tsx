import React from 'react';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { Card, Stack, Button, CardHeader, Typography } from '@mui/material';

const performanceRows: any[] = [];

const SubjectPerformanceCards = () => {
  const [openViewAll, setOpenViewAll] = React.useState(false);

  const columns: any[] = [
    { id: 'subject', label: 'Subject', align: 'left' },
    { id: 'percentage', label: 'Percentage', align: 'left' },
    { id: 'previous', label: 'Previous', align: 'left' },
    { id: 'grade', label: 'Grade', align: 'left' },
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
          title="Subject Wise Performance"
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
          sx={{ pb: 1, flexShrink: 0, mt: -1, ml: -1 }}
        />

        <Stack sx={{ p: 3, flexGrow: 1, justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No subject performance data found.
          </Typography>
        </Stack>
      </Card>

      <CustomDialog
        open={openViewAll}
        handleClose={() => setOpenViewAll(false)}
        title="Subject Performance"
        maxWidth="md"
      >
        <CustomizableTable
          columns={columns}
          data={performanceRows}
          tableId="subject-performance-table"
          noDataText="No subject performance data found."
          isSearch={false}
          isFilter={false}
          isPagination={false}
          wrapperProps={{ sx: { height: '50vh' }, padding: 1 }}
        />
      </CustomDialog>
    </>
  );
};

export default SubjectPerformanceCards;
