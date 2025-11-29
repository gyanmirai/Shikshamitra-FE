import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { Box, Card, Stack, MenuItem, TextField, Typography, LinearProgress } from '@mui/material';

const chapterProgress = [
  { subject: 'Mathematics', updatedOn: '20-06-2025', completed: 12, total: 15, color: '#1976d2' },
  { subject: 'Physics', updatedOn: '18-06-2025', completed: 8, total: 15, color: '#2e7d32' },
  { subject: 'Chemistry', updatedOn: '18-06-2025', completed: 8, total: 15, color: '#d32f2f' },
];

const ClassManagementSubjectProgress = () => {
  // Redux state for current medium/organization
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Local state for classes and divisions
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>('');

  // Populate classes when medium changes
  useEffect(() => {
    const classesFromMedium =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(classesFromMedium);
    setSelectedClass(classesFromMedium[0]?.id || '');
  }, [medium]);

  // Populate divisions when class changes
  useEffect(() => {
    const current = allClass.find((c) => c.id === selectedClass);
    setAllDivision(current?.divisions || []);
    setSelectedDivision(current?.divisions?.[0]?.id || '');
  }, [allClass, selectedClass]);

  return (
    <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Typography variant="h6">Chapter Progress Overview</Typography>
        <TextField
          select
          label="Class"
          size="small"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          {allClass.map((cls) => (
            <MenuItem key={cls.id} value={cls.id}>
              {cls.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Division"
          size="small"
          value={selectedDivision}
          onChange={(e) => setSelectedDivision(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          {allDivision.map((div) => (
            <MenuItem key={div.id} value={div.id}>
              {div.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Stack spacing={1.5}>
        {chapterProgress.map((item, index) => (
          <SubjectProgressChart
            key={index}
            subject={item.subject}
            updatedDate={item.updatedOn}
            completedChapters={item.completed}
            totalChapters={item.total}
            color={item.color}
          />
        ))}
      </Stack>
    </Card>
  );
};

export default ClassManagementSubjectProgress;

interface SubjectProgressChartProps {
  subject: string;
  updatedDate: string;
  completedChapters: number;
  totalChapters: number;
  color: string;
}

const SubjectProgressChart: React.FC<SubjectProgressChartProps> = ({
  subject,
  updatedDate,
  completedChapters,
  totalChapters,
  color,
}) => {
  const percentage = Math.round((completedChapters / totalChapters) * 100);

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        borderColor: 'divider',
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SubjectColorIndicator color={color} />
          <Typography variant="subtitle1" fontWeight={600}>
            {subject}
          </Typography>
          <Box flexGrow={1} />
          <Typography variant="subtitle2">
            {completedChapters}/{totalChapters}
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Updated: {updatedDate}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 8,
            borderRadius: 5,
            bgcolor: `${color}22`,
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
            },
          }}
        />
      </Stack>
    </Card>
  );
};
