import type { StudentRecordDetails } from 'src/redux/student/records/student-record-details-api';

const savedText = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

const savedObject = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const locationName = (value: unknown) => savedText(value) ?? savedText(savedObject(value)?.name);

export function profileOverviewContacts(details?: StudentRecordDetails) {
  const restricted = details?.recordsAccess === 'Summary';
  const general = details?.structuredSections.find((section) => section.section === 'general');
  const family = details?.structuredSections.find((section) => section.section === 'family');
  const generalRestricted = restricted || general?.isMasked;
  const familyRestricted = restricted || family?.isMasked;
  const contact = generalRestricted ? undefined : general?.data;
  const guardian = familyRestricted ? undefined : savedObject(family?.data?.guardianDetails);
  const address = [
    savedText(contact?.address1),
    savedText(contact?.address2),
    savedText(contact?.address3),
    savedText(contact?.city),
    locationName(contact?.state),
    savedText(contact?.pincode),
    locationName(contact?.country),
  ]
    .filter(Boolean)
    .join(', ');

  return [
    {
      label: 'Primary contact',
      value: generalRestricted ? 'Restricted' : savedText(contact?.primaryContactNo),
    },
    {
      label: 'Primary guardian',
      value: familyRestricted ? 'Restricted' : savedText(guardian?.fullName),
    },
    {
      label: 'Guardian email',
      value: familyRestricted ? 'Restricted' : savedText(guardian?.email),
    },
    { label: 'Address', value: generalRestricted ? 'Restricted' : address || undefined },
  ];
}
