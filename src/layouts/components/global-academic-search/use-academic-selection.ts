import type { RootState } from 'src/redux/store';
import type { Board, Medium, AcademicYear } from 'src/types/school';

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCurrentYear,
  setCurrentBoard,
  setCurrentMedium,
} from 'src/redux/globalState/globalSlice';
import {
  getValidGlobalAcademicSelection,
  getScopedSelectedAcademicOption,
} from 'src/utils/academicHierarchyUtils';

import { useAcademicDefault } from './use-academic-default';

import type { GlobalAcademicSearchOption } from './types';
import type { useAcademicOptions } from './use-academic-options';

type AcademicState = {
  currentYear: Partial<AcademicYear>;
  currentBoard: Partial<Board>;
  currentMedium: Partial<Medium>;
};

export function useAcademicSelection(data: ReturnType<typeof useAcademicOptions>) {
  const dispatch = useDispatch();
  const { currentYear, currentBoard, currentMedium } = useSelector(
    (state: RootState) => state.globalState as AcademicState
  );
  const { years, boardData, isLoading, scopedYears, options, yearOptions, isYearOnly } = data;
  const selectedYearOption =
    yearOptions.find((option) => option.academicYear.id === currentYear?.id) ?? null;
  const selectedBoardMediumOption = getScopedSelectedAcademicOption(
    currentYear,
    currentBoard,
    currentMedium,
    options
  );

  useEffect(() => {
    if (isLoading || !years?.items || !boardData?.items || !currentYear?.id) return;

    const selection = getValidGlobalAcademicSelection(
      currentYear,
      currentBoard,
      currentMedium,
      scopedYears,
      options
    );
    if (!selection) return;
    if (selection.clearYear) {
      dispatch(setCurrentYear({}));
      dispatch(setCurrentBoard({}));
      dispatch(setCurrentMedium({}));
      return;
    }
    if (selection.academicYear !== currentYear) dispatch(setCurrentYear(selection.academicYear));
    if ((selection.board?.id || undefined) !== (currentBoard?.id || undefined)) {
      dispatch(setCurrentBoard(selection.board));
    }
    if (selection.medium?.id ? selection.medium !== currentMedium : !!currentMedium?.id) {
      dispatch(setCurrentMedium(selection.medium));
    }
  }, [
    boardData?.items,
    currentBoard,
    currentMedium,
    currentYear,
    dispatch,
    isLoading,
    options,
    scopedYears,
    years?.items,
  ]);

  // The default-selection effect depends on this function; its identity must survive renders.
  const applyAcademicOption = useCallback(
    (option: GlobalAcademicSearchOption | null) => {
      dispatch(setCurrentYear(option?.academicYear ?? {}));
      dispatch(setCurrentBoard(option?.board ?? {}));
      dispatch(setCurrentMedium(option?.medium ?? {}));
    },
    [dispatch]
  );

  useAcademicDefault({
    ...data,
    currentYearId: currentYear?.id,
    currentRouteSelectionIsScoped: isYearOnly
      ? !!currentYear?.id && scopedYears.some((year) => year.id === currentYear.id)
      : !!selectedBoardMediumOption,
    applyAcademicOption,
  });

  return { selectedYearOption, selectedBoardMediumOption, applyAcademicOption };
}
