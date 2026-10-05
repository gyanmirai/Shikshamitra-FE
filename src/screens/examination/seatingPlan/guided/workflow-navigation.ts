import type { FormikProps } from 'formik';
import type { SeatingPlanGroupDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { buildWorkflowUrl } from './workflow-config';

import type { GuidedSeatingValues } from './types';

interface Args {
  pathname: string;
  query: string;
  seatingPlanId?: string;
  formik: FormikProps<GuidedSeatingValues>;
  manualPreviousRoomIds: { current: string[] };
  resetPreview: () => void;
}

export function createWorkflowNavigation({
  pathname,
  query,
  seatingPlanId,
  formik,
  manualPreviousRoomIds,
  resetPreview,
}: Args) {
  const navigate = (step: number, planId: string | null = seatingPlanId ?? null) => {
    window.history.replaceState(null, '', buildWorkflowUrl(pathname, query, step, planId));
  };
  const openPlan = (plan: SeatingPlanGroupDto) => {
    manualPreviousRoomIds.current = plan.selectedRoomIds;
    formik.setValues({
      ...formik.values,
      selectedPlanId: plan.seatingPlanId,
      selectedExamSubjectIds: [],
      selectedRoomIds: plan.selectedRoomIds,
      acknowledgeWarnings: false,
    });
    resetPreview();
    navigate(1, plan.seatingPlanId);
  };
  const startNewPlan = () => {
    manualPreviousRoomIds.current = [];
    formik.setValues({
      ...formik.values,
      selectedPlanId: '',
      selectedExamSubjectIds: [],
      planName: '',
      selectedRoomIds: [],
      acknowledgeWarnings: false,
    });
    resetPreview();
    navigate(0, null);
  };
  return { navigate, openPlan, startNewPlan };
}
