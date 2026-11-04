type ContextField = {
  id: string;
  code: string;
  displayOrder: number;
  required: boolean;
  readOnly: boolean;
  requiredRuleJson?: string | null;
  inheritedFrom?: unknown;
};
type ContextSection = { id: string; displayOrder: number; fields: ContextField[] };

/** Display projection only. Context never joins editable Registration definitions or answers. */
export function mergeInquiryContextSections<T extends ContextSection>(
  sections: T[],
  contextSections: T[] = []
): T[] {
  if (!contextSections.length) return sections;
  const result = new Map(
    sections.map((section) => [section.id, { ...section, fields: [...section.fields] }])
  );
  const sourceIds = new Set(
    sections
      .filter((section) => section.fields.some((field) => field.inheritedFrom))
      .map((section) => section.id)
  );
  contextSections.forEach((context) => {
    sourceIds.add(context.id);
    const current = result.get(context.id);
    const fields = new Map((current?.fields ?? []).map((field) => [field.id, field]));
    context.fields.forEach((field) =>
      fields.set(field.id, {
        ...field,
        readOnly: true,
        required: false,
        requiredRuleJson: undefined,
      })
    );
    result.set(context.id, {
      ...(current ?? context),
      fields: [...fields.values()].sort((left, right) => left.displayOrder - right.displayOrder),
    });
  });
  return [...result.values()].sort(
    (left, right) =>
      Number(!sourceIds.has(left.id)) - Number(!sourceIds.has(right.id)) ||
      left.displayOrder - right.displayOrder
  ) as T[];
}
