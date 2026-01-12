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
    sx={{
      p: 2,
      borderRadius: 1.5,
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      boxShadow: 'none',
      border: '1px solid',
      borderColor: 'divider',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        bgcolor: 'action.hover',
        borderColor: 'action.hover',
      },
    }}
  >
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <SubjectColorIndicator color={color} />
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {subject}
        <Typography component="span" variant="body2" sx={{ color: 'text.secondary', ml: 0.5 }}>
          ({code})
        </Typography>
      </Typography>
    </Stack>
    <Typography variant="caption" sx={{ color: 'text.secondary', ml: 3.5, fontWeight: 500 }}>
      {teacher}
    </Typography>
  </Card>
);

export default AssignedTeacherItem;
