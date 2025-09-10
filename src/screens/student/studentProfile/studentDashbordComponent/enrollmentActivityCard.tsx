import React from 'react';
import { Label } from 'src/components/label';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Card, Stack, Typography, IconButton } from '@mui/material';

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
      <Stack direction="row" alignItems="center">
        {/* Show type as a soft green label */}
        <Label variant="soft" color="success">
          {type}
        </Label>

        {/* Show date and timeAgo next to the label */}
        <Typography variant="body2" color="text.secondary">
          · {date} · {timeAgo}
        </Typography>
      </Stack>
    </Box>
    <IconButton>
      <VisibilityIcon fontSize="small" />
    </IconButton>
  </Card>
);

export default EnrollmentActivityCard;
