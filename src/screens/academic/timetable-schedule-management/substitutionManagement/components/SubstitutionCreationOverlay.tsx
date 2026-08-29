'use client';

import type { ReactNode } from 'react';

import { Close } from '@mui/icons-material';
import CustomDialog from 'src/components/customDialog';
import { Box, Drawer, Divider, IconButton } from '@mui/material';

type SubstitutionCreationOverlayProps = {
  open: boolean;
  displayAsDrawer: boolean;
  title: ReactNode;
  children: ReactNode;
  onClose: () => void;
};

export function SubstitutionCreationOverlay({
  open,
  displayAsDrawer,
  title,
  children,
  onClose,
}: SubstitutionCreationOverlayProps) {
  if (!displayAsDrawer) {
    return (
      <CustomDialog open={open} title={title} maxWidth="md" handleClose={onClose}>
        {children}
      </CustomDialog>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
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
          <Box id="create-substitution-drawer-title">{title}</Box>
          <IconButton aria-label="Close create substitution drawer" onClick={onClose}>
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
        <Divider />
        {children}
      </Box>
    </Drawer>
  );
}
