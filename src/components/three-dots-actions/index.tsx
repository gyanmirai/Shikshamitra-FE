import type { IconButtonOwnProps } from '@mui/material';

import React, { useMemo } from 'react';
import { Box, Tooltip, IconButton } from '@mui/material';

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
  viewIcon?: string;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  moreLabel?: string;
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
  viewIcon = 'carbon:view-filled',
  viewLabel = 'View',
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  moreLabel = 'More actions',
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
        <Tooltip title={viewLabel}>
          <span>
            <IconButton
              aria-label={viewLabel}
              data-testid="table-action-view"
              onClick={(e) => {
                e.stopPropagation();
                handleViewClick(e);
              }}
              disabled={disableViewIcon}
              sx={{ p: 0 }}
            >
              <Iconify icon={viewIcon} sx={{ height: '16px', width: '16px', cursor: 'pointer' }} />
            </IconButton>
          </span>
        </Tooltip>
      )}
      {showEditIcon && (
        <Tooltip title={editLabel}>
          <span>
            <IconButton
              aria-label={editLabel}
              data-testid="table-action-edit"
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(e);
              }}
              disabled={disableEditIcon}
              sx={{ p: 0 }}
            >
              <Iconify
                icon="solar:pen-bold"
                sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
              />
            </IconButton>
          </span>
        </Tooltip>
      )}
      {showDeleteIcon && (
        <CustomTooltip
          title={
            disableDeleteIcon
              ? 'This item cannot be deleted because it is already used in other parts of the system. Please remove all references first.'
              : deleteLabel
          }
          placement="top"
        >
          <span>
            <IconButton
              aria-label={deleteLabel}
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
        <Tooltip title={moreLabel}>
          <IconButton
            aria-label={moreLabel}
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
        </Tooltip>
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
