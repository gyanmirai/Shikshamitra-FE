import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
              <ButtonGroup
                size="small"
                aria-label="Form canvas view"
                sx={{ alignSelf: 'center', m: 1, flexShrink: 0 }}
              >
                <Button
                  variant={canvasMode === 'design' ? 'contained' : 'outlined'}
                  onClick={() => setCanvasMode('design')}
                >
                  Design
                </Button>
                <Button
                  variant={canvasMode === 'preview' ? 'contained' : 'outlined'}
                  onClick={() => setCanvasMode('preview')}
                >
                  Applicant preview
                </Button>
              </ButtonGroup>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                {canvasMode === 'design' ? (
                  <FormBuilderCanvas
                    formik={formik}
                    selectedSectionId={selection.selectedSectionId}
                    selectedFieldId={selection.selectedFieldId}
                    showFullStructure={showFullStructure}
                    onSelect={selection.select}
                    onAdd={commands.addCanvasUnit}
                    onShowSectionLibrary={sectionLibrary.onTrue}
                    onShowFields={fieldLibrary.onTrue}
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
          <FormValidationPanel form={formik.values} onSelectField={selection.selectField} />
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
