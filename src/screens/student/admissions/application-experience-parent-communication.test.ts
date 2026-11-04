import { it, expect, describe } from 'vitest';

import { ADMISSION_PARENT_MESSAGE_EVENTS } from './application-experience-parent-communication';

describe('admission parent communication catalogue', () => {
  it('covers every requested lifecycle message exactly once', () => {
    expect(ADMISSION_PARENT_MESSAGE_EVENTS.map((event) => event.label)).toEqual([
      'Inquiry Acknowledgement',
      'Application Received',
      'Missing Documents',
      'Exam Scheduled',
      'Hall Ticket Ready',
      'Result Published',
      'Offer Issued',
      'Payment Reminder',
      'Admission Finalized',
    ]);
  });
});
