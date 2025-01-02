import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';
import ListItemText from '@mui/material/ListItemText';
import { Card, IconButton, Typography } from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

import { Label } from 'src/components/label';

export type IUserProfileCover = {
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  setSearchParams: (value: Record<string, string>) => void;
};

// ----------------------------------------------------------------------

export function ProfileCover({
  name,
  avatarUrl,
  role,
  coverUrl,
  setSearchParams,
}: IUserProfileCover) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        // ...bgGradient({
        //   color: `0deg, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.8)}, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.8)}`,
        //   imgUrl: coverUrl,
        // }),
        bgcolor: theme.vars.palette.action.selected,
        height: 1,
        color: 'text.primary',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <IconButton
          sx={{ height: '40px', width: '40px', p: 0 }}
          onClick={() => setSearchParams({ isSearch: '', student: '', searchValue: '' })}
        >
          <KeyboardBackspaceIcon sx={{ color: 'primary.main' }} />
        </IconButton>
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
      </Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{ pl: 1 }}
        // sx={{
        //   left: { md: 24 },
        //   bottom: { md: 50 },
        //   zIndex: { md: 10 },
        //   pt: { xs: 6, md: 0 },
        //   position: { md: 'absolute' },
        // }}
      >
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

        <Box sx={{ mt: 3, ml: { md: 3 }, textAlign: { xs: 'center', md: 'unset' } }}>
          <ListItemText
            sx={{ textAlign: { xs: 'center', md: 'unset' } }}
            primary={name}
            secondary={role}
            primaryTypographyProps={{ typography: 'h4' }}
            secondaryTypographyProps={{
              mt: 0.5,
              color: 'inherit',
              component: 'span',
              typography: 'body2',
              sx: { opacity: 0.48 },
            }}
          />
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="caption">GR01</Typography>
            <Typography variant="caption" fontWeight="bold">
              <Label variant="soft" color="info">
                GSEB
              </Label>
              &nbsp;
              <Label variant="soft" color="info">
                ENG-Primary
              </Label>
            </Typography>

            <Typography variant="caption" fontWeight="bold" mt={1}>
              <Label variant="soft" color="success">
                Active
              </Label>
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Card>
  );
}
