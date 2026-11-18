import { describe, expect, it } from 'vitest';

import { buildPolicyVersionPage, materializePolicyVersion } from './policy-version-page';

const version = (number: number, value: number) => ({
  id: `v${number}`, versionNumber: number, snapshotJson: JSON.stringify({ flatAmount: value }),
  creationTime: '2026-11-17T10:00:00Z', creatorId: null, changeAction: 'edited',
});

describe('paged policy version comparisons', () => {
  it('uses the extra predecessor snapshot without displaying it as a row', () => {
    const page = buildPolicyVersionPage([version(4, 400), version(3, 300), version(2, 200)], 2);
    expect(page.map((item) => item.versionNumber)).toEqual([4, 3]);
    expect(materializePolicyVersion(page[1]).changedFields).toEqual([
      { field: 'flatAmount', oldValue: 200, newValue: 300 },
    ]);
  });

  it('compares the creation version with an empty snapshot', () => {
    const [first] = buildPolicyVersionPage([version(1, 100)], 20);
    expect(materializePolicyVersion(first).changedFields).toEqual([
      { field: 'flatAmount', oldValue: null, newValue: 100 },
    ]);
  });

  it('does not invent creation changes when the predecessor is unavailable', () => {
    const [latest] = buildPolicyVersionPage([version(7, 700)], 20);
    expect(materializePolicyVersion(latest).changedFields).toEqual([]);
    expect(materializePolicyVersion(latest).snapshotAfter).toEqual({ flatAmount: 700 });
  });

  it('defers snapshot parsing until a version is inspected', () => {
    const row = version(2, 200);
    row.snapshotJson = '{invalid';
    const [item] = buildPolicyVersionPage([row], 20);
    expect(item.snapshotAfter).toBeUndefined();
    expect(materializePolicyVersion(item).snapshotAfter).toEqual({});
  });
});
