import { it, expect, describe } from 'vitest';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';

import { getScheduleExamPrimaryAction } from './schedule-exam-primary-action';

describe('schedule exam primary action', () => {
  it('sends incomplete drafts back to setup', () => {
    expect(getScheduleExamPrimaryAction(examScheduledStatus.Pending, 2)).toMatchObject({
      kind: 'complete',
      label: 'Complete setup',
    });
  });

  it('makes publication the visible next action for ready drafts', () => {
    expect(getScheduleExamPrimaryAction(examScheduledStatus.Pending, 0)).toMatchObject({
      kind: 'publish',
      label: 'Publish exam',
    });
  });

  it('does not show a lifecycle action after publication', () => {
    expect(getScheduleExamPrimaryAction(examScheduledStatus.Published, 0)).toBeNull();
  });
});
