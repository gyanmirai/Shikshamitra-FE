import { useId, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Box, Stack, Radio, RadioGroup, Typography, FormControlLabel } from '@mui/material';
import { resolveAdmissionPrintAdvancedSettings } from 'src/redux/student/admissions/admission-form-print-settings';

import { PrintInstructionsListEditor } from './print-instructions-list-editor';
import {
  PrintSettingText,
  PrintSettingsCard,
  PrintSettingsGrid,
  PrintSettingSelect,
  PrintSettingToggle,
  PrintSettingsCards,
} from './admission-print-setting-controls';

import type { AdmissionPrintDefinition, AdmissionPrintSettings } from './form-print-model';

const PRINT_TEMPLATES = [
  ['boxed-grid', 'Boxed Grid'],
  ['structured-classic', 'Structured Classic'],
] as const;

export function AdmissionPrintSettingsPanel({
  settings,
  onChange,
  defaultLanguage = 'en',
  hasPhotoField = false,
  form,
}: {
  settings: AdmissionPrintSettings;
  onChange: (settings: AdmissionPrintSettings) => void;
  defaultLanguage?: string;
  hasPhotoField?: boolean;
  form?: AdmissionPrintDefinition;
}) {
  const {
    header,
    content,
    flow,
    paper,
    sections: sectionSettings,
  } = resolveAdmissionPrintAdvancedSettings(settings.advanced);
  const [selectedSection, setSelectedSection] = useState('');
  const sections = [
    ...new Map(
      (form?.sections ?? []).map((section) => [section.code.toUpperCase(), section])
    ).values(),
  ];
  const section =
    sections.find((item) => item.code.toUpperCase() === selectedSection) ?? sections[0];
  const sectionCode = section?.code.toUpperCase() ?? '';
  const sectionOverride = sectionSettings[sectionCode] ?? {};
  const updateSection = (patch: { startNewPage?: boolean; keepTogether?: boolean }) =>
    onChange({
      ...settings,
      advanced: {
        ...settings.advanced,
        sections: {
          ...settings.advanced?.sections,
          [sectionCode]: { ...sectionOverride, ...patch },
        },
      },
    });
  const selectedTemplate = settings.template ?? 'simple';
  const templateLabelId = useId();

  return (
    <PrintSettingsCards>
      <PrintSettingsCard
        title="Print Layout"
        icon={GlobalIcons.stationaryIcon}
        descriptionTooltip="Choose a print template, title and spacing for handwritten answers."
        defaultExpanded
      >
        <Typography id={templateLabelId} variant="subtitle2">
          Print template
        </Typography>
        <RadioGroup
          aria-labelledby={templateLabelId}
          value={selectedTemplate}
          onChange={(_, template) =>
            onChange({ ...settings, template: template as AdmissionPrintSettings['template'] })
          }
          sx={{ gap: 1 }}
        >
          {selectedTemplate === 'simple' && (
            <FormControlLabel
              value="simple"
              control={<Radio size="small" />}
              label="Simple (saved layout)"
            />
          )}
          {PRINT_TEMPLATES.map(([template, title]) => (
            <FormControlLabel
              key={template}
              value={template}
              control={<Radio size="small" />}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <TemplateThumbnail boxed={template === 'boxed-grid'} />
                  <Typography variant="subtitle2">{title}</Typography>
                </Stack>
              }
              sx={{
                m: 0,
                p: 1,
                border: 1,
                borderRadius: 1,
                borderColor: selectedTemplate === template ? 'primary.main' : 'divider',
                bgcolor: selectedTemplate === template ? 'action.selected' : undefined,
                '& .MuiFormControlLabel-label': { minWidth: 0, flex: 1 },
              }}
            />
          ))}
        </RadioGroup>
        <PrintSettingText
          label="Print title"
          value={header.title}
          helperText="Leave blank to use the form name."
          onChange={(title) =>
            onChange({
              ...settings,
              advanced: {
                ...settings.advanced,
                header: { ...settings.advanced?.header, title },
              },
            })
          }
        />
        <Typography variant="subtitle2">Print spacing</Typography>
        <RadioGroup
          row
          aria-label="Print spacing"
          value={settings.layout}
          onChange={(_, layout) =>
            onChange({ ...settings, layout: layout as AdmissionPrintSettings['layout'] })
          }
        >
          <FormControlLabel value="compact" control={<Radio size="small" />} label="Compact" />
          <FormControlLabel value="spacious" control={<Radio size="small" />} label="Spacious" />
        </RadioGroup>
        {hasPhotoField && (
          <PrintSettingToggle
            label="Photo space"
            checked={settings.showPhoto}
            onChange={(showPhoto) => onChange({ ...settings, showPhoto })}
          />
        )}
        <PrintSettingToggle
          label="Signature area"
          checked={settings.showSignature}
          onChange={(showSignature) => onChange({ ...settings, showSignature })}
        />
      </PrintSettingsCard>
      <PrintSettingsCard
        defaultExpanded
        title="Paper & Style"
        icon={GlobalIcons.documentIcon}
        descriptionTooltip="Choose the paper size and orientation for printed copies."
      >
        <PrintSettingsGrid>
          <PrintSettingSelect
            label="Paper size"
            value={settings.paperSize}
            options={[
              ['A4', 'A4'],
              ['A5', 'A5'],
              ['LETTER', 'Letter'],
              ['LEGAL', 'Legal'],
            ]}
            onChange={(paperSize) => onChange({ ...settings, paperSize })}
          />
          <PrintSettingSelect
            label="Orientation"
            value={paper.orientation}
            options={[
              ['portrait', 'Portrait'],
              ['landscape', 'Landscape'],
            ]}
            onChange={(orientation) =>
              onChange({
                ...settings,
                advanced: {
                  ...settings.advanced,
                  paper: { ...settings.advanced?.paper, orientation },
                },
              })
            }
          />
        </PrintSettingsGrid>
      </PrintSettingsCard>
      <PrintSettingsCard
        defaultExpanded
        title="Page Fitting"
        icon={GlobalIcons.admissionDetails}
        descriptionTooltip="Use available page space while keeping each field row readable."
      >
        <PrintSettingToggle
          label="Smart page fitting"
          checked={flow.smartPageFitting}
          onChange={(smartPageFitting) =>
            onChange({
              ...settings,
              advanced: {
                ...settings.advanced,
                flow: { ...settings.advanced?.flow, smartPageFitting },
              },
            })
          }
        />
        <Typography variant="caption" color="text.secondary">
          Use available space and continue sections on the next page.
        </Typography>
      </PrintSettingsCard>
      {section && (
        <PrintSettingsCard
          defaultExpanded
          title="Section Layout"
          icon={GlobalIcons.admissionDetails}
          descriptionTooltip="Choose how a section flows across printed pages."
        >
          <PrintSettingSelect
            label="Section"
            value={sectionCode}
            options={sections.map((item) => [item.code.toUpperCase(), item.name] as const)}
            onChange={setSelectedSection}
          />
          <PrintSettingToggle
            label="Start section on a new page"
            checked={sectionOverride.startNewPage ?? false}
            onChange={(startNewPage) => updateSection({ startNewPage })}
          />
          <PrintSettingToggle
            label="Keep section together"
            checked={sectionOverride.keepTogether ?? !flow.smartPageFitting}
            onChange={(keepTogether) => updateSection({ keepTogether })}
          />
          <Typography variant="caption" color="text.secondary">
            Long sections may continue on the next page.
          </Typography>
        </PrintSettingsCard>
      )}
      <PrintSettingsCard
        title="Writing Instructions"
        icon={GlobalIcons.info}
        descriptionTooltip="Add instructions for anyone filling in the paper form."
      >
        <PrintSettingToggle
          label="Print writing instructions"
          checked={content.showInstructions}
          onChange={(showInstructions) =>
            onChange({
              ...settings,
              advanced: {
                ...settings.advanced,
                content: { ...settings.advanced?.content, showInstructions },
              },
            })
          }
        />
        {content.showInstructions && (
          <PrintInstructionsListEditor
            value={content.translations[defaultLanguage]?.instructions ?? ''}
            onChange={(instructions) =>
              onChange({
                ...settings,
                advanced: {
                  ...settings.advanced,
                  content: {
                    ...settings.advanced?.content,
                    translations: {
                      ...content.translations,
                      [defaultLanguage]: { ...content.translations[defaultLanguage], instructions },
                    },
                  },
                },
              })
            }
          />
        )}
      </PrintSettingsCard>
    </PrintSettingsCards>
  );
}

function TemplateThumbnail({ boxed }: { boxed: boolean }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: 36,
        flexShrink: 0,
        aspectRatio: '210 / 297',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        p: 0.5,
      }}
    >
      <Box sx={{ height: 5, bgcolor: 'action.selected', mb: 0.5 }} />
      {[0, 1, 2].map((row) => (
        <Box
          key={row}
          sx={{
            height: 9,
            border: boxed ? 1 : 0,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            mb: 0.25,
          }}
        >
          {boxed && <Box sx={{ width: '50%', borderRight: 1, borderColor: 'divider' }} />}
        </Box>
      ))}
    </Box>
  );
}
