import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode, MouseEventHandler } from 'react';

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
  onClickThreeDots?: MouseEventHandler<HTMLButtonElement>;
  onClosePopover?: () => void;
  placement?: ThreeDotsActionsOptions['placement'];
  sx?: SxProps<Theme>;
}
