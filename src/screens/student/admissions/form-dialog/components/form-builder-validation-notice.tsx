import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { getIn } from 'formik';
import { Alert, Button } from '@mui/material';
import {
  focusFirstFormikError,
  getFirstFormikErrorPath,
} from 'src/components/custom-stepper/formik-validation';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  onSelect: (sectionId: string, fieldId: string | null) => void;
};

export function FormBuilderValidationNotice({ formik, onSelect }: Props) {
  const path = getFirstFormikErrorPath(formik.errors.sections, 'sections');
  if (!path || !getIn(formik.touched, path)) return null;
  const message: unknown = getIn(formik.errors, path);
  const indices = path.match(/^sections\[(\d+)\](?:\.fields\[(\d+)\])?/);
  const section = indices ? formik.values.sections[Number(indices[1])] : undefined;
  const field = indices?.[2] ? section?.fields[Number(indices[2])] : undefined;
  return (
    <Alert
      severity="error"
      sx={{ flexShrink: 0 }}
      action={
        section && (
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              onSelect(section.id, field?.id ?? null);
              focusFirstFormikError(formik.errors);
            }}
          >
            Fix error
          </Button>
        )
      }
    >
      {typeof message === 'string' ? message : 'Check the highlighted form settings.'}
    </Alert>
  );
}
