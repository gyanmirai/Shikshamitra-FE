import type { UsePopoverReturn } from 'src/components/custom-popover';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { MenuList, MenuItem, ListItemText, ListItemIcon } from '@mui/material';

interface Props {
  hasStudent: boolean;
  isReserved?: boolean;
  onRemove: () => void;
  onReserve: () => void;
  onAddNote: () => void;
}

export function useSeatActionPopover(): UsePopoverReturn {
  return usePopover();
}

export default function SeatActionMenu({
  hasStudent,
  isReserved,
  onRemove,
  onReserve,
  onAddNote,
  popover,
}: Props & { popover: UsePopoverReturn }) {
  return (
    <CustomPopover
      open={popover.open}
      anchorEl={popover.anchorEl}
      onClose={popover.onClose}
      slotProps={{
        paper: {
          sx: {
            minWidth: 160,
            borderRadius: 1.5,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            p: 0.5,
          },
        },
      }}
    >
      <MenuList sx={{ p: 0 }}>
        {hasStudent ? (
          <>
            <MenuItem
              onClick={() => {
                popover.onClose();
                onRemove();
              }}
              sx={{
                borderRadius: 1,
                color: 'error.main',
                py: 1,
                px: 1.5,
                '&:hover': {
                  bgcolor: 'error.lighter',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: '32px !important' }}>
                <Iconify icon="mdi:account-remove-outline" width={18} />
              </ListItemIcon>
              <ListItemText primary="Remove from Seat" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
            </MenuItem>

            <MenuItem
              onClick={() => {
                popover.onClose();
                onAddNote();
              }}
              sx={{
                borderRadius: 1,
                py: 1,
                px: 1.5,
                mt: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: '32px !important' }}>
                <Iconify icon="mdi:note-plus-outline" width={18} />
              </ListItemIcon>
              <ListItemText primary="Add Note" primaryTypographyProps={{ variant: 'body2' }} />
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem
              onClick={() => {
                popover.onClose();
                onReserve();
              }}
              sx={{
                borderRadius: 1,
                py: 1,
                px: 1.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: '32px !important' }}>
                <Iconify icon={isReserved ? 'mdi:lock-open-outline' : 'mdi:lock-outline'} width={18} />
              </ListItemIcon>
              <ListItemText primary={isReserved ? 'Unreserve Seat' : 'Reserve Seat'} primaryTypographyProps={{ variant: 'body2' }} />
            </MenuItem>

            <MenuItem
              onClick={() => {
                popover.onClose();
                onAddNote();
              }}
              sx={{
                borderRadius: 1,
                py: 1,
                px: 1.5,
                mt: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: '32px !important' }}>
                <Iconify icon="mdi:note-plus-outline" width={18} />
              </ListItemIcon>
              <ListItemText primary="Add Note" primaryTypographyProps={{ variant: 'body2' }} />
            </MenuItem>
          </>
        )}
      </MenuList>
    </CustomPopover>
  );
}
