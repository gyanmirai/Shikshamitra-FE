import { useState } from 'react';
import { Provider } from 'react-redux';
import { it, vi, expect, describe } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { act, render, screen, within, fireEvent } from '@testing-library/react';

import { IdentityCardPreview } from './preview';
import { IdentityCardDesigner } from './designer';
import { createIdentityCardPreset } from './presets';
import { DEFAULT_IDENTITY_CARD_PRINT_SETTINGS } from './geometry';

import type { IdentityCardPhotoRecord } from './types';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

vi.mock('src/components/custom-tabs', async () => {
  const { default: Tabs } = await import('@mui/material/Tabs');
  return {
    CustomTabs: ({ guardUnsavedChanges, ...props }: Record<string, unknown>) => <Tabs {...props} />,
  };
});

function Fixture({
  branding = false,
  photoRecords,
  studentBindings = false,
  borderStylesEnabled = false,
}: {
  branding?: boolean;
  photoRecords?: IdentityCardPhotoRecord[];
  studentBindings?: boolean;
  borderStylesEnabled?: boolean;
}) {
  const [layout, setLayout] = useState(createIdentityCardPreset('classic-identity'));
  const [print, setPrint] = useState(DEFAULT_IDENTITY_CARD_PRINT_SETTINGS);
  const [school, setSchool] = useState('School');
  return (
    <IdentityCardDesigner
      borderStylesEnabled={borderStylesEnabled}
      photoRecords={photoRecords}
      onPhotoEdit={vi.fn()}
      layout={layout}
      onLayoutChange={setLayout}
      printSettings={print}
      onPrintSettingsChange={setPrint}
      fieldPickerLabel={studentBindings ? 'Select Student Field' : undefined}
      fieldTokens={studentBindings ? { StudentName: 'Student Name', GRNumber: 'GR Number' } : undefined}
      fields={studentBindings ? [
        { key: 'StudentName', label: 'Student Name', group: 'Student Info' },
        { key: 'GRNumber', label: 'GR Number', group: 'Student Info' },
        { key: 'Class', label: 'Class', group: 'Student Info' },
        { key: 'Division', label: 'Division', group: 'Student Info' },
        { key: 'AcademicYear', label: 'Academic Year', group: 'Contact/School' },
      ] : ['StudentName', 'GRNumber', 'Class', 'Division', 'AcademicYear', 'CardNumber'].map(
        (key) => ({ key, label: key })
      )}
      backSideEnabled
      onBackSideEnabledChange={vi.fn()}
      qrCodeEnabled
      onQrCodeEnabledChange={vi.fn()}
      values={{ StudentName: 'Aarav Shah' }}
      brandingContent={
        branding ? (
          <input
            aria-label="School name"
            value={school}
            onChange={(event) => setSchool(event.target.value)}
          />
        ) : undefined
      }
    />
  );
}

