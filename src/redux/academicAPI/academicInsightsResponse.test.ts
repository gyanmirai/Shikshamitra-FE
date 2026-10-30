import { it, expect, describe } from 'vitest';

import { parseAcademicInsightsResponse } from './academicInsightsResponse';

const payload = {
  role: 'teacher', scopeLabel: 'Assigned classes', generatedAt: '2026-10-29T10:00:00Z',
  sections: [{ key: 'evaluation', status: 'ready', summary: '',
    metrics: [{ key: 'pending', label: 'Pending', value: 0 }],
    series: [{ name: 'review', points: [{ key: 'pending', label: 'Pending', value: 0 }] }],
    items: [],
  }],
};

describe('Academic Insights response boundary', () => {
  it('accepts genuine zero and nullable coordinates without inventing values', () => {
    const value = structuredClone(payload);
    Object.assign(value.sections[0].series[0].points[0], { x: null, y: null, status: null });
    expect(parseAcademicInsightsResponse(value)).toEqual(value);
  });

  it('preserves an unavailable metric as null', () => {
    const value = structuredClone(payload);
    Object.assign(value.sections[0].metrics[0], { value: null });
    expect(parseAcademicInsightsResponse(value)).toEqual(value);
  });

  it.each([NaN, Infinity, '18', undefined])('rejects invalid numeric values (%s)', (value) => {
    const result = structuredClone(payload);
    Object.assign(result.sections[0].metrics[0], { value });
    expect(parseAcademicInsightsResponse(result)).toBeNull();
  });

  it('rejects paginated lists and duplicate or unknown sections', () => {
    expect(parseAcademicInsightsResponse({ items: [], totalCount: 0 })).toBeNull();
    expect(parseAcademicInsightsResponse({ ...payload, sections: [...payload.sections, ...payload.sections] })).toBeNull();
    expect(parseAcademicInsightsResponse({ ...payload, sections: [{ ...payload.sections[0], key: 'lms' }] })).toBeNull();
  });

  it('rejects a non-finite scatter coordinate and malformed series', () => {
    const value = structuredClone(payload);
    Object.assign(value.sections[0].series[0].points[0], { x: Infinity });
    expect(parseAcademicInsightsResponse(value)).toBeNull();
    expect(parseAcademicInsightsResponse({ ...payload, sections: [{ ...payload.sections[0], series: null }] })).toBeNull();
  });
});
