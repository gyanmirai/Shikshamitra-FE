import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Radio, Switch, RadioGroup, Typography, FormControlLabel } from '@mui/material';

import type { AdmissionPrintSettings, AdmissionPrintBranding } from './form-print-model';

export function AdmissionPrintSettingsPanel({
  settings,
  onChange,
  branding,
}: {
  settings: AdmissionPrintSettings;
  onChange: (settings: AdmissionPrintSettings) => void;
  branding: AdmissionPrintBranding;
}) {
  return (
    <Stack spacing={2} sx={{ width: { xs: 1, md: 280 }, flexShrink: 0 }}>
      <FormSectionCard
        title="Print Template"
        descriptionTooltip="Choose the paper form style. This is saved with the form and used when printing from Registration or Pipeline."
      >
        <RadioGroup
          aria-label="Print template"
          value={settings.template ?? 'simple'}
          onChange={(_, template) =>
            onChange({ ...settings, template: template as AdmissionPrintSettings['template'] })
          }
          sx={{ gap: 1 }}
        >
          {(
            [
              ['boxed-grid', 'Boxed Grid', 'Bordered cells and character boxes for handwriting.'],
              [
                'structured-classic',
                'Structured Classic',
                'Framed sections with ruled writing space.',
              ],
            ] as const
          ).map(([template, title, description]) => (
            <FormControlLabel
              key={template}
              value={template}
              control={<Radio size="small" />}
              label={
                <Stack spacing={0.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TemplateThumbnail boxed={template === 'boxed-grid'} />
                    <Typography variant="subtitle2">{title}</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {description}
                  </Typography>
                </Stack>
              }
              sx={{
                m: 0,
                p: 1,
                alignItems: 'flex-start',
                border: 1,
                borderRadius: 1,
                borderColor: settings.template === template ? 'primary.main' : 'divider',
                bgcolor: settings.template === template ? 'action.selected' : undefined,
                '& .MuiFormControlLabel-label': { minWidth: 0, flex: 1 },
              }}
            />
          ))}
          <FormControlLabel
            value="simple"
            control={<Radio size="small" />}
            label="Simple (previous layout)"
            sx={{ m: 0 }}
          />
        </RadioGroup>
      </FormSectionCard>
      <FormSectionCard
        title="Print Spacing"
        descriptionTooltip="Compact uses less paper. Spacious leaves more room for handwriting in either template."
      >
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
      </FormSectionCard>
      <FormSectionCard
        title="School Branding"
        descriptionTooltip="The logo and banner come from Institute Setup. Printing does not change them."
      >
        {branding.bannerUrl || branding.logoUrl ? (
          <Box
            component="img"
            src={branding.bannerUrl || branding.logoUrl}
            alt="School branding from Institute Setup"
            sx={{
              maxHeight: 90,
              width: 1,
              objectFit: 'contain',
              bgcolor: 'common.white',
              borderRadius: 1,
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No school logo or banner configured.
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          From Institute Setup
        </Typography>
        <FormControlLabel
          label="School header"
          control={
            <Switch
              checked={settings.showSchoolHeader}
              onChange={(_, checked) => onChange({ ...settings, showSchoolHeader: checked })}
            />
          }
        />
      </FormSectionCard>
      <FormSectionCard
        title="Print Settings"
        descriptionTooltip="A4 portrait. Long forms continue onto additional pages automatically."
      >
        <Typography variant="body2">Paper size: A4</Typography>
        <FormControlLabel
          label="Photo space"
          control={
            <Switch
              checked={settings.showPhoto}
              onChange={(_, checked) => onChange({ ...settings, showPhoto: checked })}
            />
          }
        />
        <FormControlLabel
          label="Signature area"
          control={
            <Switch
              checked={settings.showSignature}
              onChange={(_, checked) => onChange({ ...settings, showSignature: checked })}
            />
          }
        />
      </FormSectionCard>
    </Stack>
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
