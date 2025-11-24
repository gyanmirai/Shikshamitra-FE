'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import { Box, Grid } from '@mui/material';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ExamsList from './component/examList';
import StudentProfile from './component/studentProfile';
import AssignmentsList from './component/assignmentList';
import ProgressOverTime from './component/progressOverTime';

export type TStudent = {
  avatarUrl: string;
  name: string;
  grade: string;
  attendance: { presentDays: number; absentDays: number };
  behavior: {
    score: number;
    participationLevel: 'Low' | 'Medium' | 'High'; // Enum-like string union for participation level
  };
};

const dummyStudent: TStudent = {
  avatarUrl: 'https://example.com/avatar.jpg',
  name: 'John Doe',
  grade: '10',
  attendance: { presentDays: 85, absentDays: 5 },
  behavior: { score: 90, participationLevel: 'High' },
};

const IndividualStudentProgress = (props: TabComponentType) => {
  const { searchParams, setSearchParams } = props;
  const classes = searchParams?.classId ? searchParams?.classId : '';
  const [division, setDivision] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  // const cardBgColor =
  //   theme.palette.mode === 'dark' ? theme.vars.palette.grey[800] : theme.vars.palette.grey[100];
  // const textColor =
  //   theme.palette.mode === 'dark'
  //     ? theme.vars.palette.common.white
  //     : theme.vars.palette.text.primary;

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
        setSearchParams?.({ classId: firstClass.id });
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes, setSearchParams]);
  // Conditional card background color based on the theme mode (light/dark)

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Individual Student Progress"
        links={[
          { name: 'Academics' },
          { name: 'Student Progress Analytics' },
          { name: 'Individual Student Progress' },
        ]}
        sx={{ mb: 2 }}
      />

      <Grid container spacing={3} justifyContent="center" alignItems="center">
        <Grid size={{ xs: 12 }}>
          <CustomSelect
            label="Class"
            options={classData?.items || []}
            labelKey="name"
            valueKey="id"
            onChange={(val) => {
              const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
              setSearchParams?.({ classId: val as string });
              setDivisionOptions(selectedClass?.divisions || []);
            }}
            value={classes}
            formControlProps={{ sx: { width: '100%', maxWidth: '150px' } }}
          />

          <CustomSelect
            label="Division"
            disabled={!classes}
            labelKey="name"
            valueKey="id"
            options={divisionOptions}
            value={division}
            onChange={(val) => {
              setDivision(val as string);
            }}
            formControlProps={{ sx: { width: '100%', maxWidth: '150px' } }}
          />

          <CustomSelect
            label="Select Student"
            options={[
              { value: 'student1', label: 'Student 1' },
              { value: 'student2', label: 'Student 2' },
              { value: 'student3', label: 'Student 3' },
            ]}
            value={selectedStudent}
            isSearch
            onChange={(val) => setSelectedStudent(val as string)}
            formControlProps={{ sx: { width: '100%', maxWidth: '150px' } }}
          />
        </Grid>

        {/* Student profile component */}
        <StudentProfile student={dummyStudent} />

        {/* Progress over time */}
        <ProgressOverTime />

        {/* Assignments and Exams */}
        <Grid size={{ xs: 12, md: 6 }}>
          <AssignmentsList />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ExamsList />
        </Grid>
      </Grid>
    </Box>
  );
};

export default IndividualStudentProgress;

// interface StudentProfileProps {
//   user: TStudent;
// }

// const StudentProfile = ({ user }: StudentProfileProps) => {
//   const feeDetailViewDialog = useBoolean();
//   const { assetURL } = CONFIG.site;
//   const openfeeDetailViewDialog = () => {
//     feeDetailViewDialog.onTrue();
//   };
//   const closefeeDetailViewDialog = () => {
//     feeDetailViewDialog.onFalse();
//   };

//   return (
//     <Card
//       // onClick={openfeeDetailViewDialog}
//       sx={{
//         display: 'flex',
//         flexDirection: 'row',
//         width: '100%',
//         mt: 2,
//         padding: 4,
//         background: 'linear-gradient(to right, #fbe8d3, #e0f7fa)',
//         boxShadow: 3,
//         borderRadius: 2,
//       }}
//     >
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           justifyContent: 'center',
//           width: '20%',
//           textAlign: 'center',
//           padding: 2,
//         }}
//       >
//         <Avatar
//           alt={user.name}
//           src={`${assetURL}/assets/images/avatar/avatar-${0 + 1}.webp`}
//           sx={{ width: 120, height: 120, mb: 1 }}
//         />
//         <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
//           {user.name}
//         </Typography>
//       </Box>
//       <Box sx={{ display: 'flex', flexDirection: 'column', width: '80%', gap: 3 }}>
//         <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}>
//           {[
//             { label: 'Present Days', icon: 'mdi:tick-circle-outline', value: '56' },
//             { label: 'Absent Days', icon: 'mdi:tick-circle-outline', value: '20' },
//           ].map((item) => (
//             <Box key={item.label} sx={{ textAlign: 'center' }}>
//               <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>
//                 {item.label}
//               </Typography>
//               <Box display="flex" alignItems="center" justifyContent="center">
//                 <Iconify
//                   icon={item.icon}
//                   width={20}
//                   height={20}
//                   sx={{
//                     mr: 1,
//                     color: item.label === 'Present Days' ? 'green' : 'red', // Conditional color
//                   }}
//                 />
//                 {item.value}
//               </Box>
//             </Box>
//           ))}
//         </Box>

//         {/* Second Row */}
//         <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}>
//           {[
//             { label: 'Behaviour Score', value: '0' },
//             {
//               label: 'Participation Level',
//               value: '30',
//             },
//           ].map(({ label, value }) => (
//             <Box key={label} sx={{ textAlign: 'center' }}>
//               <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>
//                 {label}
//               </Typography>
//               <Box display="flex" alignItems="center" justifyContent="center">
//                 {value}
//               </Box>
//             </Box>
//           ))}
//         </Box>

//         {/* Action Buttons */}
//       </Box>
//     </Card>
//   );
// };
