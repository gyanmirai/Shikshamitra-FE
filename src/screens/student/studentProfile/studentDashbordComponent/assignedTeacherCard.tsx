import React from 'react';
import { Card, Stack, Typography } from '@mui/material';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

interface AssignedTeacherItemProps {
  subject: string;
  code: string;
  teacher: string;
  color: string;
}

const AssignedTeacherItem: React.FC<AssignedTeacherItemProps> = ({
  subject,
  code,
  teacher,
  color,
}) => (
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
    <Stack direction="row" alignItems="center" spacing={1}>
      <SubjectColorIndicator color={color} />
      <Typography variant="subtitle1" fontWeight="600">
        {subject} ({code})
      </Typography>
    </Stack>
    <Typography variant="body2" color="text.secondary" sx={{ ml: 1.5 }}>
      {teacher}
    </Typography>
  </Card>
);

export default AssignedTeacherItem;
