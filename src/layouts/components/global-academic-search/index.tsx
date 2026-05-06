'use client';

import type { Theme } from 'src/theme/types';
import type { RootState } from 'src/redux/store';
import type { Board, Medium, AcademicYear } from 'src/types/school';

import { keyframes } from '@mui/system';
import { useSession } from 'next-auth/react';
import { styled } from '@mui/material/styles';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import CustomTooltip from 'src/components/custom-tooltip';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import React, { useMemo, useEffect, useCallback } from 'react';
import { useConfirmDialog } from 'src/hooks/use-confirm-dialog';
import { setDriverNextEnabled } from 'src/utils/driverBtnConfig';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Skeleton, TextField, Autocomplete } from '@mui/material';
import {
  setCurrentYear,
  setCurrentBoard,
  setCurrentMedium,
} from 'src/redux/globalState/globalSlice';

import type { GlobalAcademicSearchOption } from './types';

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

  const { data }: any = useSession();

  const dispatch = useDispatch();

  // Redux state selectors for current academic selections
  const { currentYear, currentBoard, currentMedium } = useSelector(
    (state: RootState) => state.globalState
  );

  // Query hooks for fetching academic data
  const { data: years, isLoading: isYearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
    options: {
      skip: !data?.accessToken,
    },
  });

  const { data: boardData, isLoading: isBoardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
    options: {
      skip: !data?.accessToken,
    },
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
  const [selectedDivision, setSelectedDivision] = React.useState<GlobalAcademicSearchOption | null>(
    null
  );
  const options = getDivisionOptions();

  // Effect to update selected division when current selections change
  useEffect(() => {
    if (currentYear?.id && currentBoard?.id && currentMedium?.id) {
      setSelectedDivision({
        label: `${currentYear?.name || ''} / ${currentBoard?.name || ''} / ${currentMedium?.name || ''}`,
        value: `${currentYear?.id}-${currentBoard?.id}-${currentMedium?.id}`,
        academicYear: currentYear,
        board: currentBoard,
        medium: currentMedium,
      });
    }
  }, [currentBoard, currentMedium, currentYear]);

  const pathname = usePathname();

  const isShowOnlyYearModule = ['/dashboard', '/finance', '/library', '/calendar', '/hr'].some(
    (route) => pathname.startsWith(route)
  );

  // --- Start of Onboarding Logic ---
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  useEffect(() => {
    const handleOpenDropdown = () => {
      setIsDropdownOpen(true);
    };

    window.addEventListener('onboarding-open-academic-dropdown', handleOpenDropdown);
    return () => {
      window.removeEventListener('onboarding-open-academic-dropdown', handleOpenDropdown);
    };
  }, []);
  // --- End of Onboarding Logic ---

  return (
    <Box data-onboarding="academic-year">
      {isYearLoading || isBoardLoading ? (
        <Skeleton
          variant="rounded"
          height={56}
          sx={{ minWidth: isShowOnlyYearModule ? '200px' : '300px', width: '100%' }}
        />
      ) : (
        <>
          {ConfirmDialog}
          <CustomTooltip
            arrow
            title={!currentYear?.name ? 'Select Academic Year, Board and Medium' : undefined}
            placement="bottom"
          >
            <AnimatedWrapper error={!currentYear?.name}>
              {isShowOnlyYearModule ? (
                <Autocomplete
                  open={isDropdownOpen}
                  onOpen={() => setIsDropdownOpen(true)}
                  onClose={() => setIsDropdownOpen(false)}
                  // disablePortal={false}
                  options={Array.from(
                    new Map(options.map((item) => [item.academicYear.name, item])).values()
                  )}
                  getOptionLabel={(option) => option.academicYear.name}
                  value={selectedDivision}
                  loading={isYearLoading || isBoardLoading}
                  clearIcon={false}
                  disableClearable={!!selectedDivision}
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

                    if (currentYear?.name || (confirmed && newValue?.academicYear?.name)) {
                      setDriverNextEnabled(true);
                    }
                  }}
                  slotProps={{
                    listbox: {
                      sx: {
                        '& .MuiAutocomplete-option': {
                          '&[aria-selected="true"]': {
                            backgroundColor: 'action.hover',
                          },
                          '&:hover': {
                            backgroundColor: 'action.hover !important',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'transparent',
                          },
                          '&.Mui-focused:hover': {
                            backgroundColor: 'action.hover !important',
                          },
                          '&[aria-selected="true"]:hover': {
                            backgroundColor: 'action.hover !important',
                          },
                        },
                      },
                    },
                    popper: {
                      // disablePortal: false,
                      sx: {
                        zIndex: '9999999999 !important',
                      },
                    },
                  }}
                  renderInput={(params) => (
                    <TextField {...params} variant="filled" size="small" label="Academic Year" />
                  )}
                  sx={{ minWidth: '200px', width: '100%', '& *': { fontSize: '14px !important' } }}
                />
              ) : (
                <Autocomplete
                  open={isDropdownOpen}
                  // disablePortal={false}
                  onOpen={() => setIsDropdownOpen(true)}
                  onClose={() => setIsDropdownOpen(false)}
                  options={options}
                  getOptionLabel={(option) => option.label}
                  value={selectedDivision}
                  loading={isYearLoading || isBoardLoading}
                  clearIcon={false}
                  disableClearable={!!selectedDivision}
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

                    if (currentYear?.name || (confirmed && newValue?.academicYear?.name)) {
                      setDriverNextEnabled(true);
                    }
                  }}
                  renderOption={(props, option) => {
                    const isSelected =
                      option.academicYear.id === currentYear?.id &&
                      option.board.id === currentBoard?.id &&
                      option.medium.id === currentMedium?.id;
                    const { key, ...restProps } = props;
                    return (
                      <Box
                        component="li"
                        key={key}
                        {...restProps}
                        data-selected={isSelected}
                        sx={{
                          backgroundColor: isSelected ? 'action.hover' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'action.hover !important',
                          },
                        }}
                      >
                        {option.label}
                      </Box>
                    );
                  }}
                  slotProps={{
                    listbox: {
                      sx: {
                        '& .MuiAutocomplete-option.Mui-focused': {
                          backgroundColor: 'transparent',
                        },
                        '& .MuiAutocomplete-option.Mui-focused:hover': {
                          backgroundColor: 'action.hover !important',
                        },
                        '& .MuiAutocomplete-option[data-selected="true"]': {
                          backgroundColor: 'action.hover',
                        },
                        '& .MuiAutocomplete-option[data-selected="true"]:hover': {
                          backgroundColor: 'action.hover !important',
                        },
                      },
                    },
                    popper: {
                      // disablePortal: false,
                      sx: {
                        zIndex: `${9999999999} !important`,
                      },
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="filled"
                      size="small"
                      label="Academic Year, Board and Medium"
                    />
                  )}
                  sx={{ minWidth: '300px', width: '100%', '& *': { fontSize: '14px !important' } }}
                />
              )}
            </AnimatedWrapper>
          </CustomTooltip>
        </>
      )}
    </Box>
  );
};
export default GlobalAcademicSearch;
