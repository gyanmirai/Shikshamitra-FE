'use client';

import type { RootState } from 'src/redux/store';
import type { NavSectionProps } from 'src/components/nav-section';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { useSelector } from 'react-redux';
import { Logo } from 'src/components/logo';
import { useSession } from 'next-auth/react';
import { dashboardPath } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { Skeleton, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetTenantByIdQuery } from 'src/redux/tenant/tenantApi';

import { HeaderSection } from './header-section';
import { Searchbar } from '../components/searchbar';
import { MenuButton } from '../components/menu-button';
import { SignInButton } from '../components/sign-in-button';
import { AccountDrawer } from '../components/account-drawer';
import { SettingsButton } from '../components/settings-button';
import GlobalAcademicSearch from '../components/global-academic-search/route-aware-search';
import { type WorkspacesPopoverProps } from '../components/workspaces-popover';
import {
  NotificationsDrawer,
  type NotificationsDrawerProps,
} from '../components/notifications-drawer';

import type { HeaderSectionProps } from './header-section';
import type { AccountDrawerProps } from '../components/account-drawer';
import type { ContactsPopoverProps } from '../components/contacts-popover';
import type { LanguagePopoverProps } from '../components/language-popover';

// ----------------------------------------------------------------------

const StyledDivider = styled('span')(({ theme }) => ({
  width: 1,
  height: 10,
  flexShrink: 0,
  display: 'none',
  position: 'relative',
  alignItems: 'center',
  flexDirection: 'column',
  marginLeft: theme.spacing(2.5),
  marginRight: theme.spacing(2.5),
  backgroundColor: 'currentColor',
  color: theme.vars.palette.divider,
  '&::before, &::after': {
    top: -5,
    width: 3,
    height: 3,
    content: '""',
    flexShrink: 0,
    borderRadius: '50%',
    position: 'absolute',
    backgroundColor: 'currentColor',
  },
  '&::after': { bottom: -5, top: 'auto' },
}));

// ----------------------------------------------------------------------

export type HeaderBaseProps = HeaderSectionProps & {
  onOpenNav: () => void;
  data?: {
    nav?: NavSectionProps['data'];
    account?: AccountDrawerProps['data'];
    langs?: LanguagePopoverProps['data'];
    contacts?: ContactsPopoverProps['data'];
    workspaces?: WorkspacesPopoverProps['data'];
    notifications?: NotificationsDrawerProps['data'];
  };
  slots?: {
    navMobile?: {
      topArea?: React.ReactNode;
      bottomArea?: React.ReactNode;
    };
  };
  slotsDisplay?: {
    signIn?: boolean;
    account?: boolean;
    helpLink?: boolean;
    settings?: boolean;
    purchase?: boolean;
    contacts?: boolean;
    searchbar?: boolean;
    workspaces?: boolean;
    menuButton?: boolean;
    localization?: boolean;
    notifications?: boolean;
  };
};

export function HeaderBase({
  sx,
  data,
  slots,
  slotProps,
  onOpenNav,
  layoutQuery,
  slotsDisplay: {
    signIn = true,
    account = true,
    helpLink = true,
    settings = true,
    purchase = true,
    contacts = true,
    searchbar = true,
    workspaces = true,
    menuButton = true,
    localization = true,
    notifications = true,
  } = {},
  ...other
}: HeaderBaseProps) {
  const theme = useTheme();
  const session: any = useSession();
  const { data: user } = session;
  const isHost = useSelector(
    (state: RootState) => state.auth.sessionContext?.accountMode === 'host'
  );

  const { data: tenantData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetTenantByIdQuery,
    params: user?.profile?.tenantid,
    options: {
      skip: !user?.profile?.tenantid,
    },
  });
  const schoolName = isHost ? 'Platform administrator' : tenantData?.extraProperties?.InstituteName;

  return (
    <HeaderSection
      sx={sx}
      layoutQuery={layoutQuery}
      slots={{
        ...slots,
        leftAreaStart: slots?.leftAreaStart,
        leftArea: (
          <>
            {slots?.leftAreaStart}

            {/* -- Menu button -- */}
            {menuButton && (
              <MenuButton
                data-slot="menu-button"
                onClick={onOpenNav}
                sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
              />
            )}

            {/* -- Logo -- */}
            <Logo data-slot="logo" />

            {/* -- Divider -- */}
            <StyledDivider data-slot="divider" />

            {/* -- Workspace popover -- */}
            {/* {workspaces && <WorkspacesPopover data-slot="workspaces" data={data?.workspaces} />} */}
            {isLoading ? (
              <Box sx={{ width: 200 }}>
                <Skeleton animation="wave" />
              </Box>
            ) : (
              <Typography fontWeight={600}> {schoolName}</Typography>
            )}

            {slots?.leftAreaEnd}
          </>
        ),
        rightArea: (
          <>
            {slots?.rightAreaStart}
            {/* {searchbar && <GlobalSearch />} */}
            <Box
              data-area="right"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: { xs: 1, sm: 1.5 },
                flex: '0 1 auto',
                minWidth: 0,
                maxWidth: '100%',
              }}
            >
              {/* -- Help link -- */}
              {helpLink && (
                <Link
                  data-slot="help-link"
                  href={dashboardPath}
                  component={RouterLink}
                  color="inherit"
                  sx={{ typography: 'subtitle2' }}
                >
                  Need help?
                </Link>
              )}

              {workspaces && !isHost && (
                // <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 0 }}>
                <GlobalAcademicSearch />
                // </Box>
              )}
              {/* -- Searchbar -- */}
              {searchbar && (
                <Searchbar
                  data-slot="searchbar"
                  data={data?.nav}
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                />
              )}

              {/* -- Language popover -- */}
              {/* {localization && <LanguagePopover data-slot="localization" data={data?.langs} />} */}

              {/* -- Notifications popover -- */}
              {notifications && (
                <NotificationsDrawer data-slot="notifications" data={data?.notifications} />
              )}

              {/* -- Contacts popover -- */}
              {/* {contacts && <ContactsPopover data-slot="contacts" data={data?.contacts} />} */}

              {/* -- Settings button -- */}
              {settings && <SettingsButton data-slot="settings" />}

              {/* -- Account drawer -- */}
              {account && <AccountDrawer data-slot="account" data={data?.account} />}

              {/* -- Sign in button -- */}
              {signIn && <SignInButton />}

              {/* -- Purchase button -- */}
              {/* {purchase && (
                <Button
                  data-slot="purchase"
                  variant="contained"
                  rel="noopener"
                  target="_blank"
                  href={paths.minimalStore}
                  sx={{
                    display: 'none',
                    [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
                  }}
                >
                  Purchase
                </Button>
              )} */}
            </Box>

            {slots?.rightAreaEnd}
          </>
        ),
      }}
      slotProps={slotProps}
      {...other}
    />
  );
}
