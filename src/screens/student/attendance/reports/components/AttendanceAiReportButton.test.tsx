import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { AttendanceAiReportButton } from './AttendanceAiReportButton';

const auth = vi.hoisted(() => ({ permissions: [] as { name: string; isGranted: boolean }[] }));
vi.mock('react-redux', () => ({ useSelector: (select: any) => select({ auth }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/screens/academic/curriculum-management/reports/ShikshaMitraAiReportDrawer', () => ({
  default: ({ open }: { open: boolean }) => open ? <div role="dialog">Report workspace</div> : null,
}));

describe('Attendance AI report permission', () => {
  it.each(['View', 'Delete'])('denies generation with %s-only access', (action) => {
    auth.permissions = [{ name: `Students.Attendance.Reports.${action}`, isGranted: true }];
    render(<AttendanceAiReportButton />);
    expect(screen.getByRole('button', { name: 'Generate with AI' })).toBeDisabled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('requires Add/Update and closes the workspace when that permission is revoked', () => {
    auth.permissions = [{ name: 'Students.Attendance.Reports.Add', isGranted: true }];
    const result = render(<AttendanceAiReportButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate with AI' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    auth.permissions = [];
    result.rerender(<AttendanceAiReportButton />);
    expect(screen.getByRole('button', { name: 'Generate with AI' })).toBeDisabled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
