export type PublicRegistrationField = {
  key: string;
  systemField?: string | null;
  visibleWhenFieldKey?: string | null;
  visibleWhenValue?: string | null;
};

export const getPublicRegistrationValue = (
  field: PublicRegistrationField,
  responses: Record<string, unknown>,
  prefill: Record<string, unknown>
) => responses[field.key] ?? (field.systemField ? prefill[field.systemField] : undefined) ?? '';

export const isPublicRegistrationFieldVisible = (
  field: PublicRegistrationField,
  fields: PublicRegistrationField[],
  responses: Record<string, unknown>,
  prefill: Record<string, unknown>
) => {
  if (!field.visibleWhenFieldKey) return true;
  const conditionField = fields.find((item) => item.key === field.visibleWhenFieldKey);
  if (!conditionField) return false;
  const value = getPublicRegistrationValue(conditionField, responses, prefill);
  return String(value).toLowerCase() === String(field.visibleWhenValue ?? 'true').toLowerCase();
};
