import React from 'react';

import { Box, Card, Typography } from '@mui/material';

const EntranceExamCard = () => (
  <Card
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: '1px solid #4CAF50',
      borderRadius: 2,
      p: 2,
      bgcolor: '#F9FAFB',
      color: '#1B5E20',
      minHeight: 80,
    }}
  >
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
        Upcoming Entrance Exam
      </Typography>
      <Typography variant="body2" color="success.main">
        Class 6 Exam
      </Typography>
      <Typography variant="body2" color="success.main">
        Tuesday, 16-05-2025
      </Typography>
    </Box>

    <Box textAlign="right">
      <Typography variant="h5" fontWeight="bold" color="text.primary">
        5
      </Typography>
      <Typography variant="body2" color="success.main">
        Days Remaining
      </Typography>
    </Box>
  </Card>
);

export default EntranceExamCard;
