import type { IconButtonOwnProps } from '@mui/material';
import type { ReactNode, MouseEventHandler } from 'react';

import type { UsePopoverReturn } from '../custom-popover';

export interface ThreeDotsActionContext {
  popover: UsePopoverReturn;
}

export interface ThreeDotsDirectAction {
  id: string;
  label: string;
  icon: string;
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export interface ThreeDotsActionsOptions {
  actions?: (context: ThreeDotsActionContext) => ReactNode;
  directActions?: readonly ThreeDotsDirectAction[];
  onClickThreeDots?: MouseEventHandler<HTMLButtonElement>;
  onClosePopover?: () => void;
  handleViewClick?: MouseEventHandler<HTMLButtonElement>;
  handleEditClick?: MouseEventHandler<HTMLButtonElement>;
  onEditMouseDown?: MouseEventHandler<HTMLButtonElement>;
  handleDeleteClick?: MouseEventHandler<HTMLButtonElement>;
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
    | 'right-bottom';
}

export type ThreeDotsActionsProps = Omit<IconButtonOwnProps, 'onClick'> & ThreeDotsActionsOptions;
