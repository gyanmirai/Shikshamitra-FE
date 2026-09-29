import type { ReactNode, MouseEventHandler } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import type { ThreeDotsActionsOptions } from '../three-dots-actions/types';

export interface AdaptiveThreeDotsAction {
  id: string;
  label: string;
  icon: string;
  color?: string;
  disabled?: boolean;
  tooltip?: ReactNode;
  onClick: () => void;
}

export interface AdaptiveThreeDotsActionsProps {
  actions: readonly AdaptiveThreeDotsAction[];
  moreLabel?: string;
  mobileDirectActionLimit?: 0 | 1 | 2 | 3;
  onClickThreeDots?: MouseEventHandler<HTMLButtonElement>;
  onClosePopover?: () => void;
  placement?: ThreeDotsActionsOptions['placement'];
  sx?: SxProps<Theme>;
}
