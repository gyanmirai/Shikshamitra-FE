import { FamilyFields } from './FamilyFields';
import { PayrollFields } from './PayrollFields';
import { InformationFields } from './InformationFields';
import { CertificateFields } from './CertificateFields';
import { WorkExperienceFields } from './WorkExperienceFields';

import type { FieldsType } from './types';

export const allFields: FieldsType[][] = [
  InformationFields,
  FamilyFields,
  CertificateFields,
  WorkExperienceFields,
  PayrollFields,
  // PerformanceAndDevelopmentFields,
];