describe('identity card designer', () => {
  it('changes the stroke style of a student divider from Position & Style', () => {
    const { container } = render(<Fixture borderStylesEnabled />);
    fireEvent.click(screen.getByRole('button', { name: 'Add line' }));
    const configuration = screen.getByRole('tabpanel', { name: 'Elements' });
    const choice = within(configuration).getByRole('combobox', { name: 'Border style' });
    expect(choice).toHaveTextContent('Solid');
    fireEvent.mouseDown(choice);
    fireEvent.click(screen.getByRole('option', { name: 'Dashed' }));
    expect(choice).toHaveTextContent('Dashed');
    fireEvent.change(within(configuration).getByLabelText('Border colour'), {
      target: { value: '#234567' },
    });
    fireEvent.change(within(configuration).getByRole('spinbutton', { name: 'Border width (canvas)' }), {
      target: { value: '2' },
    });
    const line = container.querySelector('svg[role="img"] line');
    expect(line).toHaveAttribute('stroke', '#234567');
    expect(line).toHaveAttribute('stroke-width', '2');
    expect(line).toHaveAttribute('stroke-dasharray', '8 4');
  });

  it('dismisses a source photo error without changing the design', async () => {
    const store = configureStore({ reducer: { confirmPopup: () => ({ isChanges: false }) } });
    render(
      <Provider store={store}>
        <Fixture
          photoRecords={[
            {
              id: 'person',
              name: 'Recipient',
              values: {},
              load: async () => {
                throw new Error('Unavailable');
              },
            },
          ]}
        />
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cardholder photo tools' }));
    const photoTools = screen.getByRole('dialog', { name: 'Cardholder Photo' });
    await act(async () => {
      fireEvent.click(within(photoTools).getByRole('button', { name: 'Edit photo' }));
    });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('The original photo could not be loaded.');
    fireEvent.click(within(alert).getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
  });
  it('keeps branding and configuration in a separate region from the persistent card preview', () => {
    render(<Fixture branding />);
    const configuration = screen.getByRole('region', { name: 'Card configuration' });
    const preview = screen.getByRole('region', { name: 'Card preview' });
    expect(preview).toContainElement(
      screen.getByRole('img', { name: 'Front identity card preview' })
    );
    expect(configuration).not.toContainElement(preview);
    fireEvent.change(within(configuration).getByRole('textbox', { name: 'School name' }), {
      target: { value: 'Greenwood School' },
    });
    fireEvent.click(screen.getByRole('tab', { name: 'Elements' }));
    expect(
      within(screen.getByRole('tabpanel', { name: 'Elements' })).getByText(
        /Select an element on the card or in the layer list/
      )
    ).toBeVisible();
    fireEvent.click(screen.getByRole('tab', { name: 'Print' }));
    expect(
      within(screen.getByRole('region', { name: 'Card configuration' })).getByRole('spinbutton', {
        name: 'Margin (mm)',
      })
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('tabpanel', { name: 'Print' })).getByText(/Print at actual size/)
    ).toBeVisible();
    expect(preview).toContainElement(
      screen.getByRole('img', { name: 'Front identity card preview' })
    );
    fireEvent.click(screen.getByRole('tab', { name: 'School' }));
    expect(screen.getByRole('textbox', { name: 'School name' })).toHaveValue('Greenwood School');
  });

  it('collapses either panel independently and keeps the fitted preview mounted', () => {
    render(<Fixture />);
    const preview = screen.getByRole('region', { name: 'Card preview' });
    const toolbar = within(screen.getByRole('toolbar', { name: 'Card editing tools' }));
    const layers = toolbar.getByRole('button', { name: 'Layers' });
    const configuration = toolbar.getByRole('button', { name: 'Configuration' });

    expect(layers).toHaveAttribute('aria-expanded', 'false');
    expect(configuration).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(layers);
    expect(layers).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: 'Card layers' })).toBeVisible();

    fireEvent.click(configuration);
    expect(configuration).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region', { name: 'Card configuration' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Card layers' })).toBeVisible();
    fireEvent.click(layers);
    expect(screen.queryByRole('region', { name: 'Card layers' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Card preview' })).toBe(preview);

    fireEvent.click(configuration);
    expect(screen.getByRole('region', { name: 'Card configuration' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Card preview' })).toBe(preview);
  });

  it('uses compact layer selection and opens selected-field controls when the card is clicked', () => {
    render(<Fixture />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit Name' }));
    expect(screen.getByRole('combobox', { name: 'Selected element' })).toHaveTextContent('Name');
    expect(screen.getByRole('textbox', { name: 'Element label' })).toHaveValue('Name');
    expect(screen.queryByRole('button', { name: 'Select Name' })).not.toBeInTheDocument();
  });
  it('changes static text to a searchable student binding and updates its canvas token', () => {
    render(<Fixture studentBindings />);
    fireEvent.click(screen.getByRole('button', { name: 'Add text' }));
    const configuration = within(screen.getByRole('region', { name: 'Card configuration' }));
    const preview = within(screen.getByRole('region', { name: 'Card preview' }));
    expect(configuration.getByRole('button', { name: 'Static Text' })).toHaveAttribute('aria-pressed', 'true');
    expect(configuration.getByRole('button', { name: 'Expand Position & Style' })).toHaveAttribute('aria-expanded', 'false');
    fireEvent.change(configuration.getByRole('textbox', { name: 'Text Value' }), {
      target: { value: 'Student Identity Card Draft' },
    });
    expect(preview.getByText('Student Identity Card Draft')).toBeInTheDocument();
    fireEvent.click(configuration.getByRole('button', { name: 'Dynamic Field' }));
    expect(preview.queryByText('Student Identity Card Draft')).not.toBeInTheDocument();
    expect(preview.getAllByText('[Student Name]')).toHaveLength(2);
    fireEvent.mouseDown(configuration.getByRole('combobox', { name: 'Select Student Field' }));
    expect(screen.getByText('Student Info')).toBeInTheDocument();
    expect(screen.getByText('Contact/School')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search Select Student Field' }), {
      target: { value: 'GR' },
    });
    expect(screen.queryByRole('option', { name: 'Academic Year' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'GR Number' }));
    fireEvent.change(configuration.getByRole('textbox', { name: 'Custom Text / Prefix' }), {
      target: { value: 'Custom GR: ' },
    });
    expect(preview.getByText('Custom GR: [GR Number]')).toBeInTheDocument();
    fireEvent.click(configuration.getByRole('button', { name: 'Static Text' }));
    expect(configuration.getByRole('textbox', { name: 'Text Value' })).toHaveValue('Student Identity Card Draft');
    expect(preview.getByText('Student Identity Card Draft')).toBeInTheDocument();
  });
  it('marks physical dimensions required and shows a local error after invalid editing', () => {
    render(<Fixture />);
    const width = screen.getByRole('spinbutton', { name: 'Width (mm)' });
    expect(width).toBeRequired();
    fireEvent.change(width, { target: { value: '20' } });
    fireEvent.blur(width);
    expect(width).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter a value of at least 30.')).toBeInTheDocument();
  });
  it('moves a selected element by keyboard and respects its lock', () => {
    render(<Fixture />);
    const name = screen.getByRole('button', { name: 'Edit Name' });
    fireEvent.click(name);
    fireEvent.keyDown(name, { key: 'ArrowRight' });
    expect(screen.getByRole('spinbutton', { name: 'X position (canvas)' })).toHaveValue(121);
    fireEvent.click(screen.getByRole('switch', { name: 'Locked' }));
    fireEvent.keyDown(name, { key: 'ArrowRight' });
    expect(screen.getByRole('spinbutton', { name: 'X position (canvas)' })).toHaveValue(121);
    expect(screen.getByRole('spinbutton', { name: 'X position (canvas)' })).toBeDisabled();
  });
  it.each(['Delete', 'Backspace'])(
    'deletes a canvas selection with %s after a pointer gesture and undoes it',
    (key) => {
      render(<Fixture />);
      const logo = screen.getByRole('button', { name: 'Edit logo' });
      const overlay = logo.closest('svg')!;
      overlay.setPointerCapture = vi.fn();
      act(() => screen.getByRole('spinbutton', { name: 'Width (mm)' }).focus());

      fireEvent.pointerDown(logo, { button: 0, pointerId: 1, clientX: 30, clientY: 30 });
      fireEvent.pointerUp(overlay, { pointerId: 1 });
      const preview = screen.getByRole('region', { name: 'Card preview' });
      expect(preview).toHaveFocus();
      expect(fireEvent.keyDown(document.activeElement!, { key })).toBe(false);
      expect(screen.queryByRole('button', { name: 'Edit logo' })).not.toBeInTheDocument();

      fireEvent.keyDown(document.activeElement!, { key: 'z', ctrlKey: true });
      expect(screen.getByRole('button', { name: 'Edit logo' })).toBeInTheDocument();
    }
  );

  it('leaves Delete and Backspace available in property fields and preserves locked layers', () => {
    render(<Fixture />);
    const logo = screen.getByRole('button', { name: 'Edit logo' });
    fireEvent.click(logo);
    const label = screen.getByRole('textbox', { name: 'Element label' });
    act(() => label.focus());
    expect(fireEvent.keyDown(label, { key: 'Delete' })).toBe(true);
    expect(fireEvent.keyDown(label, { key: 'Backspace' })).toBe(true);
    expect(logo).toBeInTheDocument();

    fireEvent.click(screen.getByRole('switch', { name: 'Locked' }));
    const preview = screen.getByRole('region', { name: 'Card preview' });
    act(() => preview.focus());
    expect(fireEvent.keyDown(preview, { key: 'Delete' })).toBe(true);
    expect(fireEvent.keyDown(preview, { key: 'Backspace' })).toBe(true);
    expect(logo).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Locked' })).toBeChecked();
  });
  it('suppresses an intentionally hidden logo while preserving saved elements', () => {
    const layout = createIdentityCardPreset('staff-professional');
    render(<IdentityCardPreview layout={layout} logoHidden />);
    expect(screen.queryByText('Logo')).not.toBeInTheDocument();
    expect(layout.front.elements.some((element) => element.type === 'logo')).toBe(true);
  });
  it('changes physical size while retaining the independent canvas and switches to back editing', () => {
    render(<Fixture />);
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Width (mm)' }), {
      target: { value: '90' },
    });
    expect(screen.getByText(/90.*53.98 mm/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Back' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Elements' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Selected element' }));
    expect(screen.getByRole('option', { name: 'Return instructions' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'Signature label' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Text Value' }), {
      target: { value: 'Return to reception.' },
    });
    expect(screen.getByDisplayValue('Return to reception.')).toBeInTheDocument();
  });
  it('never fabricates a person or credential when preview data is absent', () => {
    render(<IdentityCardPreview layout={createIdentityCardPreset('staff-professional')} />);
    expect(screen.getByText('Photo unavailable')).toBeInTheDocument();
    expect(screen.getByText('Sample QR')).toBeInTheDocument();
    expect(screen.queryByText('Meera Shah')).not.toBeInTheDocument();
  });
});
