import type { Theme } from 'src/theme/types';
import type { RootState } from 'src/redux/store';
import type { Board, Medium, AcademicYear } from 'src/types/school';

import { keyframes } from '@mui/system';
import { styled } from '@mui/material/styles';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import CustomTooltip from 'src/components/custom-tooltip';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import React, { useMemo, useEffect, useCallback } from 'react';
import { useConfirmDialog } from 'src/hooks/use-confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Skeleton, TextField, Autocomplete } from '@mui/material';
import {
  setCurrentYear,
  setCurrentBoard,
  setCurrentMedium,
} from 'src/redux/globalState/globalSlice';

import type { GlobalAcademicSearchOption } from './types';

// Pulse animation keyframes
// Define keyframes using the theme
const createPulseAnimation = (theme: Theme) => keyframes`
  0% {
    box-shadow: 0 0 0 0 ${theme.palette.warning.main}99;
  }
  70% {
    box-shadow: 0 0 0 6px ${theme.palette.warning.main}00;
  }
  100% {
    box-shadow: 0 0 0 0 ${theme.palette.warning.main}00;
  }
`;

// Styled wrapper that animates on error
const AnimatedWrapper = styled(Box, { shouldForwardProp: (prop) => prop !== 'error' })<{
  error: boolean;
}>(({ theme, error }) => ({
  borderRadius: 5,
  ...(error && {
    animation: `${createPulseAnimation(theme as any)} 1.5s infinite`,
    border: `1px solid ${theme.palette.warning.main}90`,
  }),
}));
/**
 * GlobalAcademicSearch Component
 * Provides an interface for selecting academic year, board and medium
 */
const GlobalAcademicSearch = () => {
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

  const pathname = usePathname();

  const isFinanceRoute = pathname.startsWith('/finance');

  return isYearLoading || isBoardLoading ? (
    <Skeleton variant="rounded" height={56} sx={{ minWidth: '300px', width: '100%' }} />
  ) : (
    <>
      {ConfirmDialog}
      <CustomTooltip
        arrow
        title={!currentYear?.name ? 'Select Academic Year, Board and Medium' : undefined}
        placement="left"
      >
        <AnimatedWrapper error={!currentYear?.name}>
          {isFinanceRoute ? (
            <Autocomplete
              options={Array.from(
                new Map(options.map((item) => [item.academicYear.name, item])).values()
              )}
              getOptionLabel={(option) => option.academicYear.name}
              value={(selectedDivision ?? {}) as any}
              loading={isYearLoading || isBoardLoading}
              clearIcon={false}
              disableClearable
              size="small"
              onChange={async (event, newValue) => {
                const confirmed = await showConfirm({
                  title: 'Change Academic Year, Board and Medium',
                  message: !currentYear?.name
                    ? `Are you sure you want to set academic year ${newValue?.academicYear?.name}?`
                    : `Are you sure you want to change academic year from  ${currentYear?.name || ''} to ${newValue?.academicYear?.name} ?`,
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
                <TextField {...params} variant="filled" size="small" label="Academic Year" />
              )}
              sx={{ minWidth: '200px', width: '100%', '& *': { fontSize: '14px !important' } }}
            />
          ) : (
            <Autocomplete
              options={options}
              getOptionLabel={(option) => option.label}
              value={(selectedDivision ?? {}) as any}
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
                />
              )}
              sx={{ minWidth: '280px', width: '100%', '& *': { fontSize: '14px !important' } }}
            />
          )}
        </AnimatedWrapper>
      </CustomTooltip>
    </>
  );
};
export default GlobalAcademicSearch;
