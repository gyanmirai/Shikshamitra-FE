import type { AdmissionFormPurpose } from 'src/redux/student/admissions/admission-forms-api';

import { admissionFormSchema } from './form-dialog-model';

export const ADMISSION_FORM_STEPS = ['Form details', 'Build form', 'Review & save'];
const REGISTRATION_FORM_STEPS = ['Form details', 'Build form', 'Review', 'Print layout'];

export function getAdmissionWizardSteps(purpose: AdmissionFormPurpose = 1) {
  return purpose === 0 ? ADMISSION_FORM_STEPS : REGISTRATION_FORM_STEPS;
}

const detailsSchema = admissionFormSchema.pick(['name', 'purpose', 'layoutType']);
const fieldsSchema = admissionFormSchema.pick(['sections']);

export function getAdmissionWizardSchema(activeStep: number) {
  if (activeStep === 0) return detailsSchema;
  if (activeStep === 1) return fieldsSchema;
  return admissionFormSchema;
}
