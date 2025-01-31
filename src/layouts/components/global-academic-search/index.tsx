import type { RootState } from 'src/redux/store';
import type { Board, AcademicYear } from 'src/types/school';

import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import { Stack, Button, Popover, useTheme } from '@mui/material';
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';

import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  setCurrentYear,
  setCurrentBoard,
  setCurrentMedium,
} from 'src/redux/globalState/globalSlice';

import { usePopover } from 'src/components/custom-popover';
import { NavItem } from 'src/components/nav-section/vertical/nav-item';
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

  const { data: years } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
  });

  const { data: boardData } = useQueryAndMutation({
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
    if (allData.length && currentMedium?.id) {
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
  }, [allData, currentMedium, dispatch]);

  return (
    <>
      <Button
        onClick={popover.onOpen}
        variant="soft"
        color="primary"
        // sx={{ border: `dashed 1px ${theme.vars.palette.primary.main}` }}
        endIcon={popover.open ? <ArrowDropDown /> : <ArrowDropUp />}
      >
        {currentYear?.name && currentBoard.name && currentMedium?.name
          ? `${currentYear.name} > ${currentBoard.name} > ${currentMedium.name}`
          : 'Select Academic Year, Board and Medium'}
      </Button>
      <Popover
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
      </Popover>
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
