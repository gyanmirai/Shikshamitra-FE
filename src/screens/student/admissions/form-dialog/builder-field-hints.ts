export function getAdmissionBuilderFieldHint(fieldCode: string) {
  return fieldCode === 'CAMPUS_PREFERENCE'
    ? 'Remove this field if your school has one campus.'
    : undefined;
}

export function hasLegacyAdmissionBuilderHint(field: {
  code: string;
  helpText?: string | null;
  inheritedFrom?: { sourceFieldCode: string } | null;
}) {
  // Older starter forms stored this hint in the applicant helper text, including inherited copies.
  const hint = getAdmissionBuilderFieldHint(field.inheritedFrom?.sourceFieldCode ?? field.code);
  return hint !== undefined && field.helpText?.trim() === hint;
}
