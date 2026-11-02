import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

export type EditableAdmissionChoice = { value: string; label: string };

export type EditableAdmissionChoiceResult = {
  choices: EditableAdmissionChoice[];
  error?: string;
};

// This repairs only the known unpublished generic-editor mistake. Keep linked
// defaults, translated labels and conditions aligned when its value changes.
export function repairDraftAdmissionGenderChoices(form: CreateUpdateAdmissionForm) {
  const codes = new Set<string>();
  const sections = form.sections.map((section) => ({
    ...section,
    fields: section.fields.map((field) => {
      const parsed = parseEditableAdmissionChoices(field.optionsJson);
      if (parsed.error) return field;
      const choices = normalizeDraftAdmissionGenderChoices(field, parsed.choices);
      if (choices === parsed.choices) return field;
      codes.add(field.code.toUpperCase());
      return {
        ...field,
        optionsJson: serializeEditableAdmissionChoices(choices),
        defaultValue: field.defaultValue === 'OPTION_3' ? 'Other' : field.defaultValue,
        translations: Object.fromEntries(
          Object.entries(field.translations ?? {}).map(([language, translation]) => {
            const { OPTION_3: legacy, ...remaining } = translation.choices ?? {};
            return [
              language,
              {
                ...translation,
                choices: legacy === undefined ? remaining : { Other: legacy, ...remaining },
              },
            ];
          })
        ),
      };
    }),
  }));
  if (!codes.size) return form;
  const normalizeRule = (json?: string | null) => {
    if (!json) return json;
    try {
      let changed = false;
      const rewrite = (node: unknown) => {
        if (!node || typeof node !== 'object' || Array.isArray(node)) return;
        const rule = node as Record<string, unknown>;
        if (Array.isArray(rule.conditions)) rule.conditions.forEach(rewrite);
        if (!codes.has(String(rule.field).toUpperCase())) return;
        if (rule.value === 'OPTION_3') {
          rule.value = 'Other';
          changed = true;
        } else if (
          typeof rule.value === 'string' &&
          ['IN', 'NOTIN'].includes(String(rule.operator).toUpperCase())
        ) {
          const mapped = rule.value
            .split(',')
            .map((item) => (item.trim() === 'OPTION_3' ? 'Other' : item))
            .join(',');
          if (mapped !== rule.value) {
            rule.value = mapped;
            changed = true;
          }
        } else if (Array.isArray(rule.value))
          rule.value = rule.value.map((value: unknown) => {
            if (value !== 'OPTION_3') return value;
            changed = true;
            return 'Other';
          });
      };
      const rule = JSON.parse(json);
      rewrite(rule);
      return changed ? JSON.stringify(rule) : json;
    } catch {
      return json;
    }
  };
  return {
    ...form,
    sections: sections.map((section) => ({
      ...section,
      visibilityRuleJson: normalizeRule(section.visibilityRuleJson),
      stepVisibilityRuleJson: normalizeRule(section.stepVisibilityRuleJson),
      fields: section.fields.map((field) => ({
        ...field,
        visibilityRuleJson: normalizeRule(field.visibilityRuleJson),
        requiredRuleJson: normalizeRule(field.requiredRuleJson),
      })),
    })),
  };
}

export function normalizeDraftAdmissionGenderChoices(
  field: { bindingType: number; bindingKey?: string | null; fieldType: number },
  choices: EditableAdmissionChoice[]
) {
  if (
    field.bindingType !== 0 ||
    field.bindingKey !== 'Applicant.Gender' ||
    ![6, 8].includes(field.fieldType) ||
    choices.length !== 3 ||
    !['Male', 'Female', 'OPTION_3'].every(
      (value) => choices.filter((choice) => choice.value === value).length === 1
    ) ||
    choices.find((choice) => choice.value === 'OPTION_3')?.label !== 'Other'
  )
    return choices;
  return choices.map((choice) =>
    choice.value === 'OPTION_3' ? { ...choice, value: 'Other' } : choice
  );
}

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
