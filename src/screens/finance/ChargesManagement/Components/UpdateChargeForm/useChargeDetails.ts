'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetChargeByIdQuery } from 'src/redux/finance/ChargeManagement/chargeApi';

import type {
  IUpdateRestrictions,
  IUpdateChargeFormValues,
  IDivisionVisibilityRule,
} from './types';

/**
 * Hook to fetch and prefill charge details
 * Handles data transformation and restriction logic
 * In Create mode (no chargeId), returns default values
 */
export const useChargeDetails = (chargeId?: string) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const isCreateMode = !chargeId;

  // Fetch charge details only if chargeId is provided (Edit mode)
  // When type: 'query', useQueryAndMutation returns an object, not an array
  const queryResult = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargeByIdQuery,
    params: {
      id: chargeId || '',
    },
    options: {
      skip: !chargeId, // Skip query if no chargeId (Create mode)
    },
  });

  // Extract data from query result - it's an object when type: 'query'
  const chargeDetail = isCreateMode ? null : queryResult?.data;
  const isLoading = isCreateMode ? false : queryResult?.isLoading || false;
  const isError = isCreateMode ? false : queryResult?.isError || false;

  // Determine update restrictions based on charge status
  const restrictions: IUpdateRestrictions = useMemo(() => {
    if (!chargeDetail) {
      return {
        canChangeBoardId: true,
        canChangeEducationMediumId: true,
        canChangeStandardId: true,
        canChangeStudents: true,
      };
    }

    const appliedCount = chargeDetail?.appliedCount || 0;
    const isApplied = appliedCount > 0;

    return {
      canChangeBoardId: !isApplied,
      canChangeEducationMediumId: !isApplied,
      canChangeStandardId: !isApplied,
      canChangeStudents: true, // Always allow student changes
      boardChangeReason: isApplied
        ? 'Cannot change board after charge has been applied'
        : undefined,
      mediumChangeReason: isApplied
        ? 'Cannot change medium after charge has been applied'
        : undefined,
    };
  }, [chargeDetail]);

  // Determine division visibility logic
  const divisionVisibility: IDivisionVisibilityRule = useMemo(() => {
    // Show divisions only if a single class is selected
    const showDivisions = !!chargeDetail?.standardIds && chargeDetail.standardIds.length === 1;

    return {
      showDivisions,
      reason: showDivisions ? 'single-class-selected' : 'multi-class-selected',
    };
  }, [chargeDetail]);

  // Transform API response to form values
  const prefillValues: IUpdateChargeFormValues | null = useMemo(() => {
    if (!chargeDetail || !currentYear) return null;

    return {
      chargeId: chargeDetail.chargeId || '',
      chargeName: chargeDetail.chargeName || '',
      chargeCategoryId: chargeDetail.chargeCategoryId || '',
      chargeCategoryName: chargeDetail.categoryName || '',
      purposeDescription: chargeDetail.purposeDescription || '',
      amount: chargeDetail.amount || '',
      dueDate: chargeDetail.dueDate ? dayjs(chargeDetail.dueDate) : null,
      additionalNotes: chargeDetail.additionalNotes || '',

      // Academic Structure
      boardId: chargeDetail.boardId || '',
      educationMediumId: chargeDetail.educationMediumId || '',
      standardId: chargeDetail.standardIds || [], // Keep as array
      divisionIds: chargeDetail.divisionIds || [],

      // Student Selection
      studentIds: chargeDetail.studentIds || [],
      selectedStudents:
        chargeDetail.studentIds?.map((id: string) => ({
          id,
          label: `Student ${id}`, // Will be replaced by actual student data
        })) || [],

      // Selection mode determination
      selectionMode:
        chargeDetail.studentIds && chargeDetail.studentIds.length > 0
          ? 'students'
          : chargeDetail.divisionIds && chargeDetail.divisionIds.length > 0
            ? 'divisions'
            : chargeDetail.standardIds && chargeDetail.standardIds.length > 0
              ? 'classes'
              : 'students',
    };
  }, [chargeDetail, currentYear]);

  return {
    prefillValues,
    chargeDetail,
    isLoading,
    isError,
    restrictions,
    divisionVisibility,
    isCreateMode,
  };
};

/**
 * Hook to track dirty state (unsaved changes)
 */
export const useDirtyState = (
  initialValues: IUpdateChargeFormValues | null,
  currentValues: IUpdateChargeFormValues
) => {
  const isDirty = useMemo(() => {
    if (!initialValues) return false;

    // Deep comparison of values
    return JSON.stringify(initialValues) !== JSON.stringify(currentValues);
  }, [initialValues, currentValues]);

  return isDirty;
};

/**
 * Hook to handle multi-class to single-class transition warning
 */
export const useDivisionValidationWarning = (
  previousStandardIds: string[],
  currentStandardIds: string[],
  divisionIds: string[]
) => {
  const shouldShowWarning = useMemo(() => {
    // Show warning if transitioning from multiple classes to single class
    // and divisions are already selected
    const wasMultiple = previousStandardIds.length > 1;
    const isNowSingle = currentStandardIds.length === 1;
    const hasDivisions = divisionIds.length > 0;

    return wasMultiple && isNowSingle && hasDivisions;
  }, [previousStandardIds, currentStandardIds, divisionIds]);

  return shouldShowWarning;
};
