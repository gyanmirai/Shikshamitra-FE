import type { RootState } from 'src/redux/store';
import type { Breakpoint } from '@mui/material/styles';
import type { NavSectionProps } from 'src/components/nav-section';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { Scrollbar } from 'src/components/scrollbar';
import { Logo, LogoWithText } from 'src/components/logo';
import { varAlpha, hideScrollY } from 'src/theme/styles';
import { hostTenantPath } from 'src/constants/host-tenant-menu';
import { NavSectionMini, NavSectionVertical } from 'src/components/nav-section';

import { settingMenu } from '../config-nav-dashboard';
import { NavToggleButton } from '../components/nav-toggle-button';

// ----------------------------------------------------------------------

export type NavVerticalProps = NavSectionProps & {
  isNavMini: boolean;
  layoutQuery: Breakpoint;
  onToggleNav: () => void;
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
};

export function NavVertical({
  sx,
  data,
  slots,
  isNavMini,
  layoutQuery,
  onToggleNav,
  ...other
}: NavVerticalProps) {
  const theme = useTheme();
  const { mainModuleVisibility, sessionContext } = useSelector((state: RootState) => state.auth);
  const isHost = sessionContext?.accountMode === 'host';

  const filteredData = useMemo(
    () =>
      data.map((group) => ({
        ...group,
        items: group.items.filter((item) => item._action !== 'setting'),
      })),
    [data]
  );

  const renderNavVertical = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 0',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {slots?.topArea ?? (
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1, flexShrink: 0 }}>
          <LogoWithText href={isHost ? hostTenantPath : '/'} />
        </Box>
      )}
      <Box
        sx={{
          flex: '1 1 0',
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Scrollbar fillContent>
          <NavSectionVertical data={filteredData} sx={{ px: 2 }} {...other} />
        </Scrollbar>
      </Box>
      {slots?.bottomArea}
      {/* Bottom section (Institute Setup) will be rendered outside this Box */}
    </Box>
  );

  const renderNavMini = (
    <>
      {slots?.topArea ?? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.5, flexShrink: 0 }}>
          <Logo href={isHost ? hostTenantPath : '/dashboard'} />
        </Box>
      )}

      <NavSectionMini
        data={filteredData}
        sx={{ pb: 2, px: 0.5, ...hideScrollY, flex: '1 1 0', minHeight: 0, overflowY: 'auto' }}
        {...other}
      />

      {slots?.bottomArea}
    </>
  );

  return (
    <Box
      id="onboarding-sidebar"
      sx={{
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        bgcolor: 'var(--layout-nav-bg)',
        zIndex: 'var(--layout-nav-zIndex)',
        width: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)})`,
        transition: theme.transitions.create(['width'], {
          easing: 'var(--layout-transition-easing)',
          duration: 'var(--layout-transition-duration)',
        }),
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      {!isHost && (
        <NavToggleButton
          isNavMini={isNavMini}
          onClick={onToggleNav}
          sx={{
            display: 'none',
            [theme.breakpoints.up(layoutQuery)]: {
              display: 'inline-flex',
            },
          }}
        />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0 }}>
        {isNavMini ? renderNavMini : renderNavVertical}
        {/* Bottom section (Institute Setup) pinned to bottom */}
        {!isHost && (
          <Box sx={{ width: '100%', flexShrink: 0 }}>
            {isNavMini ? (
              <NavSectionMini
                data={[{ items: [{ ...settingMenu, visibility: mainModuleVisibility[14] }] }]}
                sx={{
                  pb: 2,
                  px: 0.5,
                  ...hideScrollY,
                  overflowY: 'hidden',
                  borderTop: `4px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey['100Channel'], 0.2)})`,
                  '& ul': {
                    justifyContent: 'end',
                  },
                }}
              />
            ) : (
              <NavSectionVertical
                data={[{ items: [{ ...settingMenu, visibility: mainModuleVisibility[14] }] }]}
                sx={{
                  px: 2,
                  borderTop: `1px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)})`,
                }}
                {...other}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
