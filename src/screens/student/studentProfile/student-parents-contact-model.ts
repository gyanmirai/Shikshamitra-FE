import { normalizeEmail } from 'src/utils/input-format';

export const contactRelationships = ['father', 'mother', 'guardian'] as const;
export type ContactRelationship = (typeof contactRelationships)[number];
export type AdultContactDraft = {
  enabled: boolean;
  fullName: string;
  email: string;
  contactNo: string;
};
export type ParentsContactDraft = Record<ContactRelationship, AdultContactDraft> & {
  mainContactRelationship: ContactRelationship | '';
  guardianRelationship: string;
  reason: string;
};
export const contactLabels: Record<ContactRelationship, string> = {
  father: 'Father',
  mother: 'Mother',
  guardian: 'Other guardian',
};
export const savedContactObject = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
export const savedContactText = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;
export const savedAdult = (data: Record<string, unknown>, relationship: ContactRelationship) =>
  savedContactObject(data[`${relationship}Details`]);
export function hasSavedAdult(data: Record<string, unknown>, relationship: ContactRelationship) {
  const adult = savedAdult(data, relationship);
  return ['fullName', 'email', 'contactNo'].some((field) => savedContactText(adult?.[field]));
}
export function mainContactRelationship(data: Record<string, unknown>): ContactRelationship | '' {
  const saved = data.mainContactRelationship;
  if (saved)
    return contactRelationships.includes(saved as ContactRelationship) &&
      hasSavedAdult(data, saved as ContactRelationship)
      ? (saved as ContactRelationship)
      : '';
  const parents = (['father', 'mother'] as const).filter((relationship) =>
    hasSavedAdult(data, relationship)
  );
  if (parents.length === 1) return parents[0];
  return parents.length === 0 && hasSavedAdult(data, 'guardian') ? 'guardian' : '';
}
export function contactDraft(data: Record<string, unknown>): ParentsContactDraft {
  const draft = Object.fromEntries(
    contactRelationships.map((relationship) => {
      const adult = savedAdult(data, relationship);
      return [
        relationship,
        {
          enabled: hasSavedAdult(data, relationship),
          fullName: savedContactText(adult?.fullName) ?? '',
          email: savedContactText(adult?.email) ?? '',
          contactNo: savedContactText(adult?.contactNo) ?? '',
        },
      ];
    })
  ) as Record<ContactRelationship, AdultContactDraft>;
  return {
    ...draft,
    mainContactRelationship: mainContactRelationship(data),
    guardianRelationship: savedContactText(data.guardianRelationship) ?? '',
    reason: '',
  };
}
export function contactPayload(
  data: Record<string, unknown>,
  values: ParentsContactDraft
): Record<string, unknown> {
  const initial = contactDraft(data);
  const payload: Record<string, unknown> = {
    ...data,
    mainContactRelationship: values.mainContactRelationship,
  };
  contactRelationships.forEach((relationship) => {
    const next = values[relationship];
    if (!next.enabled) return;
    const previous = savedAdult(data, relationship);
    const adult = { ...previous };
    (['fullName', 'email', 'contactNo'] as const).forEach((field) => {
      if (previous && next[field] === initial[relationship][field]) return;
      adult[field] = (field === 'email' ? normalizeEmail(next[field]) : next[field].trim()) || null;
    });
    payload[`${relationship}Details`] = adult;
  });
  if (values.guardian.enabled && values.guardianRelationship !== initial.guardianRelationship)
    payload.guardianRelationship = values.guardianRelationship.trim();
  return payload;
}
