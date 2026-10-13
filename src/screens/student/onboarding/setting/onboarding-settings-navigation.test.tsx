import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { studentPaths, studentPermissions } from 'src/constants/student-menu';
import SettingsLayout from 'src/app/(auth-route)/student/onboarding/settings/layout';
import RulesRoute from 'src/app/(auth-route)/student/onboarding/settings/rules/page';
import GrRoute from 'src/app/(auth-route)/student/onboarding/settings/gr-number/page';
import RollRoute from 'src/app/(auth-route)/student/onboarding/settings/roll-number/page';
import AccountsRoute from 'src/app/(auth-route)/student/onboarding/settings/accounts-access/page';
import ReadinessRoute from 'src/app/(auth-route)/student/onboarding/settings/readiness-access/page';
import NumberingRoute from 'src/app/(auth-route)/student/onboarding/settings/numbering-placement/page';
import OperationalRoute from 'src/app/(auth-route)/student/onboarding/settings/operational-policies/page';

import OnboardingSettingsPage from './onboarding-settings-page';

const state = vi.hoisted(() => ({
  params: new URLSearchParams(),
  auth: {
    permissions: [] as Array<{ name: string; isGranted: boolean }>,
    loading: false,
    permissionsInitialized: true,
  },
}));

vi.mock('react-redux', () => ({ useSelector: (selector: any) => selector({ auth: state.auth }) }));
vi.mock('next/navigation', () => ({
  redirect: (href: string) => {
    throw new Error(`redirect:${href}`);
  },
}));
vi.mock('src/routes/hooks', () => ({ useSearchParams: () => state.params }));
vi.mock('src/sections/error', () => ({ View403: () => <div>Access denied</div> }));
vi.mock('src/components/loading-screen', () => ({
  SplashScreen: () => <div>Checking permissions</div>,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: { heading: string }) => <h1>{heading}</h1>,
}));
vi.mock('src/components/custom-tabs', () => ({
  CustomTabs: ({ children }: { children: ReactNode }) => <div role="tablist">{children}</div>,
}));
vi.mock('./portal-access-settings', () => ({
  default: () => <div>Student and parent login choices</div>,
}));
vi.mock('./onboarding-number-settings', () => ({
  GrNumberSettingsScreen: () => <div>GR series</div>,
  RollNumberSettingsScreen: () => <div>Roll rules</div>,
}));

beforeEach(() => {
  state.params = new URLSearchParams();
  state.auth = { permissions: [], loading: false, permissionsInitialized: true };
});

describe('unified onboarding settings navigation', () => {
  it.each(['', 'tab=unsupported', 'tab=division-changes'])(
    'opens Portal Access for %s',
    (query) => {
      state.params = new URLSearchParams(query);
      render(<OnboardingSettingsPage />);
      expect(screen.getByRole('heading', { name: 'Onboarding Settings' })).toBeInTheDocument();
      expect(screen.getByText('Student and parent login choices')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(3);
      expect(screen.queryByRole('button', { name: /Add/ })).not.toBeInTheDocument();
    }
  );

  it.each([
    ['gr-number', 'GR series', 'Add Series'],
    ['roll-number', 'Roll rules', 'Add Roll Number Rule'],
  ])(
    'renders %s from URL and preserves query context in real tab links',
    (tab, content, action) => {
      state.params = new URLSearchParams(`academicYearId=year-1&tab=${tab}`);
      render(<OnboardingSettingsPage />);
      expect(screen.getByText(content)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: action })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Portal Access' })).toHaveAttribute(
        'href',
        `${studentPaths.onboarding.settings}?academicYearId=year-1&tab=portal-access`
      );
      expect(screen.getByRole('tabpanel')).toHaveAttribute(
        'aria-labelledby',
        `onboarding-settings-tab-${tab}`
      );
    }
  );

  it.each([
    [AccountsRoute, 'accounts'],
    [ReadinessRoute, 'readiness'],
    [RulesRoute, 'rules'],
    [OperationalRoute, 'policies'],
  ])('redirects the retired %s screen to Portal Access', (Route) => {
    expect(() => Route()).toThrow(
      `redirect:${studentPaths.onboarding.settingsSections.portalAccess}`
    );
  });

  it('preserves direct GR and Roll bookmarks', async () => {
    expect(() => GrRoute()).toThrow(
      `redirect:${studentPaths.onboarding.settingsSections.grNumber}`
    );
    expect(() => RollRoute()).toThrow(
      `redirect:${studentPaths.onboarding.settingsSections.rollNumber}`
    );
    await expect(
      NumberingRoute({ searchParams: Promise.resolve({ tab: 'roll-number' }) })
    ).rejects.toThrow(`redirect:${studentPaths.onboarding.settingsSections.rollNumber}`);
    await expect(
      NumberingRoute({ searchParams: Promise.resolve({ tab: 'division-changes' }) })
    ).rejects.toThrow(`redirect:${studentPaths.onboarding.settingsSections.grNumber}`);
  });

  it('keeps the settings Add permission gate for every tab and legacy route', () => {
    const { rerender } = render(
      <SettingsLayout>
        <div>Settings content</div>
      </SettingsLayout>
    );
    expect(screen.getByText('Access denied')).toBeInTheDocument();
    expect(screen.queryByText('Settings content')).not.toBeInTheDocument();
    state.auth.permissions = [{ name: studentPermissions.onboarding.setup, isGranted: true }];
    rerender(
      <SettingsLayout>
        <div>Settings content</div>
      </SettingsLayout>
    );
    expect(screen.getByText('Access denied')).toBeInTheDocument();
    state.auth.permissions = [{ name: studentPermissions.onboarding.settings, isGranted: true }];
    rerender(
      <SettingsLayout>
        <div>Settings content</div>
      </SettingsLayout>
    );
    expect(screen.getByText('Settings content')).toBeInTheDocument();
    state.auth.permissionsInitialized = false;
    rerender(
      <SettingsLayout>
        <div>Settings content</div>
      </SettingsLayout>
    );
    expect(screen.getByText('Checking permissions')).toBeInTheDocument();
  });
});
