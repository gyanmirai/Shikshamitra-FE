import type { AdmissionFormPrintSettings } from 'src/redux/student/admissions/admission-forms-api';
import type { PdfPreviewReveal } from 'src/components/preview-document/pdf-preview/find-pdf-preview-target';
import type { AdmissionPrintAcademicDetails } from 'src/redux/student/admissions/admission-form-print-settings';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { useId, useRef, useState, useCallback } from 'react';
import { FormBusyRegion } from 'src/components/form-busy-region';
import PdfPreview from 'src/components/preview-document/pdf-preview';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { resolveAdmissionPrintAdvancedSettings } from 'src/redux/student/admissions/admission-form-print-settings';
import {
  Box,
  Stack,
  Alert,
  Button,
  Typography,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { useSchoolPrintBranding } from './use-school-print-branding';
import { getAdmissionPrintSampleAnswers } from './form-print-sample';
import { AdmissionPrintSettingsPanel } from './admission-print-settings';
import { useAdmissionPrintOptions } from './use-admission-print-options';
import { getAdmissionLanguageLabel } from '../form-dialog/form-languages';
import { getAdmissionFormStepGroups } from '../form-dialog/form-step-groups';
import { AdmissionPrintHeaderEditor } from './admission-print-header-editor';
import { getAdmissionPrintPreviewTarget } from './admission-print-preview-target';
import { AdmissionPrintAdvancedSettings } from './admission-print-advanced-settings';
import {
  printAdmissionForm,
  downloadAdmissionForm,
  useAdmissionPrintPreview,
} from './use-admission-print-preview';
import {
  buildAdmissionPrintDocument,
  hasAdmissionPrintPhotoField,
  DEFAULT_ADMISSION_PRINT_SETTINGS,
} from './form-print-model';

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
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [settingsView, setSettingsView] = useState<'basic' | 'advanced'>('basic');
  const [editingHeader, setEditingHeader] = useState(false);
  const optionsPopover = usePopover();
  const [previewPages, setPreviewPages] = useState<{ context: string; count: number }>();
  const [previewChange, setPreviewChange] = useState<
    (PdfPreviewReveal & { context: string; settingsKey: string }) | undefined
  >();
  const [shownChange, setShownChange] = useState<{ id: number; page?: number }>();
  const changeId = useRef(0);
  const previewScroller = useRef<HTMLDivElement>(null);
  const settingsTrigger = useRef<HTMLButtonElement>(null);
  const headerTrigger = useRef<HTMLElement | null>(null);
  const settingsTitleId = useId();
  const settingsId = useId();
  const previewOptionsId = useId();
  const headerEditorId = useId();
  const revealHeaderEditor = useCallback((node: HTMLButtonElement | null) => {
    node?.scrollIntoView?.({ block: 'nearest' });
    node?.focus({ preventScroll: true });
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
  const inLayoutEditor = Boolean(onSettingsChange);
  const canEdit = inLayoutEditor && !readOnly;
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
  const currentChange =
    previewChange?.context === previewContext &&
    previewChange.settingsKey === JSON.stringify(effectiveSettings) &&
    hasFields
      ? previewChange
      : undefined;
  const revealResult = shownChange?.id === currentChange?.id ? shownChange : undefined;
  const revealedPage = revealResult?.page;
  const handleSettingsChange = (next: AdmissionFormPrintSettings) => {
    const change = getAdmissionPrintPreviewTarget(model, effectiveSettings, next);
    setPreviewChange(
      change
        ? {
            ...change,
            id: (changeId.current += 1),
            context: previewContext,
            settingsKey: JSON.stringify(next),
          }
        : undefined
    );
    onSettingsChange?.(next);
  };
  const clearPreviewChange = useCallback(() => {
    changeId.current += 1;
    setPreviewChange(undefined);
  }, []);
  const onReveal = useCallback((id: number, page?: number, marker?: HTMLDivElement | null) => {
    if (id !== changeId.current) return;
    setShownChange({ id, page });
    const scroller = previewScroller.current;
    if (!marker || !scroller) return;
    const viewport = scroller.getBoundingClientRect();
    const target = marker.getBoundingClientRect();
    scroller.scrollTo({
      top: Math.max(0, scroller.scrollTop + target.top - viewport.top - viewport.height * 0.25),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, []);
  const steps = getAdmissionFormStepGroups(definition.sections);
  const showHeaderEditor = canEdit && editingHeader;
  const previewUrl = hasFields
    ? (preview.previewUrl ?? (!busy && !error ? preview.url : undefined))
    : undefined;
  const updatingPreview = hasFields && !error && (busy || Boolean(currentChange && !revealResult));
  const showSettings = canEdit && settingsOpen;
  const outputDisabled = !preview.url || busy || error || !hasFields;
  const download = () => {
    if (!outputDisabled && preview.url) {
      downloadAdmissionForm(preview.url, `${form.name}-${usingSample ? 'sample' : mode}`);
    }
  };
  const updateMode = (next: typeof mode) => {
    clearPreviewChange();
    setMode(next);
  };
  const openHeaderEditor = () => {
    if (!editingHeader) {
      headerTrigger.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setEditingHeader(true);
    }
  };
  const closeHeaderEditor = () => {
    setEditingHeader(false);
    const trigger = headerTrigger.current;
    if (showSettings && trigger?.isConnected) trigger.focus();
    else settingsTrigger.current?.focus();
  };
  const previewOptions = (
    <>
      <CustomSelect
        size="small"
        label="Form language"
        value={language}
        options={languages.map((value) => ({ value, label: getAdmissionLanguageLabel(value) }))}
        onChange={(value) => {
          clearPreviewChange();
          setLanguage(String(value));
        }}
        formControlProps={{ sx: { width: { xs: 1, sm: canEdit ? 1 : 160 }, flexShrink: 0 } }}
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
          onChange={(value) => {
            clearPreviewChange();
            setStep(String(value));
          }}
          formControlProps={{ sx: { width: { xs: 1, sm: canEdit ? 1 : 200 }, flexShrink: 0 } }}
        />
      )}
    </>
  );

  return (
    <Box
      sx={{
        display: 'grid',
        flex: 1,
        minHeight: 0,
        height: 1,
        width: 1,
        overflow: 'hidden',
        p: { xs: 1, sm: inLayoutEditor ? 1 : 2 },
        gap: { xs: 1, sm: inLayoutEditor ? 1 : 1.5 },
        gridTemplateAreas: showSettings
          ? { xs: '"toolbar" "settings" "preview"', md: '"toolbar toolbar" "preview settings"' }
          : '"toolbar" "preview"',
        gridTemplateRows: showSettings
          ? { xs: 'auto minmax(0, 0.9fr) minmax(0, 1fr)', md: 'auto minmax(0, 1fr)' }
          : 'auto minmax(0, 1fr)',
        gridTemplateColumns: showSettings
          ? {
              xs: 'minmax(0, 1fr)',
              md: `minmax(0, 1fr) ${settingsView === 'advanced' ? 'clamp(360px, 40%, 520px)' : '336px'}`,
            }
          : 'minmax(0, 1fr)',
      }}
    >
      <Stack
        direction="row"
        gap={1}
        alignItems="center"
        flexWrap="wrap"
        sx={{
          gridArea: 'toolbar',
          minWidth: 0,
          ...(inLayoutEditor && {
            px: 1,
            py: 0.5,
            columnGap: { xs: 0.5, sm: 1 },
            rowGap: 0.5,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1.5,
            bgcolor: 'background.paper',
          }),
        }}
      >
        <Typography variant="subtitle1" sx={{ mr: canEdit ? 0.5 : 'auto' }}>
          Print Preview
        </Typography>
        {canEdit ? (
          <>
            <CustomSelect
              label="Print content"
              size="small"
              value={mode}
              options={[
                { value: 'blank', label: 'Blank form' },
                { value: 'filled', label: 'With details' },
              ]}
              onChange={(value) => updateMode(value === 'filled' ? 'filled' : 'blank')}
              formControlProps={{ sx: { width: { xs: 116, sm: 132 }, flexShrink: 0 } }}
            />
            <Button
              size="small"
              color="inherit"
              endIcon={<Iconify icon={GlobalIcons.expandMore} />}
              aria-haspopup="dialog"
              aria-expanded={optionsPopover.open}
              aria-controls={optionsPopover.open ? previewOptionsId : undefined}
              onClick={optionsPopover.onOpen}
            >
              Preview options
            </Button>
            <CustomPopover
              open={optionsPopover.open}
              anchorEl={optionsPopover.anchorEl}
              onClose={optionsPopover.onClose}
              slotProps={{
                arrow: { placement: 'top-left' },
                paper: { id: previewOptionsId, role: 'dialog', 'aria-label': 'Preview options' },
              }}
            >
              <Stack gap={2} sx={{ p: 2, width: 252, maxWidth: 'calc(100vw - 32px)' }}>
                {previewOptions}
              </Stack>
            </CustomPopover>
          </>
        ) : (
          <>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={mode}
              onChange={(_, value: typeof mode | null) => {
                if (value) updateMode(value);
              }}
              aria-label="Print content"
            >
              <ToggleButton value="blank">Blank form</ToggleButton>
              <ToggleButton value="filled">With details</ToggleButton>
            </ToggleButtonGroup>
            {previewOptions}
          </>
        )}
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          gap={0.75}
          sx={{ ml: 'auto', minWidth: 0 }}
        >
          {!canEdit && (
            <Button
              size="small"
              variant="outlined"
              disabled={outputDisabled}
              startIcon={<Iconify icon={GlobalIcons.download} />}
              onClick={download}
            >
              Download PDF
            </Button>
          )}
          <Button
            size="small"
            variant={canEdit ? 'outlined' : 'contained'}
            color={canEdit ? 'inherit' : 'primary'}
            disabled={outputDisabled}
            startIcon={<Iconify icon={GlobalIcons.printer} />}
            onClick={() => preview.url && printAdmissionForm(preview.url)}
          >
            Print
          </Button>
          {canEdit && (
            <>
              <Button
                ref={settingsTrigger}
                size="small"
                variant={showSettings ? 'soft' : 'outlined'}
                color="inherit"
                startIcon={<Iconify icon="solar:settings-linear" />}
                aria-expanded={showSettings}
                aria-controls={settingsId}
                onClick={() => setSettingsOpen((open) => !open)}
              >
                Layout settings
              </Button>
              <CustomTooltip title="Download PDF">
                <span>
                  <IconButton
                    aria-label="Download PDF"
                    size="small"
                    disabled={outputDisabled}
                    onClick={download}
                    sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 0.75 }}
                  >
                    <Iconify icon={GlobalIcons.download} width={18} />
                  </IconButton>
                </span>
              </CustomTooltip>
            </>
          )}
        </Stack>
      </Stack>
      {canEdit && (
        <Stack
          component="aside"
          id={settingsId}
          aria-labelledby={settingsTitleId}
          sx={{
            display: showSettings ? 'flex' : 'none',
            gridArea: 'settings',
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1.5,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            gap={0.5}
            sx={{ px: 1.5, py: 0.75, flexShrink: 0 }}
          >
            <Typography id={settingsTitleId} variant="subtitle1" sx={{ flex: 1, minWidth: 0 }}>
              Layout Settings
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              aria-label="Print layout settings"
              value={settingsView}
              onChange={(_, next: typeof settingsView | null) => {
                if (next) setSettingsView(next);
              }}
              sx={{ flexShrink: 0 }}
            >
              <ToggleButton value="basic">Basic</ToggleButton>
              <ToggleButton value="advanced">Advanced</ToggleButton>
            </ToggleButtonGroup>
            <IconButton
              aria-label="Close layout settings"
              sx={{ flexShrink: 0 }}
              onClick={() => {
                setSettingsOpen(false);
                settingsTrigger.current?.focus();
              }}
            >
              <Iconify icon="mingcute:close-line" width={18} />
            </IconButton>
          </Stack>
          <Scrollbar key={settingsView} sx={{ minHeight: 0, flex: 1 }}>
            <Box sx={{ px: 1.5, pb: 1.5 }}>
              {settingsView === 'advanced' ? (
                <AdmissionPrintAdvancedSettings
                  settings={effectiveSettings}
                  onChange={handleSettingsChange}
                  form={definition}
                  branding={brand.branding}
                  onEditHeader={openHeaderEditor}
                />
              ) : (
                <AdmissionPrintSettingsPanel
                  settings={effectiveSettings}
                  onChange={handleSettingsChange}
                  branding={brand.branding}
                  defaultLanguage={form.defaultLanguage}
                  hasPhotoField={hasAdmissionPrintPhotoField(definition.sections)}
                  onEditHeader={openHeaderEditor}
                  pageCount={
                    previewPages?.context === previewContext ? previewPages.count : undefined
                  }
                />
              )}
            </Box>
          </Scrollbar>
        </Stack>
      )}
      <Stack spacing={1} sx={{ gridArea: 'preview', minWidth: 0, minHeight: 0 }}>
        {usingSample && (
          <Typography variant="caption" color="text.secondary">
            Sample answers are used for this preview and its printout.
          </Typography>
        )}
        {canEdit && currentChange && !updatingPreview && !error && revealedPage && (
          <Stack direction="row" gap={0.75} alignItems="center" role="status">
            <Iconify icon="mdi:check-circle-outline" width={16} sx={{ color: 'success.main' }} />
            <Typography variant="caption" color="text.secondary">
              {`Preview updated · ${currentChange.label} · Page ${revealedPage}`}
            </Typography>
          </Stack>
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
            {preview.errorMessage ??
              'Unable to prepare the print preview. Your form has not changed.'}
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
        <FormBusyRegion
          busy={updatingPreview}
          label={
            previewUrl
              ? `Updating print preview…${currentChange ? ` ${currentChange.label}` : ''}`
              : 'Preparing printable form…'
          }
          blockInteraction={false}
          fillContent
          flattenFieldset
        >
          <Scrollbar
            ref={previewScroller}
            sx={{ flex: 1, minHeight: 0, bgcolor: 'background.neutral', borderRadius: 1.5 }}
          >
            <Box
              sx={{
                p: { xs: 1, sm: 2 },
                ...(inLayoutEditor && { pt: 1 }),
                maxWidth: 850,
                mx: 'auto',
              }}
            >
              {showHeaderEditor && (
                <Stack component="section" id={headerEditorId} gap={1} sx={{ mb: 2 }}>
                  <Button
                    ref={revealHeaderEditor}
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={closeHeaderEditor}
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    Done editing header
                  </Button>
                  <AdmissionPrintHeaderEditor
                    model={model}
                    branding={brand.branding}
                    onChange={handleSettingsChange}
                  />
                </Stack>
              )}
              {previewUrl && (
                <PdfPreview
                  key={previewContext}
                  url={previewUrl}
                  title={form.name}
                  usePageSelector
                  preservePageOnUpdate={canEdit}
                  onPageCountChange={canEdit ? updatePreviewPageCount : undefined}
                  reveal={!busy && !error && preview.url === previewUrl ? currentChange : undefined}
                  onReveal={canEdit ? onReveal : undefined}
                  onPageChange={canEdit ? clearPreviewChange : undefined}
                />
              )}
            </Box>
          </Scrollbar>
        </FormBusyRegion>
      </Stack>
    </Box>
  );
}
