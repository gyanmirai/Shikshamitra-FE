export const INQUIRY_RULE_REPLACEMENT_MESSAGE =
  'Inquiry rules are no longer available for application stages. Replace this rule with an application answer, assessment result, or document check.';

export function hasInquiryCondition(json?: string | null): boolean {
  if (!json) return false;
  try {
    const containsInquiry = (value: unknown): boolean => {
      if (!value || typeof value !== 'object') return false;
      if (Array.isArray(value)) return value.some(containsInquiry);
      const rule = value as Record<string, unknown>;
      return (
        (typeof rule.field === 'string' && /^inquiry\./i.test(rule.field.trim())) ||
        Object.values(rule).some(containsInquiry)
      );
    };
    return containsInquiry(JSON.parse(json));
  } catch {
    return false;
  }
}
