import type { LibraryPolicyVersion } from 'src/redux/library/policy-types';

import React from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { PolicyDraftDrawer } from './PolicyDraftDrawer';

vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));

const item: LibraryPolicyVersion = {
  id: 'version-id',
  policyId: 'family-id',
  name: 'School lending',
  version: 1,
  status: 0,
  role: 0,
  effectiveFrom: '2026-11-16',
  priority: 0,
  concurrencyStamp: 'stamp',
  terms: {
    maxBooksAtTime: 2,
    reservationLimit: 1,
    loanDays: 14,
    dayCountingMode: 0,
    maxRenewals: 0,
    renewalDays: 0,
    pickupWindowDays: 2,
    moveDueDateToNextOpenDay: true,
  },
};
function setup(policy?: LibraryPolicyVersion) {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  render(
    <Provider store={store}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <PolicyDraftDrawer
          item={policy}
          academicYearId="year-id"
          onClose={vi.fn()}
          options={{
            canManageGlobalPolicies: true,
            bookCategories: [],
            sections: [],
            stages: [],
            standards: [],
          }}
        />
      </LocalizationProvider>
    </Provider>
  );
}

it.each([
  { role: 0, status: 0 },
  { role: 1, status: 0 },
  { role: 0, status: 1 },
  { role: 1, status: 1 },
] as const)(
  'keeps the existing family role immutable (role $role, status $status)',
  ({ role, status }) => {
    setup({ ...item, role, status });
    expect(screen.getByRole('combobox', { name: /Member role/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('combobox', { name: /Member role/ })).toHaveTextContent(
      role === 0 ? 'Student' : 'Staff'
    );
  }
);
it('allows either Student or Staff when creating a new family', () => {
  setup();
  const role = screen.getByRole('combobox', { name: /Member role/ });
  expect(role).not.toHaveAttribute('aria-disabled', 'true');
  fireEvent.mouseDown(role);
  expect(screen.getByRole('option', { name: 'Student' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('option', { name: 'Staff' }));
  expect(role).toHaveTextContent('Staff');
});
