import type { AdmissionFormSystemFieldMetadata } from 'src/redux/student/admissions/admission-forms-api';

const groups = [
  { name: 'Student profile', prefixes: ['Applicant'] },
  { name: 'Parents and guardians', prefixes: ['Guardian', 'Father', 'Mother', 'Family'] },
  {
    name: 'Contact and addresses',
    prefixes: ['Address', 'Contact', 'Emergency', 'PermanentAddress'],
  },
  { name: 'Previous school and learning', prefixes: ['PreviousSchool', 'Academic'] },
  { name: 'Health and support', prefixes: ['Medical'] },
  { name: 'RTE and eligibility', prefixes: ['Eligibility'] },
  { name: 'Identity and school records', prefixes: ['Identity'] },
  { name: 'Admission preferences', prefixes: ['Preference'] },
] as const;

export function groupStudentFields(fields: AdmissionFormSystemFieldMetadata[]) {
  const buckets = groups.map((group) => ({
    name: group.name,
    fields: [] as AdmissionFormSystemFieldMetadata[],
  }));
  const other: AdmissionFormSystemFieldMetadata[] = [];

  fields.forEach((field) => {
    const prefix = field.key.split('.')[0];
    const index = groups.findIndex((group) =>
      (group.prefixes as readonly string[]).includes(prefix)
    );
    if (index < 0) other.push(field);
    else buckets[index].fields.push(field);
  });

  const result: { name: string; fields: AdmissionFormSystemFieldMetadata[] }[] = buckets.filter(
    (group) => group.fields.length > 0
  );
  if (other.length) result.push({ name: 'Other student fields', fields: other });
  return result;
}
