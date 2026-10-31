import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useRef, useState, useEffect } from 'react';
import { useResponsive } from 'src/hooks/use-responsive';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { StudentFeedback } from 'src/components/student-feedback';
import {
  useSensor,
  DndContext,
  useSensors,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';

import { getSectionStepId } from './form-step-groups';
import { reorderFormBuilder } from './reorder-form-builder';
import { FormBuilderPalette } from './form-builder-palette';
import { FormValidationPanel } from './form-validation-panel';
import { AdmissionDialogTitle } from '../admission-dialog-title';
import { FormBuilderProperties } from './form-builder-properties';
import { useFormInheritance } from './hooks/use-form-inheritance';
import { FormBuilderCanvas } from './components/form-builder-canvas';
import { FormBuilderWorkspace } from './components/form-builder-workspace';
import { useFormBuilderCommands } from './hooks/use-form-builder-commands';
import { useFormBuilderSelection } from './hooks/use-form-builder-selection';
import { FormBuilderLivePreview } from './components/form-builder-live-preview';
import { getBuilderIssueRecoveryGuidance } from './form-builder-issue-navigation';
import { FormBuilderValidationNotice } from './components/form-builder-validation-notice';
import {
  FormInheritancePanel,
  InheritedFieldDrawer,
  InheritedFieldSettings,
} from './components/form-inheritance-panel';
import {
  getInheritedFields,
  getInheritanceBuilderValues,
  getInheritancePreviewValues,
  markInheritedRegistrationFields,
} from './form-inheritance-model';

import type { BuilderIssueTarget } from './form-builder-issue-navigation';
import type { BuilderNavigationRequest } from './types/builder-navigation';

export function FormBuilderSections({
  formik,
  footer,
}: {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  footer?: ReactNode;
}) {
  const inheritance = useFormInheritance();
  const inheritedFields = getInheritedFields(inheritance?.preview?.definition);
  const builderFormik = {
    ...formik,
    values: markInheritedRegistrationFields(formik.values, inheritance?.preview?.definition),
  };
  const effectiveForm = getInheritanceBuilderValues(
    formik.values,
    inheritance?.preview?.definition,
    inheritance?.previewBaseSectionIds
  );
  const selection = useFormBuilderSelection(effectiveForm.sections);
  const selectSection = selection.select;
  const viewedSource = useRef<string | null>(null);
  const sourceId = inheritance?.sourceId;
  const firstSourceSectionId = effectiveForm.sections.find((section) =>
    section.fields.some((field) => field.inheritedFrom?.inquiryFormDefinitionId === sourceId)
  )?.id;
  useEffect(() => {
    if (!sourceId) viewedSource.current = null;
    else if (firstSourceSectionId && viewedSource.current !== sourceId) {
      selectSection(firstSourceSectionId, null);
      viewedSource.current = sourceId;
    }
  }, [sourceId, firstSourceSectionId, selectSection]);
  const selectedBaseSectionIndex = formik.values.sections.findIndex((section) =>
    section.fields.some((field) => field.id === selection.selectedFieldId)
  );
  const selectedBaseFieldIndex =
    selectedBaseSectionIndex >= 0
      ? formik.values.sections[selectedBaseSectionIndex].fields.findIndex(
          (field) => field.id === selection.selectedFieldId
        )
      : -1;
  const selectedBaseLocation =
    selectedBaseSectionIndex >= 0 && selectedBaseFieldIndex >= 0
      ? { sectionIndex: selectedBaseSectionIndex, fieldIndex: selectedBaseFieldIndex }
      : null;
  const theme = useTheme();
  const desktop = useResponsive('up', 'lg');
  const [canvasMode, setCanvasMode] = useState<'design' | 'preview'>('design');
  const [newStepId, setNewStepId] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'fields' | 'form'>('form');
  const [sidePanel, setSidePanel] = useState<'settings' | null>(null);
  const [gridAnchor, setGridAnchor] = useState<HTMLElement | null>(null);
  const [navigationRequest, setNavigationRequest] = useState<BuilderNavigationRequest>();
  const [reviewGuidance, setReviewGuidance] = useState<string>();
  const previewReady =
    !inheritance?.enabled ||
    Boolean(
      !inheritance.loading &&
      !inheritance.failed &&
      !inheritance.sourceFailed &&
      inheritance.preview?.isValid
    );
  const commands = useFormBuilderCommands(
    formik,
    selection.selectedSectionId,
    selection.select,
    inheritedFields,
    (field) => inheritance?.selectField(field)
  );
  const addStep = (afterStepId?: string) => {
    const stepId = commands.addStep(afterStepId);
    setNewStepId(stepId ?? null);
    setCanvasMode('design');
    setMobilePanel('form');
  };
  const selectCanvasField = (sectionId: string, fieldId: string | null) => {
    const selectedField = effectiveForm.sections
      .find((section) => section.id === sectionId)
      ?.fields.find((field) => field.id === fieldId);
    selection.select(sectionId, fieldId);
    if (selectedField?.inheritedFrom) {
      inheritance?.selectField(selectedField);
      setSidePanel(null);
      return;
    }
    inheritance?.selectField(null);
    if (fieldId) setSidePanel('settings');
    else setSidePanel(null);
  };
  const selectIssue = (target: BuilderIssueTarget) => {
    setCanvasMode('design');
    setMobilePanel('form');
    let resolved = target;
    if (target.kind === 'field') {
      const base = formik.values.sections
        .flatMap((section) => section.fields)
        .find((field) => field.id === target.fieldId);
      const section = effectiveForm.sections.find((item) =>
        item.fields.some(
          (field) =>
            field.id === target.fieldId ||
            Boolean(
              target.fieldIdentity && field.inheritedFrom?.fieldIdentity === target.fieldIdentity
            ) ||
            Boolean(base?.fieldIdentity && base.fieldIdentity === field.fieldIdentity) ||
            Boolean(
              base?.bindingType === 0 &&
              field.bindingType === 0 &&
              base.bindingKey &&
              field.bindingKey?.toLowerCase() === base.bindingKey.toLowerCase()
            )
        )
      );
      const field = section?.fields.find(
        (item) =>
          item.id === target.fieldId ||
          Boolean(
            target.fieldIdentity && item.inheritedFrom?.fieldIdentity === target.fieldIdentity
          ) ||
          Boolean(base?.fieldIdentity && base.fieldIdentity === item.fieldIdentity) ||
          Boolean(
            base?.bindingType === 0 &&
            item.bindingType === 0 &&
            base.bindingKey &&
            item.bindingKey?.toLowerCase() === base.bindingKey.toLowerCase()
          )
      );
      if (section && field) {
        resolved = {
          ...target,
          sectionId: section.id,
          stepId: getSectionStepId(section),
          fieldId: field.id,
          owner: field.inheritedFrom ? 'inquiry' : 'registration',
        };
        selectCanvasField(section.id, field.id);
      }
    } else if (target.kind !== 'form') {
      selectCanvasField(target.sectionId, null);
    }
    setReviewGuidance(getBuilderIssueRecoveryGuidance(resolved));
    setNavigationRequest((previous) => ({
      target: resolved,
      sequence: (previous?.sequence ?? 0) + 1,
    }));
  };
  const { selectedSection } = selection;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const settingsContent = (
    <Stack sx={{ height: 1, minHeight: 0 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5 }}
      >
        <Typography id="admission-form-field-settings-title" variant="subtitle1">
          <AdmissionDialogTitle
            title="Field settings"
            helpLabel="About field settings"
            helpText="Configure the field, answer options, and visibility. Changes stay in this draft until you save."
          />
        </Typography>
        <IconButton aria-label="Close field settings" onClick={() => setSidePanel(null)}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />
      {reviewGuidance && (
        <Box sx={{ p: 1.5 }}>
          <StudentFeedback notificationKey="STU-0366" presentation="inline" severity="warning">
            {reviewGuidance}
          </StudentFeedback>
        </Box>
      )}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {selectedBaseLocation &&
        builderFormik.values.sections[selectedBaseLocation.sectionIndex]?.fields[
          selectedBaseLocation.fieldIndex
        ]?.inheritedFrom ? (
          <Box sx={{ p: 1.5 }}>
            <InheritedFieldSettings
              formik={formik}
              field={
                builderFormik.values.sections[selectedBaseLocation.sectionIndex].fields[
                  selectedBaseLocation.fieldIndex
                ]
              }
              sourceName={inheritance?.source?.name ?? 'Source Inquiry'}
            />
          </Box>
        ) : (
          <FormBuilderProperties
            formik={builderFormik}
            selectedLocation={selectedBaseLocation}
            navigationRequest={navigationRequest}
          />
        )}
      </Box>
      <Stack
        direction="row"
        justifyContent="flex-end"
        sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}
      >
        <Button size="small" variant="contained" onClick={() => setSidePanel(null)}>
          Done
        </Button>
      </Stack>
    </Stack>
  );
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => reorderFormBuilder(event, formik, selection.selectForReorder)}
    >
      <>
        <FormBuilderWorkspace
          panel={mobilePanel}
          onPanelChange={setMobilePanel}
          fields={
            <Stack sx={{ flex: 1, minHeight: 0 }}>
              <FormInheritancePanel />
              {commands.systemFieldsQuery.isError && (
                <StudentFeedback
                  notificationKey="STU-0368"
                  presentation="persistent"
                  severity="warning"
                  action={
                    <Button size="small" onClick={() => commands.systemFieldsQuery.refetch()}>
                      Retry
                    </Button>
                  }
                >
                  Student fields could not load. Custom fields are still available.
                </StudentFeedback>
              )}
              <FormBuilderPalette
                purpose={formik.values.purpose}
                systemFields={commands.selectableSystemFields}
                usedBindings={[
                  ...inheritedFields
                    .filter((field) => field.bindingType === 0 && field.bindingKey)
                    .map((field) => field.bindingKey!),
                  ...formik.values.sections.flatMap((section) =>
                    section.fields
                      .filter((field) => field.bindingType === 0 && field.bindingKey)
                      .map((field) => field.bindingKey!)
                  ),
                ]}
                targetLabel={selectedSection?.name}
                loading={commands.systemFieldsQuery.isLoading}
                error={commands.systemFieldsQuery.isError}
                onAddField={commands.addField}
                onAddGroupSection={(name, fields) => {
                  if (!commands.addGroupSection(name, fields)) return;
                  setCanvasMode('design');
                  setSidePanel(null);
                  setMobilePanel('form');
                }}
              />
            </Stack>
          }
          form={
            <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', lg: 'center' }}
                justifyContent="space-between"
                sx={{ p: 1.5, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}
              >
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                  <FormValidationPanel form={effectiveForm} onSelectIssue={selectIssue} />
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  {effectiveForm.layoutType === 0 && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="mdi:plus" />}
                      disabled={formik.isSubmitting}
                      onClick={() => addStep()}
                    >
                      Add step
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:plus" />}
                    onClick={() => {
                      commands.addSection();
                      setCanvasMode('design');
                      setMobilePanel('form');
                    }}
                  >
                    Add section
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:view-grid-outline" />}
                    endIcon={<Iconify icon="mdi:chevron-down" />}
                    aria-expanded={Boolean(gridAnchor)}
                    aria-controls={gridAnchor ? 'admission-form-grid-menu' : undefined}
                    onClick={(event) => setGridAnchor(event.currentTarget)}
                  >
                    Grid layout
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={
                      <Iconify
                        icon={canvasMode === 'preview' ? 'mdi:pencil-outline' : 'mdi:eye-outline'}
                      />
                    }
                    disabled={canvasMode !== 'preview' && !previewReady}
                    onClick={() => setCanvasMode(canvasMode === 'preview' ? 'design' : 'preview')}
                  >
                    {canvasMode === 'preview' ? 'Back to builder' : 'Preview'}
                  </Button>
                </Stack>
              </Stack>
              <Menu
                id="admission-form-grid-menu"
                anchorEl={gridAnchor}
                open={Boolean(gridAnchor)}
                onClose={() => setGridAnchor(null)}
              >
                {[1, 2, 3, 4].map((count) => (
                  <MenuItem
                    key={count}
                    selected={formik.values.fieldsPerRow === count}
                    onClick={() => {
                      formik.setFieldValue('fieldsPerRow', count);
                      setGridAnchor(null);
                    }}
                  >
                    {count === 1 ? '1 column' : `${count} columns`}
                  </MenuItem>
                ))}
              </Menu>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                {canvasMode === 'design' ? (
                  <FormBuilderCanvas
                    formik={formik}
                    effectiveForm={effectiveForm}
                    navigationRequest={navigationRequest}
                    selectedSectionId={selection.selectedSectionId}
                    selectedFieldId={selection.selectedFieldId}
                    onSelect={selectCanvasField}
                    newStepId={newStepId}
                    onAddStep={addStep}
                    onNewStepReady={setNewStepId}
                    footer={desktop ? footer : undefined}
                  />
                ) : (
                  <Stack sx={{ height: 1, minHeight: 0 }}>
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                      {previewReady ? (
                        <FormBuilderLivePreview
                          form={getInheritancePreviewValues(
                            formik.values,
                            inheritance?.preview?.definition
                          )}
                        />
                      ) : (
                        <Box sx={{ p: 2 }}>
                          <StudentFeedback
                            notificationKey="STU-0366"
                            presentation="inline"
                            severity={inheritance?.loading ? 'info' : 'warning'}
                          >
                            {inheritance?.loading
                              ? 'Checking Inquiry questions before showing this preview.'
                              : 'Review the Inquiry question checks before opening this preview.'}
                          </StudentFeedback>
                        </Box>
                      )}
                    </Box>
                    {desktop && footer}
                  </Stack>
                )}
              </Box>
            </Box>
          }
        >
          {reviewGuidance && sidePanel === null && (
            <StudentFeedback notificationKey="STU-0366" presentation="inline" severity="warning">
              {reviewGuidance}
            </StudentFeedback>
          )}
          <FormBuilderValidationNotice formik={formik} onSelectIssue={selectIssue} />
          {!desktop && footer}
        </FormBuilderWorkspace>

        <Drawer
          anchor="right"
          open={sidePanel !== null}
          onClose={() => setSidePanel(null)}
          aria-labelledby="admission-form-field-settings-title"
          // Portal order keeps settings above the wizard and newly opened menus above settings.
          sx={{ zIndex: theme.zIndex.modal }}
          slotProps={{ paper: { sx: { width: { xs: 1, sm: 440 }, maxWidth: 1 } } }}
        >
          {settingsContent}
        </Drawer>
        <InheritedFieldDrawer />
      </>
    </DndContext>
  );
}
