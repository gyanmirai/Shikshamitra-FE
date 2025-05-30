'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';

import { Box, Grid, Card } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DashBoardQuickAction from 'src/components/dashboard-quick-action';

import DashboardCards from './component/dashboardCards';
import HomeworkAssignmentCards from './component/homeworkAssignmentCards';

const Dashboard = (props: TabComponentType) => {
  const { searchParams, setSearchParams } = props;
  const classes = searchParams?.classId ? searchParams?.classId : '';
  const [division, setDivision] = useState('');
  const [subject, setSubject] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const [hoveredResource, setHoveredResource] = useState<string | null>(null);

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        // Set first division if available
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setSearchParams?.({
          classId: firstClass.id,
        });
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes, setSearchParams]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[{ name: 'Academics' }, { name: 'Homework & Assignment' }, { name: 'Dashboard' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <DashBoardQuickAction
            actions={[
              {
                icon: 'mdi:plus',
                label: 'Homework/Assignment',
                href: '/academic/homework-assignment-management/homeworkCreation',
                color: 'primary',
              },
              {
                icon: 'mdi:assignment',
                label: 'Submission',
                href: '/academic/homework-assignment-management/studentSubmissions',
                color: 'warning',
              },
              {
                icon: 'mdi:arrow-right',
                label: 'Assign Grade',
                href: '/academic/homework-assignment-management/gradingAndFeedback',
                color: 'secondary',
              },
            ]}
          />
        }
      />
      <Card sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <CustomSelect
            label="Class"
            options={classData?.items || []}
            labelKey="name"
            valueKey="id"
            onChange={(val) => {
              const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
              // formik.setFieldValue('class', selectedClass?.name || '');
              setSearchParams?.({
                classId: val as string,
              });
              setDivisionOptions(selectedClass?.divisions || []);
            }}
            value={classes}
            formControlProps={{
              sx: { width: '100%', maxWidth: '150px' },
            }}
          />
          <CustomSelect
            label="Division"
            disabled={!classes}
            labelKey="name"
            valueKey="id"
            options={divisionOptions}
            value={division}
            onChange={(val) => {
              // const selectedDivision = divisionOptions.find((i: Division) => val.includes(i.id));
              // formik.setFieldValue('division', selectedDivision?.name || '');
              setDivision(val as string);
            }}
            formControlProps={{
              sx: { width: '100%', maxWidth: '150px' },
            }}
          />
          <CustomSelect
            label="Subject"
            disabled={!division}
            options={[
              { value: 'math', label: 'Math' },
              { value: 'science', label: 'Science' },
              { value: 'english', label: 'English' },
            ]}
            value={subject}
            onChange={(val) => {
              // const selectedDivision = divisionOptions.find((i: Division) => val.includes(i.id));
              // formik.setFieldValue('division', selectedDivision?.name || '');
              setSubject(val as string);
            }}
            formControlProps={{
              sx: { width: '100%', maxWidth: '150px' },
            }}
          />
        </Box>
      </Card>
      <Grid container spacing={2} mt={1}>
        <DashboardCards />
        <HomeworkAssignmentCards />
      </Grid>
      {/* <Typography variant="h6" gutterBottom color="text.primary" sx={{ mt: 2 }}>
        Welcome, [John Doe]
      </Typography>
      <HomeworkPendingCards />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6">Assignments & Homeworks</Typography>
          <CalendarView />
        </CardContent>
      </Card> */}
    </Box>
  );
};

export default Dashboard;

// interface DashboardCardProps {
//   title: string;
//   icon: string;
//   value?: number | string;
//   labels?: { name: string; color: LabelColor }[];
//   color: string;
//   href?: string;
//   searchParams?: Record<string, string>;
// }

// const HomeworkDashboardCard = ({
//   title,
//   icon,
//   value,
//   labels = [],
//   href = '',
//   color,
//   searchParams = {},
// }: DashboardCardProps) => {
//   const url = new URL(href, window.location.origin);
//   Object.entries(searchParams).forEach(([key, val]) => {
//     if (val) {
//       url.searchParams.set(key, val);
//     }
//   });

//   return (
//     <Box component={Link} href={url.toString()} sx={{ textDecoration: 'none' }}>
//       <Card
//         sx={{
//           height: '100%',
//           transition: 'all 0.3s ease',
//           '&:hover': {
//             boxShadow: 'var(--shadows-8)',
//             scale: 1.03,
//           },
//         }}
//       >
//         <CardContent
//           sx={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             height: '100%',
//           }}
//         >
//           <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%">
//             <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
//               <Box sx={{ typography: 'subtitle1' }}>{title}</Box>
//               {/* <Typography variant="h6">Total Employees</Typography> */}
//             </Box>
//             {typeof value === 'number' && (
//               <Box sx={{ mt: 1.5, mb: 1, typography: 'h3' }}>{fNumber(value)}</Box>
//             )}
//             {typeof value === 'string' && (
//               <Box sx={{ mt: 1.5, mb: 1, typography: 'h3' }}>{value}</Box>
//             )}
//             {/* <Typography variant="h4">{stats.totalEmployees}</Typography> */}
//             <Box
//               sx={{
//                 mt: 1.5,
//                 mb: 1,
//                 typography: 'subtitle2',
//                 display: 'flex',
//                 gap: 1,
//                 flexWrap: 'wrap',
//               }}
//             >
//               {labels.map((label, index) => (
//                 <Label color={label.color || 'success'}>{label.name}</Label>
//               ))}
//             </Box>
//           </Box>
//           <Iconify icon={icon} sx={{ width: 50, height: 50, color }} />
//           {/* <Typography variant="body2"></Typography> */}
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };
