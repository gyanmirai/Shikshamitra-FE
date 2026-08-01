import { describe, expect, it } from 'vitest';

import {
  leadScoringPresets,
  getLeadScoringPreviews,
  matchesLeadScoringPreset,
} from './pipeline-scoring-model';

describe('Pipeline scoring recommendations', () => {
  it('identifies the selected recommendation without mutating the preset', () => {
    const balanced = leadScoringPresets[0];
    const selected = { ...balanced.rules };

    expect(matchesLeadScoringPreset(selected, balanced)).toBe(true);
    expect(
      matchesLeadScoringPreset({ ...selected, baseScore: selected.baseScore + 1 }, balanced)
    ).toBe(false);
  });

  it('caps representative lead scores at the configured range', () => {
    const previews = getLeadScoringPreviews({
      ...leadScoringPresets[0].rules,
      baseScore: 90,
      examFailPenalty: -200,
      maxScore: 100,
    });

    expect(previews.every((preview) => preview.score >= 0 && preview.score <= 100)).toBe(true);
    expect(previews[0].score).toBe(100);
  });
});
