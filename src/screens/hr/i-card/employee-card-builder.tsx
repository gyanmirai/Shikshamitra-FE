'use client';

import type { EmployeeICardTemplate } from 'src/redux/hr/employee-icard-template-api';
import type { AcademicOrganizationSelectOption } from 'src/screens/hr/hooks/useAcademicOrganizationOptions';

import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import {
  IdentityCardDesigner,
  validateIdentityCardLayout,
  getIdentityCardSheetLayout,
} from 'src/components/identity-card-designer';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Alert,
  Button,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';
import {
  useUploadEmployeeICardAssetMutation,
  useDownloadEmployeeICardsPdfMutation,
  useCreateEmployeeICardTemplateMutation,
  useUpdateEmployeeICardTemplateMutation,
} from 'src/redux/hr/employee-icard-template-api';

import { extractDominantColor } from './employee-card-logo-color';
import { ReadinessBar } from './components/employee-card-readiness';
import { useEmployeeCardLogo } from './hooks/use-employee-card-logo';
import { EmployeePrintSummary } from './components/employee-print-summary';
import { useEmployeeCardSelection } from './hooks/use-employee-card-selection';
import { EmployeePreviewWorkspace } from './components/employee-preview-workspace';
import {
  employeeCardFields,
  getEmployeeCardPhotoUrl,
  getEmployeeCardPreviewValues,
} from './employee-card-values';
import {
  buildTemplateState,
  getEmployeeCardDesignPayload,
  getEmployeeCardDraftSignature,
} from './employee-builder-state';
import {
  isPdfBlob,
  canNavigateEmployeeICardStep,
  updateICardBuilderPaletteColor,
  markEmployeeICardStepCompleted,
  hasPersistedEmployeeICardTemplate,
} from './i-card-builder-utils';

import type { BuilderState } from './employee-builder-state';
import type { EmployeeICardRow } from './i-card-staff-columns';

const steps = ['Template', 'Designer', 'Review', 'Employee', 'Export'];

