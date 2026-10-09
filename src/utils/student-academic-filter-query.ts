/** Keep existing single-value links compatible with multi-class/division filters. */
export const readAcademicFilterIds = (value: string | null | undefined): string[] => [
  ...new Set((value ?? '').split(',').filter((id) => id && id !== '__all__')),
];

export const academicClassFilterInput = (value: string | null | undefined) => {
  const ids = readAcademicFilterIds(value);
  return ids.length > 1 ? { standardIds: ids } : { standardId: ids[0] };
};

export const academicMultipleFilterValue = (current: string, selected: (string | number)[]) =>
  selected.includes('__all__') && readAcademicFilterIds(current).length
    ? ''
    : selected.filter((id) => id !== '__all__').join(',');

/** ASP.NET binds collections from repeated keys, not comma-separated GUIDs. */
export function studentAcademicFilterParams(input: object) {
  const params = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => {
    if (value == null) return;
    (Array.isArray(value) ? value : [value]).forEach((item) => params.append(key, String(item)));
  });
  return params;
}
