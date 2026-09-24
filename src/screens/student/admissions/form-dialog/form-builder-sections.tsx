import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
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
import { FormBuilderFieldLibraryDrawer } from './components/form-builder-field-library-drawer';
import { FormBuilderSectionLibraryDrawer } from './components/form-builder-section-library-drawer';

export function FormBuilderSections({
  formik,
}: {
  formik: FormikProps<CreateUpdateAdmissionForm>;
}) {
  const selection = useFormBuilderSelection(formik.values.sections);
  const [canvasMode, setCanvasMode] = useState<'design' | 'preview'>('design');
  const [showFullStructure, setShowFullStructure] = useState(false);
  const fieldLibrary = useBoolean();
  const sectionLibrary = useBoolean();
  const commands = useFormBuilderCommands(formik, selection.selectedSectionId, selection.select);
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
          panel={selection.panel}
          onPanelChange={selection.setPanel}
          outline={
            <FormBuilderOutline
              form={formik.values}
              selectedSectionId={selection.selectedSectionId}
              onSelectSection={(sectionId) => {
                selection.select(sectionId, null);
                setShowFullStructure(false);
              }}
              onAddSection={sectionLibrary.onTrue}
              onAddField={fieldLibrary.onTrue}
            />
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
                        {selectedSection?.name || 'Untitled section'}
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
                      onSelectField={selection.selectField}
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
                        startIcon={<Iconify icon="mdi:format-list-bulleted" />}
                        onClick={() => setShowFullStructure(true)}
                      >
                        Structure
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Iconify icon="mdi:plus" />}
                        onClick={fieldLibrary.onTrue}
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
                    onSelect={selection.select}
                    onShowFullStructureChange={setShowFullStructure}
                  />
                ) : (
                  <FormBuilderLivePreview form={formik.values} />
                )}
              </Box>
            </Box>
          }
          settings={
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <FormBuilderProperties
                formik={formik}
                selectedLocation={selection.selectedLocation}
              />
            </Box>
          }
        >
          <FormBuilderValidationNotice formik={formik} onSelect={selection.select} />
        </FormBuilderWorkspace>

        <FormBuilderFieldLibraryDrawer
          open={fieldLibrary.value}
          targetLabel={selection.selectedSection?.name}
          systemFields={commands.systemFieldsQuery.data ?? []}
          loading={commands.systemFieldsQuery.isLoading}
          error={commands.systemFieldsQuery.isError}
          onRetry={() => commands.systemFieldsQuery.refetch()}
          onClose={fieldLibrary.onFalse}
          onAddField={commands.addField}
        />
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
