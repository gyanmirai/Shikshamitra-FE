import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Box, Card, Stack, Typography } from '@mui/material';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

const teacherData = [
  {
    subject: '9A - Mathematics',
    teacher: 'Dharmik Jinjala',
    assigned: true,
  },
  {
    subject: '9A - Physics',
    teacher: 'Prerna atre',
    assigned: true,
  },
  {
    subject: '9A - Chemistry',
    teacher: 'No Teacher Assigned',
    assigned: false,
  },
  {
    subject: '9A - Biology',
    teacher: 'Parth Ghusar',
    assigned: true,
  },
];

const ClassManagementTeacherAssignment = () => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes, setDivision]);

  return (
    <Card sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Teacher Assignment Status</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <CustomSelect
            options={allClass}
            label="Class"
            value={classes}
            onChange={(val) => setClasses(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { minWidth: '120px', width: '100%' } }}
          />
          <CustomSelect
            options={allDivision}
            label="Division"
            value={division}
            onChange={(val) => setDivision(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { minWidth: '120px', width: '100%' } }}
            disabled={!classes}
          />
        </Box>
      </Box>
      <Scrollbar sx={{ height: '300px' }}>
        <Stack spacing={1.5}>
          {teacherData.map((item, index) => (
            <TeacherCard subject={item.subject} teacher={item.teacher} assigned={item.assigned} />
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
};

export default ClassManagementTeacherAssignment;

const TeacherCard = ({
  subject,
  teacher,
  assigned,
}: {
  subject: string;
  teacher: string;
  assigned: boolean;
}) => (
  <Card
    variant="outlined"
    sx={{
      p: 2,
      borderRadius: 2,
      display: 'flex',
      gap: 1,
      justifyContent: 'space-between',
    }}
  >
    <Box>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.5 }}>
        {subject}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary">
        {teacher || 'No Teacher Assigned'}
      </Typography>
    </Box>
    <Box display="flex" justifyContent="flex-end">
      <Label color={assigned ? 'success' : 'error'}>{assigned ? 'Assigned' : 'Unassigned'}</Label>
    </Box>
  </Card>
);
