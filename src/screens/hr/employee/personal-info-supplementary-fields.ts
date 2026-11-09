import type { IPersonalInformationResponse } from './types';

type SupplementaryFields = Pick<
  IPersonalInformationResponse,
  'designation' | 'qualification' | 'identificationMark1'
>;

// Missing response/form fields must stay omitted, rather than becoming an accidental clear.
export const getPersonalInfoSupplementaryFields = (
  values?: SupplementaryFields
): SupplementaryFields => ({
  designation: values?.designation,
  qualification: values?.qualification,
  identificationMark1: values?.identificationMark1,
});
