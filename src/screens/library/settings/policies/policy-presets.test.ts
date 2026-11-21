import { it, expect } from 'vitest';

import { policySchema, policyInitialValues } from './policy-form';
import { policyPresets, applyPolicyPreset } from './policy-presets';

it.each(policyPresets)(
  'applies $name terms without replacing the reviewed scope and dates',
  async (preset) => {
    const draft = {
      ...policyInitialValues(),
      name: 'Reviewed school rules',
      priority: '12',
      sectionId: 'campus-section',
      effectiveFrom: '2026-11-19',
      role: 1 as const,
    };
    const terms = applyPolicyPreset(draft, preset);
    expect(terms).toMatchObject({
      role: 1,
      name: draft.name,
      effectiveFrom: draft.effectiveFrom,
      sectionId: draft.sectionId,
      priority: draft.priority,
      ...preset.terms,
    });
    await expect(policySchema.validate(terms)).resolves.toBeDefined();
    expect(draft.maxBooksAtTime).toBe('');
  }
);
