import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { varAlpha } from 'src/theme/styles';
import { today } from 'src/utils/format-time';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { AnimateAvatar } from 'src/components/animate';

// ----------------------------------------------------------------------

const user = {
  id: '8864c717-587d-472a-929a-8e5f298024da-0',
  role: 'admin',
  email: 'admin@example.com',
  address: '123 Main St, Anytown, USA',
  displayName: 'John Doe',
  name: 'John Doe',
  lastActivity: today(),
  photoURL: 'https://minimal-assets-api.vercel.app/assets/images/avatars/avatar_1.jpg',
  phoneNumber: '123-456-7890',
  status: 'online' as 'online' | 'offline' | 'alway' | 'busy',
};

export function CourseMyAccount({ ...other }: CardProps) {
  const theme = useTheme();

  const renderAvatar = (
    <AnimateAvatar
      width={96}
      slotProps={{
        avatar: { src: user?.photoURL, alt: user?.displayName },
        overlay: {
          border: 2,
          spacing: 3,
          color: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0)} 25%, ${theme.palette.primary.main} 100%)`,
        },
      }}
      sx={{ mb: 2 }}
    >
      {user?.displayName?.charAt(0).toUpperCase()}
    </AnimateAvatar>
  );

  return (
    <Card {...other}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        {renderAvatar}

        <Typography variant="subtitle1" noWrap sx={{ mb: 0.5 }}>
          {user?.displayName}
        </Typography>

        <Box
          sx={{
            gap: 0.5,
            display: 'flex',
            typography: 'body2',
            alignItems: 'center',
            color: 'text.secondary',
          }}
        >
          ID: 123987
          <IconButton size="small">
            <Iconify width={18} icon="solar:copy-bold" />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}
