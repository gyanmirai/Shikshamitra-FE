import type { AdmissionOfferingValidationError } from 'src/redux/student/admissions/admission-offerings-api';

import { RouterLink } from 'src/routes/components';
import { Link, Stack, Typography } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';

import { getAdmissionFormPreviewUrl } from './form-preview/form-preview-navigation';

export type AdmissionOfferingRecoveryAccess = {
  canReviewForms?: boolean;
  canRestoreForms?: boolean;
  canReviewWorkflows?: boolean;
  canReviewCycles?: boolean;
};

type Props = AdmissionOfferingRecoveryAccess & {
  errors: AdmissionOfferingValidationError[];
  cycleName?: string;
};

/** The same permission-aware recovery destinations are used by single and bulk activation. */
export function AdmissionOfferingConfigurationIssues({
  errors,
  canReviewForms = false,
  canRestoreForms = false,
  canReviewWorkflows = false,
  canReviewCycles = false,
  cycleName,
}: Props) {
  return (
    <Stack spacing={1.5}>
      {errors.map((error, index) => (
        <Stack key={`${error.code}-${index}`} spacing={0.5}>
          <Typography variant="body2" role="alert">
            {offeringConfigurationMessage(error)}
          </Typography>
          {error.code === 'CycleUnavailable' && canReviewCycles && (
            <Link
              component={RouterLink}
              href={`${studentPaths.enrollment.settings.cycles}${cycleName ? `?${new URLSearchParams({ search: cycleName })}` : ''}`}
            >
              Review admission cycle
            </Link>
          )}
          {error.formDefinitionId && canReviewForms && (
            <Link component={RouterLink} href={getAdmissionFormPreviewUrl(error.formDefinitionId)}>
              Review {error.formName || 'form'}
            </Link>
          )}
          {error.formDefinitionId && canRestoreForms && /archived/i.test(error.message) && (
            <Link
              component={RouterLink}
              href={`${studentPaths.enrollment.settings.forms}?${new URLSearchParams({ restoreForm: error.formDefinitionId, search: error.formName || '' })}`}
            >
              Restore archived form
            </Link>
          )}
          {error.workflowDefinitionId && canReviewWorkflows && (
            <Link
              component={RouterLink}
              href={`${studentPaths.enrollment.settings.workflows}/${encodeURIComponent(error.workflowDefinitionId)}`}
            >
              Review workflow{error.workflowStageName ? ` · ${error.workflowStageName}` : ''}
            </Link>
          )}
          {!error.workflowDefinitionId &&
            canReviewWorkflows &&
            ['WorkflowMissing', 'WorkflowNotPublished'].includes(error.code) && (
              <Link component={RouterLink} href={studentPaths.enrollment.settings.workflows}>
                Review admission workflows
              </Link>
            )}
          {!error.formDefinitionId &&
            canReviewForms &&
            [
              'InquiryFormMissing',
              'InquiryFormNotPublished',
              'ApplicationFormMissing',
              'ApplicationFormNotPublished',
            ].includes(error.code) && (
              <Link component={RouterLink} href={studentPaths.enrollment.settings.forms}>
                Review admission forms
              </Link>
            )}
        </Stack>
      ))}
    </Stack>
  );
}

/** Older APIs include binding identifiers and unrelated surname guidance in this error. */
export function offeringConfigurationMessage(error: AdmissionOfferingValidationError) {
  switch (error.code) {
    case 'CycleUnavailable':
      return 'Publish the admission cycle before activating this offering.';
    case 'WorkflowMissing':
      return 'Choose a published admission workflow.';
    case 'WorkflowNotPublished':
      return 'Choose an available published admission workflow.';
    case 'InquiryFormMissing':
      return 'Choose a published Inquiry form.';
    case 'ApplicationFormMissing':
      return 'Choose a published Registration form.';
    case 'InquiryFormNotPublished':
      return /archived/i.test(error.message)
        ? `Inquiry form${error.formName ? ` "${error.formName}"` : ''} is archived. Restore it or choose another.`
        : 'Choose an available published Inquiry form.';
    case 'ApplicationFormNotPublished':
      return /archived/i.test(error.message)
        ? `Registration form${error.formName ? ` "${error.formName}"` : ''} is archived. Restore it or choose another.`
        : 'Choose an available published Registration form.';
    default:
      break;
  }
  if (error.code !== 'ApplicationFormIdentityIncomplete' || !error.message.includes('Applicant.'))
    return error.message;
  const fields = [
    /Applicant\.(?:FirstName|Name)/.test(error.message) && 'Student name',
    error.message.includes('Applicant.DateOfBirth') && 'Date of birth',
    error.message.includes('Applicant.Gender') && 'Gender',
  ].filter(Boolean);
  return `Make ${fields.length ? fields.join(', ') : 'the required student details'} required, visible and editable in the linked Inquiry or Registration form. Use supported Gender choices.`;
}
