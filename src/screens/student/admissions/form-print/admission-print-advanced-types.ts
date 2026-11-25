import type {
  AdmissionFormPrintSettings,
  AdmissionPrintAdvancedSettings,
  ResolvedAdmissionPrintAdvancedSettings,
} from 'src/redux/student/admissions/admission-form-print-settings';

import type { AdmissionPrintBranding, AdmissionPrintDefinition } from './form-print-model';

export type AdmissionPrintAdvancedTabProps = {
  settings: AdmissionFormPrintSettings;
  advanced: ResolvedAdmissionPrintAdvancedSettings;
  form: AdmissionPrintDefinition;
  branding: AdmissionPrintBranding;
  onChange: (settings: AdmissionFormPrintSettings) => void;
  onEditHeader?: () => void;
  update: <K extends keyof AdmissionPrintAdvancedSettings>(
    group: K,
    patch: Partial<NonNullable<AdmissionPrintAdvancedSettings[K]>>
  ) => void;
};
