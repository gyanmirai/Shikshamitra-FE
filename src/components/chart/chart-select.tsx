import type { Theme, SxProps } from '@mui/material/styles';

import { varAlpha } from 'src/theme/styles';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { Iconify } from 'src/components/iconify';
import ButtonBase from '@mui/material/ButtonBase';

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

  return (
    <>
      <ButtonBase
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
          <MenuList sx={slotProps?.popover}>
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
