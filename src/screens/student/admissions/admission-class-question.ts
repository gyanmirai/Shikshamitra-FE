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
  optionsJson?: string | null;
};
const normalize = (value: string) => value.replace(/[\s_.-]/g, '').toLowerCase();
const aliases = new Set(['classinterested', 'classinterestedin', 'interestedclass']);

export function isClassInterestQuestion(field: ClassQuestion) {
  // Explicitly linked Student fields retain their meaning after relabelling.
  if (field.fieldType === 12 || field.bindingType === 0 || field.bindingKey?.includes('.'))
    return false;
  try {
    if (['EducationBoards', 'EducationMediums'].includes(JSON.parse(field.optionsJson || '{}').source)) return false;
  } catch {
    // Malformed historical options still retain their reserved-code identity for repair.
  }
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
    const source = JSON.parse(field.optionsJson || '{}');
    return source.source === 'Standards' || (source.source === 'StandardsByMedium' &&
      typeof source.parentField === 'string' && Boolean(source.parentField.trim()));
  } catch {
    return false;
  }
}
