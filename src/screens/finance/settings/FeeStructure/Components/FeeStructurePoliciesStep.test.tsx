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
vi.mock('./StructurePolicyPreview', () => ({
  default: ({ option }: { option: StructureSettings['policies'][number] }) => (
    <h3>Configuration for {option.versionId}</h3>
  ),
}));

it.each(['collection', 'refund', 'proration'] as const)(
  'previews the attached %s version in the picker and applies a replacement directly',
  async (family) => {
    const onChange = vi.fn();
    const policies = [1, 2].map((version) => ({
      id: `school-policy-${version}`,
      family,
      versionId: `version-${version}`,
      name: version === 1 ? 'School policy' : 'Revised policy',
      versionNumber: version,
      isCurrent: version === 2,
      ...(family === 'refund' && { feeHeadScope: 'AllFeeHeads' }),
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
    const dialog = await screen.findByRole('dialog');
    const picker = within(dialog);
    expect(picker.getByRole('heading', { name: 'Configuration for version-1' })).toBeVisible();
    expect(picker.getByText('Selected')).toBeVisible();
    expect(picker.queryByRole('button', { name: 'Select School policy version 1' })).toBeNull();

    const search = picker.getByRole('textbox', { name: 'Search ' + family + ' policy choices' });
    fireEvent.change(search, { target: { value: 'Revised' } });
    expect(picker.getByRole('heading', { name: 'Configuration for version-2' })).toBeVisible();
    fireEvent.change(search, { target: { value: '' } });
    fireEvent.click(picker.getByRole('button', { name: 'Preview Revised policy version 2' }));
    expect(picker.getByRole('heading', { name: 'Configuration for version-2' })).toBeVisible();
    expect(picker.getByText('Selected')).toBeVisible();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(picker.getByRole('button', { name: 'Select Revised policy version 2' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(family, 'version-2');
    fireEvent.click(screen.getByRole('button', { name: 'Change ' + family + ' Policy' }));
    expect(await screen.findByRole('heading', { name: 'Configuration for version-2' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Select School policy version 1' })).toBeEnabled();
  }
);

it('lists the policy fee heads and rejects a refund policy without a matching fee head', () => {
  const onChange = vi.fn();
  const catalog = { items: [], loading: false, error: false, retry: vi.fn() };
  const policy = (id: string, feeHeadId: string, headName: string) => ({
    id,
    versionId: `${id}-v1`,
    name: id,
    family: 'refund' as const,
    versionNumber: 1,
    isCurrent: true,
    feeHeadScope: 'SelectedFeeHeads' as const,
    applicableFeeHeadIds: [feeHeadId],
    feeHeadNames: { [feeHeadId]: headName },
  });
  const candidate = structureCandidate();
  candidate.feeHeads = [{ feeHeadId: 'tuition' }] as typeof candidate.feeHeads;
  render(
    <Provider store={configureStore({ reducer: (value = { confirmPopup: {} }) => value })}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <FeeStructurePoliciesStep
          candidate={candidate}
          settings={
            {
              heads: [],
              terms: [],
              policies: [
                policy('Transport refund', 'transport', 'Transport Fee'),
                policy('Tuition refund', 'tuition', 'Tuition Fee'),
              ],
              permissions: { refund: true, refundRead: true },
            } as unknown as StructureSettings
          }
          impacts={[
            { key: 'refund', label: 'Refund Policy', description: '', empty: '', policyLabel: '' },
          ]}
          catalogs={{ collection: catalog, refund: catalog }}
          writable
          locked={false}
          busy={false}
          onView={vi.fn()}
          onChange={onChange}
        />
      </ThemeProvider>
    </Provider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Select Refund Policy' }));
  expect(screen.getByText('Transport Fee')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Select Transport refund version 1' })).toBeDisabled();
  expect(screen.getByText('No matching fee heads')).toBeVisible();
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Select Tuition refund version 1' }));
  expect(onChange).toHaveBeenCalledWith('refund', 'Tuition refund-v1');
});

it('reports an older fee structure API separately from a permission denial', () => {
  const catalog = { items: [], loading: false, error: false, retry: vi.fn() };
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <FeeStructurePoliciesStep
        candidate={structureCandidate()}
        settings={{ policies: [], permissions: {} } as unknown as StructureSettings}
        impacts={[{ key: 'proration', label: 'Proration Policy', description: '', empty: '', policyLabel: '' }]}
        catalogs={{ collection: catalog, refund: catalog }}
        writable
        locked={false}
        busy={false}
        onChange={vi.fn()}
        onView={vi.fn()}
      />
    </ThemeProvider>
  );
  expect(screen.getByText('The running Finance API does not support fee structure proration yet.')).toBeVisible();
  expect(screen.queryByText('You do not have permission to browse this policy family.')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Select Proration Policy' })).toBeDisabled();
});
