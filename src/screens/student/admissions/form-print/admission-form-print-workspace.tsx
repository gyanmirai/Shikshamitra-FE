import type { AdmissionFormPrintSettings } from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import PdfPreview from 'src/components/preview-document/pdf-preview';
import {
  Box,
  Stack,
  Alert,
  Button,
  Typography,
  ToggleButton,
  CircularProgress,
  ToggleButtonGroup,
} from '@mui/material';

import { useSchoolPrintBranding } from './use-school-print-branding';
import { AdmissionPrintSettingsPanel } from './admission-print-settings';
import { useAdmissionPrintOptions } from './use-admission-print-options';
import { getAdmissionLanguageLabel } from '../form-dialog/form-languages';
import { getAdmissionFormStepGroups } from '../form-dialog/form-step-groups';
import { buildAdmissionPrintDocument, DEFAULT_ADMISSION_PRINT_SETTINGS } from './form-print-model';
import {
  printAdmissionForm,
  downloadAdmissionForm,
  useAdmissionPrintPreview,
} from './use-admission-print-preview';

import type { AdmissionPrintDefinition } from './form-print-model';

export type AdmissionFormPrintWorkspaceProps = {
  form: AdmissionPrintDefinition;
  settings?: AdmissionFormPrintSettings | null;
  onSettingsChange?: (settings: AdmissionFormPrintSettings) => void;
  initialMode?: 'blank' | 'filled';
  values?: { fieldCode: string; valueJson?: string | null }[];
  inquiryContextSections?: AdmissionPrintDefinition['sections'];
  inquiryContextValues?: { fieldCode: string; valueJson?: string | null }[];
  currentStepId?: string | null;
  academicYearId?: string;
  registrationNumber?: string;
  readOnly?: boolean;
};

