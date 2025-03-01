import type { RootState } from 'src/redux/store';
import type { Board, AcademicYear } from 'src/types/school';

import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import { Stack, useTheme, ButtonBase } from '@mui/material';

import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  setCurrentYear,
  setCurrentBoard,
  setCurrentMedium,
} from 'src/redux/globalState/globalSlice';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { NavItem } from 'src/components/nav-section/vertical/nav-item';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import {
  NavLi,
  NavUl,
  NavCollapse,
  navSectionClasses,
  navSectionCssVars,
} from 'src/components/nav-section';

const GlobalAcademicSearch = () => {
  const popover = usePopover();
  const theme = useTheme();
  const cssVars = {
    ...navSectionCssVars.vertical(theme),
  };

  const dispatch = useDispatch();

  // const [currentItem, setCurrentItem] = useState<any>(null);

  const { currentYear, currentBoard, currentMedium } = useSelector(
    (state: RootState) => state.globalState
  );

  const { data: years, isLoading: isYearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
  });

  const { data: boardData, isLoading: isBoardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  const allData = useMemo(() => {
    if (!years?.items?.length) return [];
    const mergedData = years?.items?.map((year: AcademicYear) => ({
      ...year,
      boards: boardData?.items?.filter((board: Board) => board.academicYearId === year.id) || [],
    }));
    return mergedData || [];
  }, [boardData?.items, years?.items]);

  useEffect(() => {
    if (!isYearLoading && !isBoardLoading && allData.length && currentMedium?.id) {
      const findValues = (items: any[], id: string): any =>
        items.find(
          (item: any) =>
            item.id === id ||
            ((item?.boards || item?.educationMediums)?.length &&
              findValues(item?.boards || item?.educationMediums, id))
        );

      const values = findValues(allData, currentMedium?.id);

      if (values) {
        const { boards, ...year } = values;
        const selectedBoard = boards.find((item: any) =>
          item.educationMediums.find((i: any) => i.id === currentMedium?.id)
        );
        dispatch(setCurrentYear(year));
        dispatch(setCurrentBoard(selectedBoard));
        // dispatch(setCurrentMedium(currentMedium));
      } else {
        dispatch(setCurrentYear(null));
        dispatch(setCurrentBoard(null));
        dispatch(setCurrentMedium(null));
      }
    }
  }, [allData, currentMedium, dispatch, isBoardLoading, isYearLoading]);

  return (
    <>
      <ButtonBase
        disableRipple
        onClick={popover.onOpen}
        sx={{
          p: 0.5,
          gap: { xs: 0.5, sm: 1 },
          boxShadow: 'var(--shadows-1)',
          borderRadius: 1,
          // ...sx,
        }}
      >
        {currentYear?.name ? (
          <>
            <Label color="primary">{currentYear?.name}</Label>

            <Label color="secondary">{currentBoard?.name}</Label>

            <Label
              color="info"
              sx={{
                height: 22,
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            >
              {currentMedium?.name}
            </Label>
          </>
        ) : (
          'Please select a year, board and medium'
        )}

        <Iconify width={16} icon="carbon:chevron-sort" sx={{ color: 'text.disabled' }} />
      </ButtonBase>
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          paper: {
            elevation: 6,
            sx: {
              mt: 0.5,
              width: { xs: 1, sm: 250 },
              border: `1px solid ${theme.vars.palette.grey[300]}`,
            },
          },
        }}
      >
        <Stack
          component="nav"
          className={navSectionClasses.vertical.root}
          sx={{ p: 0.5, ...cssVars }}
        >
          <NavUl sx={{ flex: '1 1 auto', gap: 'var(--nav-item-gap)' }}>
            <Group1 items={allData} popover={popover} />
          </NavUl>
        </Stack>
      </CustomPopover>
      {/* <Popover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            elevation: 6,
            sx: {
              mt: 0.5,
              width: { xs: 1, sm: 250 },
              border: `1px solid ${theme.vars.palette.grey[300]}`,
            },
          },
        }}
      >
        <Stack
          component="nav"
          className={navSectionClasses.vertical.root}
          sx={{ p: 0.5, ...cssVars }}
        >
          <NavUl sx={{ flex: '1 1 auto', gap: 'var(--nav-item-gap)' }}>
            <Group1 items={allData} popover={popover} />
          </NavUl>
        </Stack>
      </Popover> */}
    </>
  );
};
export default GlobalAcademicSearch;

function Group1({ items, depth = 1, popover }: any) {
  return (
    <NavUl sx={{ gap: 'var(--nav-item-gap)' }}>
      {items?.map((group: any) => (
        <Group
          key={group.id}
          items={group.boards || group?.educationMediums || []}
          id={group.id}
          group={group}
          depth={depth}
          popover={popover}
        />
      ))}
    </NavUl>
  );
}

function Group({ items, group, depth, popover }: any) {
  const [currentOpenMenu, setCurrentOpenMenu] = useState('');
  const dispatch = useDispatch();
  const handleToggleMenu = useCallback(
    (e: any) => {
      if (items.length) {
        setCurrentOpenMenu(currentOpenMenu === group.id ? '' : (group.id as string)); // setOpenMenu((prev) => !prev);
      } else if (depth === 3) {
        dispatch(setCurrentMedium(group));
        popover.onClose();
      } else if (depth === 2) {
        toast.error('Please create a medium');
      } else if (depth === 1) {
        toast.error('Please create a board');
      }
    },
    [currentOpenMenu, depth, dispatch, group, items.length, popover]
  );
  if (items.length)
    return (
      <NavLi
        sx={{
          [`& .${navSectionClasses.li}`]: {
            '&:first-of-type': { mt: 'var(--nav-item-gap)' },
          },
        }}
        // className={stateClasses({ active: currentOpenMenu === data._action && !openMenu })}
      >
        <NavItem
          title={group.name}
          onClick={handleToggleMenu}
          path=""
          hasChild
          open={currentOpenMenu === group.id}
          depth={depth}
        />

        <NavCollapse
          data-group={group.name}
          in={currentOpenMenu === group.id}
          depth={depth}
          unmountOnExit
          mountOnEnter
        >
          <Group1 items={items} depth={depth + 1} popover={popover} />
        </NavCollapse>
      </NavLi>
    );

  return (
    <NavLi>
      <NavItem title={group.name} onClick={handleToggleMenu} path="" depth={depth} />
    </NavLi>
  );
}
