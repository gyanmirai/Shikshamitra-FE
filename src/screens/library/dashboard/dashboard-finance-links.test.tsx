import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import AdminQuickActions from './admin/admin-quick-actions';
import { reservationWrapper } from '../BookList/Components/BookView/reservation-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('does not offer a Charges drilldown to a dashboard-only reader', () => {
  render(<AdminQuickActions />, reservationWrapper(['Library.Dashboard.View']));
  expect(screen.queryByRole('link', { name: /Manage (?:fines|charges)/i })).toBeNull();
});

it('keeps the actual Charges destination available with only its own View', () => {
  render(
    <AdminQuickActions />,
    reservationWrapper(['Library.Dashboard.View', 'Library.Charges.View'])
  );
  expect(screen.getByRole('link', { name: /Manage (?:fines|charges)/i })).toHaveAttribute(
    'href',
    '/library/charges-management'
  );
});
