import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

import type { AccountIdentity } from './account-identity';

export function AccountSummary({
  identity,
  institutionName,
}: {
  identity: AccountIdentity;
  institutionName?: string;
}) {
  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1.75} sx={{ px: 3, pt: 1.5, pb: 2 }}>
        <Avatar
          src={identity.photoURL}
          alt={identity.displayName}
          sx={{
            width: 56,
            height: 56,
            bgcolor: 'primary.lighter',
            color: 'primary.darker',
            typography: 'h6',
          }}
        >
          {identity.initials}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
            {identity.displayName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}>
            {identity.email || 'Email unavailable'}
          </Typography>
        </Box>
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ px: 3, pb: 2 }}
      >
        <Typography variant="caption" color="text.secondary">
          Role
        </Typography>
        <Label
          color="primary"
          data-slot="account-role"
          sx={{
            height: 'auto',
            minHeight: 24,
            lineHeight: 1.5,
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
            textAlign: 'right',
            py: 0.25,
          }}
        >
          {identity.roleLabel || 'Role unavailable'}
        </Label>
      </Stack>
      {institutionName && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ mx: 3, mb: 2.5, p: 1.5, borderRadius: 1, bgcolor: 'background.neutral' }}
        >
          <Iconify
            icon="solar:buildings-2-outline"
            width={22}
            sx={{ color: 'text.secondary', flexShrink: 0 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              Institution
            </Typography>
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {institutionName}
            </Typography>
          </Box>
        </Stack>
      )}
    </>
  );
}
