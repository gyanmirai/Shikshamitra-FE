import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  useSensor,
  DndContext,
  useSensors,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';

import { FormBuilderPalette } from './form-builder-palette';
import { reorderFormBuilder } from './reorder-form-builder';
import { FormValidationPanel } from './form-validation-panel';
import { FormBuilderProperties } from './form-builder-properties';
import { FormBuilderCanvas } from './components/form-builder-canvas';
import { FormBuilderWorkspace } from './components/form-builder-workspace';
import { useFormBuilderCommands } from './hooks/use-form-builder-commands';
import { useFormBuilderSelection } from './hooks/use-form-builder-selection';
import { FormBuilderValidationNotice } from './components/form-builder-validation-notice';

export function FormBuilderSections({
  formik,
}: {
  formik: FormikProps<CreateUpdateAdmissionForm>;
}) {
  const selection = useFormBuilderSelection(formik.values.sections);
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
      <FormBuilderWorkspace
        panel={selection.panel}
        onPanelChange={selection.setPanel}
        fields={
          <>
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
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <FormBuilderPalette
                systemFields={commands.systemFieldsQuery.data ?? []}
                targetLabel={selection.selectedSection?.name}
                onAddField={commands.addField}
              />
            </Box>
          </>
        }
        form={
          <FormBuilderCanvas
            formik={formik}
            selectedSectionId={selection.selectedSectionId}
            selectedFieldId={selection.selectedFieldId}
            onSelect={selection.select}
            onAdd={commands.addCanvasUnit}
            onShowFields={() => selection.setPanel('fields')}
          />
        }
        settings={
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <FormBuilderProperties formik={formik} selectedLocation={selection.selectedLocation} />
          </Box>
        }
      >
        <FormBuilderValidationNotice formik={formik} onSelect={selection.select} />
        <FormValidationPanel form={formik.values} onSelectField={selection.selectField} />
      </FormBuilderWorkspace>
    </DndContext>
  );
}
