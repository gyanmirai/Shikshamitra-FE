import { it, expect, describe } from 'vitest';
import { isAdmissionRuleVisible } from 'src/screens/student/admissions/admission-visibility-rules';

import { projectPublicInquirySections } from './public-inquiry-schema';

const field = (
  code: string,
  extra = {}
): {
  code: string;
  fieldType: number;
  visibilityRuleJson?: string;
  requiredRuleJson?: string;
  bindingKey?: string;
  optionsJson?: string;
} => ({ code, fieldType: 0, ...extra });
const rule = (fieldCode: string, value: unknown) => ({
  field: fieldCode,
  operator: 'Equals',
  value,
});

describe('public inquiry schema projection', () => {
  it('keeps malformed visibility fail-closed without hiding unrelated valid questions', () => {
    const [section] = projectPublicInquirySections([
      {
        fields: [
          field('SINGLE_CHILD'),
          field('broken', { visibilityRuleJson: '{invalid', optionsJson: 'null' }),
          field('independent', { visibilityRuleJson: JSON.stringify(rule('ROLE', 'guardian')) }),
          field('malformedOptions', { optionsJson: '{invalid' }),
        ],
      },
    ]);
    expect(section.fields.map(({ code }) => code)).toEqual([
      'broken',
      'independent',
      'malformedOptions',
    ]);
    expect(isAdmissionRuleVisible(section.fields[0].visibilityRuleJson, {})).toBe(false);
    expect(isAdmissionRuleVisible(section.fields[1].visibilityRuleJson, { ROLE: 'guardian' })).toBe(
      true
    );
    expect(isAdmissionRuleVisible(section.fields[1].visibilityRuleJson, { ROLE: 'father' })).toBe(
      false
    );
  });

  it('removes canonical, exact dynamic and legacy sibling fields without interpreting labels or other owned bindings', () => {
    const sections = projectPublicInquirySections([
      {
        fields: [
          field('one', { bindingKey: 'family.issinglechild' }),
          field('two', { bindingKey: 'Family.SiblingAtSchool' }),
          field('three', { bindingKey: 'Family.SiblingStudentIds' }),
          field('dynamic', { optionsJson: '{"source":"StudentSiblings"}' }),
          field('SINGLE_CHILD'),
          field('SIBLING_STUDENT'),
          field('retained', { bindingKey: 'Family.IsSingleParentChild' }),
          field('SINGLE_CHILD', { bindingKey: 'Medical.Allergies' }),
          field('custom', {
            label: 'Sibling interests',
            optionsJson: '{"source":"OtherStudentSiblings"}',
          }),
          field('FIRST_NAME'),
        ],
      },
      { fields: [field('SINGLE_CHILD')] },
    ]);
    expect(sections).toHaveLength(1);
    expect(sections[0].fields.map(({ code }) => code)).toEqual([
      'retained',
      'SINGLE_CHILD',
      'custom',
      'FIRST_NAME',
    ]);
  });

  it('substitutes false and empty sibling selections while retaining unrelated compound rules at every schema level', () => {
    const sections = projectPublicInquirySections([
      {
        fields: [
          field('SINGLE_CHILD', { fieldType: 9 }),
          field('SIBLING_STUDENT', { fieldType: 7 }),
          field('positive', { visibilityRuleJson: JSON.stringify(rule('SINGLE_CHILD', true)) }),
          field('compound', {
            requiredRuleJson: JSON.stringify({
              operator: 'ANY',
              conditions: [rule('SINGLE_CHILD', true), rule('ROLE', 'guardian')],
            }),
          }),
          field('empty', {
            visibilityRuleJson: JSON.stringify({ field: 'SIBLING_STUDENT', operator: 'IsEmpty' }),
          }),
        ],
        visibilityRuleJson: JSON.stringify({
          operator: 'ALL',
          conditions: [rule('SINGLE_CHILD', false), rule('ROLE', 'guardian')],
        }),
        stepVisibilityRuleJson: JSON.stringify(rule('SINGLE_CHILD', false)),
      },
    ]);
    const [section] = sections;
    expect(
      isAdmissionRuleVisible(section.visibilityRuleJson, { ROLE: 'guardian', SINGLE_CHILD: 'true' })
    ).toBe(true);
    expect(isAdmissionRuleVisible(section.visibilityRuleJson, { ROLE: 'father' })).toBe(false);
    expect(isAdmissionRuleVisible(section.stepVisibilityRuleJson, {})).toBe(true);
    expect(
      isAdmissionRuleVisible(section.fields[0].visibilityRuleJson, { SINGLE_CHILD: 'true' })
    ).toBe(false);
    expect(isAdmissionRuleVisible(section.fields[1].requiredRuleJson, { ROLE: 'guardian' })).toBe(
      true
    );
    expect(isAdmissionRuleVisible(section.fields[1].requiredRuleJson, { ROLE: 'father' })).toBe(
      false
    );
    expect(isAdmissionRuleVisible(section.fields[2].visibilityRuleJson, {})).toBe(true);
  });
});
