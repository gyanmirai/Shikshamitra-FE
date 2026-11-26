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
import { GlobalIcons } from 'src/utils/icons';
import FeeStructurePoliciesStep from './FeeStructurePoliciesStep';
import StructurePolicyPicker from './StructurePolicyPicker';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <svg aria-hidden="true" data-icon={icon} />,
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('./StructurePolicyPreview', () => ({
  default: ({ option }: { option: StructureSettings['policies'][number] }) => (
    <h3>Configuration for {option.versionId}</h3>
  ),
}));

it('shows policy-list loading state, keeps cached choices during refresh and then shows completed empty state', () => {
  const catalog = { items: [], loading: true, error: false, retry: vi.fn() };
  const choice = {
    id: 'collection',
    family: 'collection' as const,
    versionId: 'collection-v1',
    name: 'School collection',
    versionNumber: 1,
    isCurrent: true,
  };
  const subject = (policies: (typeof choice)[], loading: boolean) => (
    <Provider store={configureStore({ reducer: (value = { confirmPopup: {} }) => value })}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StructurePolicyPicker
          family={{ key: 'collection', label: 'Collection Policy', description: 'Policy help' }}
          candidate={structureCandidate()}
          settings={
            { policies, heads: [], terms: [], permissions: {} } as unknown as StructureSettings
          }
          catalog={{ ...catalog, loading }}
          canSelect
          busy={false}
          onChange={vi.fn()}
          onClose={vi.fn()}
        />
      </ThemeProvider>
    </Provider>
  );
  const view = render(subject([], true));
  expect(screen.getByRole('status', { name: 'Loading collection policy choices' })).toHaveAttribute(
    'aria-busy',
    'true'
  );
  expect(screen.queryByText(/No published collection policy/)).toBeNull();

  view.rerender(subject([choice], true));
  expect(screen.queryByRole('status', { name: 'Loading collection policy choices' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Preview School collection version 1' })).toBeVisible();
  expect(screen.getByText('Loading more policies…')).toBeVisible();

  view.rerender(subject([], false));
  expect(screen.queryByRole('status', { name: 'Loading collection policy choices' })).toBeNull();
  expect(
    screen.getByText('No published collection policy is available for this academic year.')
  ).toBeVisible();
});

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
    expect(
      await screen.findByRole('heading', { name: 'Configuration for version-2' })
    ).toBeVisible();
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
        impacts={[
          {
            key: 'proration',
            label: 'Proration Policy',
            description: '',
            empty: '',
            policyLabel: '',
          },
        ]}
        catalogs={{ collection: catalog, refund: catalog }}
        writable
        locked={false}
        busy={false}
        onChange={vi.fn()}
        onView={vi.fn()}
      />
    </ThemeProvider>
  );
  expect(
    screen.getByText('The running Finance API does not support fee structure proration yet.')
  ).toBeVisible();
  expect(
    screen.queryByText('You do not have permission to browse this policy family.')
  ).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Select Proration Policy' })).toBeDisabled();
});

it.each(['collection', 'refund'] as const)(
  'marks %s coverage as matched only when every structure head has a matching known row',
  (family) => {
    const candidate = {
      ...structureCandidate(),
      [`${family}PolicyId`]: 'policy',
      [`${family}PolicyVersionId`]: 'pin',
      feeHeads: [{ feeHeadId: 'tuition' }, { feeHeadId: 'transport' }],
    } as ReturnType<typeof structureCandidate>;
    const catalog = { items: [], loading: false, error: false, retry: vi.fn() };
    const match = family === 'collection' ? 'Late fee applies' : 'Policy eligible';
    const renderStep = (rows?: { id: string; name: string; treatment: string }[]) => (
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <FeeStructurePoliciesStep
          candidate={candidate}
          settings={
            {
              policies: [
                {
                  id: 'policy',
                  family,
                  versionId: 'pin',
                  name: 'School policy',
                  versionNumber: 9,
                  isDefault: true,
                },
              ],
              permissions: { [family]: true, [`${family}Read`]: true },
            } as unknown as StructureSettings
          }
          impacts={[
            {
              key: family,
              label: `${family} Policy`,
              description: '',
              empty: '',
              policyLabel: 'School policy · v9 · Default',
              rows,
            },
          ]}
          catalogs={{ collection: catalog, refund: catalog }}
          writable
          locked={false}
          busy={false}
          onChange={vi.fn()}
          onView={vi.fn()}
        />
      </ThemeProvider>
    );
    const rows = [
      { id: 'tuition', name: 'Tuition', treatment: match },
      { id: 'transport', name: 'Transport', treatment: match },
    ];
    const { container, rerender } = render(renderStep(rows));
    const matchedIcon = () => container.querySelector(`[data-icon="${GlobalIcons.approvedIcon}"]`);
    expect(matchedIcon()).not.toBeNull();
    expect(screen.getByRole('img', { name: 'Default policy' })).toBeVisible();
    expect(screen.queryByText(/Version 9|v9|· Default/)).toBeNull();
    rerender(
      renderStep([
        rows[0],
        { ...rows[1], treatment: family === 'collection' ? 'No late fee' : 'Excluded' },
      ])
    );
    expect(matchedIcon()).toBeNull();
    expect(screen.getByText(/1 of 2 fee heads/)).toBeVisible();
    rerender(renderStep([rows[0]]));
    expect(matchedIcon()).toBeNull();
    expect(screen.getByText('Coverage details unavailable')).toBeVisible();
    rerender(renderStep([{ ...rows[0], treatment: 'Unrecognized' }, rows[1]]));
    expect(matchedIcon()).toBeNull();
    expect(screen.getByText('Coverage details unavailable')).toBeVisible();
    rerender(renderStep(undefined));
    expect(matchedIcon()).toBeNull();
    expect(screen.getByText('Coverage details unavailable')).toBeVisible();
  }
);

