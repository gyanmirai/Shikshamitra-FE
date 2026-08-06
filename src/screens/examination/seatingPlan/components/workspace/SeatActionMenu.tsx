import type { UsePopoverReturn } from 'src/components/custom-popover';

import { Iconify } from 'src/components/iconify';
import { MenuList, MenuItem, Typography } from '@mui/material';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

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
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
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
                py: 0.75,
                px: 1.25,
                gap: 1,
                '&:hover': {
                  bgcolor: 'error.lighter',
                },
              }}
            >
              <Iconify icon="mdi:account-remove-outline" width={18} />
              <Typography variant="body2" fontWeight={600}>
                Remove from Seat
              </Typography>
            </MenuItem>

            <MenuItem
              onClick={() => {
                popover.onClose();
                onAddNote();
              }}
              sx={{
                borderRadius: 1,
                py: 0.75,
                px: 1.25,
                mt: 0.5,
                gap: 1,
              }}
            >
              <Iconify icon="mdi:note-plus-outline" width={18} />
              <Typography variant="body2">Add Note</Typography>
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
                py: 0.75,
                px: 1.25,
                gap: 1,
              }}
            >
              <Iconify
                icon={isReserved ? 'mdi:lock-open-outline' : 'mdi:lock-outline'}
                width={18}
              />
              <Typography variant="body2">
                {isReserved ? 'Unreserve Seat' : 'Reserve Seat'}
              </Typography>
            </MenuItem>

            <MenuItem
              onClick={() => {
                popover.onClose();
                onAddNote();
              }}
              sx={{
                borderRadius: 1,
                py: 0.75,
                px: 1.25,
                mt: 0.5,
                gap: 1,
              }}
            >
              <Iconify icon="mdi:note-plus-outline" width={18} />
              <Typography variant="body2">Add Note</Typography>
            </MenuItem>
          </>
        )}
      </MenuList>
    </CustomPopover>
  );
}
