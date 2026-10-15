import { it, expect, describe } from 'vitest';

import { splitPdfScriptRuns } from './indic-pdf-export';

describe('Indic PDF text runs', () => {
  it.each([
    'Hindi शुल्क and पता',
    'खर्च / Fees 10',
    'क्षेत्र शिक्षा',
    'Gujarati ખર્ચ and Hindi शुल्क',
  ])('retains all characters in %s', (value) => {
    const runs = splitPdfScriptRuns(value);
    expect(runs.map((run) => run.text).join('')).toBe(value);
    expect(
      runs
        .filter((run) => /[\u0900-\u097f]/u.test(run.text))
        .every((run) => run.fontFamily === 'TableDevanagari')
    ).toBe(true);
  });
});
