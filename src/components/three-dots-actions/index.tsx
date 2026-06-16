import type { IconButtonOwnProps } from '@mui/material';

import React, { useMemo } from 'react';
import { Box, IconButton } from '@mui/material';

import { Iconify } from '../iconify';
import CustomTooltip from '../custom-tooltip';
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
  disableDeleteIcon?: boolean;
  disableEditIcon?: boolean;
  disableViewIcon?: boolean;
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
  disableDeleteIcon = false,
  disableEditIcon = false,
  disableViewIcon = false,
  handleViewClick = () => {},
  handleEditClick = () => {},
  handleDeleteClick = () => {},
  ...props
}: Omit<IconButtonOwnProps, 'onClick'> & IThreeDotesActionsType) => {
  const popover = usePopover();
  const ActionComponent = useMemo(() => actions, [actions]);
  return (
    <Box display="flex" gap={2} alignItems="center" {...props}>
      {showViewIcon && (
        <IconButton
          data-testid="table-action-view"
          onClick={(e) => {
            e.stopPropagation();
            handleViewClick(e);
          }}
          sx={{ p: 0 }}
        >
          <Iconify
            icon="carbon:view-filled"
            sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
          />
        </IconButton>
      )}
      {showEditIcon && (
        <IconButton
          data-testid="table-action-edit"
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick(e);
          }}
          sx={{ p: 0 }}
        >
          <Iconify
            icon="solar:pen-bold"
            sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
          />
        </IconButton>
      )}
      {showDeleteIcon && (
        <CustomTooltip
          title={
            disableDeleteIcon
              ? 'This item cannot be deleted because it is already used in other parts of the system. Please remove all references first.'
              : ''
          }
          placement="top"
        >
          <span>
            <IconButton
              data-testid="table-action-delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(e);
              }}
              disabled={disableDeleteIcon}
              sx={{ p: 0 }}
            >
              <Iconify
                icon="solar:trash-bin-trash-bold"
                color={disableDeleteIcon ? 'default' : 'error.main'}
                sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
              />
            </IconButton>
          </span>
        </CustomTooltip>
      )}
      {showThreeDots && (
        <IconButton
          data-testid="table-action-more"
          onClick={(e) => {
            e.stopPropagation();
            popover.onOpen(e as any);
            onClickThreeDots?.(e);
          }}
          sx={{ p: 0 }}
        >
          <Iconify
            icon="eva:more-vertical-fill"
            sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
          />
        </IconButton>
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
        slotProps={{
          arrow: { placement },
          // sx: {
          //   top: 8,
          //   right: -4,
          //   zIndex: 1000,
          // },
        }}
      >
        <ActionComponent popover={popover} />
      </CustomPopover>
      {/* <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={() => {
          popover.onClose();
          onClosePopover?.();
        }}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: { mt: 0 }, // optional tweak
        }}
      >
        {actions?.({ popover })}
      </CustomPopover> */}
    </Box>
  );
};

export default ThreeDotsActions;
