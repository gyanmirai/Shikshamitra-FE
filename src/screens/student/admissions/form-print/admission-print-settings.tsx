import type { AdmissionPrintAdvancedSettings } from 'src/redux/student/admissions/admission-form-print-settings';

import { useId } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import {
  Box,
  Stack,
  Radio,
  Button,
  Switch,
  RadioGroup,
  Typography,
  FormControlLabel,
} from '@mui/material';
import {
  resolveAdmissionPrintAdvancedSettings,
  resolveEditableRegistrationPrintTemplate,
} from 'src/redux/student/admissions/admission-form-print-settings';

import { PrintInstructionsListEditor } from './print-instructions-list-editor';
import {
  PrintSettingsCard,
  PrintSettingsCards,
  PrintSettingSelect,
} from './admission-print-setting-controls';

import type { AdmissionPrintSettings, AdmissionPrintBranding } from './form-print-model';

export function AdmissionPrintSettingsPanel({
  settings,
  onChange,
  branding,
  defaultLanguage = 'en',
  pageCount,
  hasPhotoField = false,
  onEditHeader,
}: {
  settings: AdmissionPrintSettings;
  onChange: (settings: AdmissionPrintSettings) => void;
  branding: AdmissionPrintBranding;
  defaultLanguage?: string;
  pageCount?: number;
  hasPhotoField?: boolean;
  onEditHeader?: () => void;
}) {
  const bannerPagesId = useId();
  const selectedTemplate = resolveEditableRegistrationPrintTemplate(settings.template);
  const advanced = resolveAdmissionPrintAdvancedSettings(settings.advanced);
  const { bannerPlacement, bannerPages, showBanner } = advanced.branding;
  const pageNumbers = [
    ...new Set([
      ...Array.from({ length: pageCount ?? 1 }, (_, index) => index + 1),
      ...bannerPages,
    ]),
  ].sort((left, right) => left - right);
  const update = <K extends keyof AdmissionPrintAdvancedSettings>(
    key: K,
    value: NonNullable<AdmissionPrintAdvancedSettings[K]>
  ) =>
    onChange({
      ...settings,
      advanced: {
        ...settings.advanced,
        [key]: { ...settings.advanced?.[key], ...value },
      },
    });

  return (
    <PrintSettingsCards>
      <PrintSettingsCard
        title="Template & Spacing"
        icon={GlobalIcons.stationaryIcon}
        descriptionTooltip="Choose the template, handwriting space, colours and page border for the printed form."
        defaultExpanded
      >
        <RadioGroup
          aria-label="Print template"
          value={selectedTemplate}
          onChange={(_, template) =>
            onChange({ ...settings, template: template as AdmissionPrintSettings['template'] })
          }
          sx={{ gap: 1 }}
        >
          {(
            [
              ['boxed-grid', 'Boxed Grid'],
              ['structured-classic', 'Structured Classic'],
            ] as const
          ).map(([template, title]) => (
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
                alignItems: 'flex-start',
                border: 1,
                borderRadius: 1,
                borderColor: selectedTemplate === template ? 'primary.main' : 'divider',
                bgcolor: selectedTemplate === template ? 'action.selected' : undefined,
                '& .MuiFormControlLabel-label': { minWidth: 0, flex: 1 },
              }}
            />
          ))}
        </RadioGroup>
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
        <CustomSelect
          label="Print palette"
          size="small"
          value={advanced.style.palette}
          options={[
            { label: 'School blue', value: 'school-blue' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Forest green', value: 'forest-green' },
            { label: 'Black & white', value: 'monochrome' },
          ]}
          onChange={(value) =>
            update('style', {
              palette: value as typeof advanced.style.palette,
              sectionFill: undefined,
              borderColor: undefined,
              textColor: undefined,
            })
          }
        />
        <FormControlLabel
          label="Full-page border"
          control={
            <Switch
              checked={advanced.border.enabled}
              onChange={(_, enabled) => update('border', { enabled })}
            />
          }
        />
      </PrintSettingsCard>
      <PrintSettingsCard
        title="School Branding"
        icon={GlobalIcons.building}
        descriptionTooltip="Choose how the school logo and banner from Institute Setup appear on paper."
      >
        <FormControlLabel
          label="School header"
          control={
            <Switch
              checked={settings.showSchoolHeader}
              onChange={(_, checked) => onChange({ ...settings, showSchoolHeader: checked })}
            />
          }
        />
        {settings.showSchoolHeader && !branding.bannerUrl && !branding.logoUrl && (
          <Typography variant="caption" color="text.secondary">
            No school logo or banner is configured in Institute Setup.
          </Typography>
        )}
        {settings.showSchoolHeader && (
          <>
            {(branding.bannerUrl || branding.logoUrl) && (
              <>
                {(
                  [
                    { asset: 'logo', label: 'Logo', flag: 'showLogo' },
                    { asset: 'banner', label: 'Banner', flag: 'showBanner' },
                  ] as const
                ).map(({ asset, label, flag }) => (
                  <FormControlLabel
                    key={asset}
                    label={label}
                    control={
                      <Switch
                        size="small"
                        checked={Boolean(branding[`${asset}Url`] && advanced.branding[flag])}
                        disabled={!branding[`${asset}Url`]}
                        onChange={(_, value) => update('branding', { [flag]: value })}
                      />
                    }
                  />
                ))}
              </>
            )}
            <CustomSelect
              label="Header on later pages"
              size="small"
              value={advanced.header.continuation}
              options={[
                { label: 'Compact', value: 'compact' },
                { label: 'Full', value: 'full' },
                { label: 'None', value: 'none' },
              ]}
              onChange={(value) =>
                update('header', { continuation: value as typeof advanced.header.continuation })
              }
            />
            <PrintSettingSelect
              label="Banner pages"
              value={bannerPlacement}
              disabled={!showBanner}
              options={[
                ['first', 'First page'],
                ['every', 'Every page'],
                ['selected', 'Selected pages'],
              ]}
              onChange={(placement) =>
                update('branding', {
                  bannerPlacement: placement,
                  ...(placement === 'selected' ? { bannerPages } : {}),
                })
              }
            />
            {bannerPlacement === 'selected' && (
              <CustomSelect
                name={bannerPagesId}
                label="Pages with banner"
                size="small"
                fullWidth
                multiple
                disabled={!showBanner}
                disabledValues={bannerPages.length === 1 ? bannerPages : undefined}
                value={bannerPages}
                options={pageNumbers.map((page) => ({ value: page, label: `Page ${page}` }))}
                onChange={(pages) => {
                  if (pages.length) {
                    update('branding', {
                      bannerPages: pages.map(Number).sort((left, right) => left - right),
                    });
                  }
                }}
                helperText="Choose at least one page of the printed copy."
              />
            )}
          </>
        )}
        {onEditHeader && (
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.edit} />}
            onClick={onEditHeader}
          >
            Edit header
          </Button>
        )}
      </PrintSettingsCard>
      <PrintSettingsCard
        title="Photo & Signature"
        icon={GlobalIcons.image}
        descriptionTooltip="Choose whether the printed form includes a photo space and signature area."
      >
        <FormControlLabel
          label="Photo space"
          control={
            <Switch
              checked={hasPhotoField && settings.showPhoto}
              disabled={!hasPhotoField}
              onChange={(_, checked) => onChange({ ...settings, showPhoto: checked })}
            />
          }
        />
        {!hasPhotoField && (
          <Typography variant="caption" color="text.secondary">
            Add a photo question in Build form to print a photo space.
          </Typography>
        )}
        <FormControlLabel
          label="Signature area"
          control={
            <Switch
              checked={settings.showSignature}
              onChange={(_, checked) => onChange({ ...settings, showSignature: checked })}
            />
          }
        />
      </PrintSettingsCard>
      <PrintSettingsCard
        title="Writing Instructions"
        icon={GlobalIcons.info}
        descriptionTooltip="Add instructions for anyone filling in the paper form."
      >
        <FormControlLabel
          label="Print writing instructions"
          control={
            <Switch
              checked={advanced.content.showInstructions}
              onChange={(_, showInstructions) => update('content', { showInstructions })}
            />
          }
        />
        {advanced.content.showInstructions && (
          <PrintInstructionsListEditor
            value={advanced.content.translations[defaultLanguage]?.instructions ?? ''}
            onChange={(instructions) =>
              update('content', {
                translations: {
                  ...advanced.content.translations,
                  [defaultLanguage]: {
                    ...advanced.content.translations[defaultLanguage],
                    instructions,
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
