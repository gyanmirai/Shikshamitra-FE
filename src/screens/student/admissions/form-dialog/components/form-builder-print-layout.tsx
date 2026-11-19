import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useFormInheritance } from '../hooks/use-form-inheritance';
import { getAdmissionFormPrintSettings } from '../form-dialog-model';
import { getInheritancePreviewValues } from '../form-inheritance-model';
import { AdmissionFormPrintWorkspace } from '../../form-print/admission-form-print-workspace';

type Props = { formik: FormikProps<CreateUpdateAdmissionForm> };

export function FormBuilderPrintLayout({ formik }: Props) {
  const inheritance = useFormInheritance();
  const form = getInheritancePreviewValues(
    formik.values,
    inheritance?.preview?.definition,
    inheritance?.preview?.inquiryContextSections
  );

  return (
    <AdmissionFormPrintWorkspace
      form={form}
      settings={getAdmissionFormPrintSettings(formik.values.printSettings)}
      initialMode="blank"
      sampleDetails
      readOnly={formik.isSubmitting}
      onSettingsChange={(settings) => formik.setFieldValue('printSettings', settings)}
    />
  );
}
