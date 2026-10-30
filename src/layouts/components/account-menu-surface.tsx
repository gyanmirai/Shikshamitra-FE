import type { ReactNode } from 'react';

import Drawer from '@mui/material/Drawer';
import { useResponsive } from 'src/hooks/use-responsive';
import { CustomPopover } from 'src/components/custom-popover';

type Props = {
  id: string;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  disableRestoreFocus: boolean;
  children: ReactNode;
};

export function AccountMenuSurface({
  id,
  anchorEl,
  onClose,
  disableRestoreFocus,
  children,
}: Props) {
  const desktop = useResponsive('up', 'md');
  const paper = {
    id,
    role: 'dialog',
    'aria-labelledby': `${id}-title`,
    'aria-modal': true as const,
    tabIndex: -1,
  };

  if (desktop) {
    return (
      <CustomPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        disableRestoreFocus={disableRestoreFocus}
        slotProps={{
          arrow: { hide: true },
          paper: {
            ...paper,
            sx: {
              width: 360,
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: 'calc(100dvh - 96px)',
              mt: 1,
              borderRadius: 2,
              overflowY: 'auto',
              bgcolor: 'background.paper',
            },
          },
        }}
      >
        {children}
      </CustomPopover>
    );
  }

  return (
    <Drawer
      anchor="bottom"
      open={Boolean(anchorEl)}
      onClose={onClose}
      ModalProps={{ disableRestoreFocus }}
      slotProps={{
        paper: {
          ...paper,
          sx: {
            maxHeight: 'calc(100dvh - 24px)',
            borderRadius: '20px 20px 0 0',
            overflowY: 'auto',
            pb: 'env(safe-area-inset-bottom)',
            bgcolor: 'background.paper',
          },
        },
      }}
    >
      {children}
    </Drawer>
  );
}
