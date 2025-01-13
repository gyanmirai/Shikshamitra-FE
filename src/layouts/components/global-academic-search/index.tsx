import type { RootState } from 'src/redux/store';

import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useCallback } from 'react';

import { Stack, Button, Popover, useTheme } from '@mui/material';
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';

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

const data = [
  {
    name: '2025-2026',
    startDate: '2025-03-01T05:06:27+00:00',
    endDate: '2026-02-28T18:29:59+00:00',
    lastModificationTime: null,
    lastModifierId: null,
    creationTime: '2025-01-10T05:06:38.09634+00:00',
    creatorId: '3a173edc-8065-a190-a7d1-b180244339bb',
    id: '3a1760c8-4a49-6ce2-8d2e-cfedb3265f38',
    boards: [],
  },
  {
    name: '2024-2025',
    startDate: '2024-04-01T00:00:00+00:00',
    endDate: '2025-03-31T00:00:00+00:00',
    lastModificationTime: null,
    lastModifierId: null,
    creationTime: '2025-01-03T20:31:41.98783+00:00',
    creatorId: null,
    id: '3a173edc-93cd-670d-596f-7ab1acf664c9',
    boards: [
      {
        type: 0,
        name: 'CBSE',
        academicYearId: '3a173edc-93cd-670d-596f-7ab1acf664c9',
        educationMediums: [
          {
            name: 'English',
            educationBoardId: '3a173edc-93e3-d474-e303-e4215c1bce35',
            educationMediumStages: [
              {
                educationMediumId: '3a173edc-93fc-ac24-8daa-059cf396dbc4',
                name: 'Primary',
                standards: [
                  {
                    name: '1',
                    divisions: [
                      {
                        name: 'A',
                        strength: 30,
                        standardId: '3a173edc-9425-7d0e-f553-cc8236cb3ba8',
                        lastModificationTime: null,
                        lastModifierId: null,
                        creationTime: '2025-01-03T20:31:42.094013+00:00',
                        creatorId: null,
                        id: '3a173edc-9439-d7e7-3aef-c0e925aafa02',
                      },
                    ],
                    educationMediumStageId: '3a173edc-940f-2792-46d4-bf9fdec22d67',
                    lastModificationTime: null,
                    lastModifierId: null,
                    creationTime: '2025-01-03T20:31:42.073809+00:00',
                    creatorId: null,
                    id: '3a173edc-9425-7d0e-f553-cc8236cb3ba8',
                  },
                ],
                lastModificationTime: '2025-01-07T03:52:29.555108+00:00',
                lastModifierId: '3a173edc-8065-a190-a7d1-b180244339bb',
                creationTime: '2025-01-03T20:31:42.053294+00:00',
                creatorId: null,
                id: '3a173edc-940f-2792-46d4-bf9fdec22d67',
              },
            ],
            lastModificationTime: null,
            lastModifierId: null,
            creationTime: '2025-01-03T20:31:42.031475+00:00',
            creatorId: null,
            id: '3a173edc-93fc-ac24-8daa-059cf396dbc4',
          },
        ],
        lastModificationTime: null,
        lastModifierId: null,
        creationTime: '2025-01-03T20:31:42.012004+00:00',
        creatorId: null,
        id: '3a173edc-93e3-d474-e303-e4215c1bce35',
      },
    ],
  },
];

const GlobalAcademicSearch = () => {
  const popover = usePopover();
  const theme = useTheme();
  const cssVars = {
    ...navSectionCssVars.vertical(theme),
  };

  const dispatch = useDispatch();

  const [currentItem, setCurrentItem] = useState<any>(null);

  const { currentYear, currentBoard, currentMedium } = useSelector(
    (state: RootState) => state.globalState
  );

  useEffect(() => {
    if (currentItem) {
      const findValues = (items: any[], id: string): any =>
        items.find(
          (item: any) =>
            item.id === id ||
            ((item?.boards || item?.educationMediums)?.length &&
              findValues(item?.boards || item?.educationMediums, id))
        );

      const values = findValues(data, currentItem?.id);

      if (values) {
        const { boards, ...year } = values;
        const selectedBoard = boards.find((item: any) =>
          item.educationMediums.find((i: any) => i.id === currentItem?.id)
        );
        dispatch(setCurrentYear(year));
        dispatch(setCurrentMedium(currentItem));
        dispatch(setCurrentBoard(selectedBoard));
      }
    }
  }, [currentItem, dispatch]);

  return (
    <>
      <Button
        onClick={popover.onOpen}
        variant="soft"
        color="primary"
        // sx={{ border: `dashed 1px ${theme.vars.palette.primary.main}` }}
        endIcon={popover.open ? <ArrowDropDown /> : <ArrowDropUp />}
      >
        {currentYear?.name
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
            <Group1
              items={data}
              currentItem={currentItem}
              setCurrentItem={setCurrentItem}
              popover={popover}
            />
          </NavUl>
        </Stack>
      </Popover>
    </>
  );
};
export default GlobalAcademicSearch;

function Group1({ items, depth = 1, currentItem, setCurrentItem, popover }: any) {
  return (
    <NavUl sx={{ gap: 'var(--nav-item-gap)' }}>
      {items?.map((group: any) => (
        <Group
          key={group.id}
          items={group.boards || group?.educationMediums || []}
          id={group.id}
          group={group}
          depth={depth}
          currentItem={currentItem}
          setCurrentItem={setCurrentItem}
          popover={popover}
        />
      ))}
    </NavUl>
  );
}

function Group({ items, group, depth, currentItem, setCurrentItem, popover }: any) {
  const [currentOpenMenu, setCurrentOpenMenu] = useState('');
  const handleToggleMenu = useCallback(
    (e: any) => {
      if (items.length) {
        setCurrentOpenMenu(currentOpenMenu === group.id ? '' : (group.id as string)); // setOpenMenu((prev) => !prev);
      } else if (depth === 3) {
        setCurrentItem(group);
        popover.onClose();
      } else if (depth === 2) {
        toast.error('Please create a medium');
      } else if (depth === 1) {
        toast.error('Please create a board');
      }
    },
    [currentOpenMenu, depth, group, items.length, popover, setCurrentItem]
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
          <Group1
            items={items}
            depth={depth + 1}
            currentItem={currentItem}
            setCurrentItem={setCurrentItem}
            popover={popover}
          />
        </NavCollapse>
      </NavLi>
    );

  return (
    <NavLi>
      <NavItem title={group.name} onClick={handleToggleMenu} path="" depth={depth} />
    </NavLi>
  );
}
