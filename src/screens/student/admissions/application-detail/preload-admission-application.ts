import type { AppDispatch } from 'src/redux/store';

import { admissionFormStageApi } from 'src/redux/student/admissions/admission-form-stage-api';
import { admissionApplicationsApi } from 'src/redux/student/admissions/admission-applications-api';

/** Start the two unconditional detail reads on click, alongside the route transition.
 * The destination subscribes to the same RTK Query keys, sharing pending requests
 * and normal cache/invalidation rules. Only the server-confirmed active Form
 * reads may follow; never prepare write endpoints.
 */
export function preloadAdmissionApplication(dispatch: AppDispatch, id: string) {
  dispatch((readDispatch, getState) => {
    const { auth } = getState();
    const application = readDispatch(
      admissionApplicationsApi.endpoints.getAdmissionApplication.initiate(id, { subscribe: false })
    );
    const workflow = readDispatch(
      admissionApplicationsApi.endpoints.getAdmissionApplicationWorkflow.initiate(id, {
        subscribe: false,
      })
    );
    Promise.all([application, workflow])
      .then(([record, journey]) => {
        const applicationData = record.data;
        const workflowData = journey.data;
        // Never continue a preload across an account/permission-context change,
        // failed core read or an inconsistent stage snapshot. Normal screen reads retry.
        if (
          getState().auth !== auth ||
          !record.isSuccess ||
          !journey.isSuccess ||
          applicationData?.id !== id ||
          workflowData?.status !== 0
        )
          return;
        const stage = workflowData.stages.find(
          (item) => item.id === workflowData.currentStageInstanceId
        );
        if (
          !stage ||
          stage.stageType !== 1 ||
          stage.status !== 1 ||
          applicationData.currentStageInstanceId !== stage.id
        )
          return;
        readDispatch(
          admissionApplicationsApi.endpoints.getAdmissionApplicationForm.initiate(id, {
            subscribe: false,
          })
        );
        if (stage.formStageEnabled)
          readDispatch(
            admissionFormStageApi.endpoints.getAdmissionFormStage.initiate(
              { applicationId: id, stageId: stage.id },
              { subscribe: false }
            )
          );
      })
      .catch(() => undefined);
  });
}
