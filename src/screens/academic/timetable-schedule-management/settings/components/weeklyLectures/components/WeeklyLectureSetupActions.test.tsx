import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { academicPaths, academicPermissions } from 'src/constants/academic-menu';

import { WeeklyLectureSetupActions } from './WeeklyLectureSetupActions';

const state = vi.hoisted(() => ({ permissions: [] as { name: string; isGranted: boolean }[] }));
vi.mock('react-redux', () => ({
  useSelector: (select: (value: unknown) => unknown) => select({ auth: state }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));

describe('weekly lecture prerequisite recovery', () => {
  beforeEach(() => {
    state.permissions = [];
  });

  it.each([
    ['slots', academicPermissions.timetable.settings.lectureSlots, academicPaths.timetable.settings.lectureSlots, 'Configure lecture slots'],
    ['subjects', academicPermissions.curriculum.subjectsAssignment, academicPaths.curriculum.subjectsAssignment, 'Open subject allocation'],
  ] as const)('opens %s setup without navigating away from the draft', (setup, permission, href, label) => {
    state.permissions = [{ name: `${permission}.View`, isGranted: true }];
    const refresh = vi.fn();
    render(<WeeklyLectureSetupActions setup={setup} onRefresh={refresh} />);
    const link = screen.getByRole('link', { name: `${label} (opens in a new tab)` });
    expect(link).toHaveAttribute('href', href);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    fireEvent.click(screen.getByRole('button', { name: 'Refresh setup' }));
    expect(refresh).toHaveBeenCalledOnce();
  });

  it('explains missing access and retains refresh without an unauthorized link', () => {
    state.permissions = [{ name: `${academicPermissions.timetable.settings.lectureSlots}.View`, isGranted: false }];
    render(<WeeklyLectureSetupActions setup="slots" onRefresh={vi.fn()} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(/Ask an administrator/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Refresh setup' })).toBeEnabled();
  });

  it('locks setup and refresh while submission is in progress', () => {
    state.permissions = [{ name: `${academicPermissions.timetable.settings.lectureSlots}.View`, isGranted: true }];
    const refresh = vi.fn();
    render(<WeeklyLectureSetupActions setup="slots" onRefresh={refresh} disabled />);
    expect(screen.getByRole('button', { name: 'Refresh setup' })).toBeDisabled();
    expect(screen.getByLabelText('Configure lecture slots (opens in a new tab)')).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Refresh setup' }));
    expect(refresh).not.toHaveBeenCalled();
  });
});
