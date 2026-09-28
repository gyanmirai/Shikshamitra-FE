import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '../iconify';
import CustomTooltip from '../custom-tooltip';
import ThreeDotsActions from '../three-dots-actions';

import type { AdaptiveThreeDotsAction, AdaptiveThreeDotsActionsProps } from './types';

const DIRECT_ACTION_LIMIT = 3;

type OverflowActionMenuItemProps = {
  action: AdaptiveThreeDotsAction;
  onSelect: () => void;
};

function OverflowActionMenuItem({ action, onSelect }: OverflowActionMenuItemProps) {
  const menuItem = (
    <MenuItem
      disabled={action.disabled}
      data-testid={`menu-action-${action.id}`}
      onClick={onSelect}
      sx={{ color: action.disabled ? 'text.disabled' : action.color }}
    >
      <Iconify icon={action.icon} width={16} aria-hidden sx={{ mr: 1 }} />
      {action.label}
    </MenuItem>
  );

  if (!action.disabled || !action.tooltip) {
    return menuItem;
  }

  return (
    <CustomTooltip title={action.tooltip} arrow placement="left">
      <Box component="span" sx={{ display: 'block' }}>
        {menuItem}
      </Box>
    </CustomTooltip>
  );
}

const AdaptiveThreeDotsActions = ({
  actions,
  moreLabel = 'More actions',
  mobileDirectActionLimit,
  onClickThreeDots,
  onClosePopover,
  placement = 'left-top',
  sx,
}: AdaptiveThreeDotsActionsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (actions.length === 0) {
    return null;
  }

  const directActionLimit = isMobile ? mobileDirectActionLimit ?? DIRECT_ACTION_LIMIT : DIRECT_ACTION_LIMIT;
  const directActions = actions.slice(0, directActionLimit);
  const overflowActions = actions.slice(directActionLimit);
  const usesOverflowMenu = overflowActions.length > 0;

  return (
    <ThreeDotsActions
      key={usesOverflowMenu ? 'overflow' : 'direct'}
      actions={
        usesOverflowMenu
          ? ({ popover }) => (
              <MenuList dense autoFocusItem={popover.open} aria-label={moreLabel}>
                {overflowActions.map((action) => (
                  <OverflowActionMenuItem
                    key={action.id}
                    action={action}
                    onSelect={() => {
                      popover.onClose();
                      onClosePopover?.();
                      action.onClick();
                    }}
                  />
                ))}
              </MenuList>
            )
          : undefined
      }
      directActions={directActions}
      showThreeDots={usesOverflowMenu}
      moreLabel={moreLabel}
      onClickThreeDots={onClickThreeDots}
      onClosePopover={onClosePopover}
      placement={placement}
      sx={sx}
    />
  );
};

export type { AdaptiveThreeDotsAction, AdaptiveThreeDotsActionsProps } from './types';
export default AdaptiveThreeDotsActions;
