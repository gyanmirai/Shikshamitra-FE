import type { StudentRecordDetails } from 'src/redux/student/records/student-record-details-api';

import { savedAdult, mainContactRelationship } from './student-parents-contact-model';

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
  const familyData = familyRestricted ? {} : (family?.data ?? {});
  const relationship = mainContactRelationship(familyData);
  const main = relationship ? savedAdult(familyData, relationship) : undefined;
  const familyValue = (value: string | undefined) => (familyRestricted ? 'Restricted' : value);
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
      label: 'Main contact',
      value: familyValue(savedText(main?.fullName)),
    },
    {
      label: 'Relationship',
      value: familyValue(
        relationship === 'guardian'
          ? (savedText(familyData.guardianRelationship) ?? 'Other guardian')
          : relationship === 'father'
            ? 'Father'
            : relationship === 'mother'
              ? 'Mother'
              : undefined
      ),
    },
    {
      label: 'Phone',
      value: familyValue(savedText(main?.contactNo)),
    },
    { label: 'Email', value: familyValue(savedText(main?.email)) },
    { label: 'Father', value: familyValue(savedText(savedAdult(familyData, 'father')?.fullName)) },
    { label: 'Mother', value: familyValue(savedText(savedAdult(familyData, 'mother')?.fullName)) },
    {
      label: 'Other guardian',
      value: familyValue(savedText(savedAdult(familyData, 'guardian')?.fullName)),
    },
    { label: 'Address', value: generalRestricted ? 'Restricted' : address || undefined },
  ];
}
