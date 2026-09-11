import { it, expect, describe } from 'vitest';

import {
  eligibilityCriterionSchema,
  getEligibilityConfigurationError,
} from './admission-eligibility-validation';
import {
  DEFAULT_ELIGIBILITY_POLICY,
  createEligibilityCriterion,
  readAdmissionEligibilityPolicy,
  writeAdmissionEligibilityPolicy,
} from './admission-eligibility-policy';

const age = {
  ...createEligibilityCriterion('AGE'),
  name: 'Age at admission',
  minAgeMonths: 60,
  maxAgeMonths: 83,
  cutoffDate: '2027-04-01',
};
const json = (change = {}) =>
  JSON.stringify({ eligibility: { ...DEFAULT_ELIGIBILITY_POLICY, criteria: [age], ...change } });

describe('managed eligibility configuration', () => {
  it('enforces the stored stage configuration limit before saving', () => {
    expect(getEligibilityConfigurationError(json({ notes: 'x'.repeat(8000) }))).toMatch(/8,000/);
  });
  it('preserves legacy stages and unrelated configuration', () => {
    expect(getEligibilityConfigurationError(undefined)).toBeUndefined();
    expect(readAdmissionEligibilityPolicy('{"formDefinitionId":"keep"}')).toBeNull();
    const saved = writeAdmissionEligibilityPolicy('{"custom":{"keep":true}}', {
      ...DEFAULT_ELIGIBILITY_POLICY,
      criteria: [age],
    });
    expect(JSON.parse(saved).custom).toEqual({ keep: true });
    expect(getEligibilityConfigurationError(saved)).toBeUndefined();
  });

  it('does not overwrite unsupported future settings or unknown criterion kinds', () => {
    const future = json({ version: 2 });
    expect(readAdmissionEligibilityPolicy(future)).toBeNull();
    expect(() => writeAdmissionEligibilityPolicy(future, DEFAULT_ELIGIBILITY_POLICY)).toThrow(
      /unsupported/
    );
    expect(
      getEligibilityConfigurationError(json({ criteria: [{ ...age, kind: 'future' }] }))
    ).toMatch(/preserved/);
  });

  it('retains optional configuration and metadata when enabling or disabling checks', () => {
    const original = json({ futureFlag: 'keep', criteria: [{ ...age, note: 'retain' }] });
    const policy = readAdmissionEligibilityPolicy(original)!;
    const saved = JSON.parse(
      writeAdmissionEligibilityPolicy(original, { ...policy, enabled: false })
    );
    expect(saved.eligibility.futureFlag).toBe('keep');
    expect(saved.eligibility.criteria[0].note).toBe('retain');
    expect(getEligibilityConfigurationError(JSON.stringify(saved))).toBeUndefined();
  });

  it.each([
    { minAgeMonths: null, maxAgeMonths: null },
    { minAgeMonths: 84, maxAgeMonths: 83 },
    { minAgeMonths: -1 },
    { maxAgeMonths: 1201 },
    { minAgeMonths: 12.5 },
    { cutoffDate: '2027-02-29' },
    { cutoffDate: '0000-01-01' },
    { cutoffDate: '2027-04-01T00:00:00Z' },
  ])('rejects invalid age configuration %j', (change) => {
    expect(
      getEligibilityConfigurationError(json({ criteria: [{ ...age, ...change }] }))
    ).toBeTruthy();
  });

  it('allows valid leap-day cutoffs and open-ended age limits', () => {
    expect(
      getEligibilityConfigurationError(
        json({ criteria: [{ ...age, maxAgeMonths: null, cutoffDate: '2028-02-29' }] })
      )
    ).toBeUndefined();
  });

  it('blocks empty managed policies and duplicate criterion references', () => {
    expect(getEligibilityConfigurationError(json({ criteria: [] }))).toMatch(/between 1 and 30/);
    expect(getEligibilityConfigurationError(json({ criteria: [age, age] }))).toMatch(/unique code/);
    expect(
      getEligibilityConfigurationError(json({ enabled: false, criteria: [] }))
    ).toBeUndefined();
  });

  it('requires the published form and preserves each declared answer source', () => {
    const criterion = {
      code: 'MARKS',
      name: 'Previous marks',
      kind: 'application',
      formDefinitionId: '11111111-1111-1111-1111-111111111111',
      conditionJson:
        '{"field":"application.PERCENTAGE","operator":"GreaterThanOrEqual","value":75}',
    };
    expect(getEligibilityConfigurationError(json({ criteria: [criterion] }))).toBeUndefined();
    expect(
      getEligibilityConfigurationError(
        json({ criteria: [{ ...criterion, formDefinitionId: null }] })
      )
    ).toMatch(/published form/);
    expect(
      getEligibilityConfigurationError(
        json({
          criteria: [
            {
              ...criterion,
              conditionJson: '{"field":"inquiry.MARKS","operator":"Equals","value":75}',
            },
          ],
        })
      )
    ).toMatch(/only application/);
  });

  it('requires an explicit source stage and rejects scores on waived assessments', () => {
    const criterion = {
      code: 'EXAM',
      name: 'Entrance exam',
      kind: 'assessment',
      sourceStageCode: 'EXAM_1',
      requiredOutcome: 'passed',
      minimumPercentage: 60,
    };
    expect(getEligibilityConfigurationError(json({ criteria: [criterion] }))).toBeUndefined();
    expect(
      getEligibilityConfigurationError(json({ criteria: [{ ...criterion, sourceStageCode: '' }] }))
    ).toMatch(/earlier workflow stage/);
    expect(
      getEligibilityConfigurationError(
        json({ criteria: [{ ...criterion, requiredOutcome: 'waived' }] })
      )
    ).toMatch(/cannot require a score/);
  });

  it('returns field-addressable validation so Formik cannot submit an invalid criterion', async () => {
    await expect(
      eligibilityCriterionSchema.validate(createEligibilityCriterion('NEW'))
    ).rejects.toMatchObject({ path: 'kind' });
    await expect(eligibilityCriterionSchema.validate(age)).resolves.toMatchObject({ code: 'AGE' });
  });
});
