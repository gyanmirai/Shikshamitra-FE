import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';

export const ALL_CLASS_OPTION = { id: 'All Classes', name: 'All Classes' };
export const ALL_DIVISION_OPTION = { id: 'All Divisions', name: 'All Divisions' };

export interface FinanceAcademicFilterPayload {
	academicYearId: string;
  boardId: string;
  educationMediumId: string;
  standardId?: string;
  divisionId?: string;
}

export interface UseFinanceAcademicFiltersResult {
  boards: Board[];
  mediums: Medium[];
  classes: any[];
  divisions: any[];
  selectedBoard: string;
  selectedMedium: string;
  selectedStandardId: string;
  selectedDivisionId: string;
  isReady: boolean;
  classOptions: Array<{ id: string; name: string }>;
  divisionOptions: Array<{ id: string; name: string }>;
  isDivisionDisabled: boolean;
  filterPayload: FinanceAcademicFilterPayload | null;
  setSelectedBoard: (boardId: string) => void;
  setSelectedMedium: (mediumId: string) => void;
  setSelectedStandardId: (standardId: string) => void;
  setSelectedDivisionId: (divisionId: string) => void;
  classesLoading: boolean;
}

export function useFinanceAcademicFilters(): UseFinanceAcademicFiltersResult {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [selectedBoard, setSelectedBoardState] = useState('');
  const [selectedMedium, setSelectedMediumState] = useState('');
  const [selectedStandardId, setSelectedStandardIdState] = useState('All Classes');
  const [selectedDivisionId, setSelectedDivisionIdState] = useState('All Divisions');

  const boards = useMemo<Board[]>(() => currentYear?.boards ?? [], [currentYear?.boards]);

  const mediums = useMemo<Medium[]>(() => {
    if (!selectedBoard) return [];
    const board = boards.find((b) => b.id === selectedBoard);
    return (board as Board)?.educationMediums ?? [];
  }, [boards, selectedBoard]);

  const [getClassByMedium, { data: classes = [], isLoading: classesLoading }] = useQueryAndMutation(
    {
      type: 'mutation',
      currentQueryAndMutation: useLazyGetClassByMediumQuery,
    }
  );

	const isReady = Boolean(currentYear?.id && selectedBoard && selectedMedium);

  const divisions = useMemo(() => {
    if (!selectedStandardId || selectedStandardId === 'All Classes') return [];
    return classes?.find((cls: any) => cls.id === selectedStandardId)?.divisions ?? [];
  }, [classes, selectedStandardId]);

  const isDivisionDisabled = !selectedStandardId || selectedStandardId === 'All Classes';

  const classOptions = useMemo(() => [ALL_CLASS_OPTION, ...(classes ?? [])], [classes]);

  const divisionOptions = useMemo(() => {
    if (isDivisionDisabled) return [ALL_DIVISION_OPTION];
    return [ALL_DIVISION_OPTION, ...divisions];
  }, [divisions, isDivisionDisabled]);

  const resetClassAndDivision = useCallback(() => {
    setSelectedStandardIdState('All Classes');
    setSelectedDivisionIdState('All Divisions');
  }, []);

  const setSelectedBoard = useCallback(
    (boardId: string) => {
      setSelectedBoardState(boardId);
      const board = boards.find((b) => b.id === boardId);
      const firstMedium = board?.educationMediums?.[0]?.id ?? '';
      setSelectedMediumState(firstMedium);
      resetClassAndDivision();
    },
    [boards, resetClassAndDivision]
  );

  const setSelectedMedium = useCallback(
    (mediumId: string) => {
      setSelectedMediumState(mediumId);
      resetClassAndDivision();
    },
    [resetClassAndDivision]
  );

  const setSelectedStandardId = useCallback((standardId: string) => {
    setSelectedStandardIdState(standardId);
    setSelectedDivisionIdState('All Divisions');
  }, []);

  const setSelectedDivisionId = useCallback((divisionId: string) => {
    setSelectedDivisionIdState(divisionId);
  }, []);

  useEffect(() => {
    if (!currentYear?.boards?.length) return;
    const firstBoard = currentYear.boards[0];
    const firstMedium = firstBoard?.educationMediums?.[0]?.id ?? '';
    setSelectedBoardState(firstBoard?.id ?? '');
    setSelectedMediumState(firstMedium);
    resetClassAndDivision();
  }, [currentYear?.id, currentYear?.boards, resetClassAndDivision]);

  useEffect(() => {
    if (selectedMedium) {
      getClassByMedium(selectedMedium);
    }
  }, [selectedMedium, getClassByMedium]);

  const filterPayload = useMemo<FinanceAcademicFilterPayload | null>(() => {
    if (!isReady) return null;

		const payload: FinanceAcademicFilterPayload = {
			academicYearId: currentYear!.id,
			boardId: selectedBoard,
      educationMediumId: selectedMedium,
    };

    // Only include standardId if not 'All Classes'
    if (selectedStandardId && selectedStandardId !== 'All Classes') {
      payload.standardId = selectedStandardId;
    }

    // Only include divisionId if not 'All Divisions'
    if (selectedDivisionId && selectedDivisionId !== 'All Divisions') {
      payload.divisionId = selectedDivisionId;
    }

    return payload;
	}, [isReady, currentYear, selectedBoard, selectedMedium, selectedStandardId, selectedDivisionId]);

  return {
    boards,
    mediums,
    classes: classes ?? [],
    divisions,
    selectedBoard,
    selectedMedium,
    selectedStandardId,
    selectedDivisionId,
    isReady,
    classOptions,
    divisionOptions,
    isDivisionDisabled,
    filterPayload,
    setSelectedBoard,
    setSelectedMedium,
    setSelectedStandardId,
    setSelectedDivisionId,
    classesLoading,
  };
}
