import type { NavSectionProps } from 'src/components/nav-section';

import { isEmpty } from 'lodash';
import { useState, useEffect } from 'react';
import useLocalStorage from 'use-local-storage';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { CircularProgress } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

import { dashboardPath } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Logo } from 'src/components/logo';

import { HeaderSection } from './header-section';
import { Searchbar } from '../components/searchbar';
import { MenuButton } from '../components/menu-button';
import { BoardPopover } from '../components/board-popover';
import { SignInButton } from '../components/sign-in-button';
import { AccountDrawer } from '../components/account-drawer';
import { SettingsButton } from '../components/settings-button';
import { WorkspacesPopover, type WorkspacesPopoverProps } from '../components/workspaces-popover';

import type { HeaderSectionProps } from './header-section';
import type { AccountDrawerProps } from '../components/account-drawer';
import type { ContactsPopoverProps } from '../components/contacts-popover';
import type { LanguagePopoverProps } from '../components/language-popover';
import type { NotificationsDrawerProps } from '../components/notifications-drawer';

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

  const { data: yearData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
  });

  const { data: boardsData, isLoading: isBoardsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  const [academicYear, setAcademicYear] = useLocalStorage<Record<string, any>>('academicYear', {});
  const [boards, setBoards] = useState([]);
  const [board, setBoard] = useLocalStorage<Record<string, any>>('board', {});

  useEffect(() => {
    // @ts-ignore
    if (!academicYear?.id) {
      if (yearData) {
        setAcademicYear(yearData.items[0]);
      }
    } else if (academicYear?.id && !yearData?.items.length) {
      setAcademicYear({});
    }
  }, [yearData, academicYear, setAcademicYear]);

  useEffect(() => {
    if (!isEmpty(academicYear) && boardsData) {
      const filterData = boardsData.items.filter(
        (bo: any) => bo.academicYearId === academicYear?.id
      );
      setBoards(filterData);
      setBoard(filterData[0]);
    }
  }, [boardsData, academicYear, setBoards, setBoard]);

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
            {/* {workspaces && !isLoading && (
              <WorkspacesPopover data-slot="workspaces" data={yearData?.items || []} />
            )} */}

            {slots?.leftAreaEnd}
          </>
        ),
        rightArea: (
          <>
            {slots?.rightAreaStart}

            <Box
              data-area="right"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
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

              {workspaces &&
                (!isLoading ? (
                  <WorkspacesPopover
                    data-slot="workspaces"
                    workspace={academicYear}
                    setWorkspace={setAcademicYear}
                    data={yearData?.items || []}
                  />
                ) : (
                  <CircularProgress size={16} />
                ))}

              {!isBoardsLoading ? (
                <BoardPopover
                  data-slot="boards"
                  board={board}
                  setBoard={setBoard}
                  data={boards || []}
                />
              ) : (
                <CircularProgress size={16} />
              )}

              {/* -- Searchbar -- */}
              {searchbar && <Searchbar data-slot="searchbar" data={data?.nav} />}

              {/* -- Language popover -- */}
              {/* {localization && <LanguagePopover data-slot="localization" data={data?.langs} />} */}

              {/* -- Notifications popover -- */}
              {/* {notifications && (
                <NotificationsDrawer data-slot="notifications" data={data?.notifications} />
              )} */}

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
