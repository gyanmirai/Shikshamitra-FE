import type { ReactNode } from 'react';

import { useState } from 'react';
import { Tabs } from '@mui/material';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { DEFAULT_ADMISSION_PRINT_SETTINGS } from './form-print-model';
import { AdmissionPrintSettingsPanel } from './admission-print-settings';
import { AdmissionPrintAdvancedSettings } from './admission-print-advanced-settings';

import type { AdmissionPrintSettings, AdmissionPrintDefinition } from './form-print-model';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-tabs', () => ({
  CustomTabs: ({
    density,
    guardUnsavedChanges,
    ...props
  }: {
    density?: string;
    guardUnsavedChanges?: boolean;
    children: ReactNode;
  }) => <Tabs {...props} />,
}));

const form: AdmissionPrintDefinition = {
  name: 'School Registration',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'gu'],
  sections: [
    {
      id: 'student',
      code: 'student',
      name: 'Student details',
      displayOrder: 0,
      fields: [
        {
          id: 'first',
          code: 'first_name',
          label: 'First name',
          fieldType: 0,
          bindingType: 0,
          bindingKey: 'Applicant.FirstName',
          displayOrder: 0,
          required: true,
          readOnly: false,
        },
      ],
    },
    {
      id: 'siblings',
      code: 'siblings',
      name: 'Siblings',
      displayOrder: 1,
      isRepeatable: true,
      minEntries: 1,
      fields: [
        {
          id: 'sibling',
          code: 'sibling_name',
          label: 'Sibling name',
          fieldType: 0,
          bindingType: 1,
          displayOrder: 0,
          required: false,
          readOnly: false,
        },
      ],
    },
  ],
};

function Harness({
  initial = DEFAULT_ADMISSION_PRINT_SETTINGS,
  definition = form,
  basic = false,
}: {
  initial?: AdmissionPrintSettings;
  definition?: AdmissionPrintDefinition;
  basic?: boolean;
}) {
  const [settings, setSettings] = useState(initial);
  return (
    <>
      {basic ? (
        <AdmissionPrintSettingsPanel
          settings={settings}
          onChange={setSettings}
          branding={{ schoolName: 'Example School' }}
          pageCount={4}
        />
      ) : (
        <AdmissionPrintAdvancedSettings
          settings={settings}
          onChange={setSettings}
          form={definition}
          branding={{ schoolName: 'Example School' }}
        />
      )}
      <output data-testid="saved-settings">{JSON.stringify(settings)}</output>
    </>
  );
}
const payload = () => JSON.parse(screen.getByTestId('saved-settings').textContent || '{}');
function choose(label: string, option: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  fireEvent.click(screen.getByRole('option', { name: option }));
}

