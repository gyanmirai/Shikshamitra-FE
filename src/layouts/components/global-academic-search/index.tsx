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
import {
  getScopedAcademicData,
  getScopedAcademicYears,
  getGlobalAcademicSearchOptions,
  getValidGlobalAcademicSelection,
  getScopedSelectedAcademicOption,
} from 'src/utils/academicHierarchyUtils';

import type { GlobalAcademicSearchOption } from './types';

type AcademicYearWithBoards = AcademicYear & { boards: Board[] };

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
  const allData = useMemo<AcademicYearWithBoards[]>(() => {
    if (!years?.items?.length) return [];
    const mergedData = years?.items?.map((year: AcademicYear) => ({
      ...year,
      boards: boardData?.items?.filter((board: Board) => board.academicYearId === year.id) || [],
    }));
    return mergedData || [];
  }, [boardData?.items, years?.items]);

  const scopedData = useMemo<AcademicYearWithBoards[]>(
    () => getScopedAcademicData(allData, accessControl),
    [accessControl, allData]
  );
  const scopedYears = useMemo<AcademicYearWithBoards[]>(
    () => getScopedAcademicYears(allData, accessControl),
    [accessControl, allData]
  );

  const options = useMemo<GlobalAcademicSearchOption[]>(
    () => getGlobalAcademicSearchOptions(scopedData),
    [scopedData]
  );
  const yearOptions = useMemo<GlobalAcademicSearchOption[]>(
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
    () => yearOptions.find((option) => option.academicYear.id === currentYear?.id) ?? null,
    [currentYear?.id, yearOptions]
  );
  const selectedBoardMediumOption = useMemo(
    () =>
      getScopedSelectedAcademicOption(currentYear, currentBoard, currentMedium, options) ?? null,
    [currentBoard, currentMedium, currentYear, options]
  );
  const pathname = usePathname();
  const isStudentModule = pathname === '/student' || pathname.startsWith('/student/');
  const isShowOnlyYearModule = ['/dashboard', '/finance', '/library', '/calendar', '/hr', '/student'].some(
    (route) => pathname.startsWith(route)
  );
  const hasAcademicSelection = isShowOnlyYearModule
    ? !!selectedYearOption
    : !!selectedBoardMediumOption;
  const autoSelectedAccessTokenRef = React.useRef<string | null>(null);

  const clearAcademicSelection = useCallback(
    (clearYear: boolean) => {
      if (clearYear) {
        dispatch(setCurrentYear({}));
      }
      dispatch(setCurrentBoard({}));
      dispatch(setCurrentMedium({}));
    },
    [dispatch]
  );

  // Normalize persisted selections against the freshly scoped tenant data.
  useEffect(() => {
    if (isYearLoading || isBoardLoading || isScopeLoading || !years?.items || !boardData?.items) {
      return;
    }

    if (!currentYear?.id) {
      return;
    }

    const selection = getValidGlobalAcademicSelection(
      currentYear,
      currentBoard,
      currentMedium,
      scopedYears,
      options
    );

    if (!selection) {
      return;
    }

    if (selection.clearYear) {
      clearAcademicSelection(true);
      return;
    }

    const shouldUpdateYear = selection.academicYear !== currentYear;
    const shouldUpdateBoard =
      (selection.board?.id || undefined) !== (currentBoard?.id || undefined);
    const shouldUpdateMedium =
      (selection.medium?.id || undefined) !== (currentMedium?.id || undefined);

    if (shouldUpdateYear) {
      dispatch(setCurrentYear(selection.academicYear));
    }
    if (shouldUpdateBoard) {
      dispatch(setCurrentBoard(selection.board));
    }
    if (shouldUpdateMedium) {
      dispatch(setCurrentMedium(selection.medium));
    }
  }, [
    boardData?.items,
    clearAcademicSelection,
    currentBoard,
    currentMedium,
    currentYear,
    dispatch,
    isScopeLoading,
    isBoardLoading,
    isYearLoading,
    options,
    scopedYears,
    years?.items,
  ]);

  const getDefaultAcademicSelection = useCallback(() => {
    const academicYear = findCurrentAcademicYear<AcademicYear>(years?.items || []);
    if (!academicYear) {
      return null;
    }

    // Always return the full option (year + board + medium) so that board and
    // medium are persisted in Redux even on year-only routes (Dashboard etc.).
    // The year-only UI simply doesn't display them.
    const defaultOption = options.find((option) => option.academicYear.id === academicYear.id);
    if (defaultOption) return defaultOption;

    // Fallback: year with no boards/mediums yet
    const defaultYearOption = yearOptions.find(
      (option) => option.academicYear.id === academicYear.id
    );
    return defaultYearOption ?? null;
  }, [options, yearOptions, years?.items]);

  const applyAcademicOption = useCallback(
    (option: GlobalAcademicSearchOption | null) => {
      dispatch(setCurrentYear(option?.academicYear ?? {}));
      dispatch(setCurrentBoard(option?.board ?? {}));
      dispatch(setCurrentMedium(option?.medium ?? {}));
    },
    [dispatch]
  );

  const currentYearIsScoped = useMemo(
    () => !!currentYear?.id && scopedYears.some((year) => year.id === currentYear.id),
    [currentYear?.id, scopedYears]
  );
  const currentRouteSelectionIsScoped = isShowOnlyYearModule
    ? currentYearIsScoped
    : !!selectedBoardMediumOption;

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

    if (currentYear?.id && currentRouteSelectionIsScoped) {
      autoSelectedAccessTokenRef.current = accessToken;
      return;
    }

    const defaultOption = getDefaultAcademicSelection();
    if (!defaultOption) {
      return;
    }

    applyAcademicOption(defaultOption);
    setDriverNextEnabled(true);

    autoSelectedAccessTokenRef.current = accessToken;
  }, [
    applyAcademicOption,
    currentYear?.id,
    currentRouteSelectionIsScoped,
    data?.accessToken,
    getDefaultAcademicSelection,
    isBoardLoading,
    isScopeLoading,
    isYearLoading,
    years?.items,
  ]);

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
    <Box
      data-onboarding="academic-year"
      sx={{
        flex: '1 1 160px',
        minWidth: { xs: 0, md: isShowOnlyYearModule ? 200 : 300 },
        width: '100%',
        maxWidth: isShowOnlyYearModule ? 200 : 300,
      }}
    >
      {isYearLoading || isBoardLoading || isScopeLoading ? (
        <Skeleton variant="rounded" height={56} sx={{ minWidth: 0, width: '100%' }} />
      ) : (
        <>
          {ConfirmDialog}
          <CustomTooltip
            arrow
            title={!hasAcademicSelection
              ? isStudentModule ? 'Select academic year' : 'Select Academic Year, Board and Medium'
              : undefined}
            placement="bottom"
          >
            <AnimatedWrapper error={!hasAcademicSelection} sx={{ minWidth: 0, width: '100%' }}>
              {isShowOnlyYearModule ? (
                <Autocomplete
                  key="academic-year-only"
                  open={isDropdownOpen}
                  onOpen={() => setIsDropdownOpen(true)}
                  onClose={() => setIsDropdownOpen(false)}
                  // disablePortal={false}
                  options={yearOptions}
                  getOptionLabel={(option) => option.academicYear.name}
                  getOptionKey={(option) => option.value}
                  value={selectedYearOption}
                  loading={isYearLoading || isBoardLoading}
                  clearIcon={false}
                  disableClearable={!!selectedYearOption}
                  size="small"
                  onChange={async (event, newValue) => {
                    const confirmed = await showConfirm({
                      title: isStudentModule ? 'Change academic year' : 'Change Academic Year, Board and Medium',
                      confirmText: isStudentModule ? 'Change year' : undefined,
                      message: !currentYear?.name
                        ? `Are you sure you want to set academic year ${newValue?.academicYear?.name}?`
                        : `Are you sure you want to change academic year from  ${currentYear?.name || ''} to ${newValue?.academicYear?.name} ?`,
                      icon: 'warning',
                    });
                    if (confirmed) {
                      // Find the first board+medium option for the selected year so that
                      // board and medium are kept in Redux even on year-only routes.
                      const firstOption = options.find(
                        (opt) => opt.academicYear.id === newValue?.academicYear?.id
                      );
                      dispatch(setCurrentYear(newValue?.academicYear));
                      dispatch(setCurrentBoard(firstOption?.board ?? {}));
                      dispatch(setCurrentMedium(firstOption?.medium ?? {}));
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
                  sx={{ minWidth: 0, width: '100%', '& *': { fontSize: '14px !important' } }}
                />
              ) : (
                <Autocomplete
                  key="academic-year-board-medium"
                  open={isDropdownOpen}
                  // disablePortal={false}
                  onOpen={() => setIsDropdownOpen(true)}
                  onClose={() => setIsDropdownOpen(false)}
                  options={options}
                  getOptionLabel={(option) => option.label}
                  getOptionKey={(option) => option.value}
                  value={selectedBoardMediumOption}
                  loading={isYearLoading || isBoardLoading}
                  clearIcon={false}
                  disableClearable={!!selectedBoardMediumOption}
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
                  sx={{
                    minWidth: 0,
                    width: '100%',
                    '& *': { fontSize: '14px !important' },
                    '& .MuiInputLabel-root': {
                      maxWidth: 'calc(100% - 32px)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    },
                  }}
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
