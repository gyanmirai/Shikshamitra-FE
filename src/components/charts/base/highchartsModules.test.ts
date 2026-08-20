import { it, expect, describe } from 'vitest';
import { ensureHighchartsModules, Highcharts } from './highchartsModules';

describe('highchartsModules', () => {
  it('loads Highcharts with modules without throwing TypeError', () => {
    expect(() => {
      const hc = ensureHighchartsModules();
      expect(hc).toBeDefined();
      expect(Highcharts).toBeDefined();
      expect(hc.Series).toBeDefined();
    }).not.toThrow();
  });
});
