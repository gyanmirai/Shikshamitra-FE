import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { BannerUpload } from 'src/components/custom-upload/banner-upload';
import { Stack, Button, Tooltip, IconButton, Typography } from '@mui/material';

import { getAdmissionLanguageLabel } from '../form-dialog/form-languages';
import { PrintInstructionsListEditor } from './print-instructions-list-editor';
import {
  PrintSettingText,
  PrintSettingsGrid,
  PrintSettingsCard,
  PrintSettingsCards,
  PrintSettingSelect,
  PrintSettingToggle,
  PrintSettingsResetButton,
} from './admission-print-setting-controls';

import type { AdmissionPrintAdvancedTabProps } from './admission-print-advanced-types';

const SIGNATURE_IMAGE_ACCEPT = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
};

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
  const resetContentCard = (
    contentPatch: Partial<typeof content>,
    translationPatch?: Partial<typeof translation>
  ) =>
    update('content', {
      ...contentPatch,
      ...(translationPatch && language
        ? {
            translations: {
              ...content.translations,
              [language]: { ...translation, ...translationPatch },
            },
          }
        : {}),
    });
  return (
    <PrintSettingsCards>
      <PrintSettingsCard
        defaultExpanded
        title="Print Content Language"
        icon={GlobalIcons.academicTextCase}
        action={
          <PrintSettingsResetButton
            title="Print Content Language"
            disabled={!languages.length}
            onReset={() => setSelectedLanguage(form.defaultLanguage ?? languages[0] ?? 'en')}
          />
        }
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
      </PrintSettingsCard>
      <PrintSettingsCard
        title="Instructions"
        icon={GlobalIcons.info}
        action={
          <PrintSettingsResetButton
            title="Instructions"
            disabled={!language}
            onReset={() =>
              resetContentCard(
                {
                  showInstructions: false,
                  instructionsPlacement: 'first',
                  instructionSection: '',
                  instructionHeadingSize: 'default',
                  instructionTextSize: 'default',
                  instructionTextWeight: 'regular',
                  instructionTextColor: 'default',
                },
                { instructions: undefined }
              )
            }
          />
        }
        descriptionTooltip="School-authored instructions appear only in printed copies and do not add applicant questions."
      >
        <PrintSettingToggle
          label="Include instructions"
          checked={content.showInstructions}
          onChange={(showInstructions) => update('content', { showInstructions })}
          helperTooltip="Each non-empty line prints as a bullet. Use up to 2,000 characters for the selected language."
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
            helperTooltip={!form.sections.length ? 'Add a section in Build form first.' : undefined}
          />
        )}
        <PrintSettingsGrid>
          <PrintSettingSelect
            label="Heading font size"
            value={content.instructionHeadingSize}
            disabled={!content.showInstructions}
            options={[
              ['default', 'Default'],
              ['10', '10 pt'],
              ['12', '12 pt'],
              ['14', '14 pt'],
              ['16', '16 pt'],
            ]}
            onChange={(instructionHeadingSize) => update('content', { instructionHeadingSize })}
          />
          <PrintSettingSelect
            label="Instruction font size"
            value={content.instructionTextSize}
            disabled={!content.showInstructions}
            options={[
              ['default', 'Default'],
              ['10', '10 pt'],
              ['12', '12 pt'],
              ['14', '14 pt'],
              ['16', '16 pt'],
            ]}
            onChange={(instructionTextSize) => update('content', { instructionTextSize })}
          />
          <PrintSettingSelect
            label="Instruction text weight"
            value={content.instructionTextWeight}
            disabled={!content.showInstructions}
            options={[
              ['regular', 'Regular'],
              ['bold', 'Bold'],
            ]}
            onChange={(instructionTextWeight) => update('content', { instructionTextWeight })}
          />
          <PrintSettingSelect
            label="Instruction text color"
            value={content.instructionTextColor}
            disabled={!content.showInstructions}
            options={[
              ['default', 'Default'],
              ['black', 'Black'],
              ['gray', 'Gray'],
            ]}
            onChange={(instructionTextColor) => update('content', { instructionTextColor })}
          />
        </PrintSettingsGrid>
        <PrintInstructionsListEditor
          value={translation.instructions}
          disabled={!content.showInstructions || !language}
          onChange={(instructions) => updateTranslation({ instructions })}
        />
      </PrintSettingsCard>
      <PrintSettingsCard
        title="Document Checklist"
        icon={GlobalIcons.prerequisites}
        action={
          <PrintSettingsResetButton
            title="Document Checklist"
            disabled={!language}
            onReset={() =>
              resetContentCard(
                { showChecklist: false, checklistPlacement: 'last' },
                { checklist: undefined }
              )
            }
          />
        }
        descriptionTooltip="Add school-specified document names for printed checklist boxes. This does not change upload requirements."
      >
        <PrintSettingToggle
          label="Include document checklist"
          checked={content.showChecklist}
          onChange={(showChecklist) => update('content', { showChecklist })}
          helperTooltip="Add up to 20 documents, each up to 128 characters."
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
      </PrintSettingsCard>
      <PrintSettingsCard
        title="Declaration & Signatures"
        icon={GlobalIcons.edit}
        action={
          <PrintSettingsResetButton
            title="Declaration & Signatures"
            disabled={!language}
            onReset={() =>
              resetContentCard(
                {
                  showDeclaration: false,
                  signaturePlacement: 'last',
                  parentSignature: true,
                  officeSignature: true,
                  parentSignatureImage: undefined,
                  officeSignatureImage: undefined,
                  signatureDate: false,
                },
                { declaration: undefined, parentLabel: undefined, officeLabel: undefined }
              )
            }
          />
        }
        descriptionTooltip="Use the school's own declaration and signature labels. No legal wording is supplied automatically."
      >
        <PrintSettingToggle
          label="Include declaration"
          checked={content.showDeclaration}
          onChange={(showDeclaration) => update('content', { showDeclaration })}
          helperTooltip="The school-authored declaration prints on the form. Use up to 2,000 characters for the selected language."
        />
        <PrintSettingText
          label="Declaration text"
          value={translation.declaration ?? ''}
          multiline
          maxLength={2000}
          disabled={!content.showDeclaration || !language}
          onChange={(declaration) => updateTranslation({ declaration })}
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
          helperTooltip="Upload an optional parent signature image, or leave it blank to print an empty signature line. Leave the label blank to use the standard translation."
        />
        {content.parentSignature && settings.showSignature && (
          <BannerUpload
            label="Parent signature image"
            description="PNG or JPG image. Maximum 5 MB."
            accept={SIGNATURE_IMAGE_ACCEPT}
            maxSize={5 * 1024 * 1024}
            value={content.parentSignatureImage ? [content.parentSignatureImage] : []}
            onChange={(files) =>
              update('content', {
                parentSignatureImage: typeof files[0] === 'string' ? files[0] : undefined,
              })
            }
          />
        )}
        <PrintSettingText
          label="Parent signature label"
          value={translation.parentLabel ?? ''}
          disabled={!settings.showSignature || !content.parentSignature || !language}
          onChange={(parentLabel) => updateTranslation({ parentLabel })}
        />
        <PrintSettingToggle
          label="Office signature"
          checked={content.officeSignature}
          disabled={!settings.showSignature}
          onChange={(officeSignature) => update('content', { officeSignature })}
          helperTooltip="Upload an optional office signature image, or leave it blank to print an empty signature line. Leave the label blank to use the standard translation."
        />
        {content.officeSignature && settings.showSignature && (
          <BannerUpload
            label="Office signature image"
            description="PNG or JPG image. Maximum 5 MB."
            accept={SIGNATURE_IMAGE_ACCEPT}
            maxSize={5 * 1024 * 1024}
            value={content.officeSignatureImage ? [content.officeSignatureImage] : []}
            onChange={(files) =>
              update('content', {
                officeSignatureImage: typeof files[0] === 'string' ? files[0] : undefined,
              })
            }
          />
        )}
        <PrintSettingText
          label="Office signature label"
          value={translation.officeLabel ?? ''}
          disabled={!settings.showSignature || !content.officeSignature || !language}
          onChange={(officeLabel) => updateTranslation({ officeLabel })}
        />
        <PrintSettingToggle
          label="Signature date"
          checked={content.signatureDate}
          disabled={!settings.showSignature}
          onChange={(signatureDate) => update('content', { signatureDate })}
        />
      </PrintSettingsCard>
      <PrintSettingsCard
        title="Office Use"
        icon={GlobalIcons.building}
        action={
          <PrintSettingsResetButton
            title="Office Use"
            onReset={() =>
              update('content', {
                showOfficeUse: false,
                officePlacement: 'last',
                documentChecks: true,
                remarks: true,
                verificationDate: true,
                stamp: true,
              })
            }
          />
        }
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
      </PrintSettingsCard>
      <PrintSettingsCard
        title="Filled Copies"
        icon={GlobalIcons.copy}
        action={
          <PrintSettingsResetButton
            title="Filled Copies"
            onReset={() => update('copies', { unanswered: 'blank', selectedChoices: 'label' })}
          />
        }
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
      </PrintSettingsCard>
    </PrintSettingsCards>
  );
}
