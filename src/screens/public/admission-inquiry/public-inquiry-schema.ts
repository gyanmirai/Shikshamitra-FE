import { evaluateAdmissionRule } from 'src/screens/student/admissions/admission-visibility-rules';
import { canonicalInquiryBinding } from 'src/screens/student/admissions/admission-inquiry-field-bindings';
import { templateStudentBinding } from 'src/screens/student/admissions/form-dialog/template-student-fields';

type PublicField = {
  code: string;
  fieldType: number;
  bindingKey?: string | null;
  optionsJson?: string | null;
  visibilityRuleJson?: string | null;
  requiredRuleJson?: string | null;
};
type PublicSection = {
  fields: PublicField[];
  visibilityRuleJson?: string | null;
  stepVisibilityRuleJson?: string | null;
};

function omittedValue(field: PublicField): string | undefined {
  const binding = (
    canonicalInquiryBinding(field) ?? templateStudentBinding(field.code.toUpperCase())?.bindingKey
  )?.toLowerCase();
  if (binding === 'family.issinglechild' || binding === 'family.siblingatschool') return 'false';
  if (binding === 'family.siblingstudentids') return '';
  try {
    if (JSON.parse(field.optionsJson || '{}')?.source === 'StudentSiblings') return '';
  } catch {
    // Malformed unrelated options keep their existing runtime behavior.
  }
  return undefined;
}

/** Public-only policy: absent sibling checkboxes are false; absent selections are empty.
 * Fold their rule leaves so every existing renderer/validator evaluates the same schema,
 * without inserting omitted answers into the draft or outgoing form values.
 */
export function projectPublicInquirySections<T extends PublicSection>(sections: T[]): T[] {
  const omitted = new Map(
    sections
      .flatMap((section) => section.fields)
      .flatMap((field) => {
        const value = omittedValue(field);
        return value === undefined ? [] : [[field.code, value] as const];
      })
  );
  const projectRule = (json: string | null | undefined) => {
    if (!json) return json;
    const fold = (rule: unknown): unknown => {
      if (!rule || typeof rule !== 'object' || Array.isArray(rule)) return rule;
      const expression = rule as { conditions?: unknown[]; field?: string };
      if (Array.isArray(expression.conditions))
        return { ...expression, conditions: expression.conditions.map(fold) };
      if (!expression.field || !omitted.has(expression.field)) return rule;
      const matches = evaluateAdmissionRule(rule, {
        [expression.field]: omitted.get(expression.field)!,
      });
      // Empty ALL/ANY groups are the existing evaluator's constant true/false nodes.
      return { operator: matches ? 'ALL' : 'ANY', conditions: [] };
    };
    try {
      return JSON.stringify(fold(JSON.parse(json)));
    } catch {
      return json;
    }
  };
  return sections
    .map((section) => ({
      ...section,
      visibilityRuleJson: projectRule(section.visibilityRuleJson),
      stepVisibilityRuleJson: projectRule(section.stepVisibilityRuleJson),
      fields: section.fields
        .filter((field) => omittedValue(field) === undefined)
        .map((field) => ({
          ...field,
          visibilityRuleJson: projectRule(field.visibilityRuleJson),
          requiredRuleJson: projectRule(field.requiredRuleJson),
        })),
    }))
    .filter((section) => section.fields.length > 0);
}
