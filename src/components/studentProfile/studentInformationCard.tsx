import React from 'react';

import { Box, Paper, IconButton, Typography } from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

import { Label } from '../label';

const StudentInformationCard: React.FC<{
  currentStudent: Record<string, any> | undefined;
  setSearchParams: (value: Record<string, string>) => void;
}> = ({ currentStudent, setSearchParams }) => (
  <>
    <Paper
      elevation={6}
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 3,
        p: 1,
        mb: 1,
      }}
    >
      <IconButton
        sx={{ height: '40px', width: '40px', p: 0 }}
        onClick={() => setSearchParams({ isSearch: '', student: '', searchValue: '' })}
      >
        <KeyboardBackspaceIcon />
      </IconButton>
      <img
        src="https://api-dev-minimal-v6.vercel.app/assets/images/avatar/avatar-25.webp"
        alt="profile-pic"
        style={{ width: 40, height: 40 }}
      />
      <Typography variant="caption" fontWeight="bold">
        Name : {currentStudent?.name}
      </Typography>
      <Typography variant="caption" fontWeight="bold">
        Class : {currentStudent?.class}
      </Typography>
      <Typography variant="caption" fontWeight="bold">
        Roll No : {currentStudent?.rollNo}
      </Typography>

      <Typography variant="caption" fontWeight="bold">
        Student Status : &nbsp;{' '}
        <Label variant="soft" color="success">
          Active
        </Label>
      </Typography>
    </Paper>
    <Box sx={{ p: 1 }}>
      <Typography variant="caption" fontWeight="bold">
        Achieve Badges : &nbsp;{' '}
        <Label variant="soft" color="success">
          Volunteer
        </Label>
        <Label variant="soft" color="warning" sx={{ ml: 1 }}>
          New
        </Label>
        <Label variant="soft" color="info" sx={{ ml: 1 }}>
          VIP
        </Label>
        <Label variant="soft" color="error" sx={{ ml: 1 }}>
          Good Listener
        </Label>
      </Typography>
    </Box>
  </>
);

export default StudentInformationCard;