export function AdmissionFormPrintWorkspace({
  form,
  settings,
  onSettingsChange,
  initialMode = 'blank',
  values = [],
  inquiryContextSections = [],
  inquiryContextValues = [],
  currentStepId,
  academicYearId,
  registrationNumber,
  readOnly = false,
}: AdmissionFormPrintWorkspaceProps) {
  const effectiveSettings = {
    ...DEFAULT_ADMISSION_PRINT_SETTINGS,
    ...(settings ?? form.printSettings),
  };
  const [mode, setMode] = useState(initialMode);
  const [selectedLanguage, setLanguage] = useState(form.defaultLanguage ?? 'en');
  const languages = form.supportedLanguages?.length
    ? form.supportedLanguages
    : [form.defaultLanguage ?? 'en'];
  const language = languages.includes(selectedLanguage)
    ? selectedLanguage
    : (form.defaultLanguage ?? languages[0]);
  const [step, setStep] = useState('all');
  const brand = useSchoolPrintBranding(effectiveSettings.showSchoolHeader);
  const savedValues = Object.fromEntries(
    values.map((value) => [value.fieldCode, value.valueJson ?? ''])
  );
  const contextValues = Object.fromEntries(
    inquiryContextValues.map((value) => [value.fieldCode, value.valueJson ?? ''])
  );
  const definition = { ...form, sections: [...inquiryContextSections, ...form.sections] };
  const printable = buildAdmissionPrintDocument({
    definition: form,
    values: savedValues,
    inquiryContextSections,
    inquiryContextValues: contextValues,
    mode,
    language,
    stepKey: step === 'all' ? undefined : step,
    settings: effectiveSettings,
    registrationNumber,
  });
  const choices = useAdmissionPrintOptions(
    definition,
    { ...contextValues, ...savedValues },
    mode === 'filled',
    academicYearId,
    printable.steps.flatMap((item) =>
      item.sections.flatMap((section) =>
        section.entries.flatMap((entry) => entry.fields.map((field) => field.code))
      )
    )
  );
  const model = buildAdmissionPrintDocument({
    definition: form,
    values: savedValues,
    inquiryContextSections,
    inquiryContextValues: contextValues,
    mode,
    language,
    stepKey: step === 'all' ? undefined : step,
    settings: effectiveSettings,
    choiceLabels: choices.labels,
    registrationNumber,
  });
  const hasFields = model.steps.some((item) =>
    item.sections.some((section) => section.entries.some((entry) => entry.fields.length))
  );
  const preview = useAdmissionPrintPreview(
    model,
    brand.branding,
    hasFields && !brand.loading && !brand.error && !choices.loading && !choices.error
  );
  const busy = brand.loading || choices.loading || preview.loading;
  const error = brand.error || choices.error || preview.error;
  const steps = getAdmissionFormStepGroups(definition.sections);
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ p: { xs: 1, sm: 2 }, flex: 1, minHeight: 0, height: 1, overflow: 'hidden', width: 1 }}
    >
      {onSettingsChange && !readOnly && (
        <Scrollbar
          sx={{
            width: { xs: 1, md: 290 },
            maxHeight: { xs: 300, md: 'none' },
            flexShrink: 0,
            flexGrow: 0,
          }}
        >
          <AdmissionPrintSettingsPanel
            settings={effectiveSettings}
            onChange={onSettingsChange}
            branding={brand.branding}
          />
        </Scrollbar>
      )}
      <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle1" sx={{ mr: 'auto' }}>
            Print Preview
          </Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={mode}
            onChange={(_, value) => {
              if (value) setMode(value);
            }}
            aria-label="Print content"
          >
            <ToggleButton value="blank">Blank form</ToggleButton>
            <ToggleButton value="filled">With details</ToggleButton>
          </ToggleButtonGroup>
          <CustomSelect
            size="small"
            label="Form language"
            value={language}
            options={languages.map((value) => ({ value, label: getAdmissionLanguageLabel(value) }))}
            onChange={(value) => setLanguage(String(value))}
            formControlProps={{ sx: { width: { xs: 1, sm: 160 }, flexShrink: 0 } }}
          />
          {steps.length > 1 && (
            <CustomSelect
              size="small"
              label="Print scope"
              value={step}
              options={[
                { value: 'all', label: 'Full form' },
                ...steps.map((item) => ({
                  value: item.id,
                  label: item.id === currentStepId ? `Current step: ${item.name}` : item.name,
                })),
              ]}
              onChange={(value) => setStep(String(value))}
              formControlProps={{ sx: { width: { xs: 1, sm: 200 }, flexShrink: 0 } }}
            />
          )}
          <Button
            size="small"
            variant="outlined"
            disabled={!preview.url || busy || error}
            startIcon={<Iconify icon={GlobalIcons.download} />}
            onClick={() =>
              preview.url && downloadAdmissionForm(preview.url, `${form.name}-${mode}`)
            }
          >
            Download PDF
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={!preview.url || busy || error}
            startIcon={<Iconify icon={GlobalIcons.printer} />}
            onClick={() => preview.url && printAdmissionForm(preview.url)}
          >
            Print
          </Button>
        </Stack>
        {error && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                onClick={() => {
                  if (brand.error) brand.retry();
                  if (choices.error) choices.retry();
                  if (preview.error) preview.retry();
                }}
              >
                Retry
              </Button>
            }
          >
            Unable to prepare the print preview. Your form has not changed.
          </Alert>
        )}
        {choices.unavailable && (
          <Alert severity="warning">
            Some selected choices are unavailable with your current access. They are marked
            Unavailable in the PDF.
          </Alert>
        )}
        {!hasFields && (
          <Alert severity="info">There are no printable questions in this selection.</Alert>
        )}
        {busy && (
          <Stack direction="row" spacing={1} alignItems="center" role="status">
            <CircularProgress size={20} />
            <Typography variant="body2">Preparing printable form…</Typography>
          </Stack>
        )}
        <Scrollbar
          sx={{ flex: 1, minHeight: 180, bgcolor: 'background.neutral', borderRadius: 1.5 }}
        >
          <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 850, mx: 'auto' }}>
            {preview.url && !busy && !error && <PdfPreview url={preview.url} title={form.name} />}
          </Box>
        </Scrollbar>
      </Stack>
    </Stack>
  );
}
