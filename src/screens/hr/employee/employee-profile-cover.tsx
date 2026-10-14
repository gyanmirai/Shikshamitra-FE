import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';
import { Card, IconButton } from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

export type IUserProfileCover = {
  name: string;

  avatarUrl: string;
  setSearchParams: (value: Record<string, string>) => void;
  extraContent?: React.ReactNode;
};

// ----------------------------------------------------------------------

export function EmployeeProfileCover({
  name,
  avatarUrl,
  setSearchParams,
  extraContent = null,
}: IUserProfileCover) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        bgcolor: theme.vars.palette.action.selected,
        height: 1,
        color: 'text.primary',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <IconButton
          aria-label="Back to staff directory"
          sx={{ height: '40px', width: '40px', p: 0 }}
          onClick={() => setSearchParams({ employee: '' })}
        >
          <KeyboardBackspaceIcon sx={{ color: 'primary.main' }} />
        </IconButton>
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pl: 1 }}>
        <Avatar
          alt={name}
          src={avatarUrl}
          sx={{
            width: { xs: 64, md: 128 },
            height: { xs: 64, md: 128 },
            border: `solid 2px ${theme.vars.palette.common.white}`,
          }}
        >
          {name?.charAt(0).toUpperCase()}
        </Avatar>

        {extraContent && extraContent}
      </Stack>
    </Card>
  );
}
