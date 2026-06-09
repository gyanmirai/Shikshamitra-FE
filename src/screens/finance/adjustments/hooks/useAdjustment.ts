import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  useCreateFeeAdjustmentMutation,
  useRejectFeeAdjustmentMutation,
  useGetAdjustmentApplicationsQuery,
} from 'src/redux/finance/adjustments/adjustmentApi';

import { buildAdjustmentApiPayload } from '../types/adjustmentFormValues';
import { useFinanceAcademicFilters } from '../../hooks/useFinanceAcademicFilters';
import { AdjustmentTabEnum, AdjustmentStatusEnum } from '../enums/adjustment.enum';

import type { AdjustmentRequest } from '../types/adjustment.types';
import type { IAdjustmentFullFormValues } from '../types/adjustmentFormValues';
import type { FeeAdjustmentApplicationItemDto } from '../types/adjustmentApi.types';

const mapItemToAdjustmentRequest = (item: FeeAdjustmentApplicationItemDto): AdjustmentRequest => ({
  id: item.id,
  studentId: item.studentId,
  studentName: item.studentName,
  studentGrNo: item.grNumber,
  className: item.standardName,
  divisionName: item.divisionName,
  rollNumber: item.rollNo,
  adjustmentType: item.adjustmentTypeName,
  adjustmentAmount: item.requestedAmount,
  reason: '',
  status: item.status,
  requestedBy: item.requestedByName ?? '',
  createdAt: item.createdAt,
  appliedAmount: item.appliedAmount,
  remainingAdjustmentBalance: item.remainingAmount,
});

export function useAdjustment(activeTab: AdjustmentTabEnum) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { filterPayload, isReady } = useFinanceAcademicFilters();

  const queryParams = useMemo(() => {
    if (!isReady || !filterPayload || !currentYear?.id) return null;

    const base = {
      boardId: filterPayload.boardId,
      educationMediumId: filterPayload.educationMediumId,
      academicYearId: currentYear.id,
      standardId: filterPayload.standardId,
      divisionId: filterPayload.divisionId,
      page: 1,
      pageSize: 100,
    };

    if (activeTab === AdjustmentTabEnum.Pending) {
      return { ...base, status: AdjustmentStatusEnum.Pending };
    }
    if (activeTab === AdjustmentTabEnum.Rejected) {
      return { ...base, status: AdjustmentStatusEnum.Rejected };
    }
    return { ...base, completedOnly: true };
  }, [filterPayload, currentYear?.id, activeTab, isReady]);

  const {
    data: applications,
    isLoading,
    refetch,
  } = useGetAdjustmentApplicationsQuery(queryParams!, { skip: !queryParams });

  const [createFeeAdjustment, createState] = useCreateFeeAdjustmentMutation();
  const [rejectFeeAdjustment, rejectState] = useRejectFeeAdjustmentMutation();

  const adjustments: AdjustmentRequest[] = useMemo(
    () => (applications?.items ?? []).map(mapItemToAdjustmentRequest),
    [applications?.items]
  );

  const tabCounts = useMemo(
    () => ({
      [AdjustmentTabEnum.Pending]: applications?.pendingCount ?? 0,
      [AdjustmentTabEnum.Approved]:
        (applications?.appliedCount ?? 0) + (applications?.partiallyAppliedCount ?? 0),
      [AdjustmentTabEnum.Rejected]: applications?.rejectedCount ?? 0,
    }),
    [applications]
  );

  const createAdjustment = async (values: IAdjustmentFullFormValues) => {
    if (!currentYear?.id) throw new Error('Academic year is required.');
    const body = buildAdjustmentApiPayload(values);
    await createFeeAdjustment({ academicYearId: currentYear.id, body }).unwrap();
    refetch();
  };

  const rejectAdjustment = async (id: string, _rejectedBy: string, rejectionReason: string) => {
    await rejectFeeAdjustment({ id, body: { message: rejectionReason } }).unwrap();
    refetch();
  };

  return {
    adjustments,
    tabCounts,
    isLoading,
    refetch,
    createAdjustment,
    rejectAdjustment,
    isCreating: createState.isLoading,
    isRejecting: rejectState.isLoading,
  };
}
