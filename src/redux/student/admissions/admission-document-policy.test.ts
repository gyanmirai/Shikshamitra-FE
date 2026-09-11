import { it, expect, describe } from 'vitest';

import { getAdmissionConditionError } from './admission-condition-rule';
import { getDocumentConfigurationError } from './admission-document-policy-validation';
import {
  DEFAULT_DOCUMENT_POLICY,
  createDocumentRequirement,
  readAdmissionDocumentPolicy,
  writeAdmissionDocumentPolicy,
} from './admission-document-policy';

const requirement = createDocumentRequirement('BIRTH_CERTIFICATE', 'Birth certificate');
const policy = { ...DEFAULT_DOCUMENT_POLICY, requirements: [requirement] };
const json = (change = {}) => JSON.stringify({ documentVerification: { ...policy, ...change } });

describe('document verification configuration compatibility', () => {
  it('enforces the stored stage configuration limit before saving', () => {
    expect(getDocumentConfigurationError(json({ notes: 'x'.repeat(8000) }))).toContain('8,000');
  });
  it.each([undefined, '{}', '{"integration":{"reference":"existing"}}'])(
    'keeps unconfigured stages on their existing process: %s',
    (value) => {
      expect(readAdmissionDocumentPolicy(value)).toBeNull();
      expect(getDocumentConfigurationError(value)).toBeUndefined();
    }
  );
  it('preserves extensions and requirement metadata when updating review options', () => {
    const original = JSON.stringify({
      integration: { key: 'existing' },
      documentVerification: {
        ...policy,
        extension: { audit: true },
        requirements: [{ ...requirement, source: 'imported' }],
      },
    });
    const current = readAdmissionDocumentPolicy(original)!;
    expect(
      JSON.parse(writeAdmissionDocumentPolicy(original, { ...current, allowWaivers: true }))
    ).toEqual({
      integration: { key: 'existing' },
      documentVerification: { ...current, allowWaivers: true },
    });
  });
  it('accepts omitted and explicitly null optional fields returned by the API', () => {
    const value = json({
      requirements: [
        { ...requirement, description: null, conditionJson: null, documentTypeId: null },
      ],
    });
    expect(readAdmissionDocumentPolicy(value)).not.toBeNull();
    expect(getDocumentConfigurationError(value)).toBeUndefined();
  });
  it.each(['{', '[]', json({ version: 2 }), json({ allowWaivers: 'false' })])(
    'blocks malformed or future configuration without overwriting it',
    (value) => {
      expect(getDocumentConfigurationError(value)).toBeTruthy();
      expect(() => writeAdmissionDocumentPolicy(value, policy)).toThrow();
    }
  );
  it('retains requirements when temporarily switching back to basic completion', () => {
    const next = writeAdmissionDocumentPolicy(json(), { ...policy, enabled: false });
    expect(readAdmissionDocumentPolicy(next)?.requirements).toEqual([requirement]);
    expect(getDocumentConfigurationError(next)).toBeUndefined();
  });
  it('rejects duplicate codes, empty checklists and unsupported file limits', () => {
    expect(getDocumentConfigurationError(json({ requirements: [] }))).toContain('1 and 30');
    expect(
      getDocumentConfigurationError(json({ requirements: [requirement, requirement] }))
    ).toContain('unique code');
    expect(
      getDocumentConfigurationError(json({ requirements: [{ ...requirement, maxFileSizeMb: 21 }] }))
    ).toContain('20 MB');
    expect(
      getDocumentConfigurationError(
        json({ requirements: [{ ...requirement, allowedExtensions: ['exe'] }] })
      )
    ).toContain('PDF');
  });
  it('requires a valid condition only for conditional requirements', () => {
    const conditional = { ...requirement, requirement: 'conditional' };
    expect(getDocumentConfigurationError(json({ requirements: [conditional] }))).toContain(
      'condition'
    );
    const conditionJson = JSON.stringify({
      operator: 'ALL',
      conditions: [
        { field: 'application.TRANSFER', operator: 'Equals', value: 'yes' },
        { field: 'application.PREVIOUS_GRADE', operator: 'GreaterThan', value: 1 },
      ],
    });
    expect(
      getDocumentConfigurationError(json({ requirements: [{ ...conditional, conditionJson }] }))
    ).toBeUndefined();
  });
  it('rejects circular document conditions and nonnumeric comparisons', () => {
    expect(
      getAdmissionConditionError(
        '{"field":"documents.complete","operator":"Equals","value":"true"}'
      )
    ).toContain('application');
    expect(
      getAdmissionConditionError(
        '{"field":"application.AGE","operator":"GreaterThan","value":"abc"}'
      )
    ).toContain('number');
    expect(getAdmissionConditionError('{"operator":"ALL","conditions":[]}')).toContain(
      'at least one'
    );
  });
  it('rejects hidden stale conditions on unconditional requirements', () => {
    expect(
      getDocumentConfigurationError(
        json({
          requirements: [
            {
              ...requirement,
              conditionJson: '{"field":"application.TRANSFER","operator":"Equals","value":"yes"}',
            },
          ],
        })
      )
    ).toContain('Remove the condition');
  });
  it('enforces field and total condition limits before saving', () => {
    expect(
      getAdmissionConditionError(
        JSON.stringify({ field: `application.${'A'.repeat(129)}`, operator: 'IsEmpty' })
      )
    ).toContain('128');
    expect(
      getAdmissionConditionError(
        JSON.stringify({ field: 'application.A', operator: 'Equals', value: 'a'.repeat(8192) })
      )
    ).toContain('8,192');
  });
});
