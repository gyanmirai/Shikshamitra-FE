import type { ReactNode } from 'react';
import type { AdmissionFormPrintSettings } from 'src/redux/student/admissions/admission-form-print-settings';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, screen, fireEvent, render as renderWithTestingLibrary } from '@testing-library/react';

import { DEFAULT_ADMISSION_PRINT_SETTINGS } from './form-print-model';
import { AdmissionFormPrintWorkspace } from './admission-form-print-workspace';

import type { AdmissionPrintDefinition } from './form-print-model';

const theme = createTheme(defaultSettings);
const render = (element: ReactNode) =>
  renderWithTestingLibrary(element, {
    wrapper: ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>,
  });

const mocks = vi.hoisted(() => ({
  preview: vi.fn(),
  branding: vi.fn(),
  options: vi.fn(),
  print: vi.fn(),
  download: vi.fn(),
  retryBranding: vi.fn(),
  retryOptions: vi.fn(),
  retryPreview: vi.fn(),
  pdf: vi.fn(),
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
  default: (props: { url: string }) => {
    mocks.pdf(props);
    return <div data-testid="pdf-preview">{props.url}</div>;
  },
}));
vi.mock('./admission-print-settings', () => ({
  AdmissionPrintSettingsPanel: ({
    settings,
    onChange,
    onEditHeader,
  }: {
    settings: AdmissionFormPrintSettings;
    onChange: (next: AdmissionFormPrintSettings) => void;
    onEditHeader?: () => void;
  }) => (
    <>
      <button type="button" onClick={onEditHeader}>
        Edit header
      </button>
      <button
        type="button"
        onClick={() =>
          onChange({
            ...settings,
            advanced: { sections: { SECTION_1: { columns: 1 } } },
          })
        }
      >
        Print settings
      </button>
    </>
  ),
}));
vi.mock('./admission-print-advanced-settings', () => ({
  AdmissionPrintAdvancedSettings: ({ onEditHeader }: { onEditHeader?: () => void }) => (
    <div>
      Advanced print settings
      <button type="button" onClick={onEditHeader}>
        Edit header
      </button>
    </div>
  ),
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

  it('opens layout settings on demand while keeping the existing preview mounted', () => {
    render(<AdmissionFormPrintWorkspace form={form} onSettingsChange={vi.fn()} />);
    const preview = screen.getByTestId('pdf-preview');
    const settings = screen.getByRole('button', { name: 'Layout settings' });
    expect(settings).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('complementary', { name: 'Layout Settings' })).toBeNull();
    fireEvent.click(settings);
    expect(settings).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('complementary', { name: 'Layout Settings' })).toBeVisible();
    const headingRow = screen.getByRole('heading', { name: 'Layout Settings' }).parentElement;
    expect(headingRow).toContainElement(
      screen.getByRole('group', { name: 'Print layout settings' })
    );
    expect(headingRow).toContainElement(
      screen.getByRole('button', { name: 'Close layout settings' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Advanced' }));
    expect(screen.getByText('Advanced print settings')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Close layout settings' }));
    expect(settings).toHaveFocus();
    expect(screen.getByTestId('pdf-preview')).toBe(preview);
    fireEvent.click(settings);
    expect(screen.getByText('Advanced print settings')).toBeVisible();
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
    fireEvent.change(screen.getByRole('combobox', { name: 'Print content' }), {
      target: { value: 'filled' },
    });
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
    fireEvent.click(screen.getByRole('button', { name: 'More print actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Download PDF' }));
    expect(mocks.print).toHaveBeenCalledWith('blob:current');
    expect(mocks.download).toHaveBeenCalledWith('blob:current', 'Registration-filled');
    expect(onSettingsChange).not.toHaveBeenCalled();
  });

  it('prints a filled builder example without querying applicant-specific choices', () => {
    render(<AdmissionFormPrintWorkspace form={form} sampleDetails />);
    expect(mocks.preview.mock.lastCall![0].registrationNumber).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'With details' }));
    const model = mocks.preview.mock.lastCall![0];
    expect(model.registrationNumber).toBe('SAMPLE-001');
    expect(model.steps[0].sections[0].entries[0].fields[0].value).toBe('Example answer');
    expect(screen.getByText(/Sample answers are used/)).toBeVisible();
    expect(mocks.options.mock.lastCall![2]).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
    expect(mocks.download).toHaveBeenLastCalledWith('blob:current', 'Registration-sample');
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

  it('groups the builder language and scope under preview options', () => {
    render(<AdmissionFormPrintWorkspace form={form} onSettingsChange={vi.fn()} />);
    expect(screen.queryByRole('combobox', { name: 'Form language' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Preview options' }));
    expect(screen.getByRole('dialog', { name: 'Preview options' })).toBeVisible();
    fireEvent.change(screen.getByRole('combobox', { name: 'Form language' }), {
      target: { value: 'gu' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Print scope' }), {
      target: { value: 'step-1' },
    });
    expect(mocks.preview.mock.lastCall![0]).toMatchObject({ language: 'gu' });
    expect(mocks.preview.mock.lastCall![0].steps.map(({ key }: { key: string }) => key)).toEqual([
      'step-1',
    ]);
  });

  it('does not offer a separate print scope for reused questions in a flagged single-page form', () => {
    render(
      <AdmissionFormPrintWorkspace
        form={{
          ...form,
          layoutType: 0,
          sections: form.sections.map((section) => ({
            ...section,
            stepId: 'registration-page',
            stepCode: 'REGISTRATION_PAGE',
            stepName: form.name,
            stepDisplayOrder: 0,
          })),
        }}
        readOnly
      />
    );
    expect(screen.queryByRole('combobox', { name: 'Print scope' })).toBeNull();
    expect(mocks.preview.mock.lastCall![0].steps).toHaveLength(1);
  });

  it('keeps the draft preview mounted during a settings refresh and blocks stale output', () => {
    const props = { form, onSettingsChange: vi.fn() };
    const { rerender } = render(<AdmissionFormPrintWorkspace {...props} />);
    const preview = screen.getByTestId('pdf-preview');
    mocks.preview.mockReturnValue({ previewUrl: 'blob:current', loading: true, error: false });
    rerender(<AdmissionFormPrintWorkspace {...props} />);
    expect(screen.getByTestId('pdf-preview')).toBe(preview);
    expect(screen.queryByText('Preparing printable form…')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Print' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'More print actions' }));
    expect(screen.getByRole('menuitem', { name: 'Download PDF' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    fireEvent.keyDown(screen.getByRole('menu', { name: 'More print actions' }), { key: 'Escape' });
    mocks.preview.mockReturnValue({
      previewUrl: 'blob:updated',
      url: 'blob:updated',
      loading: false,
      error: false,
    });
    rerender(<AdmissionFormPrintWorkspace {...props} />);
    expect(screen.getByTestId('pdf-preview')).toBe(preview);
    expect(preview).toHaveTextContent('blob:updated');
    expect(screen.getByRole('button', { name: 'Print' })).toBeEnabled();
  });

  it('reveals the affected section only on the updated PDF', () => {
    const onSettingsChange = vi.fn();
    const props = { form, onSettingsChange, settings: DEFAULT_ADMISSION_PRINT_SETTINGS };
    const { rerender } = render(<AdmissionFormPrintWorkspace {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Layout settings' }));
    const settingsButton = screen.getByRole('button', { name: 'Print settings' });
    settingsButton.focus();
    fireEvent.click(settingsButton);

    mocks.preview.mockReturnValue({ previewUrl: 'blob:current', loading: true, error: false });
    const settings = onSettingsChange.mock.lastCall![0];
    rerender(<AdmissionFormPrintWorkspace {...props} settings={settings} />);
    expect(mocks.pdf.mock.lastCall![0].reveal).toBeUndefined();
    expect(screen.getByRole('status', { name: /Updating print preview/ })).toBeVisible();

    mocks.preview.mockReturnValue({
      previewUrl: 'blob:updated',
      url: 'blob:updated',
      loading: false,
      error: false,
    });
    rerender(<AdmissionFormPrintWorkspace {...props} settings={settings} />);
    expect(mocks.pdf.mock.lastCall![0].reveal).toMatchObject({
      target: { destination: 'section:section-1', text: ['Family'] },
      label: expect.stringContaining('Family'),
    });
    const { reveal, onReveal, onPageChange } = mocks.pdf.mock.lastCall![0];
    expect(screen.getByRole('status', { name: /Updating print preview/ })).toBeVisible();
    act(() => onReveal(reveal.id, 3));
    expect(screen.getByRole('status')).toHaveTextContent(/Preview updated · Family .* Page 3/);
    act(() => onPageChange(1));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(settingsButton).toHaveFocus();
  });

  it('keeps the header editor usable when moving between Basic and Advanced', () => {
    mocks.branding.mockReturnValue({
      branding: { logoUrl: 'logo.png' },
      loading: false,
      error: false,
    });
    render(<AdmissionFormPrintWorkspace form={form} onSettingsChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Layout settings' }));
    fireEvent.click(screen.getByRole('button', { name: 'Advanced' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit header' }));
    const logo = screen.getByRole('button', { name: 'Move school logo' });
    fireEvent.click(screen.getByRole('button', { name: 'Basic' }));
    expect(screen.getByRole('button', { name: 'Move school logo' })).toBe(logo);
  });

  it('edits the form title even when school branding is hidden', () => {
    const onSettingsChange = vi.fn();
    const props = {
      form,
      settings: {
        ...DEFAULT_ADMISSION_PRINT_SETTINGS,
        showSchoolHeader: false,
        advanced: { header: { title: 'School Registration' } },
      },
      onSettingsChange,
    };
    const { rerender } = render(<AdmissionFormPrintWorkspace {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Layout settings' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit header' }));
    expect(screen.queryByRole('button', { name: 'Move school logo' })).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Move form title' }), {
      key: 'ArrowDown',
    });
    expect(onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        showSchoolHeader: false,
        advanced: {
          header: {
            title: 'School Registration',
            layout: { title: expect.objectContaining({ y: expect.any(Number) }) },
          },
        },
      })
    );
    rerender(
      <AdmissionFormPrintWorkspace {...props} settings={onSettingsChange.mock.lastCall?.[0]} />
    );
    expect(mocks.pdf.mock.lastCall?.[0].reveal).toBeUndefined();
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
    expect(screen.queryByRole('button', { name: 'Edit header' })).not.toBeInTheDocument();
  });
});
