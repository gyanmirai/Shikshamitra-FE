'use client';

import type { ReactNode } from 'react';

import { Close } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import HelpTooltip from 'src/components/help-tooltip';
import CustomDialog from 'src/components/customDialog';
import { Box, Drawer, Divider, IconButton } from '@mui/material';

type SubstitutionCreationOverlayProps = {
  open: boolean;
  displayAsDrawer: boolean;
  title: ReactNode;
  titleInfo?: string;
  children: ReactNode;
  onClose: () => void;
  disableClose?: boolean;
  closeLabel?: string;
};

export function SubstitutionCreationOverlay({
  open,
  displayAsDrawer,
  title,
  titleInfo,
  children,
  onClose,
  disableClose = false,
  closeLabel = 'Close create substitution drawer',
}: SubstitutionCreationOverlayProps) {
  if (!displayAsDrawer) {
    return (
      <CustomDialog
        open={open}
        title={title}
        titleInfo={titleInfo}
        maxWidth="md"
        handleClose={onClose}
        disableClose={disableClose}
      >
        {children}
      </CustomDialog>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={disableClose ? undefined : onClose}
      aria-labelledby="create-substitution-drawer-title"
      sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 880 },
          maxWidth: '100vw',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        },
      }}
    >
      <Box
        component="form"
        onSubmit={(event) => event.preventDefault()}
        sx={{ minHeight: 0, height: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Box
          sx={{
            px: 2,
            py: 2.1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            bgcolor: 'background.paper',
            flexShrink: 0,
          }}
        >
          <Box
            id="create-substitution-drawer-title"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            {title}
            {titleInfo && (
              <HelpTooltip label="Create substitution information" title={titleInfo}>
                <Iconify icon="lucide:info" width={16} />
              </HelpTooltip>
            )}
          </Box>
          <IconButton aria-label={closeLabel} onClick={onClose} disabled={disableClose}>
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
        <Divider />
        {children}
      </Box>
    </Drawer>
  );
}
