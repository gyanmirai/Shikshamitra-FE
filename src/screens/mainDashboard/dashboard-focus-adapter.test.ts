import { it, expect, describe } from 'vitest';

import { parseDashboardFocus, parseDashboardPersonalContext } from './dashboard-focus-adapter';

const childId = '11111111-1111-4111-8111-111111111111';
const payload = {
  kind: 'collections', widgetId: 'finance-collection', title: 'Verified Collections',
  description: 'Official receipts only', status: 'ready', accessMode: 'staff',
  requiredPermissions: ['Finance.Fees.FeeCollections.View'], unit: 'INR',
  series: [{ id: 'verified', label: 'Verified', points: [{ key: 'oct', label: 'October', value: 0 }] }],
  items: [], metrics: [{ key: 'total', label: 'Verified', value: 0, unit: 'INR' }],
};

describe('dashboard focus contract', () => {
  it('preserves real zero and missing values without inventing samples', () => {
    const focus = parseDashboardFocus({ ...payload,
      metrics: [...payload.metrics, { key: 'unknown', label: 'Unavailable', value: null }] });
    expect(focus?.metrics.map((metric) => metric.value)).toEqual([0, null]);
    expect(focus?.series[0].points[0].value).toBe(0);
  });

  it.each(['kind', 'status', 'accessMode'])('drops an unknown %s instead of guessing semantics', (key) => {
    expect(parseDashboardFocus({ ...payload, [key]: 'unknown' })).toBeUndefined();
  });

  it('rejects malformed and unbounded numeric observations', () => {
    expect(parseDashboardFocus({ ...payload, metrics: [{ key: 'bad', label: 'Bad', value: Infinity }] })).toBeUndefined();
    expect(parseDashboardFocus({ ...payload, series: [{ id: 'too-many', label: 'Too many', points: Array(401).fill({ key: 'x', label: 'X', value: 1 }) }] })).toBeUndefined();
  });

  it('strips external, backslash and encoded control drilldowns', () => {
    const urls = ['//outside.example', '/\\outside.example', '/%5coutside.example', '/academic%0a/dashboard', '/academic/dashboard'];
    const focus = parseDashboardFocus({ ...payload, items: urls.map((drilldownUrl, index) => ({ id: String(index), title: 'Record', drilldownUrl })) });
    expect(focus?.items.map((item) => item.drilldownUrl)).toEqual([undefined, undefined, undefined, undefined, '/academic/dashboard']);
  });

  it('accepts only distinct explicitly returned child options and matching selection', () => {
    const context = parseDashboardPersonalContext({ students: [{ id: childId, label: 'Child' }, { id: childId, label: 'Duplicate' }], selectedStudentId: childId });
    expect(context.students).toEqual([{ id: childId, label: 'Child' }]);
    expect(context.selectedStudentId).toBe(childId);
    expect(parseDashboardPersonalContext({ students: [], selectedStudentId: childId }).selectedStudentId).toBeUndefined();
  });

  it('does not retain data behind an error or unavailable status', () => {
    ['error', 'unavailable'].forEach((status) => {
      const focus = parseDashboardFocus({ ...payload, status });
      expect(focus?.series).toEqual([]);
      expect(focus?.items).toEqual([]);
      expect(focus?.metrics).toEqual([]);
    });
  });
});
