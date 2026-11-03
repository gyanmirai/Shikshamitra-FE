import type { TimetableSettingStatus } from 'src/utils/timetable-capacity';

import { vi, it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CapacityBanner } from './CapacityBanner';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
vi.mock('./WeeklyLectureSetupActions', () => ({
  WeeklyLectureSetupActions: () => <button type="button">Configure lecture slots</button>,
}));

describe('capacity warning recovery', () => {
  it.each([
    ['PendingSlotSetup', false, true],
    ['OverCapacity', true, true],
    ['Balanced', true, false],
    ['FreeSlotsAvailable', true, false],
    ['PendingWeeklyLectures', true, false],
  ] as const)('shows setup only for a redirectable %s status', (status, hasSlots, actionable) => {
    render(
      <CapacityBanner
        status={status as TimetableSettingStatus}
        availableCapacity={30}
        requiredLectures={35}
        hasSlots={hasSlots}
        classContext="Class 1 / 2026-2027 / CBSE / English"
        onRefresh={vi.fn()}
      />
    );
    expect(Boolean(screen.queryByRole('button', { name: 'Configure lecture slots' }))).toBe(actionable);
    if (!hasSlots) expect(screen.getByText(/Class 1 \/ 2026-2027 \/ CBSE \/ English/)).toBeVisible();
  });
});
