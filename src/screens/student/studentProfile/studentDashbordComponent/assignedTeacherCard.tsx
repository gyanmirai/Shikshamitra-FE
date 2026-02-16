import React from 'react';
import { Box, Card, Stack, Avatar, Typography } from '@mui/material';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

interface AssignedTeacherItemProps {
  subject: string;
  code: string;
  teacher: string;
  color: string;
  avatarUrl?: string;
}

const AssignedTeacherItem: React.FC<AssignedTeacherItemProps> = ({
  subject,
  code,
  teacher,
  color,
  avatarUrl,
}) => (
  <Card
    sx={{
      p: 2,
      borderRadius: 1.5,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      boxShadow: 'none',
      border: '1px solid',
      borderColor: 'divider',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        borderColor: 'transparent',
        bgcolor: 'background.neutral',
        transform: 'scale(1.02)',
        boxShadow: 'none',
      },
    }}
  >
    <Avatar src={avatarUrl} alt={teacher} sx={{ width: 48, height: 48 }} />

    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {teacher}
      </Typography>

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
        <SubjectColorIndicator color={color} />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {subject} ({code})
        </Typography>
      </Stack>
    </Box>
  </Card>
);

export default AssignedTeacherItem;
