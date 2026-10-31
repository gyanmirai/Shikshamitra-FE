/** Class of interest is distinct from the final class applied for and a previous class. */
export const classInterestOptions = '{"source":"Standards"}';
export const duplicateClassInterestMessage =
  'Keep only one Class interested in question. Reuse the existing question.';
export const classInterestConfigurationMessage =
  'Class interested in must use the Institute Setup class dropdown.';

type ClassQuestion = {
  code: string;
  label?: string;
  bindingType?: number;
  bindingKey?: string | null;
  fieldType?: number;
};
const normalize = (value: string) => value.replace(/[\s_.-]/g, '').toLowerCase();
const aliases = new Set(['classinterested', 'classinterestedin', 'interestedclass']);

export function isClassInterestQuestion(field: ClassQuestion) {
  // Explicitly linked Student fields retain their meaning after relabelling.
  if (field.fieldType === 12 || field.bindingType === 0 || field.bindingKey?.includes('.'))
    return false;
  return (
    aliases.has(normalize(field.code.replace(/_\d+$/, ''))) ||
    aliases.has(normalize(field.label ?? ''))
  );
}

export function classInterestConfigurationValid(
  field: ClassQuestion & { fieldType: number; optionsJson?: string | null }
) {
  if (field.fieldType !== 6) return false;
  try {
    return JSON.parse(field.optionsJson || '{}').source === 'Standards';
  } catch {
    return false;
  }
}
