import { Box, Avatar, Typography } from '@mui/material';
import UserHoverProfile from 'src/components/student-popover';

interface BirthdayCardProfileProps {
  name: string;
  age: number;
  className: string;
  division: string;
  dateLabel?: string; // e.g. "Tomorrow", "Dec 28"
  borderColor?: string;
}

export default function BirthdayCardProfile({
  name,
  age,
  className,
  division,
  dateLabel,
  borderColor = 'success.main',
}: BirthdayCardProfileProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid',
        borderLeft: `4px solid ${borderColor}`, // Green left border (you can change the color)
        p: 2,
        borderRadius: '12px', // Rounded corners to match the design
        position: 'relative',
      }}
    >
      <UserHoverProfile
        avatarComp={
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              mr: 2,
              width: 48,
              height: 48,
              cursor: 'pointer',
            }}
          >
            {name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </Avatar>
        }
        user={{
          name,
          avatarUrl: '/assets/images/avatars/avatar_1.jpg',
          role: 'Student',
          email: 'demo@school.com',
          class: className,
          division,
          board: 'CBSE',
          medium: 'English',
          organization: 'Higher Secondary',
        }}
      />

      <Box>
        <Typography variant="subtitle2">{name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {`${className}${division ? ` - ${division}` : ''}`}
        </Typography>
      </Box>

      {dateLabel && (
        <Typography
          variant="subtitle2"
          sx={{ position: 'absolute', right: 16, color: 'primary.main' }}
        >
          {dateLabel}
        </Typography>
      )}
    </Box>
  );
}
