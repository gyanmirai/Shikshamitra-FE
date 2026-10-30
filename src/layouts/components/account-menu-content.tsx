import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import { stylesMode } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { SignOutButton } from './sign-out-button';
import { AccountSummary } from './account-summary';

import type { AccountIdentity } from './account-identity';

type Props = {
  identity: AccountIdentity;
  titleId: string;
  institutionName?: string;
  canUseSelfLeaveCenter: boolean;
  onClose: () => void;
  onPassword: () => void;
  onProfile: () => void;
  onLeaveCenter: () => void;
};

export function AccountMenuContent({
  identity,
  titleId,
  institutionName,
  canUseSelfLeaveCenter,
  onClose,
  onPassword,
  onProfile,
  onLeaveCenter,
}: Props) {
  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pl: 3, pr: 1, pt: 1 }}
      >
        <Typography id={titleId} component="h2" variant="subtitle1">
          My Account
        </Typography>
        <IconButton
          autoFocus
          aria-label="Close account menu"
          onClick={onClose}
          sx={{ width: 44, height: 44 }}
        >
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </Stack>
      <AccountSummary identity={identity} institutionName={institutionName} />
      <Divider />
      <MenuList
        aria-label="Account actions"
        sx={{ p: 1, '& .MuiMenuItem-root': { gap: 1.5, minHeight: 48, borderRadius: 1 } }}
      >
        {canUseSelfLeaveCenter &&
          [
            { label: 'Leave Center', icon: 'mdi:calendar-account', onClick: onLeaveCenter },
            { label: 'Profile', icon: 'mdi:user-box', onClick: onProfile },
          ].map((action) => (
            <MenuItem key={action.label} onClick={action.onClick}>
              <Iconify icon={action.icon} width={20} />
              {action.label}
            </MenuItem>
          ))}
        <MenuItem onClick={onPassword}>
          <Iconify icon="solar:key-minimalistic-outline" width={20} />
          Change Password
        </MenuItem>
      </MenuList>
      <Box sx={{ px: 1, pb: 1 }}>
        <SignOutButton
          onClose={onClose}
          variant="text"
          size="medium"
          startIcon={<Iconify icon="solar:logout-2-outline" width={20} />}
          sx={{
            justifyContent: 'flex-start',
            px: 2,
            minHeight: 48,
            color: 'error.dark',
            [stylesMode.dark]: { color: 'error.light' },
            '& .MuiButton-startIcon': { mr: 1.5 },
          }}
        />
      </Box>
    </>
  );
}
