import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useBoolean } from 'src/hooks/use-boolean';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  useSensor,
  DndContext,
  useSensors,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';

import { reorderFormBuilder } from './reorder-form-builder';
import { FormBuilderPalette } from './form-builder-palette';
import { FormValidationPanel } from './form-validation-panel';
import { getAdmissionFormStepGroups } from './form-step-groups';
import { FormBuilderProperties } from './form-builder-properties';
import { FormBuilderCanvas } from './components/form-builder-canvas';
import { FormBuilderOutline } from './components/form-builder-outline';
import { FormBuilderWorkspace } from './components/form-builder-workspace';
import { useFormBuilderCommands } from './hooks/use-form-builder-commands';
import { useFormBuilderSelection } from './hooks/use-form-builder-selection';
import { FormBuilderLivePreview } from './components/form-builder-live-preview';
import { FormBuilderValidationNotice } from './components/form-builder-validation-notice';
import { FormBuilderSectionLibraryDrawer } from './components/form-builder-section-library-drawer';

export function FormBuilderSections({
  formik,
}: {
  formik: FormikProps<CreateUpdateAdmissionForm>;
}) {
  const selection = useFormBuilderSelection(formik.values.sections);
  const theme = useTheme();
  const [canvasMode, setCanvasMode] = useState<'design' | 'preview'>('design');
  const [showFullStructure, setShowFullStructure] = useState(false);
  const [newStepId, setNewStepId] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'fields' | 'form'>('form');
  const [sidePanel, setSidePanel] = useState<'settings' | 'outline' | null>(null);
  const [moreAnchor, setMoreAnchor] = useState<HTMLElement | null>(null);
  const [gridAnchor, setGridAnchor] = useState<HTMLElement | null>(null);
  const sectionLibrary = useBoolean();
  const commands = useFormBuilderCommands(formik, selection.selectedSectionId, selection.select);
  const addStep = (afterStepId?: string) => {
    const stepId = commands.addCanvasUnit(afterStepId);
    setNewStepId(stepId ?? null);
    setShowFullStructure(true);
    setCanvasMode('design');
    setMobilePanel('form');
  };
  const selectCanvasField = (sectionId: string, fieldId: string | null) => {
    selection.select(sectionId, fieldId);
    if (fieldId) setSidePanel('settings');
    else setSidePanel(null);
  };
  const showFields = () => {
    setSidePanel(null);
    setMobilePanel('fields');
  };
  const { selectedSection } = selection;
  const steps = getAdmissionFormStepGroups(formik.values.sections);
  const selectedStep = steps.find((step) =>
    step.sections.some(({ section }) => section.id === selectedSection?.id)
  );
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
          Field settings
        </Typography>
        <IconButton aria-label="Close field settings" onClick={() => setSidePanel(null)}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <FormBuilderProperties formik={formik} selectedLocation={selection.selectedLocation} />
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
              {commands.systemFieldsQuery.isError && (
                <Alert
                  severity="warning"
                  action={
                    <Button size="small" onClick={() => commands.systemFieldsQuery.refetch()}>
                      Retry
                    </Button>
                  }
                >
                  Student fields could not load. Custom fields are still available.
                </Alert>
              )}
              <FormBuilderPalette
                systemFields={commands.systemFieldsQuery.data ?? []}
                usedBindings={formik.values.sections.flatMap((section) =>
                  section.fields
                    .filter((field) => field.bindingType === 0 && field.bindingKey)
                    .map((field) => field.bindingKey!)
                )}
                targetLabel={selectedSection?.name}
                loading={commands.systemFieldsQuery.isLoading}
                error={commands.systemFieldsQuery.isError}
                onAddField={commands.addField}
                onAddGroupSection={(name, fields) => {
                  if (!commands.addGroupSection(name, fields)) return;
                  setShowFullStructure(false);
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
                  {formik.values.layoutType === 1 && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="mdi:plus" />}
                      onClick={() => addStep(selectedStep?.id)}
                    >
                      Add step
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:plus" />}
                    onClick={commands.addSection}
                  >
                    Add section
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    endIcon={<Iconify icon="mdi:chevron-down" />}
                    onClick={(event) => setMoreAnchor(event.currentTarget)}
                  >
                    More
                  </Button>
                  <FormValidationPanel
                    form={formik.values}
                    onSelectField={(fieldId) => {
                      selection.selectField(fieldId);
                      setSidePanel('settings');
                    }}
                  />
                </Stack>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:view-grid-outline" />}
                    endIcon={<Iconify icon="mdi:chevron-down" />}
                    aria-expanded={Boolean(gridAnchor)}
                    aria-controls={gridAnchor ? 'admission-form-grid-menu' : undefined}
                    onClick={(event) => setGridAnchor(event.currentTarget)}
                  >
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, mr: 0.5 }}>
                      Grid layout:
                    </Box>
                    <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' }, mr: 0.5 }}>
                      Grid:
                    </Box>
                    {formik.values.fieldsPerRow}{' '}
                    {formik.values.fieldsPerRow === 1 ? 'column' : 'columns'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={
                      <Iconify
                        icon={canvasMode === 'preview' ? 'mdi:pencil-outline' : 'mdi:eye-outline'}
                      />
                    }
                    onClick={() => setCanvasMode(canvasMode === 'preview' ? 'design' : 'preview')}
                  >
                    {canvasMode === 'preview' ? 'Back to builder' : 'Preview as applicant'}
                  </Button>
                </Stack>
              </Stack>
              <Menu
                anchorEl={moreAnchor}
                open={Boolean(moreAnchor)}
                onClose={() => setMoreAnchor(null)}
              >
                <MenuItem
                  onClick={() => {
                    setMoreAnchor(null);
                    setSidePanel('outline');
                  }}
                >
                  Form outline
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setMoreAnchor(null);
                    setShowFullStructure(!showFullStructure);
                    setCanvasMode('design');
                  }}
                >
                  {showFullStructure ? 'Focus section' : 'Show full structure'}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setMoreAnchor(null);
                    sectionLibrary.onTrue();
                  }}
                >
                  Section library
                </MenuItem>
                <MenuItem
                  disabled={!selectedSection}
                  onClick={() => {
                    setMoreAnchor(null);
                    showFields();
                  }}
                >
                  Add field
                </MenuItem>
              </Menu>
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
                    selectedSectionId={selection.selectedSectionId}
                    selectedFieldId={selection.selectedFieldId}
                    showFullStructure={showFullStructure}
                    onSelect={selectCanvasField}
                    onShowFullStructureChange={setShowFullStructure}
                    newStepId={newStepId}
                    onAddStep={addStep}
                    onNewStepReady={setNewStepId}
                  />
                ) : (
                  <FormBuilderLivePreview form={formik.values} />
                )}
              </Box>
            </Box>
          }
        >
          <FormBuilderValidationNotice formik={formik} onSelect={selectCanvasField} />
        </FormBuilderWorkspace>

        <Drawer
          anchor="right"
          open={sidePanel !== null}
          onClose={() => setSidePanel(null)}
          aria-labelledby={
            sidePanel === 'outline'
              ? 'admission-form-side-panel-title'
              : 'admission-form-field-settings-title'
          }
          sx={{ zIndex: theme.zIndex.modal + 1 }}
          slotProps={{ paper: { sx: { width: { xs: 1, sm: 440 }, maxWidth: 1 } } }}
        >
          {sidePanel === 'outline' ? (
            <Stack sx={{ height: 1, minHeight: 0 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ p: 2 }}
              >
                <Typography id="admission-form-side-panel-title" variant="h6">
                  Form outline
                </Typography>
                <IconButton aria-label="Close form outline" onClick={() => setSidePanel(null)}>
                  <Iconify icon="mdi:close" />
                </IconButton>
              </Stack>
              <Divider />
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <FormBuilderOutline
                  form={formik.values}
                  selectedSectionId={selection.selectedSectionId}
                  onSelectSection={(sectionId) => {
                    selection.select(sectionId, null);
                    setShowFullStructure(false);
                    setSidePanel(null);
                    setMobilePanel('form');
                  }}
                  onAddSection={() => {
                    setSidePanel(null);
                    sectionLibrary.onTrue();
                  }}
                  onAddField={showFields}
                />
              </Box>
            </Stack>
          ) : (
            settingsContent
          )}
        </Drawer>
        <FormBuilderSectionLibraryDrawer
          open={sectionLibrary.value}
          targetLabel={selection.selectedSection?.name}
          onClose={sectionLibrary.onFalse}
          onAddSection={commands.addSectionTemplate}
        />
      </>
    </DndContext>
  );
}
