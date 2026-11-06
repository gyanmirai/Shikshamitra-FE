import { it, vi, expect } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { PresetSelect } from './preset-select';
import { IdentityCardPreview } from './preview';
import { LayoutSettings } from './layout-settings';
import { createIdentityCardPreset } from './presets';
import { ElementInspector } from './element-inspector';
import { DEFAULT_IDENTITY_CARD_PRINT_SETTINGS } from './geometry';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

it('retains a custom layout choice without replacing it or offering an incompatible preset', () => {
  const onLayoutChange = vi.fn();
  const layout = { ...createIdentityCardPreset('classic-identity'), presetKey: 'legacy-custom' };
  render(
    <PresetSelect
      layout={layout}
      fields={[{ key: 'StudentName', label: 'Student name' }]}
      onLayoutChange={onLayoutChange}
    />
  );
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Preset' }));
  expect(screen.getByRole('option', { name: 'Custom layout' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  expect(screen.queryByRole('option', { name: 'Staff Professional' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('option', { name: 'Custom layout' }));
  expect(onLayoutChange).not.toHaveBeenCalled();
});

it.each([
  {
    keys: ['StudentName'],
    preset: 'classic-identity',
    allowed: 'Classic Identity',
    forbidden: 'Staff Professional',
  },
  {
    keys: ['name', 'employeeCode'],
    preset: 'staff-professional',
    allowed: 'Staff Professional',
    forbidden: 'Classic Identity',
  },
] as const)(
  'only offers catalogue-compatible presets for $preset',
  ({ keys, preset, allowed, forbidden }) => {
    render(
      <LayoutSettings
        layout={createIdentityCardPreset(preset)}
        onLayoutChange={vi.fn()}
        printSettings={DEFAULT_IDENTITY_CARD_PRINT_SETTINGS}
        onPrintSettingsChange={vi.fn()}
        fields={keys.map((key) => ({ key, label: key }))}
        guides={false}
        onGuidesChange={vi.fn()}
        backSideEnabled
        onBackSideEnabledChange={vi.fn()}
        qrCodeEnabled
        onQrCodeEnabledChange={vi.fn()}
      />
    );
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Preset' }));
    expect(screen.getByRole('option', { name: allowed })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: forbidden })).not.toBeInTheDocument();
  }
);

it.each(['headerText', 'footerText'])(
  'shows branding guidance instead of a competing static editor for %s',
  (fieldKey) => {
    const element = {
      ...createIdentityCardPreset('classic-identity').front.elements[1],
      type: 'text' as const,
      fieldKey,
    };
    render(
      <ElementInspector
        element={element}
        fields={[{ key: fieldKey, label: fieldKey }]}
        onChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.queryByRole('textbox', { name: 'Static text' })).not.toBeInTheDocument();
    expect(
      screen.getByText('This value comes from the card branding settings.')
    ).toBeInTheDocument();
  }
);

it('binds the student return instructions to branding and keeps staff instructions static', () => {
  const student = createIdentityCardPreset('classic-identity');
  expect(
    student.back?.elements.find((element) => element.id === 'return-instructions')?.fieldKey
  ).toBe('footerText');
  render(
    <IdentityCardPreview
      layout={student}
      side="back"
      values={{ footerText: 'Please return to reception.' }}
    />
  );
  expect(screen.getByText('Please return to reception.')).toBeInTheDocument();
  cleanup();
  expect(
    createIdentityCardPreset('staff-professional').back?.elements.find(
      (element) => element.id === 'return-instructions'
    )?.fieldKey
  ).toBe('static');
});
