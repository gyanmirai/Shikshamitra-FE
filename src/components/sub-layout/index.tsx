'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { navSubData } from 'src/layouts/config-nav-dashboard';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Drawer, Tooltip, IconButton, Typography } from '@mui/material';

import { Iconify } from '../iconify';
import { Scrollbar } from '../scrollbar';
import { NavSectionVertical } from '../nav-section';
import { navSectionClasses } from '../nav-section/classes';

// ----------------------------------------------------------------------

const SubLayout = ({ children }: any) => {
  const muiTheme = useTheme();
  const compactNav = useMediaQuery(muiTheme.breakpoints.down('md'));
  const session: any = useSession();
  const { data: user } = session;
  const pathname = usePathname();
  const removeLastSlash = pathname.replace(/\/$/, '');
  const [currentModule] = removeLastSlash.split('/').filter((x) => x);
  const currentData: Array<any> = navSubData(user?.profile?.email === 'ddvs@gmail.com')?.[
    `/${currentModule}` as keyof typeof navSubData
  ];

  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const enterTimeout = useRef<any>(null);
  const leaveTimeout = useRef<any>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0, left: 0 });
    setMobileNavOpen(false);
  }, [pathname]);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    if (enterTimeout.current) clearTimeout(enterTimeout.current);
    enterTimeout.current = setTimeout(() => {
      setIsHovered(true);
    }, 500);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (enterTimeout.current) clearTimeout(enterTimeout.current);
    leaveTimeout.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  }, []);

  useEffect(
    () => () => {
      if (enterTimeout.current) clearTimeout(enterTimeout.current);
      if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    },
    []
  );

  const handleTogglePin = useCallback(() => {
    if (enterTimeout.current) clearTimeout(enterTimeout.current);
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    setIsPinned((prev) => !prev);
  }, []);

  const isCollapsed = compactNav || (!isPinned && !isHovered);

  const NAV_WIDTH = 280;
  const NAV_MINI_WIDTH = 80;

  return (
    <Box
      display="flex"
      height="100%"
      sx={{ backgroundColor: (theme) => theme.vars.palette.background.neutral }}
    >
      <Drawer
        open={compactNav && mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        slotProps={{
          paper: {
            sx: { width: 280, bgcolor: 'background.paper' },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
          }}
        >
          <Typography variant="subtitle1">Student navigation</Typography>
          <IconButton
            aria-label="Close Student navigation"
            onClick={() => setMobileNavOpen(false)}
            size="small"
          >
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>
        <Scrollbar fillContent>
          <NavSectionVertical data={currentData} sx={{ p: 1, flex: '1 1 auto' }} />
        </Scrollbar>
      </Drawer>

      {currentData?.length > 0 && (
        <motion.div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          layout
          initial={false}
          animate={{
            width: isCollapsed ? NAV_MINI_WIDTH : NAV_WIDTH,
          }}
          transition={{
            type: 'tween',
            ease: 'easeOut',
            duration: 0.3,
          }}
          style={{
            height: '100%',
            backgroundColor: 'var(--palette-background-paper)',
            borderRight: '1px solid var(--palette-divider)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              p: 1,
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'center',
              borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
            }}
          >
            <Tooltip title="Open Student navigation" placement="right">
              <IconButton
                aria-label="Open Student navigation"
                onClick={() => setMobileNavOpen(true)}
                size="small"
              >
                <Iconify icon="solar:hamburger-menu-outline" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* -- Pin Button -- */}
          <Box
            sx={{
              p: 1,
              display: { xs: 'none', md: 'flex' },
              justifyContent: isCollapsed ? 'center' : 'flex-end',
              borderBottom: (theme) =>
                isCollapsed ? 'none' : `1px solid ${theme.vars.palette.divider}`,
            }}
          >
            <Tooltip title={isPinned ? 'Unpin' : 'Pin'} placement="right">
              <IconButton onClick={handleTogglePin} size="small">
                <Iconify
                  icon={isPinned ? 'solar:pin-bold' : 'solar:pin-linear'}
                  sx={{
                    width: 20,
                    height: 20,
                    transition: 'transform 0.2s',
                    ...(!isPinned && { transform: 'rotate(-45deg)' }),
                    color: isPinned ? 'primary.main' : 'text.disabled',
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>

          <Scrollbar
            fillContent
            sx={{
              flexGrow: 1,
              overflowX: 'hidden',
              '& .simplebar-content-wrapper': {
                overflowX: 'hidden',
              },
            }}
          >
            <NavSectionVertical
              data={currentData}
              isSubLayout
              sx={{
                p: isCollapsed ? 0 : 1,
                flex: '1 1 auto',
                width: '100%',
                transition: (theme) =>
                  theme.transitions.create(['padding'], {
                    easing: theme.transitions.easing.easeInOut,
                    duration: theme.transitions.duration.standard,
                  }),
                ...(isCollapsed && {
                  '--nav-item-gap': '5px !important',
                  [`& .${navSectionClasses.ul}`]: {
                    gap: '5px !important',
                  },
                  [`& .${navSectionClasses.item.root}`]: {
                    width: 'calc(100% - 10px) !important',
                    px: '4px !important',
                    py: '8px !important',
                    margin: '0 5px !important',
                    display: 'flex',
                    textAlign: 'center',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: '56px !important',
                    overflow: 'hidden',
                  },
                  [`& .${navSectionClasses.item.icon}`]: {
                    margin: '0 0 4px 0 !important',
                    width: '24px !important',
                    height: '24px !important',
                  },
                  [`& .${navSectionClasses.item.texts}`]: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    opacity: 1,
                    visibility: 'visible',
                    width: '100%',
                    overflow: 'hidden',
                    transition: (theme) =>
                      theme.transitions.create(['opacity'], {
                        duration: theme.transitions.duration.shorter,
                      }),
                  },
                  [`& .${navSectionClasses.item.title}`]: {
                    fontSize: '10px !important',
                    lineHeight: '1.2 !important',
                    fontWeight: '600 !important',
                    width: '100%',
                    maxWidth: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textAlign: 'center',
                    textTransform: 'capitalize',
                  },
                  [`& .${navSectionClasses.item.caption}`]: {
                    display: 'none',
                  },
                  [`& .${navSectionClasses.item.arrow}`]: {
                    display: 'none',
                  },
                  [`& .${navSectionClasses.item.info}`]: {
                    display: 'none',
                  },
                  [`& .${navSectionClasses.subheader}`]: {
                    display: 'none',
                  },
                  [`& .MuiCollapse-root`]: {
                    display: 'none !important',
                  },
                }),
                ...(!isCollapsed && {
                  [`& .${navSectionClasses.item.texts}`]: {
                    opacity: 1,
                    visibility: 'visible',
                    transition: (theme) =>
                      theme.transitions.create(['opacity', 'visibility'], {
                        duration: theme.transitions.duration.standard,
                      }),
                  },
                }),
              }}
            />
          </Scrollbar>
        </motion.div>
      )}
      <Box
        sx={{
          flexGrow: 1,
          height: '100%',
          overflow: 'hidden',
          '& .simplebar-content': { height: '100%' },
          bgcolor: 'transparent',
          borderRadius: 0,
          borderBottom: 'none',
          borderRight: 'none',
        }}
      >
        <Scrollbar
          ref={contentScrollRef}
          sx={{
            width: '100%',
            mx: 'auto',
            height: '100%',
            overflow: 'auto',
            pt: 1,
            pr: 1,
            pl: 1,
            pb: 1,
          }}
        >
          {children}
        </Scrollbar>
      </Box>
    </Box>
  );
};

export default SubLayout;
