export const duplicateDivisionCode = 'ShikshaMitra.TenantSettings:DuplicateDivisionName';

export const duplicateDivisionMessage = (name?: string) =>
  name?.trim()
    ? `A division named '${name.trim()}' already exists in this standard.`
    : 'A division with this name already exists in this standard.';

export function isDuplicateDivisionError(code: unknown, data: unknown) {
  if (code === duplicateDivisionCode) return true;
  if (code !== 'ShikshaMitra.TenantSettings:00001' || !data || typeof data !== 'object') {
    return false;
  }
  return (
    'entityName' in data &&
    typeof data.entityName === 'string' &&
    data.entityName.toLowerCase() === 'division'
  );
}
