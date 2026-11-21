import type { AdmissionFormPrintSettings } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionPrintAcademicDetails } from 'src/redux/student/admissions/admission-form-print-settings';

import { useId, useState, useCallback } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import PdfPreview from 'src/components/preview-document/pdf-preview';
import { resolveAdmissionPrintAdvancedSettings } from 'src/redux/student/admissions/admission-form-print-settings';
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
import { getAdmissionPrintSampleAnswers } from './form-print-sample';
import { AdmissionPrintSettingsPanel } from './admission-print-settings';
import { useAdmissionPrintOptions } from './use-admission-print-options';
import { getAdmissionLanguageLabel } from '../form-dialog/form-languages';
import { getAdmissionFormStepGroups } from '../form-dialog/form-step-groups';
import { buildAdmissionPrintDocument, DEFAULT_ADMISSION_PRINT_SETTINGS } from './form-print-model';
import { AdmissionPrintBrandingEditor } from './admission-print-branding-editor';
import { AdmissionPrintAdvancedSettings } from './admission-print-advanced-settings';
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
  academicDetails?: AdmissionPrintAcademicDetails;
  sampleDetails?: boolean;
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
  academicDetails,
  sampleDetails = false,
  readOnly = false,
}: AdmissionFormPrintWorkspaceProps) {
  const effectiveSettings = {
    ...DEFAULT_ADMISSION_PRINT_SETTINGS,
    ...(settings ?? form.printSettings),
  };
  const [mode, setMode] = useState(initialMode);
  const [settingsView, setSettingsView] = useState<'basic' | 'advanced'>('basic');
  const [editingBranding, setEditingBranding] = useState(false);
  const [previewPages, setPreviewPages] = useState<{ context: string; count: number }>();
  const brandingEditorId = useId();
  const revealBrandingEditor = useCallback((node: HTMLDivElement | null) => {
    node?.scrollIntoView?.({ block: 'nearest' });
  }, []);
  const [selectedLanguage, setLanguage] = useState(form.defaultLanguage ?? 'en');
  const languages = form.supportedLanguages?.length
    ? form.supportedLanguages
    : [form.defaultLanguage ?? 'en'];
  const language = languages.includes(selectedLanguage)
    ? selectedLanguage
    : (form.defaultLanguage ?? languages[0]);
  const [step, setStep] = useState('all');
  const advanced = resolveAdmissionPrintAdvancedSettings(effectiveSettings.advanced);
  const brand = useSchoolPrintBranding(
    effectiveSettings.showSchoolHeader ||
      (advanced.footer.placement !== 'none' && advanced.footer.schoolName),
    effectiveSettings.showSchoolHeader
  );
  const usingSample = sampleDetails && mode === 'filled';
  const savedValues = usingSample
    ? getAdmissionPrintSampleAnswers(form.sections)
    : Object.fromEntries(values.map((value) => [value.fieldCode, value.valueJson ?? '']));
  const contextValues = Object.fromEntries(
    inquiryContextValues.map((value) => [value.fieldCode, value.valueJson ?? ''])
  );
  const definition = { ...form, sections: [...inquiryContextSections, ...form.sections] };
  const modelInput = {
    definition: form,
    values: savedValues,
    inquiryContextSections,
    inquiryContextValues: contextValues,
    mode,
    language,
    stepKey: step === 'all' ? undefined : step,
    settings: effectiveSettings,
    registrationNumber: usingSample ? 'SAMPLE-001' : registrationNumber,
    academicDetails,
  };
  const printable = buildAdmissionPrintDocument(modelInput);
  const choices = useAdmissionPrintOptions(
    definition,
    { ...contextValues, ...savedValues },
    mode === 'filled' && !usingSample,
    academicYearId,
    printable.steps.flatMap((item) =>
      item.sections.flatMap((section) =>
        section.entries.flatMap((entry) => entry.fields.map((field) => field.code))
      )
    )
  );
  const model = buildAdmissionPrintDocument({
    ...modelInput,
    choiceLabels: choices.labels,
  });
  const hasFields = model.steps.some((item) =>
    item.sections.some((section) => section.entries.some((entry) => entry.fields.length))
  );
  const canEdit = Boolean(onSettingsChange && !readOnly);
  const previewContext = JSON.stringify([mode, language, step]);
  const updatePreviewPageCount = useCallback(
    (count: number) => setPreviewPages({ context: previewContext, count }),
    [previewContext]
  );
  const preview = useAdmissionPrintPreview(
    model,
    brand.branding,
    hasFields && !brand.loading && !brand.error && !choices.loading && !choices.error,
    canEdit ? 180 : 0,
    canEdit && hasFields ? previewContext : undefined
  );
  const busy = brand.loading || choices.loading || preview.loading;
  const error = brand.error || choices.error || preview.error;
  const steps = getAdmissionFormStepGroups(definition.sections);
  const brandingSettings = advanced.branding;
  const canEditBranding =
    canEdit &&
    effectiveSettings.showSchoolHeader &&
    Boolean(
      (brandingSettings.showLogo && brand.branding.logoUrl) ||
      (brandingSettings.showBanner && brand.branding.bannerUrl)
    );
  const showBrandingEditor = canEditBranding && editingBranding;
  const previewUrl = hasFields ? preview.previewUrl ?? (!busy && !error ? preview.url : undefined) : undefined;
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ p: { xs: 1, sm: 2 }, flex: 1, minHeight: 0, height: 1, overflow: 'hidden', width: 1 }}
    >
      {onSettingsChange && !readOnly && (
        <Stack
          spacing={1}
          sx={{
            width: { xs: 1, md: settingsView === 'advanced' ? '56%' : 300 },
            maxHeight: { xs: '44%', md: 'none' },
            flexShrink: 0,
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
            justifyContent="space-between"
          >
            <Typography variant="subtitle1">Print Layout</Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              aria-label="Print layout settings"
              value={settingsView}
              onChange={(_, next: typeof settingsView | null) => {
                if (next) setSettingsView(next);
              }}
            >
              <ToggleButton value="basic">Basic</ToggleButton>
              <ToggleButton value="advanced">Advanced</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <Scrollbar sx={{ minHeight: 0, pr: 0.5 }}>
            {settingsView === 'advanced' ? (
              <AdmissionPrintAdvancedSettings
                settings={effectiveSettings}
                onChange={onSettingsChange}
                form={definition}
                branding={brand.branding}
              />
            ) : (
              <AdmissionPrintSettingsPanel
                settings={effectiveSettings}
                onChange={onSettingsChange}
                branding={brand.branding}
                defaultLanguage={form.defaultLanguage}
                pageCount={previewPages?.context === previewContext ? previewPages.count : undefined}
              />
            )}
          </Scrollbar>
        </Stack>
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
          {canEditBranding && (
            <Button
              size="small"
              variant="outlined"
              aria-pressed={showBrandingEditor}
              aria-controls={showBrandingEditor ? brandingEditorId : undefined}
              startIcon={<Iconify icon={GlobalIcons.image} />}
              onClick={() => setEditingBranding((value) => !value)}
            >
              {showBrandingEditor ? 'Done editing branding' : 'Edit branding'}
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            disabled={!preview.url || busy || error}
            startIcon={<Iconify icon={GlobalIcons.download} />}
            onClick={() =>
              preview.url &&
              downloadAdmissionForm(preview.url, `${form.name}-${usingSample ? 'sample' : mode}`)
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
        {usingSample && (
          <Typography variant="caption" color="text.secondary">
            Sample answers are used for this preview and its printout.
          </Typography>
        )}
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
            {preview.errorMessage ?? 'Unable to prepare the print preview. Your form has not changed.'}
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
        {busy && !previewUrl && (
          <Stack direction="row" spacing={1} alignItems="center" role="status">
            <CircularProgress size={20} />
            <Typography variant="body2">Preparing printable form…</Typography>
          </Stack>
        )}
        <Scrollbar
          sx={{ flex: 1, minHeight: 180, bgcolor: 'background.neutral', borderRadius: 1.5 }}
        >
          <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 850, mx: 'auto' }}>
            {showBrandingEditor && onSettingsChange && (
              <Box id={brandingEditorId} ref={revealBrandingEditor} sx={{ mb: 2 }}>
                <AdmissionPrintBrandingEditor
                  settings={effectiveSettings}
                  branding={brand.branding}
                  onChange={onSettingsChange}
                />
              </Box>
            )}
            {previewUrl && (
              <PdfPreview
                key={previewContext}
                url={previewUrl}
                title={form.name}
                usePageSelector
                preservePageOnUpdate={canEdit}
                onPageCountChange={canEdit ? updatePreviewPageCount : undefined}
              />
            )}
          </Box>
        </Scrollbar>
      </Stack>
    </Stack>
  );
}
