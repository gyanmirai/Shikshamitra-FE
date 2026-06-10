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
import { findCurrentAcademicYear } from 'src/utils/academic-year';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Skeleton, TextField, Autocomplete } from '@mui/material';
import { useGetUserScopeHierarchyQuery } from 'src/redux/userScope/userScopeApi';
import {
  setCurrentYear,
  setCurrentBoard,
  setCurrentMedium,
} from 'src/redux/globalState/globalSlice';

import type { GlobalAcademicSearchOption } from './types';

const hasNodeAccess = (node: any, fullAccessKey?: string) =>
  !!node?.hasAccess || (fullAccessKey ? !!node?.[fullAccessKey] : false);

const hasAccessibleStandard = (standardScope: any) =>
  hasNodeAccess(standardScope, 'hasFullDivisionAccess') ||
  standardScope?.divisions?.some((divisionScope: any) => divisionScope?.hasAccess);

const hasAccessibleMediumStage = (mediumStageScope: any) =>
  hasNodeAccess(mediumStageScope, 'hasFullStandardAccess') ||
  mediumStageScope?.standards?.some(hasAccessibleStandard);

const hasAccessibleMedium = (mediumScope: any) =>
  hasNodeAccess(mediumScope, 'hasFullMediumStageAccess') ||
  mediumScope?.mediumStages?.some(hasAccessibleMediumStage);

const hasAccessibleBoard = (boardScope: any) =>
  hasNodeAccess(boardScope, 'hasFullMediumAccess') ||
  boardScope?.mediums?.some(hasAccessibleMedium);

const getScopedAcademicData = (
  academicData: Array<AcademicYear & { boards: Board[] }>,
  accessControl: any
) => {
  if (!academicData.length) return [];
  if (accessControl?.isAdmin) return academicData;

  const hierarchy = accessControl?.accessibleHierarchy;
  if (!Array.isArray(hierarchy)) return [];

  return academicData
    .map((year) => {
      const yearScope = hierarchy.find((item: any) => item.academicYearId === year.id);
      if (!yearScope) return null;

      if (yearScope.hasFullBoardAccess) {
        return year;
      }

      const boards = year.boards
        .map((board) => {
          const boardScope = yearScope.boards?.find((item: any) => item.boardId === board.id);
          if (!hasAccessibleBoard(boardScope)) return null;

          if (boardScope.hasFullMediumAccess) {
            return board;
          }

          const educationMediums = board.educationMediums.filter((medium) => {
            const mediumScope = boardScope.mediums?.find(
              (item: any) => item.mediumId === medium.id
            );
            return hasAccessibleMedium(mediumScope);
          });

          return educationMediums.length ? { ...board, educationMediums } : null;
        })
        .filter(Boolean) as Board[];

      return boards.length ? { ...year, boards } : null;
    })
    .filter(Boolean) as Array<AcademicYear & { boards: Board[] }>;
};

