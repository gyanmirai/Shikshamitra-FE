import { RenderDocuments } from './RenderDocument';
import { generalFormFields } from './GeneralFormFields';
import { medicalFields } from './render-medical-details';
import { bankDetailsFields } from './render-bank-details';
import { communicationFields } from './render-communication';
import RenderFamilyInformation from './RenderFamilyInformation';
import { previousSchoolFields } from './render-previous-details';
import { additionalDetailsFields } from './render-additional-details';

import type { FieldsType } from './type';

export const documentFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Certificate Name',
    name: 'certificateName',

    gridProps: { size: { xs: 12, md: 12 }, sx: { height: '100%' } },
    renderComp(props) {
      return <RenderDocuments id={props.formik.values.id} />;
    },
  },
];
export const familyFields: FieldsType[] = [
  {
    name: 'fatherName',
    label: 'Father Name',
    type: 'text',
    otherProps: {},
    gridProps: { size: { xs: 12, md: 12 } },
    renderComp(props: any) {
      return <RenderFamilyInformation {...props} />;
    },
  },
];

// Array containing all form field groups for student registration
// Each element represents a different section of the registration form:
// - generalFormFields: Basic student information
// - documentFields: Required document uploads
// - familyFields: Parent/guardian information
// - communicationFields: Contact details
// - additionalDetailsFields: Extra student information
// - medicalFields: Health and medical information
// - previousSchoolFields: Prior education details
// - bankDetailsFields: Banking information
export const allFields = [
  generalFormFields,
  documentFields,
  familyFields,
  communicationFields,
  additionalDetailsFields,
  medicalFields,
  previousSchoolFields,
  bankDetailsFields,
];
