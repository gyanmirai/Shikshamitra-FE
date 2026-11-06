import { useState } from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { IdentityCardPreview } from './preview';
import { IdentityCardDesigner } from './designer';
import { createIdentityCardPreset } from './presets';
import { DEFAULT_IDENTITY_CARD_PRINT_SETTINGS } from './geometry';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

vi.mock('src/components/custom-tabs', async () => {
  const { default: Tabs } = await import('@mui/material/Tabs');
  return {
    CustomTabs: ({ guardUnsavedChanges, ...props }: Record<string, unknown>) => <Tabs {...props} />,
  };
});

function Fixture({ branding = false }: { branding?: boolean }) {
  const [layout, setLayout] = useState(createIdentityCardPreset('classic-identity'));
  const [print, setPrint] = useState(DEFAULT_IDENTITY_CARD_PRINT_SETTINGS);
  const [school, setSchool] = useState('School');
  return (
    <IdentityCardDesigner
      layout={layout}
      onLayoutChange={setLayout}
      printSettings={print}
      onPrintSettingsChange={setPrint}
      fields={['StudentName', 'GRNumber', 'Class', 'Division', 'AcademicYear', 'CardNumber'].map(
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
    fireEvent.click(screen.getByRole('tab', { name: 'Print' }));
    expect(
      within(screen.getByRole('region', { name: 'Card configuration' })).getByRole('spinbutton', {
        name: 'Margin (mm)',
      })
    ).toBeInTheDocument();
    expect(preview).toContainElement(
      screen.getByRole('img', { name: 'Front identity card preview' })
    );
    fireEvent.click(screen.getByRole('tab', { name: 'School' }));
    expect(screen.getByRole('textbox', { name: 'School name' })).toHaveValue('Greenwood School');
  });

  it('uses compact layer selection and opens selected-field controls when the card is clicked', () => {
    render(<Fixture />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit Name' }));
    expect(screen.getByRole('combobox', { name: 'Selected element' })).toHaveTextContent('Name');
    expect(screen.getByRole('textbox', { name: 'Element label' })).toHaveValue('Name');
    expect(screen.queryByRole('button', { name: 'Select Name' })).not.toBeInTheDocument();
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
    fireEvent.change(screen.getByRole('textbox', { name: 'Static text' }), {
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
