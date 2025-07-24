import type { RootState } from 'src/redux/store';
import type { Board, Medium, AcademicYear } from 'src/types/school';

import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import { useTheme, Skeleton, TextField, Autocomplete } from '@mui/material';

import { useConfirmDialog } from 'src/hooks/use-confirm-dialog';

import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  setCurrentYear,
  setCurrentBoard,
  setCurrentMedium,
} from 'src/redux/globalState/globalSlice';

import { NavItem } from 'src/components/nav-section/vertical/nav-item';
import { NavLi, NavUl, NavCollapse, navSectionClasses } from 'src/components/nav-section';

import type { GlobalAcademicSearchOption } from './types';

/**
 * GlobalAcademicSearch Component
 * Provides an interface for selecting academic year, board and medium
 */
const GlobalAcademicSearch = () => {
  // Custom hooks for UI components
  const theme = useTheme();
  const [showConfirm, ConfirmDialog] = useConfirmDialog();

  const dispatch = useDispatch();

  // Redux state selectors for current academic selections
  const { currentYear, currentBoard, currentMedium } = useSelector(
    (state: RootState) => state.globalState
  );

  // Query hooks for fetching academic data
  const { data: years, isLoading: isYearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
  });

  const { data: boardData, isLoading: isBoardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  // Memoized computation of merged academic data
  const allData = useMemo(() => {
    if (!years?.items?.length) return [];
    const mergedData = years?.items?.map((year: AcademicYear) => ({
      ...year,
      boards: boardData?.items?.filter((board: Board) => board.academicYearId === year.id) || [],
    }));
    return mergedData || [];
  }, [boardData?.items, years?.items]);

  /**
   * Generates options for the division autocomplete
   * @returns Array of division options with formatted labels
   */
  const getDivisionOptions = useCallback((): GlobalAcademicSearchOption[] => {
    const options: GlobalAcademicSearchOption[] = [];
    allData.forEach((year: AcademicYear & { boards: Board[] }) => {
      year.boards.forEach((board: Board) => {
        board.educationMediums.forEach((medium: Medium) => {
          options.push({
            label: `${year.name} / ${board.name} / ${medium.name}`,
            value: `${year.id}-${board.id}-${medium.id}`,
            academicYear: year,
            board,
            medium,
          });
        });
      });
    });
    return options;
  }, [allData]);

  // State for selected division in autocomplete
  const [selectedDivision, setSelectedDivision] = React.useState<
    undefined | GlobalAcademicSearchOption
  >(undefined);
  const options = getDivisionOptions();

  // Effect to update selected division when current selections change
  useEffect(() => {
    if (currentYear?.id && currentBoard?.id && currentMedium?.id) {
      setSelectedDivision({
        label: `${currentYear?.name} / ${currentBoard?.name} / ${currentMedium?.name}`,
        value: `${currentYear?.id}-${currentBoard?.id}-${currentMedium?.id}`,
        academicYear: currentYear,
        board: currentBoard,
        medium: currentMedium,
      });
    }
  }, [currentBoard, currentMedium, currentYear]);

  return isYearLoading || isBoardLoading ? (
    <Skeleton variant="rounded" height={56} sx={{ minWidth: '300px', width: '100%' }} />
  ) : (
    <>
      {ConfirmDialog}
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.label}
        value={selectedDivision}
        loading={isYearLoading || isBoardLoading}
        clearIcon={false}
        disableClearable
        size="small"
        onChange={async (event, newValue) => {
          const confirmed = await showConfirm({
            title: 'Change Academic Year, Board and Medium',
            message: !currentYear?.name
              ? `Are you sure you want to set academic year, board and medium  ${newValue?.academicYear?.name} / ${newValue?.board?.name} / ${newValue?.medium?.name} ?`
              : `Are you sure you want to change academic year, board and medium from  ${currentYear?.name || ''} / ${currentBoard?.name || ''} / ${currentMedium?.name || ''} to ${newValue?.academicYear?.name} / ${newValue?.board?.name} / ${newValue?.medium?.name} ?`,
            icon: 'warning',
          });
          if (confirmed) {
            dispatch(setCurrentYear(newValue?.academicYear));
            dispatch(setCurrentBoard(newValue?.board));
            dispatch(setCurrentMedium(newValue?.medium));
            setSelectedDivision(newValue);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="filled"
            size="small"
            label="Academic Year, Board and Medium"
            // placeholder="Select a academic year, board and medium"
          />
        )}
        sx={{ minWidth: '280px', width: '100%', '& *': { fontSize: '14px !important' } }}
      />
    </>
  );
};
export default GlobalAcademicSearch;

/**
 * Group1 Component
 * Renders a list of navigation items for the first level of grouping
 */
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

/**
 * Group Component
 * Renders a collapsible navigation group with nested items
 */
function Group({ items, group, depth, popover }: any) {
  // State for tracking currently open menu
  const [currentOpenMenu, setCurrentOpenMenu] = useState('');
  const dispatch = useDispatch();

  // Callback for handling menu toggle
  const handleToggleMenu = useCallback(
    (e: any) => {
      if (items.length) {
        setCurrentOpenMenu(currentOpenMenu === group.id ? '' : (group.id as string));
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
