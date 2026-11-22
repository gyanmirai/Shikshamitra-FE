import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ICardPage from 'src/app/(auth-route)/student/student-i-card/page';
import CertificatesPage from 'src/app/(auth-route)/student/certificates/page';
import SettingsPage from 'src/app/(auth-route)/student/records/settings/page';
import SettingsLayout from 'src/app/(auth-route)/student/records/settings/layout';
import LegacyDocumentsPage from 'src/app/(auth-route)/student/records/documents/page';
import PolicyPage from 'src/app/(auth-route)/student/records/settings/documents/page';
import TemplatesPage from 'src/app/(auth-route)/student/records/settings/i-card-templates/page';

const navigation = vi.hoisted(() => ({
  query: '',
  auth: {
    permissions: [] as { name: string; isGranted: boolean }[],
    loading: false,
    permissionsInitialized: true,
  },
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: any) => selector({ auth: navigation.auth }),
}));
vi.mock('src/sections/error', () => ({ View403: () => <h1>Access denied</h1> }));
vi.mock('src/components/loading-screen', () => ({ SplashScreen: () => null }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(navigation.query),
}));
vi.mock('./records-settings', () => ({ default: () => <h1>Records policy settings</h1> }));
vi.mock('./student-icard-assignment', () => ({ default: () => <h1>I-Card Assignment</h1> }));
vi.mock('./student-icard-templates', () => ({ default: () => <h1>Saved I-card designs</h1> }));
vi.mock('./student-record-documents', () => ({
  default: ({ fixedKind }: { fixedKind?: string }) => (
    <h1>
      {fixedKind === 'ids'
        ? 'Issued I-cards'
        : fixedKind === 'certificates'
          ? 'Certificate workspace'
          : 'Retained document history'}
    </h1>
  ),
}));

beforeEach(() => {
  navigation.query = '';
  navigation.auth.permissions = [];
});

it('opens I-Card Assignment at the existing Student I-Card route', () => {
  render(<ICardPage />);
  expect(screen.getByRole('heading', { name: 'I-Card Assignment' })).toBeVisible();
  expect(
    screen.queryByRole('heading', { name: 'Retained document history' })
  ).not.toBeInTheDocument();
});

it('opens dedicated issued-card history on the I-card route and preserves it on reload', () => {
  navigation.query = 'view=issued&student=student-1';
  const view = render(<ICardPage />);
  expect(screen.getByRole('heading', { name: 'Issued I-cards' })).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Saved I-card designs' })).not.toBeInTheDocument();
  view.unmount();
  render(<ICardPage />);
  expect(screen.getByRole('heading', { name: 'Issued I-cards' })).toBeVisible();
});

it('keeps Certificates on its existing dedicated workspace', () => {
  navigation.query = 'view=issued';
  render(<CertificatesPage />);
  expect(screen.getByRole('heading', { name: 'Certificate workspace' })).toBeVisible();
});

it('keeps the legacy generic document history route on its existing owner', () => {
  render(<LegacyDocumentsPage />);
  expect(screen.getByRole('heading', { name: 'Retained document history' })).toBeVisible();
});

it.each([
  ['Students.Records.StudentICard.View', 'Saved I-card designs', TemplatesPage, PolicyPage],
  ['Students.Records.Settings.View', 'Records policy settings', PolicyPage, TemplatesPage],
] as const)(
  'gives %s access only to the appropriate settings routes',
  (permission, title, AllowedPage, DeniedPage) => {
    navigation.auth.permissions = [{ name: permission, isGranted: true }];
    const view = render(
      <SettingsLayout>
        <SettingsPage />
      </SettingsLayout>
    );
    expect(
      screen.getByRole('heading', {
        name: permission === 'Students.Records.Settings.View' ? title : 'Access denied',
      })
    ).toBeVisible();
    view.rerender(
      <SettingsLayout>
        <AllowedPage />
      </SettingsLayout>
    );
    expect(screen.getByRole('heading', { name: title })).toBeVisible();
    view.rerender(
      <SettingsLayout>
        <DeniedPage />
      </SettingsLayout>
    );
    expect(screen.getByRole('heading', { name: 'Access denied' })).toBeVisible();
  }
);
