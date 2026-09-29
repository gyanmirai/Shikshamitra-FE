import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useBoolean } from 'src/hooks/use-boolean';
import ButtonGroup from '@mui/material/ButtonGroup';
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
  const [canvasMode, setCanvasMode] = useState<'design' | 'preview'>('design');
  const [showFullStructure, setShowFullStructure] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'fields' | 'form'>('form');
  const [sidePanel, setSidePanel] = useState<'settings' | 'outline' | null>(null);
  const sectionLibrary = useBoolean();
  const commands = useFormBuilderCommands(formik, selection.selectedSectionId, selection.select);
  const selectCanvasField = (sectionId: string, fieldId: string | null) => {
    selection.select(sectionId, fieldId);
    if (fieldId) setSidePanel('settings');
  };
  const showFields = () => {
    setSidePanel(null);
    setMobilePanel('fields');
  };
  const { selectedSection } = selection;
  const selectedStep = getAdmissionFormStepGroups(formik.values.sections).find((step) =>
    step.sections.some(({ section }) => section.id === selectedSection?.id)
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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
              {commands.systemFieldsQuery.isLoading && (
                <Alert severity="info">Loading student fields...</Alert>
              )}
              <FormBuilderPalette
                systemFields={commands.systemFieldsQuery.data ?? []}
                usedBindings={formik.values.sections.flatMap((section) =>
                  section.fields
                    .filter((field) => field.bindingType === 0 && field.bindingKey)
                    .map((field) => field.bindingKey!)
                )}
                targetLabel={selectedSection?.name}
                onAddField={commands.addField}
              />
            </Stack>
          }
          form={
            <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
                sx={{ p: 1.5, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography component="h2" variant="h6" tabIndex={-1}>
                    {showFullStructure ? (
                      'Form structure'
                    ) : (
                      <>
                        {selectedStep?.name && (
                          <Typography component="span" variant="h6" fontWeight={400}>
                            {selectedStep.name} /{' '}
                          </Typography>
                        )}
                        {selectedSection?.name || 'No sections yet'}
                      </>
                    )}
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {showFullStructure
                        ? `${formik.values.sections.length} sections`
                        : `${selectedSection?.fields.length ?? 0} ${(selectedSection?.fields.length ?? 0) === 1 ? 'field' : 'fields'}`}
                    </Typography>
                    <FormValidationPanel
                      form={formik.values}
                      onSelectField={(fieldId) => {
                        selection.selectField(fieldId);
                        setSidePanel('settings');
                      }}
                    />
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <ButtonGroup size="small" aria-label="Form canvas view">
                    <Button
                      variant={canvasMode === 'design' ? 'contained' : 'outlined'}
                      onClick={() => setCanvasMode('design')}
                      sx={
                        canvasMode === 'design'
                          ? {
                              bgcolor: 'common.black',
                              color: 'common.white',
                              '&:hover': { bgcolor: 'grey.800' },
                            }
                          : { color: 'text.primary', borderColor: 'divider' }
                      }
                    >
                      Design
                    </Button>
                    <Button
                      variant={canvasMode === 'preview' ? 'contained' : 'outlined'}
                      onClick={() => setCanvasMode('preview')}
                      sx={
                        canvasMode === 'preview'
                          ? {
                              bgcolor: 'common.black',
                              color: 'common.white',
                              '&:hover': { bgcolor: 'grey.800' },
                            }
                          : { color: 'text.primary', borderColor: 'divider' }
                      }
                    >
                      Preview
                    </Button>
                  </ButtonGroup>
                  {canvasMode === 'design' && !showFullStructure && (
                    <>
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
                        startIcon={<Iconify icon="mdi:format-list-bulleted" />}
                        onClick={() => setSidePanel('outline')}
                      >
                        Outline
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon="mdi:format-list-bulleted" />}
                        onClick={() => setShowFullStructure(true)}
                      >
                        Structure
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={!selectedSection}
                        startIcon={<Iconify icon="mdi:plus" />}
                        onClick={showFields}
                        sx={{
                          bgcolor: 'common.black',
                          color: 'common.white',
                          '&:hover': { bgcolor: 'grey.800' },
                        }}
                      >
                        Add field
                      </Button>
                    </>
                  )}
                  {canvasMode === 'design' && showFullStructure && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={!selectedSection}
                        startIcon={<Iconify icon="mdi:target" />}
                        onClick={() => setShowFullStructure(false)}
                      >
                        Focus section
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon="mdi:view-grid-plus-outline" />}
                        onClick={sectionLibrary.onTrue}
                      >
                        Section library
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Iconify icon="mdi:plus" />}
                        onClick={commands.addCanvasUnit}
                        sx={{
                          bgcolor: 'common.black',
                          color: 'common.white',
                          '&:hover': { bgcolor: 'grey.800' },
                        }}
                      >
                        {formik.values.layoutType === 1 ? 'Add step' : 'Add section'}
                      </Button>
                    </>
                  )}
                </Stack>
              </Stack>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                {canvasMode === 'design' ? (
                  <FormBuilderCanvas
                    formik={formik}
                    selectedSectionId={selection.selectedSectionId}
                    selectedFieldId={selection.selectedFieldId}
                    showFullStructure={showFullStructure}
                    onSelect={selectCanvasField}
                    onShowFullStructureChange={setShowFullStructure}
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
          aria-labelledby="admission-form-side-panel-title"
          sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
          slotProps={{ paper: { sx: { width: { xs: 1, sm: 440 }, maxWidth: 1 } } }}
        >
          <Stack sx={{ height: 1, minHeight: 0 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
              <Typography id="admission-form-side-panel-title" variant="h6">
                {sidePanel === 'outline' ? 'Form outline' : 'Edit field'}
              </Typography>
              <IconButton aria-label="Close form side panel" onClick={() => setSidePanel(null)}>
                <Iconify icon="mdi:close" />
              </IconButton>
            </Stack>
            <Divider />
            <Tabs
              value={sidePanel ?? 'settings'}
              onChange={(_, value: 'settings' | 'outline') => setSidePanel(value)}
              variant="fullWidth"
              aria-label="Builder side panel views"
            >
              {selection.selectedLocation && <Tab value="settings" label="Field settings" />}
              <Tab value="outline" label="Outline" />
            </Tabs>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              {sidePanel === 'outline' ? (
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
              ) : (
                <FormBuilderProperties
                  formik={formik}
                  selectedLocation={selection.selectedLocation}
                />
              )}
            </Box>
          </Stack>
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
