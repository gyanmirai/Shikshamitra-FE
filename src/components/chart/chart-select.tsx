import type { Theme, SxProps } from '@mui/material/styles';

import { useId, useRef } from 'react';
import { varAlpha } from 'src/theme/styles';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { Iconify } from 'src/components/iconify';
import ButtonBase from '@mui/material/ButtonBase';
import { focusAdjacentControl } from 'src/utils/dropdown-focus';

import { Scrollbar } from '../scrollbar';
import { usePopover, CustomPopover } from '../custom-popover';

// ----------------------------------------------------------------------

type Props = {
  options: string[];
  value: string;
  onChange: (newValue: string) => void;
  slotProps?: {
    button?: SxProps<Theme>;
    popover?: SxProps<Theme>;
  };
};

export function ChartSelect({ options, value, onChange, slotProps, ...other }: Props) {
  const popover = usePopover();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <ButtonBase
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={popover.open}
        aria-controls={popover.open ? menuId : undefined}
        onClick={popover.onOpen}
        sx={{
          pr: 1,
          pl: 1.5,
          gap: 1.5,
          height: 34,
          borderRadius: 1,
          typography: 'subtitle2',
          border: (theme) => `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.24)}`,
          ...slotProps?.button,
        }}
        {...other}
      >
        {value}

        <Iconify
          width={16}
          icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
        />
      </ButtonBase>

      <CustomPopover open={popover.open} anchorEl={popover.anchorEl} onClose={popover.onClose}>
        <Scrollbar
          sx={{
            maxHeight: 200, // Set a fixed height or max-height to make it scrollable
            overflowY: 'auto', // Enable vertical scrolling
            overflowX: 'hidden',
            width: 150,
          }}
        >
          <MenuList
            id={menuId}
            autoFocusItem
            sx={slotProps?.popover}
            onKeyDownCapture={(event) => {
              if (
                event.key !== 'Tab' ||
                event.altKey ||
                event.ctrlKey ||
                event.metaKey ||
                event.nativeEvent.isComposing
              ) {
                return;
              }

              event.preventDefault();
              event.stopPropagation();

              if (
                !event.shiftKey &&
                event.target instanceof HTMLElement &&
                event.target.matches('[role="menuitem"]:not([aria-disabled="true"])')
              ) {
                event.target.click();
              }

              popover.onClose();
              if (triggerRef.current) focusAdjacentControl(triggerRef.current, event.shiftKey);
            }}
          >
            {options.map((option) => (
              <MenuItem
                key={option}
                selected={option === value}
                onClick={() => {
                  popover.onClose();
                  onChange(option);
                }}
              >
                {option}
              </MenuItem>
            ))}
          </MenuList>
        </Scrollbar>
      </CustomPopover>
    </>
  );
}
