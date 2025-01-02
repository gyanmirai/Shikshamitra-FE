import type { IconButtonOwnProps } from '@mui/material';

import React from 'react';

import { Box } from '@mui/material';

import { Iconify } from '../iconify';
import { usePopover, CustomPopover } from '../custom-popover';

import type { UsePopoverReturn } from '../custom-popover';

interface IThreeDotesActionsType {
  actions?: (e: IActionType) => React.ReactNode;
  onClickThreeDots?: (e: any) => void;
  onClosePopover?: () => void;
  handleViewClick?: (e: any) => void;
  handleEditClick?: (e: any) => void;
  handleDeleteClick?: (e: any) => void;
  showViewIcon?: boolean;
  showEditIcon?: boolean;
  showDeleteIcon?: boolean;
  showThreeDots?: boolean;
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

interface IActionType {
  popover: UsePopoverReturn;
}

const ThreeDotsActions = ({
  actions = (e: IActionType) => null,
  onClickThreeDots,
  onClosePopover,
  placement = 'left-top',
  showViewIcon = false,
  showEditIcon = false,
  showDeleteIcon = false,
  showThreeDots = true,
  handleViewClick = () => {},
  handleEditClick = () => {},
  handleDeleteClick = () => {},
  ...props
}: Omit<IconButtonOwnProps, 'onClick'> & IThreeDotesActionsType) => {
  const popover = usePopover();

  return (
    <Box display="flex" gap={2} alignItems="center" {...props}>
      {showViewIcon && (
        <Iconify
          icon="carbon:view-filled"
          sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            handleViewClick(e);
          }}
        />
      )}
      {showEditIcon && (
        <Iconify
          icon="solar:pen-bold"
          sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick(e);
          }}
        />
      )}
      {showDeleteIcon && (
        <Iconify
          icon="solar:trash-bin-trash-bold"
          color="error.main"
          sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(e);
          }}
        />
      )}
      {showThreeDots && (
        <Iconify
          icon="eva:more-vertical-fill"
          sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            popover.onOpen(e as any);
            onClickThreeDots?.(e);
          }}
        />
      )}
      {/* <IconButton
        color={popover.open ? 'inherit' : 'default'}
        onClick={(e) => {
          e.stopPropagation();
          popover.onOpen(e);
          onClickThreeDots?.(e);
        }}
        {...props}
      ></IconButton> */}
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={() => {
          popover.onClose();
          onClosePopover?.();
        }}
        slotProps={{ arrow: { placement } }}
      >
        {actions?.({ popover })}
      </CustomPopover>
    </Box>
  );
};

export default ThreeDotsActions;
