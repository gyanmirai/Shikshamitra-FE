'use client';

import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export type WorkspacesPopoverProps = ButtonBaseProps & {
  workspace: {
    id?: string;
    name?: string;
    logo?: string;
    plan?: string;
  };
  setWorkspace: (workspace: { id: string; name: string; logo: string; plan: string }) => void;
  data?: {
    id: string;
    name: string;
    logo: string;
    plan: string;
  }[];
};

export function WorkspacesPopover({
  data = [],
  sx,
  workspace,
  setWorkspace,
  ...other
}: WorkspacesPopoverProps) {
  const popover = usePopover();

  const mediaQuery = 'sm';

  const handleChangeWorkspace = useCallback(
    (newValue: (typeof data)[0]) => {
      setWorkspace(newValue);
      popover.onClose();
    },
    [popover, setWorkspace]
  );

  return (
    <>
      <ButtonBase
        disableRipple
        onClick={popover.onOpen}
        sx={{
          p: 0.5,
          gap: { xs: 0.5, [mediaQuery]: 1 },
          border: (theme) => `dashed 1px ${theme.vars.palette.success.main}`,
          borderRadius: 1,
          zIndex: 0,
          ...sx,
        }}
        {...other}
      >
        {/* <Box
          component="img"
          alt={workspace?.name}
          src={`${CONFIG.site.basePath}/assets/icons/workspaces/year.svg`}
          sx={{ width: 24, height: 24, borderRadius: '50%' }}
        /> */}
        <Iconify width={20} icon="uil:calender" sx={{ color: 'primary.main' }} />
        <Box
          component="span"
          sx={{
            typography: 'subtitle2',
            display: { xs: 'none', [mediaQuery]: 'inline-flex' },
          }}
        >
          {workspace?.name}
        </Box>

        {/* <Label
          color={workspace?.plan === 'Free' ? 'default' : 'info'}
          sx={{
            height: 22,
            display: { xs: 'none', [mediaQuery]: 'inline-flex' },
          }}
        >
          {workspace?.plan}
        </Label> */}

        <Iconify width={16} icon="carbon:chevron-sort" sx={{ color: 'primary.main' }} />
      </ButtonBase>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'top-left' } }}
      >
        <MenuList sx={{ width: 240 }}>
          {data.length ? (
            data.map((option) => (
              <MenuItem
                key={option.id}
                selected={option.id === workspace?.id}
                onClick={() => handleChangeWorkspace(option)}
                sx={{ height: 32 }}
              >
                {/* <Avatar alt={option.name} src={option.logo} sx={{ width: 24, height: 24 }} /> */}

                <Box component="span" sx={{ flexGrow: 1 }}>
                  {option.name}
                </Box>

                {/* <Label color={option.plan === 'Free' ? 'default' : 'info'}>{option.plan}</Label> */}
              </MenuItem>
            ))
          ) : (
            <MenuItem>No Academic Year Available</MenuItem>
          )}
        </MenuList>
      </CustomPopover>
    </>
  );
}
