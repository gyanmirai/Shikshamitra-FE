import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

export type FieldSettingsProps = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  sectionIndex: number;
  fieldIndex: number;
};