const getScopedAcademicYears = (
  academicData: Array<AcademicYear & { boards: Board[] }>,
  accessControl: any
) => {
  if (!academicData.length) return [];
  if (accessControl?.isAdmin) return academicData;

  const hierarchy = accessControl?.accessibleHierarchy;
  if (!Array.isArray(hierarchy)) return [];

  return academicData.filter((year) =>
    hierarchy.some((item: any) => item.academicYearId === year.id)
  );
};

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

  const { data: accessControl, isLoading: isScopeLoading } = useGetUserScopeHierarchyQuery(
    { userId: data?.profile?.sub },
    { skip: !data?.profile?.sub || !data?.accessToken }
  );

  // Memoized computation of merged academic data
  const allData = useMemo(() => {
    if (!years?.items?.length) return [];
    const mergedData = years?.items?.map((year: AcademicYear) => ({
      ...year,
      boards: boardData?.items?.filter((board: Board) => board.academicYearId === year.id) || [],
    }));
    return mergedData || [];
  }, [boardData?.items, years?.items]);

  const scopedData = useMemo(
    () => getScopedAcademicData(allData, accessControl),
    [accessControl, allData]
  );
  const scopedYears = useMemo(
    () => getScopedAcademicYears(allData, accessControl),
    [accessControl, allData]
  );

  /**
   * Generates options for the division autocomplete
   * @returns Array of division options with formatted labels
   */
  const getDivisionOptions = useCallback((): GlobalAcademicSearchOption[] => {
    const options: GlobalAcademicSearchOption[] = [];
    scopedData.forEach((year: AcademicYear & { boards: Board[] }) => {
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
  }, [scopedData]);

  // State for selected division in autocomplete
  const [selectedDivision, setSelectedDivision] = React.useState<GlobalAcademicSearchOption | null>(
    null
  );
  const options = useMemo(() => getDivisionOptions(), [getDivisionOptions]);
  const yearOptions = useMemo(
    () =>
      scopedYears.map((year) => ({
        label: year.name,
        value: year.id,
        academicYear: year,
        board: {} as Board,
        medium: {} as Medium,
      })),
    [scopedYears]
  );
  const selectedYearOption = useMemo(
    () =>
      yearOptions.find((option) => option.academicYear.id === currentYear?.id) ?? selectedDivision,
    [currentYear?.id, selectedDivision, yearOptions]
  );
  const autoSelectedAccessTokenRef = React.useRef<string | null>(null);

  const clearAcademicSelection = useCallback(
    (clearYear: boolean) => {
      if (clearYear) {
        dispatch(setCurrentYear({}));
      }
      dispatch(setCurrentBoard({}));
      dispatch(setCurrentMedium({}));
      setSelectedDivision(null);
    },
    [dispatch]
  );

  // Clear persisted selections that do not belong to the freshly loaded tenant data.
  useEffect(() => {
    if (isYearLoading || isScopeLoading || !years?.items) {
      return;
    }

    if (!currentYear?.id) {
      return;
    }

    const persistedYear = years.items.find((year: AcademicYear) => year.id === currentYear.id);
    if (!persistedYear) {
      clearAcademicSelection(true);
      return;
    }

    if (isBoardLoading || !boardData?.items) {
      return;
    }

    if (!currentBoard?.id && !currentMedium?.id) {
      return;
    }

    const persistedOptionExists = options.some(
      (option) =>
        option.academicYear.id === currentYear.id &&
        option.board.id === currentBoard.id &&
        option.medium.id === currentMedium.id
    );

    if (!persistedOptionExists) {
      clearAcademicSelection(false);
    }
  }, [
    boardData?.items,
    clearAcademicSelection,
    currentBoard?.id,
    currentMedium?.id,
    currentYear?.id,
    isScopeLoading,
    isBoardLoading,
    isYearLoading,
    options,
    years?.items,
  ]);

  useEffect(() => {
    const accessToken = data?.accessToken;

    if (
      !accessToken ||
      autoSelectedAccessTokenRef.current === accessToken ||
      isYearLoading ||
      isBoardLoading ||
      isScopeLoading ||
      !years?.items?.length
    ) {
      return;
    }

    if (currentYear?.id) {
      autoSelectedAccessTokenRef.current = accessToken;
      return;
    }

    const academicYear = findCurrentAcademicYear<AcademicYear>(years.items);
    if (!academicYear) {
      autoSelectedAccessTokenRef.current = accessToken;
      return;
    }

    const defaultYearOption = yearOptions.find(
      (option) => option.academicYear.id === academicYear.id
    );
    const defaultOption = options.find((option) => option.academicYear.id === academicYear.id);

    dispatch(setCurrentYear(defaultOption?.academicYear ?? defaultYearOption?.academicYear ?? {}));
    dispatch(setCurrentBoard(defaultOption?.board ?? {}));
    dispatch(setCurrentMedium(defaultOption?.medium ?? {}));
    setSelectedDivision(defaultOption ?? defaultYearOption ?? null);
    setDriverNextEnabled(true);

    autoSelectedAccessTokenRef.current = accessToken;
  }, [
    data?.accessToken,
    dispatch,
    isBoardLoading,
    isScopeLoading,
    isYearLoading,
    options,
    yearOptions,
    years?.items,
    currentYear?.id,
  ]);

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
      {isYearLoading || isBoardLoading || isScopeLoading ? (
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
                  options={yearOptions}
                  getOptionLabel={(option) => option.academicYear.name}
                  value={selectedYearOption}
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
                      dispatch(setCurrentBoard({}));
                      dispatch(setCurrentMedium({}));
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
