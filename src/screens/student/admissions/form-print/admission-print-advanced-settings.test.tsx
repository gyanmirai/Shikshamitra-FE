import type { ReactNode } from 'react';

import { useState } from 'react';
import { Tabs } from '@mui/material';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { act, render, screen, within, fireEvent } from '@testing-library/react';

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

const formWithPhoto: AdmissionPrintDefinition = {
  ...form,
  sections: form.sections.map((section, index) =>
    index === 0
      ? {
          ...section,
          fields: [
            ...section.fields,
            {
              id: 'photo',
              code: 'STUDENT_PHOTO',
              label: 'Student photograph',
              fieldType: 0,
              bindingType: 0,
              bindingKey: 'Applicant.ProfilePhoto',
              validationJson: '{"format":"photo"}',
              displayOrder: 1,
              required: false,
              readOnly: false,
            },
          ],
        }
      : section
  ),
};

function Harness({
  initial = DEFAULT_ADMISSION_PRINT_SETTINGS,
  definition = form,
  basic = false,
  onEditHeader,
  bannerUrl,
}: {
  initial?: AdmissionPrintSettings;
  definition?: AdmissionPrintDefinition;
  basic?: boolean;
  onEditHeader?: () => void;
  bannerUrl?: string;
}) {
  const [settings, setSettings] = useState(initial);
  return (
    <>
      {basic ? (
        <AdmissionPrintSettingsPanel
          settings={settings}
          onChange={setSettings}
          hasPhotoField={definition === formWithPhoto}
        />
      ) : (
        <AdmissionPrintAdvancedSettings
          settings={settings}
          onChange={setSettings}
          form={definition}
          branding={{ schoolName: 'Example School', bannerUrl }}
          onEditHeader={onEditHeader}
          pageCount={4}
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

function openSettingsCard(title: string) {
  const button = screen.queryByRole('button', { name: `Expand ${title}` });
  if (button) fireEvent.click(button);
}

function selectSettingsTab(name: string) {
  fireEvent.click(screen.getByRole('tab', { name }));
}

describe('Advanced registration print settings', () => {
  it('shows labeled scroll arrows when the tabs overflow', () => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(private callback: (entries: { isIntersecting: boolean }[]) => void) {}

        observe() {
          this.callback([{ isIntersecting: false }]);
        }

        disconnect = vi.fn();
      }
    );
    try {
      render(<Harness />);
      expect(screen.getByRole('button', { name: 'Scroll tabs left' })).toBeEnabled();
      fireEvent.click(screen.getByRole('button', { name: 'Scroll tabs right' }));
      expect(screen.getByRole('tab', { name: 'Paper & style', selected: true })).toBeVisible();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it.each([
    ['Paper & style', 'Paper Setup', 'Page Border'],
    ['Header & footer', 'School Details', 'Photo Space'],
    ['Sections & fields', 'Form Flow', 'Section Layout'],
    ['Content & copies', 'Print Content Language', 'Document Checklist'],
  ])('opens one settings group at a time on %s', (tab, defaultGroup, nextGroup) => {
    render(<Harness definition={formWithPhoto} />);
    fireEvent.click(screen.getByRole('tab', { name: tab }));
    const panel = within(screen.getByRole('tabpanel', { name: tab }));

    expect(panel.getByRole('button', { name: `Collapse ${defaultGroup}` })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    fireEvent.click(panel.getByRole('button', { name: `Expand ${nextGroup}` }));
    expect(panel.getByRole('button', { name: `Expand ${defaultGroup}` })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    const close = panel.getByRole('button', { name: `Collapse ${nextGroup}` });
    expect(close).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(close);
    expect(panel.queryByRole('button', { name: /^Collapse / })).not.toBeInTheDocument();
  });

  it('opens the shared header editor from School Details when editing is available', () => {
    const onEditHeader = vi.fn();
    render(<Harness onEditHeader={onEditHeader} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Header & footer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit header' }));
    expect(onEditHeader).toHaveBeenCalledOnce();
    expect(payload()).toEqual(DEFAULT_ADMISSION_PRINT_SETTINGS);
  });

  it.each([
        ['Header & footer', 'Photo Space'],
    ['Sections & fields', 'Section Layout'],
    ['Content & copies', 'Document Checklist'],
  ])('provides keyboard-accessible disclosure controls on %s', async (tab, title) => {
    const user = userEvent.setup();
    render(<Harness definition={formWithPhoto} />);
    fireEvent.click(screen.getByRole('tab', { name: tab }));
    const panel = screen.getByRole('tabpanel', { name: tab });
    const collapsed = within(panel).getByRole('button', {
      name: `Expand ${title}`,
    });
    expect(collapsed).toHaveAttribute('aria-expanded', 'false');
    act(() => collapsed.focus());
    await user.keyboard('{Enter}');
    expect(within(panel).getByRole('button', { name: `Collapse ${title}` })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('enables position and size only for a configured photo field', () => {
    render(<Harness definition={formWithPhoto} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Header & footer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Expand Photo Space' }));
    choose('Photo placement', 'Top right of first-page header');
    expect(payload().advanced.photo.placement).toBe('header-top-right');
    expect(screen.getByLabelText('Photo width')).toBeEnabled();
    expect(screen.getByLabelText('Photo height')).toBeEnabled();
    expect(screen.getByRole('combobox', { name: 'Photo alignment' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('retains saved instruction typography when changing instruction placement', () => {
    const content = {
      showInstructions: true,
      instructionTextSize: '14' as const,
      instructionTextWeight: 'bold' as const,
    };
    render(<Harness initial={{ ...DEFAULT_ADMISSION_PRINT_SETTINGS, advanced: { content } }} />);
    selectSettingsTab('Content & copies');
    openSettingsCard('Instructions');
    choose('Instructions placement', 'Before declaration');
    expect(payload().advanced.content).toEqual({
      ...content,
      instructionsPlacement: 'before-declaration',
    });
    expect(screen.queryByLabelText('Instruction font size')).not.toBeInTheDocument();
  });

  it('enables instruction placement and editing from the Advanced card', () => {
    render(<Harness />);
    selectSettingsTab('Content & copies');
    openSettingsCard('Instructions');

    const placement = screen.getByRole('combobox', { name: 'Instructions placement' });
    expect(placement).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(screen.getByRole('switch', { name: 'Print writing instructions' }));
    choose('Instructions placement', 'Separate page');
    fireEvent.change(screen.getByLabelText('Instruction 1'), {
      target: { value: 'Write in block letters' },
    });
    expect(payload().advanced.content).toMatchObject({
      showInstructions: true,
      instructionsPlacement: 'separate-page',
      translations: { en: { instructions: 'Write in block letters' } },
    });
  });

  it('places content guidance beside the related setting labels', () => {
    render(<Harness />);
    selectSettingsTab('Content & copies');

    openSettingsCard('Declaration & Signatures');
    expect(screen.getByRole('button', { name: 'Include declaration help' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Parent signature help' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Office signature help' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Instructions text help' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Declaration text help' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Parent signature label help' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Office signature label help' })
    ).not.toBeInTheDocument();
  });

  it('keeps saved signature images removable and adds custom handwritten signature lines', () => {
    render(
      <Harness
        initial={{
          ...DEFAULT_ADMISSION_PRINT_SETTINGS,
          advanced: {
            content: {
              parentSignatureImage: 'data:image/png;base64,cGFyZW50',
              officeSignatureImage: 'data:image/jpeg;base64,b2ZmaWNl',
            },
          },
        }}
      />
    );
    selectSettingsTab('Content & copies');
    openSettingsCard('Declaration & Signatures');

    expect(screen.queryByRole('group', { name: /Parent signature image/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove saved parent signature image' })).toBeVisible();
    expect(screen.queryByRole('group', { name: /Office signature image/ })).not.toBeInTheDocument();
    expect(payload().advanced.content).toMatchObject({
      parentSignatureImage: 'data:image/png;base64,cGFyZW50',
      officeSignatureImage: 'data:image/jpeg;base64,b2ZmaWNl',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Remove saved office signature image' }));
    expect(payload().advanced.content.officeSignatureImage).toBeUndefined();
    fireEvent.click(screen.getByRole('button', { name: 'Add signature' }));
    fireEvent.change(screen.getByLabelText('Custom signature label 1'), {
      target: { value: 'Principal signature' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add signature' }));
    fireEvent.change(screen.getByLabelText('Custom signature label 2'), {
      target: { value: 'Student signature' },
    });
    expect(payload().advanced.content.translations.en.customSignatureLabels).toEqual([
      'Principal signature',
      'Student signature',
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Remove custom signature 1' }));
    expect(payload().advanced.content.translations.en.customSignatureLabels).toEqual([
      'Student signature',
    ]);
  });

  it('shows photo guidance without changing saved settings when there is no photo question', () => {
    render(
      <Harness
        initial={{
          ...DEFAULT_ADMISSION_PRINT_SETTINGS,
          advanced: { photo: { placement: 'header-top-right', alignment: 'center' } },
        }}
      />
    );
    selectSettingsTab('Header & footer');
    openSettingsCard('Photo Space');
    expect(screen.queryByRole('combobox', { name: 'Photo placement' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Photo alignment' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Show photo space')).not.toBeInTheDocument();
    expect(screen.getByText(/Add a photo question in Build form/)).toBeVisible();
    expect(payload().advanced.photo).toMatchObject({
      placement: 'header-top-right',
      alignment: 'center',
    });
  });

  it('preserves saved banner page choices when the continuation header changes', () => {
    render(
      <Harness
        bannerUrl="/school-banner.png"
        initial={{
          ...DEFAULT_ADMISSION_PRINT_SETTINGS,
          advanced: { branding: { bannerPlacement: 'selected', bannerPages: [1, 3] } },
        }}
      />
    );
    selectSettingsTab('Header & footer');
    expect(screen.getByRole('combobox', { name: 'Pages with banner' })).toHaveTextContent('Page 3');
    choose('Continuation page header', 'Full header');
    expect(payload().advanced).toMatchObject({
      branding: { bannerPlacement: 'selected', bannerPages: [1, 3] },
      header: { continuation: 'full' },
    });
  });

  it('edits Basic writing instructions as separate list items', () => {
    render(<Harness basic />);
    openSettingsCard('Writing Instructions');
    fireEvent.click(screen.getByLabelText('Print writing instructions'));
    fireEvent.change(screen.getByLabelText('Instruction 1'), {
      target: { value: 'Use black ink.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add instruction' }));
    fireEvent.change(screen.getByLabelText('Instruction 2'), {
      target: { value: 'Bring required documents.' },
    });
    expect(payload().advanced.content.translations.en.instructions).toBe(
      'Use black ink.\nBring required documents.'
    );
  });

  it('saves photo visibility while retaining the saved placement values', () => {
    render(
      <Harness basic
        definition={formWithPhoto}
        initial={{
          ...DEFAULT_ADMISSION_PRINT_SETTINGS,
          advanced: { photo: { placement: 'last', alignment: 'center' } },
        }}
      />
    );
    fireEvent.click(screen.getByLabelText('Photo space'));
    expect(payload()).toMatchObject({
      showPhoto: false,
      advanced: { photo: { placement: 'last', alignment: 'center' } },
    });
    fireEvent.click(screen.getByLabelText('Photo space'));
    expect(payload().advanced.photo).toMatchObject({ placement: 'last', alignment: 'center' });
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
    openSettingsCard('Page Border');
    fireEvent.click(screen.getByRole('switch', { name: 'Show page border' }));
    choose('Border style', 'Double line');
    choose('Border corners', 'Rounded');
    openSettingsCard('Print Colours');
    fireEvent.click(screen.getByRole('radio', { name: /School blue/ }));
    expect(payload()).toMatchObject({
      paperSize: 'A5',
      advanced: {
        paper: { orientation: 'landscape' },
        border: { enabled: true, style: 'double', corners: 'rounded' },
        style: { palette: 'school-blue', borderColor: '#003399' },
        branding: initial.advanced?.branding,
        sections: initial.advanced?.sections,
        content: initial.advanced?.content,
      },
    });
  });

  it('offers four print colour presets and three font families', () => {
    render(<Harness />);
    openSettingsCard('Print Colours');
    expect(screen.getByRole('radio', { name: /School blue/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Neutral/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Forest green/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Black and white/ })).toBeInTheDocument();
    expect(screen.queryByLabelText('Section fill')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /Forest green/ }));
    expect(payload().advanced.style).toMatchObject({
      palette: 'forest-green',
      sectionFill: '#E8F5EC',
      borderColor: '#166534',
      textColor: '#102A1A',
    });

    openSettingsCard('Typography');
    expect(screen.getByRole('radio', { name: 'Sans serif' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Serif' })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Monospace' })).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Roboto' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Serif' }));
    expect(payload().advanced.style.fontFamily).toBe('serif');
  });

  it('resets each paper and style card independently', () => {
    render(
      <Harness
        initial={{
          ...DEFAULT_ADMISSION_PRINT_SETTINGS,
          paperSize: 'A5',
          advanced: {
            paper: {
              orientation: 'landscape',
              margins: { top: 20, right: 20, bottom: 20, left: 20 },
            },
            border: { enabled: true, style: 'double', thickness: 'thick', inset: 15 },
            style: { palette: 'forest-green', fontFamily: 'roboto', baseSize: 12, titleSize: 20 },
          },
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reset Print Colours to defaults' }));
    expect(payload()).toMatchObject({
      paperSize: 'A5',
      advanced: {
        paper: { orientation: 'landscape', margins: { top: 20 } },
        border: { enabled: true, style: 'double', thickness: 'thick', inset: 15 },
        style: { palette: 'neutral', sectionFill: '#F3F4F6', fontFamily: 'roboto', baseSize: 12 },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset Typography to defaults' }));
    expect(payload().advanced.style).toMatchObject({
      palette: 'neutral',
      fontFamily: 'sans',
      baseSize: 10,
      titleSize: 16,
      labelWeight: 'semibold',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset Paper Setup to defaults' }));
    expect(payload()).toMatchObject({
      paperSize: 'A4',
      advanced: {
        paper: { orientation: 'portrait', margins: { top: 12, right: 12, bottom: 12, left: 12 } },
        border: { enabled: true, style: 'double' },
      },
    });

  });

  it('resets header, photo and footer cards independently', () => {
    render(
      <Harness
        definition={formWithPhoto}
        initial={{
          ...DEFAULT_ADMISSION_PRINT_SETTINGS,
          showPhoto: false,
          advanced: {
            header: {
              schoolName: false,
              address: false,
              phone: true,
              continuation: 'full',
              title: 'Keep me',
              registrationNumber: false,
            },
            photo: {
              placement: 'last',
              alignment: 'left',
              width: 50,
              height: 60,
              caption: 'Portrait',
              useSaved: false,
            },
            footer: { placement: 'last', alignment: 'left', pageNumbers: false, schoolName: true },
          },
        }}
      />
    );
    selectSettingsTab('Header & footer');
    openSettingsCard('Photo Space');

    expect(screen.getByRole('combobox', { name: 'Photo placement' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('combobox', { name: 'Photo alignment' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.queryByText(/Add a photo question in Build form/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reset School Details to defaults' }));
    expect(payload().advanced.header).toMatchObject({
      schoolName: true,
      address: true,
      phone: false,
      continuation: 'compact',
      title: 'Keep me',
      registrationNumber: false,
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Reset Title & Admission Details to defaults' })
    );
    expect(payload().advanced.header).toMatchObject({
      schoolName: true,
      title: 'Keep me',
      subtitle: '',
      alignment: 'center',
      registrationNumber: true,
      date: true,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset Photo Space to defaults' }));
    expect(payload()).toMatchObject({
      showPhoto: false,
      advanced: {
        photo: {
          placement: 'header-top-right',
          alignment: 'right',
          width: 35,
          height: 45,
          caption: '',
          useSaved: true,
        },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset Footer to defaults' }));
    expect(payload().advanced.footer).toMatchObject({
      placement: 'every',
      alignment: 'right',
      pageNumbers: true,
      registrationReference: false,
      schoolName: false,
    });
  });

  it('resets form flow and the selected section and field without clearing other overrides', () => {
    render(
      <Harness
        initial={{
          ...DEFAULT_ADMISSION_PRINT_SETTINGS,
          advanced: {
            flow: { stepTitles: false, sectionNumbers: false },
            sections: { STUDENT: { columns: 4, fullWidth: true }, SIBLINGS: { columns: 3 } },
            fields: {
              FIRST_NAME: { width: 'full', showHelp: true },
              SIBLING_NAME: { width: 'half' },
            },
          },
        }}
      />
    );
    selectSettingsTab('Sections & fields');

    fireEvent.click(screen.getByRole('button', { name: 'Reset Form Flow to defaults' }));
    expect(payload().advanced.flow).toEqual({ stepTitles: true, sectionNumbers: true });

    fireEvent.click(screen.getByRole('button', { name: 'Reset Section Layout to defaults' }));
    openSettingsCard('Section Layout');
    expect(payload().advanced.sections).toEqual({ SIBLINGS: { columns: 3 } });
    expect(screen.getByRole('combobox', { name: 'Section columns' })).toHaveTextContent(
      '2 columns'
    );
    expect(screen.getByRole('combobox', { name: 'Section spacing' })).toHaveTextContent('Compact');

    fireEvent.click(screen.getByRole('button', { name: 'Reset Field Appearance to defaults' }));
    openSettingsCard('Field Appearance');
    expect(payload().advanced.fields).toEqual({ SIBLING_NAME: { width: 'half' } });
    expect(screen.getByRole('combobox', { name: 'Field width' })).toHaveTextContent(
      'Use section columns'
    );
  });

  it('resets content and copy cards and exposes field guidance through custom tooltips', () => {
    render(
      <Harness
        initial={{
          ...DEFAULT_ADMISSION_PRINT_SETTINGS,
          advanced: {
            content: {
              showInstructions: true,
              instructionsPlacement: 'section',
              instructionSection: 'STUDENT',
              showChecklist: true,
              checklistPlacement: 'first',
              showDeclaration: true,
              signaturePlacement: 'separate-page',
              parentSignature: false,
              officeSignature: false,
              signatureDate: true,
              showOfficeUse: true,
              officePlacement: 'separate-page',
              documentChecks: false,
              remarks: false,
              verificationDate: false,
              stamp: false,
              translations: {
                en: {
                  instructions: 'School instructions',
                  checklist: ['Birth certificate'],
                  declaration: 'School declaration',
                  parentLabel: 'Guardian',
                  officeLabel: 'Staff',
                },
                gu: { instructions: 'Keep Gujarati' },
              },
            },
            copies: { unanswered: 'dash', selectedChoices: 'mark' },
          },
        }}
      />
    );
    selectSettingsTab('Content & copies');

    openSettingsCard('Declaration & Signatures');
    expect(screen.getByRole('button', { name: 'Include declaration help' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Parent signature help' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Office signature help' })).toBeInTheDocument();
    expect(
      screen.queryByText('Up to 2,000 characters for the selected language.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Leave empty to use the standard translated label.')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reset Instructions to defaults' }));
    expect(payload().advanced.content).toMatchObject({
      showInstructions: true,
      instructionsPlacement: 'first',
      instructionSection: '',
      translations: {
        en: { checklist: ['Birth certificate'], declaration: 'School declaration' },
        gu: { instructions: 'Keep Gujarati' },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset Document Checklist to defaults' }));
    expect(payload().advanced.content).toMatchObject({
      showChecklist: false,
      checklistPlacement: 'last',
    });
    expect(payload().advanced.content.translations.en.checklist).toBeUndefined();

    fireEvent.click(
      screen.getByRole('button', { name: 'Reset Declaration & Signatures to defaults' })
    );
    expect(payload().advanced.content).toMatchObject({
      showDeclaration: false,
      signaturePlacement: 'last',
      parentSignature: true,
      officeSignature: true,
      signatureDate: false,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset Office Use to defaults' }));
    expect(payload().advanced.content).toMatchObject({
      showOfficeUse: false,
      officePlacement: 'last',
      documentChecks: true,
      remarks: true,
      verificationDate: true,
      stamp: true,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset Filled Copies to defaults' }));
    expect(payload().advanced.copies).toEqual({ unanswered: 'blank', selectedChoices: 'label' });

    fireEvent.click(
      screen.getByRole('button', { name: 'Reset Print Content Language to defaults' })
    );
    openSettingsCard('Print Content Language');
    expect(screen.getByRole('combobox', { name: 'Content language' })).toHaveTextContent('English');
  });

  it('keeps saved contact flags while disabling unavailable school contact options', () => {
    render(
      <Harness
        initial={{ ...DEFAULT_ADMISSION_PRINT_SETTINGS, advanced: { header: { phone: true } } }}
      />
    );
    selectSettingsTab('Header & footer');
    expect(screen.getByRole('switch', { name: 'School phone' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'School phone' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'School phone' })).toHaveAccessibleDescription(
      'Add missing contact details in Institute Setup to print them.'
    );
    expect(screen.getByText(/Add missing contact details in Institute Setup/)).toBeVisible();
    openSettingsCard('Title & Admission Details');
    fireEvent.change(screen.getByLabelText('Subtitle'), {
      target: { value: 'Admission registration' },
    });
    openSettingsCard('Footer');
    choose('Footer pages', 'Last page');
    expect(payload().advanced).toMatchObject({
      header: { phone: true, subtitle: 'Admission registration' },
      footer: { placement: 'last' },
    });
  });

  it('stores section and field overrides by uppercase authored code without changing questions', () => {
    render(<Harness />);
    selectSettingsTab('Sections & fields');
    openSettingsCard('Section Layout');
    choose('Section columns', '3 columns');
    fireEvent.click(screen.getByRole('switch', { name: 'Start section on a new page' }));
    openSettingsCard('Field Appearance');
    choose('Field width', 'Full width');
    openSettingsCard('Section Layout');
    choose('Section', 'Siblings');
    choose('Section columns', '1 column');
    expect(screen.getByLabelText('Blank table rows')).toBeVisible();
    expect(payload().advanced).toMatchObject({
      sections: { STUDENT: { columns: 3, startNewPage: true }, SIBLINGS: { columns: 1 } },
      fields: { FIRST_NAME: { width: 'full' } },
    });
    expect(form.sections[0].fields[0].required).toBe(true);
    selectSettingsTab('Paper & style');
    selectSettingsTab('Sections & fields');
    expect(payload().advanced.fields.FIRST_NAME.width).toBe('full');
  });

  it('preserves content translations, checklist rows and print-only flags after changing tabs', () => {
    render(
      <Harness
        initial={{
          ...DEFAULT_ADMISSION_PRINT_SETTINGS,
          advanced: {
            content: {
              showInstructions: true,
              translations: {
                en: { instructions: 'English instructions' },
                gu: { instructions: 'Gujarati instructions', checklist: ['Birth certificate'] },
              },
            },
          },
        }}
      />
    );
    selectSettingsTab('Content & copies');
    choose('Content language', 'Gujarati');
    openSettingsCard('Instructions');
    fireEvent.change(screen.getByLabelText('Instruction 1'), {
      target: { value: 'Updated Gujarati instructions' },
    });
    openSettingsCard('Document Checklist');
    fireEvent.click(screen.getByRole('switch', { name: 'Include document checklist' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add document' }));
    fireEvent.change(screen.getByLabelText('Document 2'), {
      target: { value: 'Transfer certificate' },
    });
    openSettingsCard('Declaration & Signatures');
    fireEvent.click(screen.getByRole('switch', { name: 'Include declaration' }));
    fireEvent.change(screen.getByLabelText('Declaration text'), {
      target: { value: 'School-authored declaration' },
    });
    openSettingsCard('Filled Copies');
    choose('Unanswered fields', 'Show dash');
    openSettingsCard('Print Content Language');
    choose('Content language', 'English');
    openSettingsCard('Instructions');
    expect(screen.getByLabelText('Instruction 1')).toHaveValue('English instructions');
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
    selectSettingsTab('Sections & fields');
    openSettingsCard('Section Layout');
    expect(screen.getByText(/Add sections in Build form/)).toBeVisible();
    openSettingsCard('Field Appearance');
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
    selectSettingsTab('Sections & fields');
    openSettingsCard('Field Appearance');
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
    selectSettingsTab('Content & copies');
    openSettingsCard('Document Checklist');
    expect(screen.getByRole('button', { name: 'Add document' })).toBeDisabled();
    fireEvent.click(screen.getByRole('switch', { name: 'Include document checklist' }));
    expect(payload().advanced.content.translations.en.checklist).toEqual(checklist);
    expect(screen.getByLabelText('Document 1')).toBeDisabled();
  });

  it('reopens the saved photo-question placement when the photo question is present', () => {
    render(
      <Harness
        definition={formWithPhoto}
        initial={{
          ...DEFAULT_ADMISSION_PRINT_SETTINGS,
          advanced: { photo: { placement: 'field' } },
        }}
      />
    );
    selectSettingsTab('Header & footer');
    openSettingsCard('Photo Space');
    expect(
      screen.queryByText(/Add a photo question in Build form to place/)
    ).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Photo placement' })).toHaveTextContent(
      'At the photo question'
    );
    expect(payload().advanced.photo.placement).toBe('field');
  });
});
