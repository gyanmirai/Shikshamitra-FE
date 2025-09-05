import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { Box, Card, Stack, Typography } from '@mui/material';

const classTeacherData = [
  { className: '9A', teacher: 'Smit Patel', assigned: true },
  { className: '9B', teacher: 'No Teacher Assigned', assigned: false },
  { className: '10A', teacher: 'Devanshi Shah', assigned: true },
  { className: '10B', teacher: 'No Teacher Assigned', assigned: false },
];

const ClassTeacherAssignment = () => {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  return (
    <Card sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Class Teacher Assignment</Typography>
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClasses(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '120px', width: '100%' } }}
        />
      </Box>
      <Scrollbar sx={{ height: '300px' }}>
        <Stack spacing={1.5}>
          {classTeacherData.map((item, index) => (
            <TeacherCard
              key={index}
              subject={item.className}
              teacher={item.teacher}
              assigned={item.assigned}
            />
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
};

export default ClassTeacherAssignment;

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
