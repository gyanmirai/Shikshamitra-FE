import type { ApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';
import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';
import type {
  AdmissionApplication,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { canRequestNormalStageAdvance } from '../application-detail/application-progress-model';

export type AssessmentContinueServices = {
  application: (id: string) => Promise<Pick<AdmissionApplication, 'status' | 'concurrencyStamp'>>;
  workflow: (id: string) => Promise<AdmissionApplicationWorkflow>;
  assessment: (applicationId: string, stageInstanceId: string) => Promise<ApplicationAssessment>;
  advance: (input: {
    id: string;
    expectedCurrentStageInstanceId: string;
    concurrencyStamp: string;
    idempotencyKey: string;
  }) => Promise<unknown>;
};

export type AssessmentContinueRetry = {
  command?: Parameters<AssessmentContinueServices['advance']>[0];
};

/** Both individual and bulk continuation refresh the same evidence before the guarded command. */
export async function continueAssessment(
  row: AssessmentRosterItem,
  services: AssessmentContinueServices,
  idempotencyKey: string,
  retry?: AssessmentContinueRetry
) {
  const send = async (command: Parameters<AssessmentContinueServices['advance']>[0]) => {
    try {
      return await services.advance(command);
    } catch (failure) {
      const status =
        failure && typeof failure === 'object' && 'status' in failure ? failure.status : undefined;
      // A definite business rejection has no receipt; retry with freshly validated evidence.
      if (retry && typeof status === 'number' && status >= 400 && status < 500 && status !== 408)
        delete retry.command;
      throw failure;
    }
  };
  // Replay the exact sent command so the server can resolve its durable receipt before stage checks.
  if (retry?.command) {
    if (
      retry.command.id !== row.applicationId ||
      retry.command.expectedCurrentStageInstanceId !== row.stageInstanceId ||
      retry.command.idempotencyKey !== idempotencyKey
    )
      throw new Error('The saved continuation request belongs to another assessment.');
    return send(retry.command);
  }
  const [application, workflow, assessment] = await Promise.all([
    services.application(row.applicationId),
    services.workflow(row.applicationId),
    services.assessment(row.applicationId, row.stageInstanceId),
  ]);
  if (workflow.currentStageInstanceId !== row.stageInstanceId)
    throw new Error(
      'The admission step changed. Refresh the roster and review the current application.'
    );
  const stage = workflow.stages.find((item) => item.id === row.stageInstanceId);
  if (!assessment.canComplete || !canRequestNormalStageAdvance(stage, application.status))
    throw new Error(
      assessment.blockers.join(' ') || 'Complete the pending assessment actions before continuing.'
    );
  if (!application.concurrencyStamp)
    throw new Error('The application version is unavailable. Refresh before continuing.');
  const command = {
    id: row.applicationId,
    expectedCurrentStageInstanceId: row.stageInstanceId,
    concurrencyStamp: application.concurrencyStamp,
    idempotencyKey,
  };
  if (retry) retry.command = command;
  return send(command);
}
