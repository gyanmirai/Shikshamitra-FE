import { FamilyFields } from './employee-form-fields/FamilyFields';
import { PayrollFields } from './employee-form-fields/PayrollFields';
import { CertificateFields } from './employee-form-fields/CertificateFields';
import { InformationFields } from './employee-form-fields/InformationFields';
import { WorkExperienceFields } from './employee-form-fields/WorkExperienceFields';
import { AssignReportingManager } from './employee-form-fields/AssignReportingManager';
import { AdditionalDetailsFields } from './employee-form-fields/AdditionalDetailsFields';
import { AcademicPermissionFields } from './employee-form-fields/AcademicPermissionFields';

import type { FieldsType } from './employee-form-fields/types';

export const allFields: FieldsType[][] = [
  InformationFields,
  FamilyFields,
  AdditionalDetailsFields,
  CertificateFields,
  WorkExperienceFields,
  PayrollFields,
  AssignReportingManager,
  AcademicPermissionFields,
  // PerformanceAndDevelopmentFields,
];
