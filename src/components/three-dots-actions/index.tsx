import type { IconButtonOwnProps } from '@mui/material';

import React from 'react';

import { IconButton } from '@mui/material';

import { Iconify } from '../iconify';
import { usePopover, CustomPopover } from '../custom-popover';

import type { UsePopoverReturn } from '../custom-popover';

interface IThreeDotesActionsType {
  actions: ({ popover }: { popover: UsePopoverReturn }) => React.ReactNode;
  onClickThreeDots?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onClosePopover?: () => void;
  placement?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
    | 'left-top'
    | 'left-center'
    | 'left-bottom'
    | 'right-top'
    | 'right-center'
    | 'right-bottom'
    | undefined;
}

const ThreeDotsActions = ({
  actions,
  onClickThreeDots,
  onClosePopover,
  placement = 'left-top',
  ...props
}: Omit<IconButtonOwnProps, 'onClick'> & IThreeDotesActionsType) => {
  const popover = usePopover();

  return (
    <>
      <IconButton
        color={popover.open ? 'inherit' : 'default'}
        onClick={(e) => {
          e.stopPropagation();
          popover.onOpen(e);
          onClickThreeDots?.(e);
        }}
        {...props}
      >
        <Iconify icon="eva:more-vertical-fill" sx={{ height: '16px', width: '16px' }} />
      </IconButton>
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={() => {
          popover.onClose();
          onClosePopover?.();
        }}
        slotProps={{ arrow: { placement } }}
      >
        {actions({ popover })}
      </CustomPopover>
    </>
  );
};

export default ThreeDotsActions;
