import type { AdmissionOfferingValidationError } from 'src/redux/student/admissions/admission-offerings-api';

import { RouterLink } from 'src/routes/components';
import { Link, Stack, Typography } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';

import { getAdmissionFormPreviewUrl } from './form-preview/form-preview-navigation';

type Props = {
  errors: AdmissionOfferingValidationError[];
  canReviewForms?: boolean;
  canRestoreForms?: boolean;
  canReviewWorkflows?: boolean;
};

/** The same permission-aware recovery destinations are used by single and bulk activation. */
export function AdmissionOfferingConfigurationIssues({
  errors,
  canReviewForms = false,
  canRestoreForms = false,
  canReviewWorkflows = false,
}: Props) {
  return (
    <Stack spacing={1.5}>
      {errors.map((error, index) => (
        <Stack key={`${error.code}-${index}`} spacing={0.5}>
          <Typography variant="body2" role="alert">
            {offeringConfigurationMessage(error)}
          </Typography>
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
        </Stack>
      ))}
    </Stack>
  );
}

/** Older APIs include binding identifiers and unrelated surname guidance in this error. */
export function offeringConfigurationMessage(error: AdmissionOfferingValidationError) {
  if (error.code !== 'ApplicationFormIdentityIncomplete' || !error.message.includes('Applicant.'))
    return error.message;
  const fields = [
    /Applicant\.(?:FirstName|Name)/.test(error.message) && 'Student name',
    error.message.includes('Applicant.DateOfBirth') && 'Date of birth',
    error.message.includes('Applicant.Gender') && 'Gender',
  ].filter(Boolean);
  return `Make ${fields.length ? fields.join(', ') : 'the required student details'} required, visible and editable in the linked Inquiry or Registration form. Use supported Gender choices.`;
}
