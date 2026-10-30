import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { Label } from 'src/components/label';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import type { AccountIdentity } from './account-identity';

export type AccountButtonProps = ButtonBaseProps & {
  open: boolean;
  identity: AccountIdentity;
};

export function AccountButton({ open, identity, sx, ...other }: AccountButtonProps) {
  const { displayName, roleLabel, email, photoURL, initials } = identity;

  return (
    <Tooltip title={[displayName, roleLabel, email].filter(Boolean).join(' · ')}>
      <ButtonBase
        id="onboarding-user-profile"
        aria-label={`Account menu for ${displayName}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        sx={{
          p: 0.5,
          gap: 1.25,
          minHeight: 44,
          minWidth: 44,
          maxWidth: { xs: 44, md: 280 },
          borderRadius: 1,
          textAlign: 'left',
          flexShrink: 0,
          '&:hover': { bgcolor: 'action.hover' },
          '&.Mui-focusVisible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
          ...sx,
        }}
        {...other}
      >
        <Avatar
          src={photoURL}
          alt={displayName}
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.lighter',
            color: 'primary.darker',
            typography: 'subtitle2',
          }}
        >
          {initials}
        </Avatar>
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, minWidth: 0 }}>
          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Typography component="span" variant="subtitle2" noWrap sx={{ minWidth: 0 }}>
              {displayName}
            </Typography>
            {roleLabel && (
              <Label
                color="primary"
                data-slot="account-role"
                sx={{ maxWidth: 100, minWidth: 0, flexShrink: 0 }}
              >
                <Box
                  component="span"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.5,
                  }}
                >
                  {roleLabel}
                </Box>
              </Label>
            )}
          </Box>
          <Typography
            component="span"
            variant="caption"
            noWrap
            sx={{ display: 'block', color: 'text.secondary' }}
          >
            {email || 'Email unavailable'}
          </Typography>
        </Box>
      </ButtonBase>
    </Tooltip>
  );
}