export const EmployeeICardBuilder = ({
  template,
  organizations,
  academicYearId,
  academicYearName,
  handleClose,
}: {
  template: EmployeeICardTemplate | null;
  organizations: AcademicOrganizationSelectOption[];
  academicYearId?: string;
  academicYearName?: string;
  handleClose: () => void;
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [draftAcademicYearId] = useState(academicYearId);
  const [draftAcademicYearName] = useState(academicYearName);
  const scopeChanged = draftAcademicYearId !== academicYearId;
  const [state, setState] = useState<BuilderState>(() =>
    buildTemplateState(template, academicYearName)
  );
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(template?.id ?? null);
  const isUpdateMode = hasPersistedEmployeeICardTemplate(template?.id, savedTemplateId);
  const [completedSteps, setCompletedSteps] = useState<number[]>(() =>
    template?.id ? steps.map((_, index) => index) : []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [exportPending, setExportPending] = useState(false);
  const [uploadPending, setUploadPending] = useState(false);
  const [baseline, setBaseline] = useState(() => getEmployeeCardDraftSignature(state));
  const savingRef = useRef(false);
  const router = useRouter();
  const navigation = useUnsavedNavigation(getEmployeeCardDraftSignature(state) !== baseline, {
    push: router.push,
    blockNavigation: isSaving || exportPending || uploadPending,
  });
  const logo = useEmployeeCardLogo(state);
  const designErrors = [
    ...validateIdentityCardLayout(state.layout, employeeCardFields),
    ...getIdentityCardSheetLayout(state.layout, state.printSettings).errors,
    ...(!state.backSideEnabled && state.printSettings.sideMode === 'back'
      ? ['Enable the back side or choose front output before saving.']
      : []),
  ];
  const {
    employeePage,
    setEmployeePage,
    employeePageSize,
    setEmployeePageSize,
    employeeStatusFilter,
    setEmployeeStatusFilter,
    setSelectedEmployeesById,
    employeeData,
    isFetchingEmployees,
    employeeError,
    retryEmployees,
    employeeTableProps,
    readiness,
    designationOptions,
    selectedPreviewEmployees,
    sampleEmployee,
    previewEmployee,
    filteredEmployees,
    employeeColumns,
  } = useEmployeeCardSelection(state, setState, logo.url);
  const [createTemplate] = useCreateEmployeeICardTemplateMutation();
  const [updateTemplate] = useUpdateEmployeeICardTemplateMutation();
  const [uploadAsset] = useUploadEmployeeICardAssetMutation();
  const [downloadPdf, { isLoading: isExporting }] = useDownloadEmployeeICardsPdfMutation();

  useEffect(
    () => () => {
      if (state.logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(state.logoPreview);
      }
    },
    [state.logoPreview]
  );

  const patchState = (patch: Partial<BuilderState>) => setState((prev) => ({ ...prev, ...patch }));

  const markCurrentStepCompleted = () =>
    setCompletedSteps((prev) => markEmployeeICardStepCompleted(prev, activeStep));

  const canNavigateToStep = (step: number) =>
    !scopeChanged && canNavigateEmployeeICardStep(step, activeStep, completedSteps, isUpdateMode);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setUploadPending(true);
    try {
      const [result, dominantColor] = await Promise.all([
        uploadAsset(file).unwrap(),
        extractDominantColor(file),
      ]);
      setState((previous) => {
        const updated = dominantColor
          ? updateICardBuilderPaletteColor(previous, 'themeColor', dominantColor)
          : previous;

        return {
          ...updated,
          logoBlobName: result.blobName,
          logoMode: 1,
          logoPreview: preview,
        };
      });
      shikshaMitraToast.success({ message: 'School logo uploaded' });
    } catch {
      URL.revokeObjectURL(preview);
      shikshaMitraToast.error({ message: 'Could not upload logo' });
    } finally {
      input.value = '';
      setUploadPending(false);
    }
  };

  const handleSave = async () => {
    if (scopeChanged) {
      shikshaMitraToast.error({
        message: 'Restore the original academic year before saving this draft.',
      });
      return null;
    }
    if (savingRef.current) return null;
    savingRef.current = true;
    setAttempted(true);
    try {
      setIsSaving(true);
      if (!academicYearId) {
        shikshaMitraToast.error({ message: 'Academic year is required' });
        return null;
      }
      if (!state.name.trim()) {
        shikshaMitraToast.error({ message: 'Template name is required' });
        return null;
      }

      if (designErrors.length) {
        shikshaMitraToast.error({ message: designErrors[0] });
        return null;
      }
      const body = {
        academicYearId,
        mediumStageId: state.organization === 'all' ? null : state.organization,
        name: state.name.trim(),
        backgroundImageBlobName: null,
        logoBlobName: state.logoBlobName,
        logoMode: state.logoMode,
        schoolName: state.schoolName.trim(),
        schoolAddress: state.schoolAddress.trim(),
        qrCodeEnabled: state.qrCodeEnabled,
        barcodeEnabled: state.barcodeEnabled,
        backSideEnabled: state.backSideEnabled,
        ...getEmployeeCardDesignPayload(state),
        isActive: state.isActive,
      };

      if (savedTemplateId) {
        await updateTemplate({ id: savedTemplateId, body }).unwrap();
        setBaseline(getEmployeeCardDraftSignature(state));
        shikshaMitraToast.success({ message: 'Staff I-card template updated' });
        return savedTemplateId;
      }

      const created = await createTemplate(body).unwrap();
      setBaseline(getEmployeeCardDraftSignature(state));
      setSavedTemplateId(created.id);
      shikshaMitraToast.success({ message: 'Staff I-card template created' });
      return created.id;
    } catch (error: unknown) {
      const problem = parseApiProblemDetail(error);
      shikshaMitraToast.error({
        message:
          problem.errorCode === 'ShikshaMitra:IdentityCard:InvalidConfiguration'
            ? problem.detail
            : 'Could not save Staff I-card template',
      });
      return null;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (exportPending || isSaving) return;
    if (state.selectedEmployeeIds.length === 0) {
      shikshaMitraToast.error({ message: 'Select at least one staff' });
      return;
    }

    setExportPending(true);
    try {
      const templateId = await handleSave();
      if (!templateId) return;

      const blob: Blob = await downloadPdf({
        templateId,
        body: {
          employeeIds: state.selectedEmployeeIds,
          cardsPerPage: getIdentityCardSheetLayout(state.layout, state.printSettings)
            .effectiveCardsPerPage,
          excludeIncompleteEmployees: state.excludeIncompleteEmployees,
        },
      }).unwrap();
      if (!(await isPdfBlob(blob))) {
        shikshaMitraToast.error({ message: 'Could not export Staff I-card PDF' });
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Employee-I-Cards-${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      shikshaMitraToast.success({ message: 'Staff I-card PDF downloaded' });
      handleClose();
    } catch (error: unknown) {
      const problem = parseApiProblemDetail(error);
      const { detail } = problem;
      if (problem.errorCode === 'ShikshaMitra:IdentityCard:InvalidConfiguration') {
        shikshaMitraToast.error({ message: detail });
      } else if (
        detail.toLowerCase().includes('required') &&
        detail.toLowerCase().includes('employee')
      ) {
        shikshaMitraToast.error({
          message:
            'No eligible staff after filtering. Uncheck "Exclude" or choose staff with complete data.',
        });
      } else {
        shikshaMitraToast.error({ message: 'Could not export Staff I-card PDF' });
      }
    } finally {
      setExportPending(false);
    }
  };

  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={template ? 'Update Staff I-Card' : 'Create Staff I-Card'}
        description="Configure staff cards and review both sides before export."
        links={[
          { name: 'Staff I-Card', onClick: () => navigation.requestNavigation(handleClose) },
          { name: template ? 'Update Staff I-Card' : 'Create Staff I-Card' },
        ]}
        isBack
        onBack={() => navigation.requestNavigation(handleClose)}
      />
      {scopeChanged && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Academic year changed. Restore the original year to continue this draft, or go back and
          discard it.
        </Alert>
      )}
      <Paper
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pt: 1.5,
          boxSizing: 'border-box',
        }}
      >
        <CustomStepperWithFormik
          contentScrollMode={activeStep === 1 ? 'regions' : 'step'}
          initialValues={{}}
          steps={steps}
          activeStep={activeStep}
          validateOnChange={false}
          validationSchema={undefined}
          handleBack={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
          completedSteps={completedSteps}
          isStepClickable={canNavigateToStep}
          onStepClick={(step) => {
            if (isSaving || isExporting || exportPending || uploadPending || scopeChanged) return;
            if (step !== activeStep && canNavigateToStep(step)) {
              setActiveStep(step);
            }
          }}
          handleNext={async (isLastStep, _value, _formik, setLoading) => {
            if (isLastStep) {
              setLoading(true);
              try {
                const savedId = await handleSave();
                if (savedId) {
                  markCurrentStepCompleted();
                  handleClose();
                }
              } finally {
                setLoading(false);
              }
            } else {
              if (activeStep === 0 && !state.name.trim()) {
                setAttempted(true);
                return;
              }
              if (activeStep === 1 && designErrors.length) {
                shikshaMitraToast.error({ message: designErrors[0] });
                return;
              }
              markCurrentStepCompleted();
              setLoading(false);
              setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
            }
          }}
          onSave={async (_isLastStep, _value, _formik, setLoading) => {
            setLoading(true);
            try {
              const savedId = await handleSave();
              if (savedId) {
                markCurrentStepCompleted();
              }
            } finally {
              setLoading(false);
            }
          }}
          showSaveButton
          disableSubmit={isSaving || isExporting || exportPending || uploadPending || scopeChanged}
          nextButtonLabel="Next"
          finalButtonLabel="Save & Close"
          saveButtonProps={{
            disabled: isSaving || isExporting || exportPending || uploadPending || scopeChanged,
          }}
          backButtonProps={{
            disabled: isSaving || isExporting || exportPending || uploadPending || scopeChanged,
          }}
          saveAndNextButtonProps={{
            disabled: isSaving || isExporting || exportPending || uploadPending || scopeChanged,
          }}
          renderItem={({ activeStep: currentStep }) => (
            <Box
              component="fieldset"
              disabled={isSaving || isExporting || exportPending || uploadPending || scopeChanged}
              sx={{
                p: 2,
                m: 0,
                border: 0,
                minWidth: 0,
                width: 1,
                minHeight: 0,
                ...(currentStep === 1 && { flex: 1, overflow: 'hidden' }),
              }}
            >
              <Grid
                container
                spacing={3}
                sx={{ height: currentStep === 1 ? 1 : undefined, minHeight: 0 }}
              >
                <Grid
                  size={{ xs: 12, md: currentStep === 1 ? 12 : 7 }}
                  sx={{ height: currentStep === 1 ? 1 : undefined, minHeight: 0 }}
                >
                  {currentStep === 0 && (
                    <Stack spacing={2}>
                      <FormSectionCard
                        title="Staff Professional"
                        icon={GlobalIcons.documentIcon}
                        descriptionTooltip="Start from the approved staff card, then configure its front, back, and print settings in Designer."
                      >
                        <Typography variant="body2" color="text.secondary">
                          Use the designer to adjust the saved design. Existing templates keep their
                          current layout.
                        </Typography>
                      </FormSectionCard>
                      <ShakingTextField error={attempted && !state.name.trim()}>
                        <TextField
                          fullWidth
                          required
                          error={attempted && !state.name.trim()}
                          helperText={
                            attempted && !state.name.trim()
                              ? 'Template name is required'
                              : undefined
                          }
                          label="Template name"
                          value={state.name}
                          onChange={(event) => patchState({ name: event.target.value })}
                          size="small"
                        />
                      </ShakingTextField>
                      <CustomSelect
                        disabled={
                          isSaving || isExporting || exportPending || uploadPending || scopeChanged
                        }
                        options={[{ name: 'All organizations', id: 'all' }, ...organizations]}
                        label="Organization"
                        value={state.organization}
                        onChange={(val) => {
                          patchState({
                            organization: String(Array.isArray(val) ? val[0] : val),
                            selectedEmployeeIds: [],
                          });
                          setSelectedEmployeesById({});
                          setEmployeePage(1);
                        }}
                        labelKey="name"
                        valueKey="id"
                        formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                      />
                    </Stack>
                  )}

                  {currentStep === 1 && (
                    <IdentityCardDesigner
                      brandingContent={
                        <FormSectionCard
                          title="School Identity"
                          icon={GlobalIcons.building}
                          descriptionTooltip="Use the organization’s School Identity logo, a custom uploaded logo, or hide the logo. The saved choice applies to both sides."
                        >
                          {logo.isError && (
                            <Alert
                              severity="error"
                              action={<Button onClick={() => logo.retry()}>Retry</Button>}
                            >
                              School logo could not be loaded.
                            </Alert>
                          )}
                          <TextField
                            select
                            disabled={
                              isSaving ||
                              isExporting ||
                              exportPending ||
                              uploadPending ||
                              scopeChanged
                            }
                            label="School logo setting"
                            value={state.logoMode}
                            size="small"
                            onChange={(event) =>
                              patchState({ logoMode: Number(event.target.value) as 0 | 1 | 2 })
                            }
                          >
                            <MenuItem value={0}>Use School Identity</MenuItem>
                            <MenuItem value={1}>Use custom asset</MenuItem>
                            <MenuItem value={2}>Do not display</MenuItem>
                          </TextField>
                          <Button
                            size="small"
                            component="label"
                            variant="outlined"
                            disabled={state.logoMode !== 1}
                            startIcon={<Iconify icon="solar:upload-linear" />}
                          >
                            Upload School Logo
                            <input
                              hidden
                              type="file"
                              accept="image/png,image/jpeg"
                              onChange={handleLogoUpload}
                            />
                          </Button>
                          <TextField
                            label="School Name"
                            value={state.schoolName}
                            onChange={(event) => patchState({ schoolName: event.target.value })}
                            size="small"
                          />
                          <TextField
                            label="School Address"
                            value={state.schoolAddress}
                            onChange={(event) => patchState({ schoolAddress: event.target.value })}
                            size="small"
                            multiline
                            minRows={2}
                          />
                        </FormSectionCard>
                      }
                      layout={state.layout}
                      onLayoutChange={(layout) =>
                        patchState({
                          layout,
                          width: layout.width,
                          height: layout.height,
                          orientation: layout.orientation,
                          themeColor: layout.themeColor,
                          backgroundColor: layout.backgroundColor,
                        })
                      }
                      printSettings={state.printSettings}
                      onPrintSettingsChange={(printSettings) => patchState({ printSettings })}
                      fields={employeeCardFields}
                      values={getEmployeeCardPreviewValues(
                        state,
                        previewEmployee,
                        academicYearName
                      )}
                      logoUrl={logo.url}
                      photoUrl={getEmployeeCardPhotoUrl(previewEmployee)}
                      logoHidden={state.logoMode === 2}
                      disabled={
                        isSaving || isExporting || exportPending || uploadPending || scopeChanged
                      }
                      backSideEnabled={state.backSideEnabled}
                      onBackSideEnabledChange={(backSideEnabled) => patchState({ backSideEnabled })}
                      qrCodeEnabled={state.qrCodeEnabled}
                      onQrCodeEnabledChange={(qrCodeEnabled) => patchState({ qrCodeEnabled })}
                      barcodeEnabled={state.barcodeEnabled}
                      onBarcodeEnabledChange={(barcodeEnabled) => patchState({ barcodeEnabled })}
                    />
                  )}

                  {currentStep === 2 && (
                    <Stack spacing={2}>
                      <EmployeePrintSummary
                        layout={state.layout}
                        settings={state.printSettings}
                        backSideEnabled={state.backSideEnabled}
                      />
                      {designErrors.map((message) => (
                        <Alert key={message} severity="error">
                          {message}
                        </Alert>
                      ))}
                      {!designErrors.length && (
                        <Alert severity="info">
                          Review both sides with selected staff before exporting. PDF generation
                          does not record physical printing or distribution.
                        </Alert>
                      )}
                    </Stack>
                  )}

                  {currentStep === 3 && (
                    <Stack spacing={2}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <TextField
                          label="Search staff"
                          sx={{ flex: '1 1 180px' }}
                          value={state.employeeSearch}
                          onChange={(event) => {
                            patchState({ employeeSearch: event.target.value });
                            setEmployeePage(1);
                          }}
                          size="small"
                          fullWidth
                        />
                        <CustomSelect
                          options={[{ name: 'All designations', id: 'all' }, ...designationOptions]}
                          label="Designation"
                          value={state.designationFilter}
                          onChange={(val) => {
                            patchState({
                              designationFilter: String(Array.isArray(val) ? val[0] : val),
                            });
                            setEmployeePage(1);
                          }}
                          labelKey="name"
                          valueKey="id"
                          formControlProps={{ sx: { flex: '1 1 180px', minWidth: 0 } }}
                        />
                        <CustomSelect
                          options={[
                            { name: 'All statuses', id: 'all' },
                            { name: 'Active', id: 'Active' },
                            { name: 'Inactive', id: 'Inactive' },
                          ]}
                          label="Status"
                          value={employeeStatusFilter}
                          onChange={(val) => {
                            setEmployeeStatusFilter(String(Array.isArray(val) ? val[0] : val));
                            setEmployeePage(1);
                          }}
                          labelKey="name"
                          valueKey="id"
                          formControlProps={{ sx: { flex: '1 1 180px', minWidth: 0 } }}
                        />
                      </Stack>
                      <ReadinessBar readiness={readiness} />
                      {isFetchingEmployees && (
                        <Typography variant="caption" color="text.secondary">
                          Loading staff...
                        </Typography>
                      )}
                      <CustomizableTable
                        showColumns
                        showExport={false}
                        showFullScreen
                        exportScope="all"
                        tableId="employee-icard-selection-table"
                        tableTitle="Staff selection"
                        columns={employeeColumns}
                        {...employeeTableProps}
                        data={filteredEmployees}
                        error={employeeError}
                        onRetry={retryEmployees}
                        isLoading={isFetchingEmployees}
                        isSearch={false}
                        serverSidePagination
                        totalCount={employeeData?.totalCount || 0}
                        page={employeePage - 1}
                        rowsPerPage={employeePageSize}
                        onServerPagination={(nextPage, nextSize) => {
                          setEmployeePage(nextPage);
                          setEmployeePageSize(nextSize);
                        }}
                        isShowedDense={false}
                        rowProps={(row) => ({
                          selected: state.selectedEmployeeIds.includes(
                            (row as EmployeeICardRow).id
                          ),
                        })}
                        tableContainerProps={{ sx: { maxHeight: 360 } }}
                        wrapperProps={{ sx: { maxHeight: 430 } }}
                        noDataText="No staff found for this filter."
                      />
                    </Stack>
                  )}

                  {currentStep === 4 && (
                    <Stack spacing={2}>
                      <ReadinessBar readiness={readiness} />
                      <EmployeePrintSummary
                        layout={state.layout}
                        settings={state.printSettings}
                        backSideEnabled={state.backSideEnabled}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Adjust paper, sides, margins, and duplex alignment in Designer.
                      </Typography>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={state.excludeIncompleteEmployees}
                            onChange={(event) =>
                              patchState({ excludeIncompleteEmployees: event.target.checked })
                            }
                          />
                        }
                        label="Exclude staff missing photo, phone, or designation"
                      />
                      <Button
                        size="small"
                        variant="contained"
                        disabled={
                          isSaving ||
                          isExporting ||
                          exportPending ||
                          uploadPending ||
                          state.selectedEmployeeIds.length === 0
                        }
                        onClick={handleExport}
                        startIcon={<Iconify icon="solar:file-download-bold" />}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        Export Bulk PDF
                      </Button>
                    </Stack>
                  )}
                </Grid>

                {currentStep !== 1 && (
                  <Grid size={{ xs: 12, md: 5 }}>
                    <EmployeePreviewWorkspace
                      state={state}
                      employees={selectedPreviewEmployees}
                      sampleEmployee={sampleEmployee}
                      academicYearName={draftAcademicYearName}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        />
      </Paper>
      {navigation.confirmation}
    </Box>
  );
};
