'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';

import { Box, Slide } from '@mui/material';

import { yearApi } from 'src/redux/year/yearApi';
import { boardApi } from 'src/redux/board/boardApi';
import { navSubData } from 'src/layouts/config-nav-dashboard';

import { Scrollbar } from '../scrollbar';
import { useSettingsContext } from '../settings';
import { NavSectionVertical } from '../nav-section';

const SubLayout = ({ children }: any) => {
  const { user } = useSelector((state: any) => state.auth);
  const pathname = usePathname();
  const removeLastSlash = pathname.replace(/\/$/, '');
  const [currentModule] = removeLastSlash.split('/').filter((x) => x);
  const currentData: Array<any> = navSubData(user?.profile?.email === 'ddvs@gmail.com')?.[
    `/${currentModule}` as keyof typeof navSubData
  ];

  const settings = useSettingsContext();
  const isNavMini = settings.navLayout === 'mini';

  const yearLoading = useSelector(
    (state: RootState) => yearApi.endpoints.getYear.select(undefined)(state)?.isLoading
  );
  const boardLoading = useSelector(
    (state: RootState) => boardApi.endpoints.getBoards.select(undefined)(state)?.isLoading
  );

  const { loading } = useSelector((state: RootState) => state.auth);
  return (
    <Box
      display="flex"
      height="100%"
      gap={2}
      // sx={{ backgroundColor: (theme) => theme.palette.background.paper }}
    >
      {currentData?.length > 0 && (
        <Slide direction="right" in={isNavMini} mountOnEnter unmountOnExit>
          <Scrollbar
            fillContent
            sx={{
              height: '100%',
              width: '320px',
              boxShadow: 'var(--shadows-3)',
              bgcolor: (theme) => theme.palette.background.paper,
              borderRadius: 1,
            }}
          >
            <NavSectionVertical
              data={currentData}
              sx={{ p: 1, flex: '1 1 auto', width: '100%' }}
              isSubLayout
            />
          </Scrollbar>
        </Slide>
      )}
      <Box
        sx={{
          // maxWidth: '1440px',
          width: '100%',
          // mx: 'auto',
          height: '100%',
          overflow: 'hidden',

          boxShadow: 'var(--shadows-3)',
          '& .simplebar-content': { height: '100%' },

          bgcolor: (theme) => theme.palette.background.default,
          border: (theme) =>
            currentData?.length ? `4px solid ${theme.palette.background.paper}` : 'none',
          borderRadius: 1,
          borderBottom: 'none',
          borderRight: 'none',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        {/* {(yearLoading || boardLoading || isLoading) &&
        removeLastSlash !== '/setting/academic-setup' ? (
          <LoadingScreen />
        ) : ( */}
        <Scrollbar
          sx={{
            // maxWidth: '1440px',
            width: '100%',
            mx: 'auto',
            height: '100%',
            overflow: 'auto',
            p: 2,

            // p: 1,
            // bgcolor: (theme) => theme.palette.background.default,
          }}
        >
          {children}
        </Scrollbar>
        {/* )} */}
      </Box>
    </Box>
  );
};

export default SubLayout;
