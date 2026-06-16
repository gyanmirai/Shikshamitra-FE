'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetChargeByIdQuery } from 'src/redux/finance/ChargeManagement/chargeApi';
import { audienceToFormFields } from 'src/redux/finance/ChargeManagement/chargeMappers';

import type {
  IUpdateRestrictions,
  IUpdateChargeFormValues,
  IDivisionVisibilityRule,
} from './types';

export const useChargeDetails = (chargeId?: string) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const isCreateMode = !chargeId;

  const queryResult = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargeByIdQuery,
    params: {
      id: chargeId || '',
    },
    options: {
      skip: !chargeId,
    },
  });

  const chargeDetail = isCreateMode ? null : queryResult?.data;
  const isLoading = isCreateMode ? false : queryResult?.isLoading || false;
  const isError = isCreateMode ? false : queryResult?.isError || false;

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
      canChangeStudents: true,
      boardChangeReason: isApplied
        ? 'Cannot change board after charge has been applied'
        : undefined,
      mediumChangeReason: isApplied
        ? 'Cannot change medium after charge has been applied'
        : undefined,
    };
  }, [chargeDetail]);

  const divisionVisibility: IDivisionVisibilityRule = useMemo(() => {
    const classIds = chargeDetail?.audience?.scope?.classIds ?? [];
    const showDivisions = classIds.length === 1;

    return {
      showDivisions,
      reason: showDivisions ? 'single-class-selected' : 'multi-class-selected',
    };
  }, [chargeDetail]);

  const prefillValues: IUpdateChargeFormValues | null = useMemo(() => {
    if (!chargeDetail || !currentYear) return null;

    const audienceFields = audienceToFormFields(chargeDetail.audience);
    const students = chargeDetail.students ?? [];

    return {
      chargeId: chargeDetail.chargeId || '',
      chargeName: chargeDetail.chargeName || '',
      chargeCategoryId: chargeDetail.chargeCategoryId || '',
      chargeCategoryName: chargeDetail.categoryName || '',
      purposeDescription: chargeDetail.purposeDescription || '',
      amount: chargeDetail.amount || '',
      dueDate: chargeDetail.dueDate ? dayjs(chargeDetail.dueDate) : null,
      boardId: chargeDetail.audience?.scope?.boardId || '',
      educationMediumId: chargeDetail.audience?.scope?.educationMediumId || '',
      standardId: audienceFields.standardId,
      divisionIds: audienceFields.divisionIds,
      studentIds:
        audienceFields.studentIds.length > 0
          ? audienceFields.studentIds
          : students.map((s: any) => s.studentId),
      selectedStudents: students.map((s: any) => ({
        id: s.studentId,
        label: s.studentName,
        rollNumber: s.rollNumber,
        grNumber: s.grNumber,
        divisionName: s.divisionName,
      })),
      selectionMode: 'students',
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

export const useDirtyState = (
  initialValues: IUpdateChargeFormValues | null,
  currentValues: IUpdateChargeFormValues
) => {
  const isDirty = useMemo(() => {
    if (!initialValues) return false;
    return JSON.stringify(initialValues) !== JSON.stringify(currentValues);
  }, [initialValues, currentValues]);

  return isDirty;
};

export const useDivisionValidationWarning = (
  previousStandardIds: string[],
  currentStandardIds: string[],
  divisionIds: string[]
) => {
  const shouldShowWarning = useMemo(() => {
    const wasMultiple = previousStandardIds.length > 1;
    const isNowSingle = currentStandardIds.length === 1;
    const hasDivisions = divisionIds.length > 0;
    return wasMultiple && isNowSingle && hasDivisions;
  }, [previousStandardIds, currentStandardIds, divisionIds]);

  return shouldShowWarning;
};
