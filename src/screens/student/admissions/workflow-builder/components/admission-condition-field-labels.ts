export type ConditionFieldLabel = {
  value: string;
  label: string;
  fieldType?: number;
  code: string;
  context: string;
};

function countLabels(labels: string[]) {
  const counts = new Map<string, number>();
  labels.forEach((label) => counts.set(label, (counts.get(label) ?? 0) + 1));
  return counts;
}

export function labelConditionFields(fields: ConditionFieldLabel[]) {
  const counts = countLabels(fields.map((field) => field.label));
  const labels = fields.map((field) =>
    counts.get(field.label) === 1 ? field.label : `${field.label} — ${field.context || field.code}`
  );
  const contextualCounts = countLabels(labels);
  const used = new Set(
    fields.filter((field) => counts.get(field.label) === 1).map((field) => field.label)
  );
  return fields.map((field, index) => {
    let label = labels[index];
    if (counts.get(field.label) !== 1) {
      if (contextualCounts.get(label)! > 1 || used.has(label)) label += ` [${field.code}]`;
      if (used.has(label)) label += ` [${field.value}]`;
      while (used.has(label)) label += ' ·';
      used.add(label);
    }
    return { value: field.value, label, fieldType: field.fieldType };
  });
}
