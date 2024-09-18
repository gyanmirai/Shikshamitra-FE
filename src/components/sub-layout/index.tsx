'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { Box, List, useTheme, ListItem, ListItemButton } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { navSubData } from 'src/layouts/config-nav-dashboard';

import { Scrollbar } from '../scrollbar';
import CustomAccordion from '../custom-accordian';
import { StyledNavItem } from '../nav-section/mini/nav-item';
import { sharedStyles, navSectionClasses, NavSectionVertical } from '../nav-section';

const SubLayout = ({ children }: any) => {
  const pathname = usePathname();
  const removeLastSlash = pathname.replace(/\/$/, '');
  const [currentModule] = removeLastSlash.split('/').filter((x) => x);
  const currentData = navSubData[`/${currentModule}` as keyof typeof navSubData];

  return (
    <Box
      display="flex"
      height="100%"
      gap={2}
      // sx={{ backgroundColor: (theme) => theme.palette.background.paper }}
    >
      {currentData?.length > 0 && (
        <Scrollbar
          fillContent
          sx={{
            height: '100%',
            width: '18%',
            boxShadow: 'var(--shadows-3)',
          }}
        >
          <NavSectionVertical
            data={currentData}
            sx={{ p: 1, flex: '1 1 auto', width: '100%' }}
            isSubLayout
          />
        </Scrollbar>
      )}
      <Box
        sx={{
          // flexGrow: 1,

          boxShadow: 'var(--shadows-3)',
          width: currentData?.length ? '82%' : '100%',
        }}
      >
        <Scrollbar
          sx={{
            maxWidth: '1440px',
            width: '100%',
            mx: 'auto',
            height: '100%',
            overflow: 'auto',
            p: 2,
            '& .simplebar-content': { height: '100%' },
          }}
        >
          {children}
        </Scrollbar>
      </Box>
    </Box>
  );
};

const RenderSubModule = ({ data }: any) =>
  data.map((item: any) =>
    item.items?.length ? <RenderAccordion item={item} /> : <RenderList item={item} />
  );

const RenderList = ({ item }: any) => {
  const pathname = usePathname();
  const removeTrailingSlash = pathname.replace(/\/$/, '');
  const theme = useTheme();
  const router = useRouter();
  return (
    <Scrollbar fillContent sx={{ maxHeight: '300px', height: '100%' }}>
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%', pr: 1 }}>
        <ListItem
          key={item.title}
          disablePadding
          sx={{
            border:
              removeTrailingSlash === item.path
                ? `1px solid ${theme.palette.primary.main}`
                : `1px solid ${theme.palette.divider}`,
            bgcolor:
              removeTrailingSlash === item.path
                ? varAlpha(theme.palette.primary.mainChannel, 0.08)
                : 'inherit',
          }}
          onClick={() => {
            router.push(`${item.path}`);
          }}
        >
          <StyledNavItem
            active={removeTrailingSlash === item.path}
            sx={{
              [`& .${navSectionClasses.item.title}`]: {
                ...sharedStyles.noWrap,
                lineHeight: '16px',
                fontSize: theme.typography.pxToRem(10),
                fontWeight:
                  removeTrailingSlash === item.path
                    ? theme.typography.fontWeightBold
                    : theme.typography.fontWeightSemiBold,
                whiteSpace: 'unset',
              },
            }}
          >
            <ListItemButton
              component="span"
              className={navSectionClasses.item.title}
              sx={{ textAlign: 'left', p: 1 }}
            >
              {item.title}
            </ListItemButton>
          </StyledNavItem>
        </ListItem>
      </List>
    </Scrollbar>
  );
};

const RenderAccordion = ({ item }: any) => {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const removeTrailingSlash = pathname.replace(/\/$/, '');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const recur = (data: any) =>
      data.find((i: any) => removeTrailingSlash === i.path || (i?.items?.length && recur(i.items)));
    const resp = recur(item.items);

    if (resp) {
      setExpanded(true);
      setIsActive(true);
    } else {
      setExpanded(false);
      setIsActive(false);
    }
  }, [item.items, removeTrailingSlash]);
  return (
    <CustomAccordion
      content={<RenderSubModule data={item.items} />}
      title={item.title}
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      isActive={isActive}
    />
  );
};

export default SubLayout;
