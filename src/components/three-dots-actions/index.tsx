import React from 'react';
import { Box, Tooltip, IconButton } from '@mui/material';

import { Iconify } from '../iconify';
import CustomTooltip from '../custom-tooltip';
import { usePopover, CustomPopover } from '../custom-popover';

import type { ThreeDotsActionsProps, ThreeDotsActionContext } from './types';

const COMPACT_ACTION_BUTTON_SX = { p: 0, width: 30, height: 30 } as const;

const ThreeDotsActions = ({
  actions = (_context: ThreeDotsActionContext) => null,
  directActions = [],
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
  onEditMouseDown,
  handleDeleteClick = () => {},
  ...props
}: ThreeDotsActionsProps) => {
  const popover = usePopover();
  return (
    <Box display="flex" gap={1} alignItems="center" {...props}>
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
              sx={COMPACT_ACTION_BUTTON_SX}
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
              onMouseDown={(e) => {
                e.stopPropagation();
                onEditMouseDown?.(e);
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(e);
              }}
              disabled={disableEditIcon}
              sx={COMPACT_ACTION_BUTTON_SX}
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
              sx={COMPACT_ACTION_BUTTON_SX}
            >
              <Iconify
                icon="solar:trash-bin-trash-bold"
                color={disableDeleteIcon ? 'action.disabled' : 'error.main'}
                sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
              />
            </IconButton>
          </span>
        </CustomTooltip>
      )}
      {directActions.map((action) => (
        <Tooltip key={action.id} title={action.tooltip ?? action.label}>
          <span>
            <IconButton
              aria-label={action.label}
              data-testid={`table-action-${action.id}`}
              onClick={(event) => {
                event.stopPropagation();
                action.onClick(event);
              }}
              disabled={action.disabled}
              sx={COMPACT_ACTION_BUTTON_SX}
            >
              <Iconify
                icon={action.icon}
                sx={{
                  height: '16px',
                  width: '16px',
                  color: action.disabled ? 'action.disabled' : action.color,
                  cursor: action.disabled ? 'default' : 'pointer',
                }}
              />
            </IconButton>
          </span>
        </Tooltip>
      ))}
      {showThreeDots && (
        <Tooltip title={moreLabel}>
          <IconButton
            aria-label={moreLabel}
            aria-haspopup="menu"
            aria-expanded={popover.open}
            data-testid="table-action-more"
            onClick={(e) => {
              e.stopPropagation();
              popover.onOpen(e);
              onClickThreeDots?.(e);
            }}
            sx={{ ...COMPACT_ACTION_BUTTON_SX, '& *': { pointerEvents: 'none' } }}
          >
            <Iconify
              icon="eva:more-vertical-fill"
              sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
            />
          </IconButton>
        </Tooltip>
      )}
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        onClose={() => {
          popover.onClose();
          onClosePopover?.();
        }}
        slotProps={{
          arrow: { placement },
        }}
      >
        {actions({ popover })}
      </CustomPopover>
    </Box>
  );
};

export default ThreeDotsActions;
