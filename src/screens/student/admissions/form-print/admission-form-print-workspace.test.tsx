import type { ReactNode } from 'react';

import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { AdmissionFormPrintWorkspace } from './admission-form-print-workspace';

import type { AdmissionPrintDefinition } from './form-print-model';

const mocks = vi.hoisted(() => ({
  preview: vi.fn(),
  branding: vi.fn(),
  options: vi.fn(),
  print: vi.fn(),
  download: vi.fn(),
  retryBranding: vi.fn(),
  retryOptions: vi.fn(),
  retryPreview: vi.fn(),
}));
vi.mock('./use-admission-print-preview', () => ({
  useAdmissionPrintPreview: mocks.preview,
  printAdmissionForm: mocks.print,
  downloadAdmissionForm: mocks.download,
}));
vi.mock('./use-school-print-branding', () => ({ useSchoolPrintBranding: mocks.branding }));
vi.mock('./use-admission-print-options', () => ({ useAdmissionPrintOptions: mocks.options }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/components/preview-document/pdf-preview', () => ({
  default: ({ url }: { url: string }) => <div data-testid="pdf-preview">{url}</div>,
}));
vi.mock('./admission-print-settings', () => ({
  AdmissionPrintSettingsPanel: () => <div>Print settings</div>,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({
    label,
    value,
    options,
    onChange,
  }: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }) => (
    <label htmlFor={label}>
      {label}
      <select
        id={label}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  ),
}));

const form: AdmissionPrintDefinition = {
  name: 'Registration',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'gu'],
  sections: ['Student', 'Family'].map((name, index) => ({
    id: `section-${index}`,
    code: `SECTION_${index}`,
    name,
    displayOrder: index,
    stepId: `step-${index}`,
    stepName: name,
    fields: [
      {
        id: `field-${index}`,
        sectionId: `section-${index}`,
        code: `FIELD_${index}`,
        label: `${name} name`,
        fieldType: 0,
        bindingType: 1,
        readOnly: false,
        required: true,
        displayOrder: 0,
        translations: { gu: { label: `${name} Gujarati` } },
      },
    ],
  })),
};

describe('Registration print workspace controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.branding.mockReturnValue({
      branding: {},
      loading: false,
      error: false,
      retry: mocks.retryBranding,
    });
    mocks.options.mockReturnValue({
      labels: {},
      loading: false,
      error: false,
      retry: mocks.retryOptions,
    });
    mocks.preview.mockReturnValue({
      url: 'blob:current',
      loading: false,
      error: false,
      retry: mocks.retryPreview,
    });
  });

  it('starts blank, passes saved details only to filled mode, and never saves while printing', () => {
    const onSettingsChange = vi.fn();
    render(
      <AdmissionFormPrintWorkspace
        form={form}
        values={[{ fieldCode: 'FIELD_0', valueJson: '"Saved student"' }]}
        onSettingsChange={onSettingsChange}
        academicYearId="year-1"
        registrationNumber="APP-024"
      />
    );
    let model = mocks.preview.mock.lastCall![0];
    expect(model.mode).toBe('blank');
    expect(model.registrationNumber).toBe('');
    expect(model.steps[0].sections[0].entries[0].fields[0].value).toBe('');
    expect(mocks.options).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.anything(),
      false,
      'year-1',
      ['FIELD_0', 'FIELD_1']
    );
    fireEvent.click(screen.getByRole('button', { name: 'With details' }));
    model = mocks.preview.mock.lastCall![0];
    expect(model.mode).toBe('filled');
    expect(model.registrationNumber).toBe('APP-024');
    expect(model.steps[0].sections[0].entries[0].fields[0].value).toBe('Saved student');
    expect(mocks.options).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.anything(),
      true,
      'year-1',
      ['FIELD_0', 'FIELD_1']
    );
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
    expect(mocks.print).toHaveBeenCalledWith('blob:current');
    expect(mocks.download).toHaveBeenCalledWith('blob:current', 'Registration-filled');
    expect(onSettingsChange).not.toHaveBeenCalled();
  });

  it('generates the selected language and current step while preserving the full-form default', () => {
    render(<AdmissionFormPrintWorkspace form={form} currentStepId="step-1" />);
    expect(mocks.preview.mock.lastCall![0].steps).toHaveLength(2);
    expect(screen.getByRole('option', { name: 'Current step: Family' })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Print scope' }), {
      target: { value: 'step-1' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Form language' }), {
      target: { value: 'gu' },
    });
    const model = mocks.preview.mock.lastCall![0];
    expect(model.language).toBe('gu');
    expect(model.steps).toHaveLength(1);
    expect(model.steps[0].key).toBe('step-1');
    expect(model.steps[0].sections[0].entries[0].fields[0].label).toBe('Family Gujarati');
    fireEvent.change(screen.getByRole('combobox', { name: 'Print scope' }), {
      target: { value: 'all' },
    });
    expect(mocks.preview.mock.lastCall![0].steps).toHaveLength(2);
  });

  it.each(['branding', 'options', 'generation'])(
    'hides stale PDF and locks both outputs while %s is loading',
    (phase) => {
      if (phase === 'branding')
        mocks.branding.mockReturnValue({ branding: {}, loading: true, error: false });
      if (phase === 'options')
        mocks.options.mockReturnValue({ labels: {}, loading: true, error: false });
      if (phase === 'generation')
        mocks.preview.mockReturnValue({ url: 'blob:old', loading: true, error: false });
      render(<AdmissionFormPrintWorkspace form={form} />);
      expect(screen.getByRole('status')).toHaveTextContent('Preparing printable form');
      expect(screen.queryByTestId('pdf-preview')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Print' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Download PDF' })).toBeDisabled();
      if (phase !== 'generation') expect(mocks.preview.mock.lastCall![2]).toBe(false);
    }
  );

  it.each(['branding', 'options', 'generation'])(
    'keeps %s failure visible and retries the failed boundary',
    (phase) => {
      if (phase === 'branding')
        mocks.branding.mockReturnValue({
          branding: {},
          loading: false,
          error: true,
          retry: mocks.retryBranding,
        });
      if (phase === 'options')
        mocks.options.mockReturnValue({
          labels: {},
          loading: false,
          error: true,
          retry: mocks.retryOptions,
        });
      if (phase === 'generation')
        mocks.preview.mockReturnValue({
          url: 'blob:old',
          loading: false,
          error: true,
          retry: mocks.retryPreview,
        });
      render(<AdmissionFormPrintWorkspace form={form} />);
      expect(screen.getByRole('alert')).toHaveTextContent('Your form has not changed');
      expect(screen.queryByTestId('pdf-preview')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Print' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Download PDF' })).toBeDisabled();
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
      expect(mocks.retryBranding).toHaveBeenCalledTimes(phase === 'branding' ? 1 : 0);
      expect(mocks.retryOptions).toHaveBeenCalledTimes(phase === 'options' ? 1 : 0);
      expect(mocks.retryPreview).toHaveBeenCalledTimes(phase === 'generation' ? 1 : 0);
    }
  );

  it('does not offer settings editing in the application read-only preview', () => {
    render(<AdmissionFormPrintWorkspace form={form} onSettingsChange={vi.fn()} readOnly />);
    expect(screen.queryByText('Print settings')).not.toBeInTheDocument();
  });
});
