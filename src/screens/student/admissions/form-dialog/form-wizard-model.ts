import { admissionFormSchema } from './form-dialog-model';

export const ADMISSION_FORM_STEPS = ['Form details', 'Build form', 'Review & save'];

const detailsSchema = admissionFormSchema.pick(['name', 'purpose', 'layoutType']);
const fieldsSchema = admissionFormSchema.pick(['sections']);

export function getAdmissionWizardSchema(activeStep: number) {
  if (activeStep === 0) return detailsSchema;
  if (activeStep === 1) return fieldsSchema;
  return admissionFormSchema;
}
