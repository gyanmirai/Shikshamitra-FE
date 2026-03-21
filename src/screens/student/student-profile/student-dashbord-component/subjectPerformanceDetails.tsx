import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import CustomizableTable from 'src/components/customizable-table';
import { Card, Stack, Button, Divider, CardHeader, Typography } from '@mui/material';

import SubjectPerformanceItem from './subjectPerformanceCard';

// Enhanced Mock Data with Previous Scores
const subjectPerformances = [
  { subject: 'Mathematics', percentage: 92, previous: 88, grade: 'A+', color: '#00C49F' },
  { subject: 'English', percentage: 79, previous: 82, grade: 'B+', color: '#00B8D9' },
  { subject: 'Science', percentage: 88, previous: 85, grade: 'A', color: '#9C27B0' },
  { subject: 'Social Science', percentage: 89, previous: 86, grade: 'A', color: '#FFA500' },
  { subject: 'Hindi', percentage: 58, previous: 62, grade: 'C', color: '#FF5630' },
  { subject: 'Gujarati', percentage: 75, previous: 70, grade: 'B+', color: '#FFAB00' },
  { subject: 'Sanskrit', percentage: 82, previous: 80, grade: 'A', color: '#00AB55' },
];

const SubjectPerformanceCards = () => {
  // Calculate Statistics
  const stats = useMemo(() => {
    const total = subjectPerformances.reduce((acc, item) => acc + item.percentage, 0);
    const avg = Math.round(total / subjectPerformances.length);

    // Find Highest and Lowest performing subjects
    const highest = subjectPerformances.reduce((prev, current) =>
      prev.percentage > current.percentage ? prev : current
    );
    const lowest = subjectPerformances.reduce((prev, current) =>
      prev.percentage < current.percentage ? prev : current
    );

    return { avg, highest, lowest };
  }, []);

  const [openViewAll, setOpenViewAll] = React.useState(false);

  // Define columns for the table
  const columns: any[] = [
    { id: 'subject', label: 'Subject', align: 'left' },
    {
      id: 'percentage',
      label: 'Percentage',
      align: 'left',
      render: (value: number) => `${value}%`,
    },
    { id: 'previous', label: 'Previous', align: 'left', render: (value: number) => `${value}%` },
    {
      id: 'grade',
      label: 'Grade',
      align: 'left',
      render: (value: string) => {
        let color: 'success' | 'info' | 'warning' | 'error' = 'error';
        if (value === 'A+') color = 'success';
        else if (value === 'A') color = 'info';
        else if (value === 'B+') color = 'warning';

        return (
          <Label variant="soft" color={color}>
            {value}
          </Label>
        );
      },
    },
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

        {/* Summary Row */}
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          sx={{ py: 2, borderBottom: (theme) => `1px dashed ${theme.palette.divider}` }}
        >
          <Stack spacing={0.5} sx={{ width: 1, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Average
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {stats.avg}%
            </Typography>
          </Stack>

          <Stack spacing={0.5} sx={{ width: 1, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Best
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'success.main' }}>
              {stats.highest.subject}
            </Typography>
          </Stack>

          <Stack spacing={0.5} sx={{ width: 1, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Weakest
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'error.main' }}>
              {stats.lowest.subject}
            </Typography>
          </Stack>
        </Stack>

        <Scrollbar sx={{ p: 1, flexGrow: 1 }}>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            {subjectPerformances.map((item, index) => (
              <SubjectPerformanceItem
                key={index}
                {...item}
                isHighest={item.subject === stats.highest.subject}
                isLowest={item.subject === stats.lowest.subject}
              />
            ))}
          </Stack>
        </Scrollbar>
      </Card>

      <CustomDialog
        open={openViewAll}
        handleClose={() => setOpenViewAll(false)}
        title="Subject Performance"
        maxWidth="md"
      >
        <CustomizableTable
          columns={columns}
          data={subjectPerformances}
          tableId="subject-performance-table"
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
