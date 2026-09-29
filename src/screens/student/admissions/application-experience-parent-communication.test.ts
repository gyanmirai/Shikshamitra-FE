import { it, expect, describe } from 'vitest';

import { ADMISSION_PARENT_MESSAGE_EVENTS } from './application-experience-parent-communication';

describe('admission parent communication catalogue', () => {
  it('covers every requested lifecycle message exactly once', () => {
    expect(ADMISSION_PARENT_MESSAGE_EVENTS.map((event) => event.label)).toEqual([
      'Inquiry acknowledgement',
      'Application received',
      'Missing documents',
      'Exam scheduled',
      'Hall ticket ready',
      'Result published',
      'Offer issued',
      'Payment reminder',
      'Admission finalized',
    ]);
  });
});
