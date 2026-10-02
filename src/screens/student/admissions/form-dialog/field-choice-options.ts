export type EditableAdmissionChoice = { value: string; label: string };

export type EditableAdmissionChoiceResult = {
  choices: EditableAdmissionChoice[];
  error?: string;
};

export function parseEditableAdmissionChoices(
  optionsJson?: string | null
): EditableAdmissionChoiceResult {
  if (!optionsJson) return { choices: [] };
  try {
    const parsed = JSON.parse(optionsJson) as unknown;
    if (!Array.isArray(parsed)) {
      return {
        choices: [],
        error: 'The saved choices are not a list and cannot be edited visually.',
      };
    }

    const choices = parsed.flatMap<EditableAdmissionChoice>((option) => {
      if (typeof option === 'string') return [{ value: option, label: option }];
      if (!option || typeof option !== 'object') return [];
      const candidate = option as { value?: unknown; label?: unknown };
      const value = typeof candidate.value === 'string' ? candidate.value : '';
      const label = typeof candidate.label === 'string' ? candidate.label : value;
      return value || label ? [{ value: value || label, label }] : [];
    });

    if (choices.length !== parsed.length) {
      return {
        choices,
        error: 'One or more saved choices use an unsupported format.',
      };
    }

    return { choices };
  } catch {
    return { choices: [], error: 'The saved choices contain invalid JSON.' };
  }
}

export function serializeEditableAdmissionChoices(choices: EditableAdmissionChoice[]) {
  return choices.length ? JSON.stringify(choices) : undefined;
}

export function createAdmissionChoiceValue(label: string, usedValues: string[]) {
  const base =
    label
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'OPTION';
  let value = base;
  let suffix = 2;
  const existingValues = new Set(usedValues.map((usedValue) => usedValue.toUpperCase()));
  while (existingValues.has(value)) {
    value = `${base}_${suffix}`;
    suffix += 1;
  }
  return value;
}

export function appendPastedAdmissionChoices(
  choices: EditableAdmissionChoice[],
  pastedValue: string
) {
  const labels = pastedValue
    .split(/\r?\n/)
    .map((label) => label.trim())
    .filter(Boolean);
  const next = [...choices];
  labels.forEach((label) => {
    const value = createAdmissionChoiceValue(
      label,
      next.map((choice) => choice.value)
    );
    next.push({ value, label });
  });
  return next;
}
