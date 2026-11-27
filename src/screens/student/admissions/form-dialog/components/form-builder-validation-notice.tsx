import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { getIn } from 'formik';
import { Button } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import { getFirstFormikErrorPath } from 'src/components/custom-stepper/formik-validation';

import {
  type BuilderIssueTarget,
  getBuilderIssueActionLabel,
  getFormikBuilderIssueTarget,
  getBuilderIssueRecoveryGuidance,
} from '../form-builder-issue-navigation';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  onSelect?: (sectionId: string, fieldId: string | null) => void;
  onSelectIssue?: (target: BuilderIssueTarget) => void;
};

export function FormBuilderValidationNotice({ formik, onSelect, onSelectIssue }: Props) {
  const path = getFirstFormikErrorPath(formik.errors.sections, 'sections');
  if (!path || !getIn(formik.touched, path)) return null;
  const message: unknown = getIn(formik.errors, path);
  const target = getFormikBuilderIssueTarget(formik.values, path);
  const guidance = getBuilderIssueRecoveryGuidance(target);
  return (
    <StudentFeedback
      notificationKey="STU-0366"
      presentation="toast"
      severity="error"
      sx={{ flexShrink: 0 }}
      toastAction={
        target.kind !== 'form' &&
        (onSelectIssue || onSelect) && (
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              if (onSelectIssue) onSelectIssue(target);
              else onSelect?.(target.sectionId, target.kind === 'field' ? target.fieldId : null);
            }}
          >
            {getBuilderIssueActionLabel(target)}
          </Button>
        )
      }
    >
      {message === 'Add at least one field'
        ? 'Add at least one field to this section.'
        : guidance ||
          (typeof message === 'string' ? message : 'Check the highlighted form settings.')}
    </StudentFeedback>
  );
}
