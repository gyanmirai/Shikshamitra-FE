import { FamilyFields } from './employee-form-fields/FamilyFields';
import { PayrollFields } from './employee-form-fields/PayrollFields';
import { CertificateFields } from './employee-form-fields/CertificateFields';
import { InformationFields } from './employee-form-fields/InformationFields';
import { WorkExperienceFields } from './employee-form-fields/WorkExperienceFields';

import type { FieldsType } from './employee-form-fields/types';

export const allFields: FieldsType[][] = [
  InformationFields,
  FamilyFields,
  CertificateFields,
  WorkExperienceFields,
  PayrollFields,
  // PerformanceAndDevelopmentFields,
];
