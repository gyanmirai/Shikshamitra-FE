import type { StructureSettings } from 'src/redux/finance/feeStructureWorkspace';

import { Provider } from 'react-redux';
import React, { useState } from 'react';
import { it, vi, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { structureCandidate } from '../feeStructureModel';
import FeeStructurePoliciesStep from './FeeStructurePoliciesStep';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));

it.each(['collection', 'refund'] as const)(
  'identifies the attached %s version, blocks re-selection and updates the selected row after changing',
  async (family) => {
    const onChange = vi.fn();
    const policies = [1, 2].map((version) => ({
      id: `school-policy-${version}`,
      family,
      versionId: `version-${version}`,
      name: 'School policy',
      versionNumber: version,
      isCurrent: version === 2,
    }));
    const settings = {
      heads: [],
      terms: [],
      policies,
      permissions: { [family]: true, [`${family}Read`]: true },
    } as unknown as StructureSettings;
    function Harness() {
      const [candidate, setCandidate] = useState({
        ...structureCandidate(),
        [`${family}PolicyId`]: 'school-policy-1',
        [`${family}PolicyVersionId`]: 'version-1',
      });
      return (
        <FeeStructurePoliciesStep
          candidate={candidate}
          settings={settings}
          impacts={[
            {
              key: family,
              label: `${family} Policy`,
              description: 'Policy help',
              empty: '',
              policyLabel: 'School policy',
            },
          ]}
          catalogs={{
            collection: { items: [], loading: false, error: false, retry: vi.fn() },
            refund: { items: [], loading: false, error: false, retry: vi.fn() },
          }}
          writable
          locked={false}
          busy={false}
          onView={vi.fn()}
          onChange={(key, version) => {
            onChange(key, version);
            setCandidate((value) => ({ ...value, [`${key}PolicyVersionId`]: version }));
          }}
        />
      );
    }
    render(
      <Provider store={configureStore({ reducer: (value = { confirmPopup: {} }) => value })}>
        <ThemeProvider theme={createTheme(defaultSettings)}>
          <Harness />
        </ThemeProvider>
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: `Change ${family} Policy` }));
    const selected = await screen.findByRole('button', {
      name: 'Currently applied: School policy version 1',
    });
    expect(selected).toBeDisabled();
    expect(selected).toHaveTextContent('Selected');
    expect(selected.closest('tr')).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(selected);
    expect(onChange).not.toHaveBeenCalled();
    const other = screen.getByRole('button', { name: 'Select School policy version 2' });
    expect(other).toBeEnabled();
    expect(other.closest('tr')).toHaveAttribute('aria-selected', 'false');
    fireEvent.click(other);
    expect(onChange).toHaveBeenCalledExactlyOnceWith(family, 'version-2');
    fireEvent.click(screen.getByRole('button', { name: `Change ${family} Policy` }));
    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('button', { name: 'Currently applied: School policy version 2' })
    ).toBeDisabled();
    expect(
      within(dialog).getByRole('button', { name: 'Select School policy version 1' })
    ).toBeEnabled();
  }
);
