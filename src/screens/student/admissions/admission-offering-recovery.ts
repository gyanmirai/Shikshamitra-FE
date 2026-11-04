import type { AdmissionOfferingValidationError } from 'src/redux/student/admissions/admission-offerings-api';

/** Handles both the ProblemDetails and ABP business-error envelopes. */
export function readOfferingConfigurationErrors(
  error: unknown
): AdmissionOfferingValidationError[] {
  const value = error as any;
  const body = value?.response?.data ?? value?.data ?? value;
  const data = body?.data ?? body?.error?.data;
  const errors = data?.ConfigurationErrors ?? data?.configurationErrors;
  if (!Array.isArray(errors)) return [];
  return errors.flatMap((item) => {
    const code = item?.code ?? item?.Code;
    const message = item?.message ?? item?.Message;
    if (typeof code !== 'string' || typeof message !== 'string') return [];
    return [
      {
        code,
        message,
        formDefinitionId: item.formDefinitionId ?? item.FormDefinitionId,
        formName: item.formName ?? item.FormName,
        formPurpose: item.formPurpose ?? item.FormPurpose,
        workflowDefinitionId: item.workflowDefinitionId ?? item.WorkflowDefinitionId,
        workflowStageId: item.workflowStageId ?? item.WorkflowStageId,
        workflowStageName: item.workflowStageName ?? item.WorkflowStageName,
      },
    ];
  });
}
