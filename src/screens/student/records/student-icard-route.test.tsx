import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ICardPage from 'src/app/(auth-route)/student/student-i-card/page';
import LegacyDocumentsPage from 'src/app/(auth-route)/student/records/documents/page';

vi.mock('./student-icard-templates', () => ({ default: () => <h1>Saved I-card designs</h1> }));
vi.mock('./student-record-documents', () => ({
  default: () => <h1>Retained document history</h1>,
}));

it('mounts the documented saved-design catalogue at the main Student I-card route', () => {
  render(<ICardPage />);
  expect(screen.getByRole('heading', { name: 'Saved I-card designs' })).toBeVisible();
  expect(
    screen.queryByRole('heading', { name: 'Retained document history' })
  ).not.toBeInTheDocument();
});

it('keeps the legacy generic document history route on its existing owner', () => {
  render(<LegacyDocumentsPage />);
  expect(screen.getByRole('heading', { name: 'Retained document history' })).toBeVisible();
});
