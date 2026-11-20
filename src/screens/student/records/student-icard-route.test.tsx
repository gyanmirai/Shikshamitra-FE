import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ICardPage from 'src/app/(auth-route)/student/student-i-card/page';
import CertificatesPage from 'src/app/(auth-route)/student/certificates/page';
import LegacyDocumentsPage from 'src/app/(auth-route)/student/records/documents/page';

const navigation = vi.hoisted(() => ({ query: '' }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(navigation.query),
}));
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
});

it('mounts the documented saved-design catalogue at the main Student I-card route', () => {
  render(<ICardPage />);
  expect(screen.getByRole('heading', { name: 'Saved I-card designs' })).toBeVisible();
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
