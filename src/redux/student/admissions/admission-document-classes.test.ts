import { it, expect, describe } from 'vitest';

import { getDocumentConfigurationError } from './admission-document-policy-validation';
import {
  DEFAULT_DOCUMENT_POLICY,
  createDocumentRequirement,
  readAdmissionDocumentPolicy,
  writeAdmissionDocumentPolicy,
} from './admission-document-policy';

const standardId = '11111111-1111-4111-8111-111111111111';
const requirement = createDocumentRequirement('REPORT', 'Class 9 report card');
const json = (standardIds?: string[] | null) =>
  JSON.stringify({
    documentVerification: {
      ...DEFAULT_DOCUMENT_POLICY,
      requirements: [{ ...requirement, standardIds }],
    },
  });

describe('class-specific document requirements', () => {
  it('preserves selected class IDs and existing rules through editing', () => {
    const saved = json([standardId]);
    const policy = readAdmissionDocumentPolicy(saved)!;
    expect(getDocumentConfigurationError(saved)).toBeUndefined();
    expect(
      readAdmissionDocumentPolicy(
        writeAdmissionDocumentPolicy(saved, { ...policy, allowWaivers: true })
      )?.requirements[0].standardIds
    ).toEqual([standardId]);
  });
  it('keeps legacy and all-class requirements valid', () => {
    expect(getDocumentConfigurationError(json())).toBeUndefined();
    expect(getDocumentConfigurationError(json(null))).toBeUndefined();
  });
  it('accepts sequential GUIDs returned by school class and document-type lookups', () => {
    const id = '10101010-1010-e010-b010-101010101010';
    const policy = readAdmissionDocumentPolicy(json([id]))!;
    policy.requirements[0].documentTypeId = id;
    expect(
      getDocumentConfigurationError(writeAdmissionDocumentPolicy(undefined, policy))
    ).toBeUndefined();
  });
  it.each([
    { ids: [] },
    { ids: [standardId, standardId] },
    { ids: ['Class 10'] },
    { ids: ['00000000-0000-0000-0000-000000000000'] },
    { ids: ['10101010-1010-e010-b010-101010101010', '10101010-1010-E010-B010-101010101010'] },
  ])('rejects invalid class selections $ids', ({ ids }) => {
    expect(getDocumentConfigurationError(json(ids))).toBeTruthy();
  });
});
