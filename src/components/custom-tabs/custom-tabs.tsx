import type { RootState } from 'src/redux/store';
import type { TabsProps } from '@mui/material/Tabs';
import type { Theme, SxProps } from '@mui/material/styles';

import NoSsr from '@mui/material/NoSsr';
import { stylesMode } from 'src/theme/styles';
import { tabClasses } from '@mui/material/Tab';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

// ----------------------------------------------------------------------

export type CustomTabsProps = TabsProps & {
  /** Compact settings rows; touch pointers retain a 44 px tab target. */
  density?: 'standard' | 'compact';
  /** Disable only when tabs share one preserved form and its parent owns the leave guard. */
  guardUnsavedChanges?: boolean;
  slotProps?: TabsProps['slotProps'] & {
    scroller?: SxProps<Theme>;
    indicator?: SxProps<Theme>;
    tab?: SxProps<Theme>;
    selected?: SxProps<Theme>;
    scrollButtons?: SxProps<Theme>;
    flexContainer?: SxProps<Theme>;
  };
};

export function CustomTabs({
  children,
  slotProps,
  sx,
  onChange,
  orientation = 'horizontal',
  density = 'standard',
  guardUnsavedChanges = true,
  ...other
}: CustomTabsProps) {
  const theme = useTheme();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const isVertical = orientation === 'vertical';
  const isCompact = density === 'compact';

  return (
    <Tabs
      orientation={orientation}
      sx={{
        gap: { sm: 0 },
        minHeight: 44,
        flexShrink: 0,
        backgroundColor: theme.vars.palette.background.paper,
        alignItems: isVertical ? 'flex-start' : 'center',
        [`& .${tabsClasses.scroller}`]: {
          px: 1,
          py: isCompact ? 0.5 : 1,
          ...slotProps?.scroller,
        },
        [`& .${tabsClasses.flexContainer}`]: {
          gap: 0,
          ...slotProps?.flexContainer,
        },
        [`& .${tabsClasses.scrollButtons}`]: {
          borderRadius: 1,
          minHeight: 'inherit',
          ...slotProps?.scrollButtons,
        },
        [`& .${tabsClasses.indicator}`]: {
          ...(isVertical
            ? {
                px: isCompact ? 0.5 : 1,
                width: 1,
                left: 0,
                right: 'auto',
              }
            : {
                py: isCompact ? 0.5 : 1,
                height: 1,
              }),
          bgcolor: 'transparent',
          '& > span': {
            width: 1,
            height: 1,
            borderRadius: 1,
            display: 'block',
            bgcolor: theme.palette.divider,
            boxShadow: theme.customShadows.z1,
            [stylesMode.dark]: { bgcolor: 'grey.900' },
            ...slotProps?.indicator,
          },
        },
        [`& .${tabClasses.root}`]: {
          py: isCompact ? 0.5 : 1,
          px: isCompact ? 1.5 : 2,
          zIndex: 1,
          minHeight: isCompact ? 36 : 44,
          ...(isCompact && {
            '@media (any-pointer: coarse)': { minHeight: 44 },
          }),
          ...(isVertical && {
            width: 1,
            alignItems: 'flex-start',
            textAlign: 'left',
          }),
          ...slotProps?.tab,
          [`&.${tabClasses.selected}`]: {
            ...slotProps?.selected,
          },
        },
        ...sx,
      }}
      onChange={(e, val) => {
        if (!guardUnsavedChanges) {
          onChange?.(e, val);
          return;
        }
        if (isChanges && window.confirm('Are you sure you want to leave this page?')) {
          onChange?.(e, val);
          dispatch(setIsChanges(false));
        } else if (!isChanges) {
          onChange?.(e, val);
        }
      }}
      {...other}
      TabIndicatorProps={{
        children: (
          <NoSsr>
            <span />
          </NoSsr>
        ),
      }}
    >
      {children}
    </Tabs>
  );
}
