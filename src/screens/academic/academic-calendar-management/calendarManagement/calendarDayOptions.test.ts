import { it, expect, describe } from 'vitest';

import {
  getCalendarDayOptionLabel,
  ensureSelectedCalendarDayOption,
} from './calendarDayOptions';

describe('calendar day edit options', () => {
  it('hydrates a persisted selection that is absent from the current option query', () => {
    const options = ensureSelectedCalendarDayOption(
      [{ id: 'active-exam', name: 'Active exam' }],
      'linked-exam',
      'December Final Exam',
      'Unavailable exam'
    );

    expect(options).toContainEqual(
      expect.objectContaining({ id: 'linked-exam', name: 'December Final Exam' })
    );
  });

  it('never exposes a raw entity id when the selected class cannot be resolved', () => {
    const options = ensureSelectedCalendarDayOption(
      [],
      '3a238ca1-2150-06ab-6dc4-dc48f6100000',
      undefined,
      'Unavailable class'
    );

    expect(
      getCalendarDayOptionLabel(
        options,
        '3a238ca1-2150-06ab-6dc4-dc48f6100000',
        'Unavailable class'
      )
    ).toBe('Unavailable class');
    expect(options[0]).toMatchObject({ unavailable: true });
  });

  it('does not duplicate a selection already returned by the API', () => {
    const options = ensureSelectedCalendarDayOption(
      [{ id: 'class-12', name: 'Class 12' }],
      'class-12',
      'Different label',
      'Unavailable class'
    );

    expect(options).toEqual([{ id: 'class-12', name: 'Class 12' }]);
  });
});
