import type { ReactNode, MouseEventHandler } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import type { ThreeDotsActionsOptions } from '../three-dots-actions/types';

export interface AdaptiveThreeDotsAction {
  id: string;
  label: string;
  icon: string;
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  tooltip?: ReactNode;
  onClick: () => void;
}

export interface AdaptiveThreeDotsActionsProps {
  actions: readonly AdaptiveThreeDotsAction[];
  moreLabel?: string;
  /** Put the complete action set in the menu when it exceeds the direct-action limit. */
  collapseOnOverflow?: boolean;
  directActionLimit?: 0 | 1 | 2;
  mobileDirectActionLimit?: 0 | 1 | 2;
  onClickThreeDots?: MouseEventHandler<HTMLButtonElement>;
  onClosePopover?: () => void;
  placement?: ThreeDotsActionsOptions['placement'];
  sx?: SxProps<Theme>;
}