it('requires a proration choice and keeps preview separate from selecting its pinned version', () => {
  const onChange = vi.fn();
  const catalog = { items: [], loading: false, error: false, retry: vi.fn() };
  render(
    <Provider store={configureStore({ reducer: (value = { confirmPopup: {} }) => value })}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <FeeStructurePoliciesStep
          candidate={structureCandidate()}
          settings={
            {
              heads: [],
              policies: [
                {
                  id: 'proration',
                  family: 'proration',
                  versionId: 'pin',
                  name: 'School proration',
                  versionNumber: 2,
                  isDefault: true,
                },
              ],
              permissions: { proration: true, prorationRead: true },
            } as unknown as StructureSettings
          }
          impacts={[
            {
              key: 'proration',
              label: 'Proration Policy',
              description: '',
              empty: '',
              policyLabel: '',
            },
          ]}
          catalogs={{ collection: catalog, refund: catalog, proration: catalog }}
          writable
          locked={false}
          busy={false}
          onChange={onChange}
          onView={vi.fn()}
        />
      </ThemeProvider>
    </Provider>
  );
  expect(screen.getByText('Required')).toBeVisible();
  expect(screen.queryByText('Optional')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Select Proration Policy' }));
  const picker = within(screen.getByRole('dialog'));
  expect(picker.queryByRole('button', { name: 'Use academic-year default' })).toBeNull();
  expect(picker.queryByText('Version 2')).toBeNull();
  expect(picker.getByRole('img', { name: 'Default policy' })).toBeVisible();
  fireEvent.click(picker.getByRole('button', { name: 'Preview School proration version 2' }));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(picker.getByRole('button', { name: 'Select School proration version 2' }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith('proration', 'pin');
});

it.each([
  { state: 'exact default', metadata: {}, showStar: true },
  { state: 'missing option', metadata: null, showStar: false },
  { state: 'wrong policy ID', metadata: { id: 'different-policy' }, showStar: false },
  { state: 'wrong version', metadata: { versionId: 'different-version' }, showStar: false },
  { state: 'wrong family', metadata: { family: 'refund' }, showStar: false },
  { state: 'explicit nondefault', metadata: { isDefault: false }, showStar: false },
  { state: 'unknown default status', metadata: { isDefault: undefined }, showStar: false },
])(
  'preserves the published policy name and verifies its default star: $state',
  ({ metadata, showStar }) => {
    const catalog = { items: [], loading: false, error: false, retry: vi.fn() };
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <FeeStructurePoliciesStep
          candidate={{
            ...structureCandidate(),
            collectionPolicyId: 'saved-policy',
            collectionPolicyVersionId: 'saved-pin',
          }}
          settings={
            {
              policies:
                metadata === null
                  ? []
                  : [
                      {
                        id: 'saved-policy',
                        family: 'collection',
                        versionId: 'saved-pin',
                        name: 'Current catalog name',
                        versionNumber: 7,
                        isCurrent: true,
                        isDefault: true,
                        ...metadata,
                      },
                    ],
              permissions: { collectionRead: true },
            } as unknown as StructureSettings
          }
          impacts={[
            {
              key: 'collection',
              label: 'Collection Policy',
              description: '',
              empty: '',
              policyLabel: 'Published policy name · v7 · Default',
            },
          ]}
          catalogs={{ collection: catalog, refund: catalog }}
          writable={false}
          locked
          busy={false}
          onChange={vi.fn()}
          onView={vi.fn()}
        />
      </ThemeProvider>
    );
    expect(screen.getByText('Published policy name')).toBeVisible();
    expect(screen.queryByText('Current catalog name')).toBeNull();
    expect(screen.queryByText(/v7|· Default/)).toBeNull();
    const star = screen.queryByRole('img', { name: 'Default policy' });
    if (showStar) expect(star).toBeVisible();
    else expect(star).toBeNull();
  }
);
