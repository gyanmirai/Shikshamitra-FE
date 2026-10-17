import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import StudentNotificationScreen from './index';

const state = vi.hoisted(() => ({
  permissions: [] as { name: string; isGranted: boolean }[],
  params: new URLSearchParams(),
}));
vi.mock('react-redux', () => ({ useSelector: (select: any) => select({ auth: state }) }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => state.params,
  usePathname: () => '/student/attendance/notification',
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('src/components/iconify/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: ({ heading }: any) => <h1>{heading}</h1> }));
vi.mock('src/components/custom-tabs', () => ({ CustomTabs: ({ children }: any) => <div role="tablist">{children}</div> }));
vi.mock('src/components/form-slider', () => ({ FormSlider: ({ children }: any) => children }));
vi.mock('src/screens/student/studentNotification/Components/AttendanceNotification', () => ({ default: () => <div>Attendance notification settings</div> }));
vi.mock('src/screens/student/studentNotification/Components/EnrollmentNotification', () => ({ default: () => <div>Enrollment notification settings</div> }));

beforeEach(() => { state.permissions = []; state.params = new URLSearchParams(); });

describe('Student notification tab permissions', () => {
  it('hides unrelated tabs and rejects a forbidden URL selection', () => {
    state.params = new URLSearchParams('tab=enrollment');
    state.permissions = [{ name: 'Students.Notification.AttendanceManagement.View', isGranted: true }];
    render(<StudentNotificationScreen />);
    expect(screen.getByRole('tab', { name: 'Attendance' })).toBeVisible();
    expect(screen.queryByRole('tab', { name: 'Enrollment' })).not.toBeInTheDocument();
    expect(screen.getByText('Attendance notification settings')).toBeVisible();
    expect(screen.queryByText('Enrollment notification settings')).not.toBeInTheDocument();
  });

  it('allows enrollment-only access without Attendance permissions', () => {
    state.permissions = [{ name: 'Students.Notification.InquiryManagement.View', isGranted: true }];
    render(<StudentNotificationScreen />);
    expect(screen.getByRole('tab', { name: 'Enrollment' })).toBeVisible();
    expect(screen.queryByRole('tab', { name: 'Attendance' })).not.toBeInTheDocument();
    expect(screen.getByText('Enrollment notification settings')).toBeVisible();
  });

  it('does not turn an Add grant into read access or expose an unsupported Exam workspace', () => {
    state.permissions = [{ name: 'Students.Notification.AttendanceManagement.Add', isGranted: true }];
    render(<StudentNotificationScreen />);
    expect(screen.getByRole('alert')).toHaveTextContent('No notification workspace is available');
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByText('Attendance notification settings')).not.toBeInTheDocument();
  });
});
