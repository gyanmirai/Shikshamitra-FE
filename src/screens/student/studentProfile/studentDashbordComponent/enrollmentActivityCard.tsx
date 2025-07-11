import React from 'react';

import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Card, Typography, IconButton } from '@mui/material';

interface EnrollmentActivityProps {
  name: string;
  type: string;
  date: string;
  timeAgo: string;
}

const EnrollmentActivityCard: React.FC<EnrollmentActivityProps> = ({
  name,
  type,
  date,
  timeAgo,
}) => (
  <Card
    variant="outlined"
    sx={{
      p: 2,
      mb: 1,
      borderRadius: 2,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      '&:hover': {
        boxShadow: 'var(--shadows-8)',
        cursor: 'pointer',
      },
    }}
  >
    <Box>
      <Typography variant="subtitle1" fontWeight="600">
        {name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {type} · {date} · {timeAgo}
      </Typography>
    </Box>
    <IconButton>
      <VisibilityIcon fontSize="small" />
    </IconButton>
  </Card>
);

export default EnrollmentActivityCard;
