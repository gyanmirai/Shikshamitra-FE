import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Button, Tooltip, IconButton, Typography } from '@mui/material';

import { getAdmissionLanguageLabel } from '../form-dialog/form-languages';
import {
  PrintSettingText,
  PrintSettingsGrid,
  PrintSettingsCards,
  PrintSettingSelect,
  PrintSettingToggle,
} from './admission-print-setting-controls';

import type { AdmissionPrintAdvancedTabProps } from './admission-print-advanced-types';

export function AdmissionPrintContentCopiesSettings({
  settings,
  advanced,
  form,
  update,
}: AdmissionPrintAdvancedTabProps) {
  const supported = form.supportedLanguages?.length
    ? form.supportedLanguages
    : [form.defaultLanguage ?? 'en'];
  const languages = supported.filter((language) => ['en', 'gu', 'hi'].includes(language));
  const [selectedLanguage, setSelectedLanguage] = useState(form.defaultLanguage ?? 'en');
  const language = languages.includes(selectedLanguage) ? selectedLanguage : languages[0];
  const { content, copies } = advanced;
  const translation = content.translations[language] ?? {};
  const checklist = translation.checklist ?? [];
  const updateTranslation = (patch: Partial<typeof translation>) =>
    update('content', {
      translations: { ...content.translations, [language]: { ...translation, ...patch } },
    });
  return (
    <PrintSettingsCards>
      <FormSectionCard
        title="Print Content Language"
        sx={{ gridColumn: '1 / -1' }}
        icon={GlobalIcons.academicTextCase}
        descriptionTooltip="Enter print-only content for the languages enabled on this form. Switching language preserves the other translations."
      >
        {languages.length ? (
          <PrintSettingSelect
            label="Content language"
            value={language}
            options={languages.map((value) => [value, getAdmissionLanguageLabel(value)] as const)}
            onChange={setSelectedLanguage}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Enable English, Gujarati or Hindi in Form details to edit translated print content.
          </Typography>
        )}
      </FormSectionCard>
      <FormSectionCard
        title="Instructions"
        icon={GlobalIcons.info}
        descriptionTooltip="School-authored instructions appear only in printed copies and do not add applicant questions."
      >
        <PrintSettingToggle
          label="Include instructions"
          checked={content.showInstructions}
          onChange={(showInstructions) => update('content', { showInstructions })}
        />
        <PrintSettingSelect
          label="Instructions placement"
          value={content.instructionsPlacement}
          disabled={!content.showInstructions}
          options={[
            ['first', 'First page'],
            ['section', 'Before selected section'],
            ['before-declaration', 'Before declaration'],
            ['separate-page', 'Separate page'],
          ]}
          onChange={(instructionsPlacement) => update('content', { instructionsPlacement })}
        />
        {content.instructionsPlacement === 'section' && (
          <PrintSettingSelect
            label="Instructions section"
            value={content.instructionSection}
            disabled={!content.showInstructions || !form.sections.length}
            options={[
              ['', 'Choose section'],
              ...form.sections.map(
                (section) => [section.code.toUpperCase(), section.name] as const
              ),
            ]}
            onChange={(instructionSection) => update('content', { instructionSection })}
            helperText={!form.sections.length ? 'Add a section in Build form first.' : undefined}
          />
        )}
        <PrintSettingText
          label="Instructions text"
          value={translation.instructions ?? ''}
          multiline
          maxLength={2000}
          disabled={!content.showInstructions || !language}
          onChange={(instructions) => updateTranslation({ instructions })}
          helperText="Up to 2,000 characters for the selected language."
        />
      </FormSectionCard>
      <FormSectionCard
        title="Document Checklist"
        icon={GlobalIcons.prerequisites}
        descriptionTooltip="Add school-specified document names for printed checklist boxes. This does not change upload requirements."
      >
        <PrintSettingToggle
          label="Include document checklist"
          checked={content.showChecklist}
          onChange={(showChecklist) => update('content', { showChecklist })}
        />
        <PrintSettingSelect
          label="Checklist placement"
          value={content.checklistPlacement}
          disabled={!content.showChecklist}
          options={[
            ['first', 'First page'],
            ['last', 'Last page'],
            ['separate-page', 'Separate page'],
          ]}
          onChange={(checklistPlacement) => update('content', { checklistPlacement })}
        />
        {checklist.map((item, index) => (
          <Stack key={index} direction="row" spacing={1} alignItems="center">
            <PrintSettingText
              label={`Document ${index + 1}`}
              value={item}
              disabled={!content.showChecklist || !language}
              onChange={(value) =>
                updateTranslation({
                  checklist: checklist.map((entry, itemIndex) =>
                    itemIndex === index ? value : entry
                  ),
                })
              }
            />
            <Tooltip title="Remove document">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  aria-label={`Remove document ${index + 1}`}
                  disabled={!content.showChecklist || !language}
                  onClick={() =>
                    updateTranslation({
                      checklist: checklist.filter((_, itemIndex) => itemIndex !== index),
                    })
                  }
                >
                  <Iconify icon={GlobalIcons.delete} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        ))}
        <Button
          type="button"
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.addIcon} />}
          sx={{ alignSelf: 'flex-start' }}
          disabled={!content.showChecklist || !language || checklist.length >= 20}
          onClick={() => updateTranslation({ checklist: [...checklist, ''] })}
        >
          Add document
        </Button>
        <Typography variant="caption" color="text.secondary">
          Up to 20 documents, each up to 128 characters.
        </Typography>
      </FormSectionCard>
      <FormSectionCard
        title="Declaration & Signatures"
        icon={GlobalIcons.edit}
        descriptionTooltip="Use the school's own declaration and signature labels. No legal wording is supplied automatically."
      >
        <PrintSettingToggle
          label="Include declaration"
          checked={content.showDeclaration}
          onChange={(showDeclaration) => update('content', { showDeclaration })}
        />
        <PrintSettingText
          label="Declaration text"
          value={translation.declaration ?? ''}
          multiline
          maxLength={2000}
          disabled={!content.showDeclaration || !language}
          onChange={(declaration) => updateTranslation({ declaration })}
          helperText="Up to 2,000 characters for the selected language."
        />
        <PrintSettingSelect
          label="Signature placement"
          value={content.signaturePlacement}
          disabled={!settings.showSignature}
          options={[
            ['last', 'Last page'],
            ['separate-page', 'Separate page'],
          ]}
          onChange={(signaturePlacement) => update('content', { signaturePlacement })}
        />
        <PrintSettingToggle
          label="Parent signature"
          checked={content.parentSignature}
          disabled={!settings.showSignature}
          onChange={(parentSignature) => update('content', { parentSignature })}
        />
        <PrintSettingText
          label="Parent signature label"
          value={translation.parentLabel ?? ''}
          disabled={!settings.showSignature || !content.parentSignature || !language}
          onChange={(parentLabel) => updateTranslation({ parentLabel })}
          helperText="Leave empty to use the standard translated label."
        />
        <PrintSettingToggle
          label="Office signature"
          checked={content.officeSignature}
          disabled={!settings.showSignature}
          onChange={(officeSignature) => update('content', { officeSignature })}
        />
        <PrintSettingText
          label="Office signature label"
          value={translation.officeLabel ?? ''}
          disabled={!settings.showSignature || !content.officeSignature || !language}
          onChange={(officeLabel) => updateTranslation({ officeLabel })}
          helperText="Leave empty to use the standard translated label."
        />
        <PrintSettingToggle
          label="Signature date"
          checked={content.signatureDate}
          disabled={!settings.showSignature}
          onChange={(signatureDate) => update('content', { signatureDate })}
        />
      </FormSectionCard>
      <FormSectionCard
        title="Office Use"
        icon={GlobalIcons.building}
        descriptionTooltip="Add printed spaces for school staff to complete document verification and office notes."
      >
        <PrintSettingToggle
          label="Include office-use area"
          checked={content.showOfficeUse}
          onChange={(showOfficeUse) => update('content', { showOfficeUse })}
        />
        <PrintSettingSelect
          label="Office-use placement"
          value={content.officePlacement}
          disabled={!content.showOfficeUse}
          options={[
            ['last', 'Last page'],
            ['separate-page', 'Separate page'],
          ]}
          onChange={(officePlacement) => update('content', { officePlacement })}
        />
        {(
          [
            ['documentChecks', 'Document verification checks'],
            ['remarks', 'Remarks space'],
            ['verificationDate', 'Verification date'],
            ['stamp', 'School stamp space'],
          ] as const
        ).map(([key, label]) => (
          <PrintSettingToggle
            key={key}
            label={label}
            checked={content[key]}
            disabled={!content.showOfficeUse}
            onChange={(checked) => update('content', { [key]: checked })}
          />
        ))}
      </FormSectionCard>
      <FormSectionCard
        title="Filled Copies"
        sx={{ gridColumn: '1 / -1' }}
        icon={GlobalIcons.copy}
        descriptionTooltip="Choose how saved answers are presented. Blank copies never include applicant answers."
      >
        <PrintSettingsGrid>
          <PrintSettingSelect
            label="Unanswered fields"
            value={copies.unanswered}
            options={[
              ['blank', 'Leave blank'],
              ['dash', 'Show dash'],
              ['not-provided', 'Show Not provided'],
            ]}
            onChange={(unanswered) => update('copies', { unanswered })}
          />
          <PrintSettingSelect
            label="Selected choices"
            value={copies.selectedChoices}
            options={[
              ['label', 'Selected label'],
              ['mark', 'Mark selected options'],
            ]}
            onChange={(selectedChoices) => update('copies', { selectedChoices })}
          />
        </PrintSettingsGrid>
      </FormSectionCard>
    </PrintSettingsCards>
  );
}