describe('Advanced registration print settings', () => {
  it('offers a fixed top-right header placement and retains the saved alignment for other placements', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('tab', { name: 'Header & footer' }));
    choose('Photo alignment', 'Centre');
    choose('Photo placement', 'Top-right of header');
    expect(screen.getByRole('combobox', { name: 'Photo alignment' })).toHaveAttribute('aria-disabled', 'true');
    expect(payload().advanced.photo).toMatchObject({ placement: 'header-top-right', alignment: 'center' });
    choose('Photo placement', 'First page');
    expect(screen.getByRole('combobox', { name: 'Photo alignment' })).toHaveTextContent('Centre');
  });

  it('keeps specific banner pages independent of the header choice', () => {
    render(<Harness basic />);
    choose('Banner pages', 'Selected pages');
    choose('Pages with banner', 'Page 3');
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    choose('Header on later pages', 'Full');
    expect(payload().advanced).toMatchObject({
      branding: { bannerPlacement: 'selected', bannerPages: [1, 3] },
      header: { continuation: 'full' },
    });
  });

  it('saves photo visibility and alignment independently of photo placement', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('tab', { name: 'Header & footer' }));
    choose('Photo alignment', 'Centre');
    fireEvent.click(screen.getByLabelText('Show photo space'));
    expect(screen.getByRole('combobox', { name: 'Photo alignment' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(payload()).toMatchObject({
      showPhoto: false,
      advanced: { photo: { alignment: 'center' } },
    });
    fireEvent.click(screen.getByLabelText('Show photo space'));
    expect(screen.getByRole('combobox', { name: 'Photo alignment' })).toHaveTextContent('Centre');
  });

  it('preserves existing overrides and serializes paper, border and typography edits independently', () => {
    const initial: AdmissionPrintSettings = {
      ...DEFAULT_ADMISSION_PRINT_SETTINGS,
      advanced: {
        branding: { logo: { x: 5, y: 8, width: 20, height: 70 } },
        sections: { STUDENT: { columns: 3 } },
        content: { translations: { gu: { instructions: 'Existing translation' } } },
      },
    };
    render(<Harness initial={initial} />);
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    choose('Paper size', 'A5');
    choose('Orientation', 'Landscape');
    fireEvent.click(screen.getByRole('switch', { name: 'Show page border' }));
    choose('Border style', 'Double line');
    choose('Colour palette', 'School blue');
    expect(payload()).toMatchObject({
      paperSize: 'A5',
      advanced: {
        paper: { orientation: 'landscape' },
        border: { enabled: true, style: 'double' },
        style: { palette: 'school-blue', borderColor: '#003399' },
        branding: initial.advanced?.branding,
        sections: initial.advanced?.sections,
        content: initial.advanced?.content,
      },
    });
  });

  it('keeps saved contact flags while disabling unavailable school contact options', () => {
    render(
      <Harness
        initial={{ ...DEFAULT_ADMISSION_PRINT_SETTINGS, advanced: { header: { phone: true } } }}
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Header & footer' }));
    expect(screen.getByRole('switch', { name: 'School phone' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'School phone' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'School phone' })).toHaveAccessibleDescription(
      'Set missing school contact details in Institute Setup to include them.'
    );
    expect(screen.getByText(/Set missing school contact details/)).toBeVisible();
    fireEvent.change(screen.getByLabelText('Print title'), {
      target: { value: 'Admission registration' },
    });
    choose('Footer pages', 'Last page');
    expect(payload().advanced).toMatchObject({
      header: { phone: true, title: 'Admission registration' },
      footer: { placement: 'last' },
    });
  });

  it('stores section and field overrides by uppercase authored code without changing questions', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('tab', { name: 'Sections & fields' }));
    choose('Section columns', '3 columns');
    fireEvent.click(screen.getByRole('switch', { name: 'Start section on a new page' }));
    choose('Field width', 'Full width');
    choose('Section', 'Siblings');
    fireEvent.click(screen.getByRole('switch', { name: 'Full-width section' }));
    expect(screen.getByLabelText('Blank table rows')).toBeVisible();
    expect(payload().advanced).toMatchObject({
      sections: { STUDENT: { columns: 3, startNewPage: true }, SIBLINGS: { fullWidth: true } },
      fields: { FIRST_NAME: { width: 'full' } },
    });
    expect(form.sections[0].fields[0].required).toBe(true);
    fireEvent.click(screen.getByRole('tab', { name: 'Paper & style' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Sections & fields' }));
    expect(payload().advanced.fields.FIRST_NAME.width).toBe('full');
  });

  it('preserves content translations, checklist rows and print-only flags after changing tabs', () => {
    render(
      <Harness
        initial={{
          ...DEFAULT_ADMISSION_PRINT_SETTINGS,
          advanced: {
            content: {
              translations: {
                en: { instructions: 'English instructions' },
                gu: { instructions: 'Gujarati instructions', checklist: ['Birth certificate'] },
              },
            },
          },
        }}
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Content & copies' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Include instructions' }));
    choose('Content language', 'Gujarati');
    fireEvent.change(screen.getByLabelText('Instructions text'), {
      target: { value: 'Updated Gujarati instructions' },
    });
    fireEvent.click(screen.getByRole('switch', { name: 'Include document checklist' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add document' }));
    fireEvent.change(screen.getByLabelText('Document 2'), {
      target: { value: 'Transfer certificate' },
    });
    fireEvent.click(screen.getByRole('switch', { name: 'Include declaration' }));
    fireEvent.change(screen.getByLabelText('Declaration text'), {
      target: { value: 'School-authored declaration' },
    });
    choose('Unanswered fields', 'Show dash');
    choose('Content language', 'English');
    expect(screen.getByLabelText('Instructions text')).toHaveValue('English instructions');
    expect(payload().advanced).toMatchObject({
      content: {
        showInstructions: true,
        showChecklist: true,
        showDeclaration: true,
        translations: {
          en: { instructions: 'English instructions' },
          gu: {
            instructions: 'Updated Gujarati instructions',
            checklist: ['Birth certificate', 'Transfer certificate'],
            declaration: 'School-authored declaration',
          },
        },
      },
      copies: { unanswered: 'dash' },
    });
  });

  it('shows useful empty states when no sections or fields are available', () => {
    render(<Harness definition={{ ...form, sections: [] }} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Sections & fields' }));
    expect(screen.getByText(/Add sections in Build form/)).toBeVisible();
    expect(screen.getByText(/Add fields to this section/)).toBeVisible();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('supports numeric typing with bounds and keeps each margin independent', () => {
    render(<Harness />);
    const top = screen.getByLabelText('Top margin');
    fireEvent.change(top, { target: { value: '2' } });
    expect(screen.getByText('Enter a value from 5 to 30 mm.')).toBeVisible();
    fireEvent.change(top, { target: { value: '20' } });
    expect(payload().advanced.paper.margins).toEqual({ top: 20, right: 12, bottom: 12, left: 12 });
    fireEvent.change(top, { target: { value: '3' } });
    fireEvent.blur(top);
    expect(payload().advanced.paper.margins.top).toBe(5);
    fireEvent.change(top, { target: { value: '99' } });
    expect(payload().advanced.paper.margins.top).toBe(5);
  });

  it('uses multiline density defaults until an explicit writing-line override is entered', () => {
    const definition = {
      ...form,
      sections: [
        {
          ...form.sections[0],
          fields: [{ ...form.sections[0].fields[0], fieldType: 1, label: 'Home address' }],
        },
      ],
    };
    render(
      <Harness
        definition={definition}
        initial={{ ...DEFAULT_ADMISSION_PRINT_SETTINGS, layout: 'spacious' }}
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Sections & fields' }));
    expect(screen.getByLabelText('Writing lines')).toHaveValue('3');
    fireEvent.change(screen.getByLabelText('Writing lines'), { target: { value: '1' } });
    expect(payload().advanced.fields.FIRST_NAME.writingLines).toBe(1);
  });

  it('limits checklist creation while keeping authored content when printing is disabled', () => {
    const checklist = Array.from({ length: 20 }, (_, index) => `Document ${index + 1}`);
    render(
      <Harness
        initial={{
          ...DEFAULT_ADMISSION_PRINT_SETTINGS,
          advanced: { content: { showChecklist: true, translations: { en: { checklist } } } },
        }}
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Content & copies' }));
    expect(screen.getByRole('button', { name: 'Add document' })).toBeDisabled();
    fireEvent.click(screen.getByRole('switch', { name: 'Include document checklist' }));
    expect(payload().advanced.content.translations.en.checklist).toEqual(checklist);
    expect(screen.getByLabelText('Document 1')).toBeDisabled();
  });

  it('explains unavailable photo-question placement without clearing a previously saved choice', () => {
    render(
      <Harness
        initial={{
          ...DEFAULT_ADMISSION_PRINT_SETTINGS,
          advanced: { photo: { placement: 'field' } },
        }}
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Header & footer' }));
    expect(screen.getByText(/Add a photo question in Build form to place/)).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Photo placement' })).toHaveTextContent(
      'With photo question'
    );
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Photo placement' }));
    expect(screen.getByRole('option', { name: /With photo question/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    fireEvent.click(screen.getByRole('option', { name: 'First page' }));
    expect(payload().advanced.photo.placement).toBe('first');
  });
});
