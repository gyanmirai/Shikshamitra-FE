import type { AdmissionFormSystemFieldMetadata } from 'src/redux/student/admissions/admission-forms-api';

const groups: {
  name: string;
  prefixes: readonly string[];
  keys?: readonly string[];
}[] = [
  { name: 'Student profile', prefixes: ['Applicant'] },
  { name: 'Parents and guardians', prefixes: ['Guardian', 'Father', 'Mother', 'Family'] },
  { name: 'Inquiry details', prefixes: ['Inquiry'] },
  {
    name: 'Contact and addresses',
    prefixes: ['Address', 'Contact', 'Emergency', 'PermanentAddress'],
  },
  { name: 'Previous school and learning', prefixes: ['PreviousSchool', 'Academic'] },
  { name: 'Health and support', prefixes: ['Medical'] },
  { name: 'RTE and eligibility', prefixes: ['Eligibility'] },
  { name: 'Identity and school records', prefixes: ['Identity'] },
  { name: 'Admission preferences', prefixes: ['Preference'] },
  {
    name: 'Transport preferences',
    prefixes: [],
    keys: ['Preference.TransportRequired', 'Preference.PickupArea'],
  },
];

export function groupStudentFields(fields: AdmissionFormSystemFieldMetadata[]) {
  const buckets = groups.map((group) => ({
    name: group.name,
    fields: [] as AdmissionFormSystemFieldMetadata[],
  }));
  const other: AdmissionFormSystemFieldMetadata[] = [];

  fields.forEach((field) => {
    const prefix = field.key.split('.')[0];
    const exactIndex = groups.findIndex((group) => group.keys?.includes(field.key));
    const index =
      exactIndex >= 0 ? exactIndex : groups.findIndex((group) => group.prefixes.includes(prefix));
    if (index < 0) other.push(field);
    else buckets[index].fields.push(field);
  });

  const result: { name: string; fields: AdmissionFormSystemFieldMetadata[] }[] = buckets.filter(
    (group) => group.fields.length > 0
  );
  if (other.length) result.push({ name: 'Other student fields', fields: other });
  return result;
}
