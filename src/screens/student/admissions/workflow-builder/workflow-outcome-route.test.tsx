import { it, vi, expect } from 'vitest';
import { screen } from '@testing-library/react';

import { renderRetiredRoute } from './stage-retirement-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

// Retired stage presets must not remain an alternate entry point into removed functionality.
it('removes Offer outcome presets and blocks configuring a retired-stage route', () => {
  const { onSave } = renderRetiredRoute(8, 'Offer');
  expect(
    screen.queryByRole('combobox', { name: 'Continue when offer is' })
  ).not.toBeInTheDocument();
  expect(
    screen.getByText('Replace retired stage types before configuring their next steps.')
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save path' })).toBeDisabled();
  expect(onSave).not.toHaveBeenCalled();
});
