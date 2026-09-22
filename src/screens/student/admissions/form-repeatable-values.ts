export function readRepeatableValues(value?: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.map((item) => (item === null || item === undefined ? '' : String(item)))
      : [];
  } catch {
    return [];
  }
}

export function writeRepeatableValue(current: string | undefined, index: number, value: string) {
  const values = readRepeatableValues(current);
  while (values.length <= index) values.push('');
  values[index] = value;
  return JSON.stringify(values);
}

export function removeRepeatableEntry(current: string | undefined, index: number) {
  const values = readRepeatableValues(current);
  values.splice(index, 1);
  return JSON.stringify(values);
}

export function getRepeatableEntryCount(fieldValues: (string | undefined)[], minimumEntries = 0) {
  return Math.max(
    1,
    minimumEntries,
    ...fieldValues.map((value) => readRepeatableValues(value).length)
  );
}
