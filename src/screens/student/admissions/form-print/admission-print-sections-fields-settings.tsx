import type {
  AdmissionPrintFieldSettings,
  AdmissionPrintSectionSettings,
} from 'src/redux/student/admissions/admission-form-print-settings';

import { useState } from 'react';
import { Typography } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';

import {
  PrintSettingsGrid,
  PrintSettingsCard,
  PrintSettingsCards,
  PrintSettingSelect,
  PrintSettingNumber,
  PrintSettingToggle,
  PrintSettingsResetButton,
} from './admission-print-setting-controls';

import type { AdmissionPrintAdvancedTabProps } from './admission-print-advanced-types';

export function AdmissionPrintSectionsFieldsSettings({
  settings,
  advanced,
  form,
  onChange,
  update,
}: AdmissionPrintAdvancedTabProps) {
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const sections = [
    ...new Map(form.sections.map((section) => [section.code.toUpperCase(), section])).values(),
  ];
  const section =
    sections.find((item) => item.code.toUpperCase() === selectedSection) ?? sections[0];
  const fields = section?.fields ?? [];
  const field = fields.find((item) => item.code.toUpperCase() === selectedField) ?? fields[0];
  const sectionCode = section?.code.toUpperCase() ?? '';
  const fieldCode = field?.code.toUpperCase() ?? '';
  const sectionSettings = advanced.sections[sectionCode] ?? {};
  const fieldSettings = advanced.fields[fieldCode] ?? {};
  const updateSection = (patch: Partial<AdmissionPrintSectionSettings>) =>
    update('sections', { [sectionCode]: { ...sectionSettings, ...patch } });
  const updateField = (patch: Partial<AdmissionPrintFieldSettings>) =>
    update('fields', { [fieldCode]: { ...fieldSettings, ...patch } });
  const resetSectionOverride = () => {
    const nextSections = { ...advanced.sections };
    delete nextSections[sectionCode];
    onChange({
      ...settings,
      advanced: { ...settings.advanced, sections: nextSections },
    });
  };
  const resetFieldOverride = () => {
    const nextFields = { ...advanced.fields };
    delete nextFields[fieldCode];
    onChange({
      ...settings,
      advanced: { ...settings.advanced, fields: nextFields },
    });
  };
  return (
    <PrintSettingsCards>
      <PrintSettingsCard
        defaultExpanded
        title="Form Flow"
        icon={GlobalIcons.floors}
        action={
          <PrintSettingsResetButton
            title="Form Flow"
            onReset={() =>
              update('flow', {
                stepTitles: true,
                sectionNumbers: true,
              })
            }
          />
        }
        descriptionTooltip="Control printed step headings and section numbering. Online form steps remain unchanged."
      >
        <PrintSettingToggle
          label="Show step titles"
          checked={advanced.flow.stepTitles}
          onChange={(stepTitles) => update('flow', { stepTitles })}
        />
        <PrintSettingToggle
          label="Number sections"
          checked={advanced.flow.sectionNumbers}
          onChange={(sectionNumbers) => update('flow', { sectionNumbers })}
        />
      </PrintSettingsCard>
      <PrintSettingsCard
        title="Section Layout"
        icon={GlobalIcons.admissionDetails}
        action={
          <PrintSettingsResetButton
            title="Section Layout"
            disabled={!section}
            onReset={resetSectionOverride}
          />
        }
        descriptionTooltip="Adjust one printed section at a time, including reused Inquiry sections. Question definitions remain unchanged."
      >
        {section ? (
          <>
            <PrintSettingSelect
              label="Section"
              value={sectionCode}
              options={sections.map((item) => [item.code.toUpperCase(), item.name] as const)}
              onChange={(value) => {
                setSelectedSection(value);
                setSelectedField('');
              }}
            />
            <PrintSettingsGrid>
              <PrintSettingSelect
                label="Section columns"
                value={
                  sectionSettings.fullWidth
                    ? 1
                    : (sectionSettings.columns ??
                      Math.max(1, Math.min(4, section.fieldsPerRow ?? form.fieldsPerRow ?? 2)))
                }
                options={[
                  [1, '1 column'],
                  [2, '2 columns'],
                  [3, '3 columns'],
                  [4, '4 columns'],
                ]}
                onChange={(columns) => updateSection({ columns: columns as 1 | 2 | 3 | 4, fullWidth: undefined })}
              />
              <PrintSettingSelect
                label="Section spacing"
                value={sectionSettings.spacing ?? settings.layout}
                options={[
                  ['compact', 'Compact'],
                  ['spacious', 'Spacious'],
                ]}
                onChange={(spacing) => updateSection({ spacing })}
              />
            </PrintSettingsGrid>
            <PrintSettingToggle
              label="Start section on a new page"
              checked={sectionSettings.startNewPage ?? false}
              onChange={(startNewPage) => updateSection({ startNewPage })}
            />
            <PrintSettingToggle
              label="Keep section together"
              checked={sectionSettings.keepTogether ?? !advanced.flow.smartPageFitting}
              onChange={(keepTogether) => updateSection({ keepTogether })}
            />
            <PrintSettingToggle
              label="Keep heading with first row"
              checked={sectionSettings.keepHeading ?? true}
              onChange={(keepHeading) => updateSection({ keepHeading })}
            />
            {section.isRepeatable && (
              <>
                <PrintSettingToggle
                  label="Repeat table headings on continuation pages"
                  checked={sectionSettings.repeatTableHeadings ?? true}
                  onChange={(repeatTableHeadings) => updateSection({ repeatTableHeadings })}
                />
                <PrintSettingNumber
                  label="Blank table rows"
                  value={sectionSettings.blankRows ?? Math.max(1, section.minEntries ?? 1)}
                  min={1}
                  max={30}
                  onChange={(blankRows) => updateSection({ blankRows })}
                />
              </>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Add sections in Build form to configure their printed layout.
          </Typography>
        )}
      </PrintSettingsCard>
      <PrintSettingsCard
        title="Field Appearance"
        icon={GlobalIcons.academicFieldSettings}
        action={
          <PrintSettingsResetButton
            title="Field Appearance"
            disabled={!field}
            onReset={resetFieldOverride}
          />
        }
        descriptionTooltip="These field settings affect paper copies only. Required questions keep their online validation."
      >
        {field ? (
          <>
            <PrintSettingSelect
              label="Field"
              value={fieldCode}
              options={fields.map((item) => [item.code.toUpperCase(), item.label] as const)}
              onChange={setSelectedField}
            />
            <PrintSettingsGrid>
              <PrintSettingSelect
                label="Field width"
                value={fieldSettings.width ?? 'auto'}
                options={[
                  ['auto', 'Use section columns'],
                  ['half', 'Half width'],
                  ['full', 'Full width'],
                ]}
                onChange={(width) => updateField({ width })}
              />
              <PrintSettingSelect
                label="Label position"
                value={fieldSettings.labelPosition ?? 'above'}
                options={[
                  ['above', 'Above answer'],
                  ['inline', 'Beside answer'],
                ]}
                onChange={(labelPosition) => updateField({ labelPosition })}
              />
              <PrintSettingSelect
                label="Answer style"
                value={fieldSettings.answerStyle ?? 'auto'}
                options={[
                  ['auto', 'Match field type'],
                  ['line', 'Writing line'],
                  ['boxes', 'Character boxes'],
                  ['checkboxes', 'Choice checkboxes'],
                ]}
                onChange={(answerStyle) => updateField({ answerStyle })}
              />
              <PrintSettingNumber
                label="Writing lines"
                value={
                  fieldSettings.writingLines ??
                  ([1, 11].includes(field.fieldType)
                    ? (sectionSettings.spacing ?? settings.layout) === 'spacious'
                      ? 3
                      : 2
                    : 1)
                }
                min={1}
                max={8}
                onChange={(writingLines) => updateField({ writingLines })}
              />
            </PrintSettingsGrid>
            <PrintSettingToggle
              label="Show field help text"
              checked={fieldSettings.showHelp ?? false}
              onChange={(showHelp) => updateField({ showHelp })}
            />
            <PrintSettingToggle
              label="Show conditional question note"
              checked={fieldSettings.showConditional ?? true}
              onChange={(showConditional) => updateField({ showConditional })}
            />
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Add fields to this section to configure their printed appearance.
          </Typography>
        )}
      </PrintSettingsCard>
    </PrintSettingsCards>
  );
}
