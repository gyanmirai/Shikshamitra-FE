import { it, expect, describe } from 'vitest';

import { getBuilderIssues } from './form-builder-issues';
import { newField, getBlankAdmissionFormInitialValues } from './form-dialog-model';
import {
  getBuilderIssueActionLabel,
  getFormikBuilderIssueTarget,
  getBuilderIssueRecoveryGuidance,
} from './form-builder-issue-navigation';

describe('builder issue destinations', () => {
  it.each(['invalid', '[]', 'null'])(
    'offers recovery instead of an unrelated Rules control for invalid validation %s',
    (validationJson) => {
      const form = getBlankAdmissionFormInitialValues();
      form.sections[0].fields = [{ ...newField(form.sections[0].id, 0, 0), validationJson }];
      const issue = getBuilderIssues(form).find((item) =>
        item.message.includes('invalid validation')
      );
      expect(issue?.target).toBeDefined();
      expect(getBuilderIssueActionLabel(issue!.target!)).toBe('Review question');
      expect(getBuilderIssueRecoveryGuidance(issue!.target!)).toContain('cannot be edited here');
    }
  );

  it.each(['state', 'city'])(
    'retains editable location settings for the missing %s dependency',
    (format) => {
      const form = getBlankAdmissionFormInitialValues();
      form.sections[0].fields = [
        { ...newField(form.sections[0].id, 0, 0), validationJson: JSON.stringify({ format }) },
      ];
      const issue = getBuilderIssues(form).find(
        (item) => item.message.includes('needs Country') || item.message.includes('needs a Country')
      );
      expect(issue?.target).toBeDefined();
      expect(getBuilderIssueActionLabel(issue!.target!)).toBe('Fix error');
      expect(getBuilderIssueRecoveryGuidance(issue!.target!)).toBeUndefined();
    }
  );

  it('offers recovery when a validation dependency has no supported location editor', () => {
    const form = getBlankAdmissionFormInitialValues();
    form.sections[0].fields = [
      {
        ...newField(form.sections[0].id, 0, 0),
        validationJson: '{"format":"phone","countryField":"REMOVED_COUNTRY"}',
      },
    ];
    const issue = getBuilderIssues(form).find((item) => item.message.includes('REMOVED_COUNTRY'));
    expect(issue?.target).toBeDefined();
    expect(getBuilderIssueActionLabel(issue!.target!)).toBe('Review question');
    expect(getBuilderIssueRecoveryGuidance(issue!.target!)).toContain('cannot be edited here');
  });

  it.each(['code', 'bindingKey', 'requiredRuleJson'])(
    'offers review and recovery for hidden question setting %s',
    (property) => {
      const form = getBlankAdmissionFormInitialValues();
      form.sections[0].fields = [newField(form.sections[0].id, 0, 0)];
      const target = getFormikBuilderIssueTarget(form, `sections[0].fields[0].${property}`);
      expect(getBuilderIssueActionLabel(target)).toBe('Review question');
      expect(getBuilderIssueRecoveryGuidance(target)).toContain('cannot be edited here');
      expect(getBuilderIssueRecoveryGuidance(target)).toContain('Keep the current question');
    }
  );

  it('routes a missing condition reference to the rule that owns it', () => {
    const form = getBlankAdmissionFormInitialValues();
    form.sections[0].fields = [
      {
        ...newField(form.sections[0].id, 0, 0),
        label: 'Activity',
        visibilityRuleJson: '{"field":"REMOVED_VISIBLE","operator":"IsNotEmpty"}',
        requiredRuleJson: '{"field":"REMOVED_REQUIRED","operator":"IsNotEmpty"}',
      },
    ];
    const referenceIssues = getBuilderIssues(form).filter((issue) =>
      issue.message.includes('references missing')
    );
    expect(referenceIssues.map((issue) => issue.target?.settingPath)).toEqual([
      'sections[0].fields[0].visibilityRuleJson',
      'sections[0].fields[0].requiredRuleJson',
    ]);
  });
  it('resolves the indexed field and exact setting path without choosing a similarly named field', () => {
    const form = getBlankAdmissionFormInitialValues();
    form.sections[0].stepId = 'step-with-duplicate-labels';
    form.sections[0].fields = [0, 1].map((index) => ({
      ...newField(form.sections[0].id, index, 0),
      id: `field-${index}`,
      label: 'Same label',
    }));
    expect(getFormikBuilderIssueTarget(form, 'sections[0].fields[1].label')).toEqual({
      kind: 'field',
      sectionId: form.sections[0].id,
      stepId: 'step-with-duplicate-labels',
      fieldId: 'field-1',
      owner: 'registration',
      settingPath: 'sections[0].fields[1].label',
    });
    expect(getFormikBuilderIssueTarget(form, 'sections[99].name')).toEqual({
      kind: 'form',
      settingPath: 'sections[99].name',
    });
  });
  it('identifies the exact section and step when labels are duplicated', () => {
    const form = getBlankAdmissionFormInitialValues();
    form.layoutType = 1;
    form.sections = [0, 1].map((index) => ({
      ...form.sections[0],
      id: `section-${index}`,
      code: `SECTION_${index}`,
      name: 'Details',
      stepId: `step-${index}`,
      stepCode: `STEP_${index}`,
      stepName: index ? '' : 'Details',
      stepDisplayOrder: index,
      fields: [],
    }));

    expect(getBuilderIssues(form)).toContainEqual(
      expect.objectContaining({
        message: 'Step 2 needs a name.',
        target: expect.objectContaining({
          kind: 'step',
          sectionId: 'section-1',
          stepId: 'step-1',
          settingPath: 'sections[1].stepName',
        }),
      })
    );
    expect(
      getBuilderIssues(form).filter((issue) => issue.message.includes('has no fields'))
    ).toEqual([
      expect.objectContaining({
        target: expect.objectContaining({ kind: 'section', sectionId: 'section-0' }),
      }),
      expect.objectContaining({
        target: expect.objectContaining({ kind: 'section', sectionId: 'section-1' }),
      }),
    ]);
  });

  it('retains source identity for a remapped inherited field instead of offering definition edits', () => {
    const form = getBlankAdmissionFormInitialValues();
    form.sections[0].fields = [
      {
        ...newField(form.sections[0].id, 0, 6),
        id: 'registration-field',
        code: 'REMAPPED',
        label: 'Activities',
        optionsJson: 'invalid',
        inheritedFrom: {
          inquiryFormDefinitionId: 'inquiry-version-2',
          sourceFieldCode: 'SOURCE_ACTIVITY',
          sourceFieldIdentity: 'source-identity',
          fieldIdentity: 'effective-identity',
        },
      },
    ];

    expect(getBuilderIssues(form)).toContainEqual(
      expect.objectContaining({
        message: 'Activities requires valid options.',
        target: expect.objectContaining({
          kind: 'field',
          sectionId: form.sections[0].id,
          fieldId: 'registration-field',
          owner: 'inquiry',
          sourceFormDefinitionId: 'inquiry-version-2',
          fieldIdentity: 'effective-identity',
        }),
      })
    );
  });
});
