import type { Board } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { AccessSelection } from 'src/utils/academicHierarchyUtils';

import { useSelector } from 'react-redux';
import { useRef, useMemo, useState, useEffect } from 'react';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetAccessControlQuery, useAddAccessControlMutation } from 'src/redux/hr/employeeApi';
import {
  emptyAccessSelection,
  expandAccessibleHierarchy,
  compressExplicitAcademicSelection,
} from 'src/utils/academicHierarchyUtils';

import { submitAccessControlForm } from '../services/submit-access-control';

export type AccessControlFormProps = {
  user?: { id?: string } | null;
  handleClose?: () => void;
  academicYearId?: string;
  onCancel?: () => void;
  onBusyChange?: (busy: boolean) => void;
  onDirtyChange?: (dirty: boolean) => void;
};

export function useAccessControlForm({
  user,
  handleClose,
  academicYearId,
  onBusyChange,
  onDirtyChange,
}: AccessControlFormProps) {
  // State for tracking selected items across different categories
  const [checkedItem, setCheckedItem] = useState<AccessSelection>(emptyAccessSelection());

  const [selectedData, setSelectedData] = useState<AccessSelection>(emptyAccessSelection());

  // Get current academic year from global state
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const yearId = academicYearId ?? currentYear?.id;
  const initialized = useRef(false);
  const initialSelection = useRef(emptyAccessSelection());

  // Mutation hook for adding access control
  const [addAccessControl, { isLoading: isAddAccessControlLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddAccessControlMutation,
    popupConfig: { success: true, successMessage: 'Access Control added successfully' },
  });

  // Query hook for fetching existing access control data
  const {
    data: accessControl,
    currentData: currentAccessControl,
    isLoading,
    isFetching,
    isError: accessError,
    refetch: refetchAccess,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAccessControlQuery,
    params: { userId: user?.id, academicYearId: yearId },
    options: { skip: !(user?.id && yearId) },
  });
  const activeAccessControl = currentAccessControl ?? (!isFetching ? accessControl : undefined);

  // Full boards tree for the current academic year — needed to expand the
  // BE response when it compresses branches via `hasFull*Access` flags.
  const {
    data: boardsData,
    currentData: currentBoardsData,
    isLoading: boardsLoading,
    isFetching: boardsFetching,
    isError: boardsError,
    refetch: refetchBoards,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });
  const activeBoardsData = currentBoardsData ?? (!boardsFetching ? boardsData : undefined);
  const allBoards = useMemo(
    () => activeBoardsData?.items?.filter((b: Board) => b.academicYearId === yearId),
    [activeBoardsData?.items, yearId]
  );
  const isHierarchyLoading = isLoading || isFetching || boardsLoading || boardsFetching;
  const canSubmit = Boolean(
    user?.id &&
    yearId &&
    allBoards?.length &&
    activeAccessControl &&
    !isHierarchyLoading &&
    !accessError &&
    !boardsError
  );

  useEffect(() => {
    onBusyChange?.(isAddAccessControlLoading);
    return () => onBusyChange?.(false);
  }, [isAddAccessControlLoading, onBusyChange]);

  useEffect(() => {
    onDirtyChange?.(JSON.stringify(checkedItem) !== JSON.stringify(initialSelection.current));
  }, [checkedItem, onDirtyChange]);

  // Effect to populate form with existing access control data
  useEffect(() => {
    if (!user?.id || !yearId) {
      setCheckedItem(emptyAccessSelection());
      setSelectedData(emptyAccessSelection());
      return;
    }

    if (initialized.current || !activeAccessControl?.accessibleHierarchy || !allBoards?.length)
      return;
    const expanded = expandAccessibleHierarchy(activeAccessControl, allBoards);
    initialized.current = true;
    initialSelection.current = expanded;
    setCheckedItem(expanded);
    setSelectedData(compressExplicitAcademicSelection(expanded, allBoards));
  }, [activeAccessControl, allBoards, yearId, user?.id]);

  // Handler for form submission
  const handleSubmit = async () => {
    try {
      await submitAccessControlForm({
        addAccessControl,
        userId: user?.id,
        currentYearId: yearId,
        checkedItem,
        allBoards,
        handleClose,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    yearId,
    checkedItem,
    setCheckedItem,
    selectedData,
    setSelectedData,
    allBoards,
    isHierarchyLoading,
    canSubmit,
    isAddAccessControlLoading,
    accessError,
    boardsError,
    refetchAccess,
    refetchBoards,
    handleSubmit,
  };
}
