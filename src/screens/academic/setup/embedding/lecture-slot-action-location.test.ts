import { it, expect, describe } from 'vitest';

import { lectureSlotActionLocation } from './lecture-slot-action-location';

describe('lecture slot action navigation', () => {
  it('preserves the guide and unrelated query context when opening an action', () => {
    const href = lectureSlotActionLocation(
      '/academic/setup',
      'stage=timetable&setting=lectureSlots&filter=Class+1',
      'edit'
    );
    const url = new URL(href, 'http://localhost');
    expect(url.pathname).toBe('/academic/setup');
    expect(url.searchParams.get('stage')).toBe('timetable');
    expect(url.searchParams.get('setting')).toBe('lectureSlots');
    expect(url.searchParams.get('filter')).toBe('Class 1');
    expect(url.searchParams.get('action')).toBe('edit');
  });

  it('removes only action and record context when closing the inline form', () => {
    const href = lectureSlotActionLocation(
      '/academic/setup',
      'stage=timetable&setting=lectureSlots&action=edit&recordId=slot-1&filter=active'
    );
    const url = new URL(href, 'http://localhost');
    expect([...url.searchParams.entries()]).toEqual([
      ['stage', 'timetable'],
      ['setting', 'lectureSlots'],
      ['filter', 'active'],
    ]);
  });

  it('returns the standalone pathname without a dangling query separator', () => {
    expect(
      lectureSlotActionLocation('/academic/timetableSettings/lectureSlots', 'action=add')
    ).toBe('/academic/timetableSettings/lectureSlots');
  });
});
