import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import CustomizableTable from 'src/components/customizable-table';
import { Card, Stack, Avatar, Button, CardHeader, Typography } from '@mui/material';

import AssignedTeacherItem from './assignedTeacherCard';

const teachers = [
  {
    subject: 'Mathematics',
    code: 'MATH-10',
    teacher: 'Dharmik Jinjala',
    color: '#e53935',
    avatarUrl: '/assets/images/avatars/avatar_1.jpg',
  },
  {
    subject: 'English',
    code: 'ENG-11',
    teacher: 'Prerna Atre',
    color: '#1e88e5',
    avatarUrl: '/assets/images/avatars/avatar_2.jpg',
  },
  {
    subject: 'Science',
    code: 'SCI-04',
    teacher: 'Parth Ghusar',
    color: '#f48fb1',
    avatarUrl: '/assets/images/avatars/avatar_3.jpg',
  },
  {
    subject: 'Social Science',
    code: 'SOC-08',
    teacher: 'Anjali Mehta',
    color: '#FFA500',
    avatarUrl: '/assets/images/avatars/avatar_4.jpg',
  },
  {
    subject: 'Hindi',
    code: 'HIN-02',
    teacher: 'Rajesh Kumar',
    color: '#FF5630',
    avatarUrl: '/assets/images/avatars/avatar_5.jpg',
  },
  {
    subject: 'Gujarati',
    code: 'GUJ-05',
    teacher: 'Sneha Patel',
    color: '#FFAB00',
    avatarUrl: '/assets/images/avatars/avatar_6.jpg',
  },
];

const SubjectsTeachersStudentDashboard = () => {
  const [openViewAll, setOpenViewAll] = React.useState(false);

  const columns: any[] = [
    {
      id: 'teacher',
      label: 'Teacher',
      align: 'left',
      render: (value: any, row: any) => (
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar src={row.avatarUrl} alt={row.teacher} sx={{ width: 32, height: 32 }} />
          <Typography variant="subtitle2" noWrap>
            {row.teacher}
          </Typography>
        </Stack>
      ),
    },
    { id: 'subject', label: 'Subject', align: 'left' },
    {
      id: 'code',
      label: 'Code',
      align: 'center',
      render: (value: string) => (
        <Label variant="soft" color="info">
          {value}
        </Label>
      ),
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

        <Scrollbar sx={{ p: 1, flexGrow: 1 }}>
          <Stack spacing={1.5}>
            {teachers.map((item, index) => (
              <AssignedTeacherItem key={index} {...item} />
            ))}
          </Stack>
        </Scrollbar>
      </Card>
      <CustomDialog
        open={openViewAll}
        handleClose={() => setOpenViewAll(false)}
        title="Assigned Teachers"
        maxWidth="md"
      >
        <CustomizableTable
          columns={columns}
          data={teachers}
          tableId="assigned-teachers-table"
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
