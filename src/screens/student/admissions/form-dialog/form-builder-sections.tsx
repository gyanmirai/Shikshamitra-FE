import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useEffect, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Stack, Button, Typography } from '@mui/material';
import { useGetAdmissionFormSystemFieldsQuery } from 'src/redux/student/admissions/admission-forms-api';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSensor,
  DndContext,
  useSensors,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
} from '@dnd-kit/core';

import { FormBuilderStep } from './form-builder-step';
import { FormBuilderSection } from './form-builder-section';
import { FormBuilderPalette } from './form-builder-palette';
import { FormValidationPanel } from './form-validation-panel';
import { FormBuilderProperties } from './form-builder-properties';
import { newField, nextFieldOrder, hasSystemBinding } from './form-dialog-model';
import { nextSectionNumber, getAdmissionFormStepGroups } from './form-step-groups';

import type { AdmissionFieldPreset } from './form-field-presets';

export function FormBuilderSections({
  formik,
}: {
  formik: FormikProps<CreateUpdateAdmissionForm>;
}) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    formik.values.sections[0]?.fields[0]?.id ?? null
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    formik.values.sections[0]?.id ?? null
  );
  const isStepper = formik.values.layoutType === 1;
  const steps = getAdmissionFormStepGroups(formik.values.sections);
  const { data: systemFields = [] } = useGetAdmissionFormSystemFieldsQuery();
  useEffect(() => {
    const selectedSectionStillExists = formik.values.sections.some(
      (section) => section.id === selectedSectionId
    );
    if (selectedSectionStillExists) return;

    const firstSection = formik.values.sections[0];
    setSelectedSectionId(firstSection?.id ?? null);
    setSelectedFieldId(firstSection?.fields[0]?.id ?? null);
  }, [formik.values.sections, selectedSectionId]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const addCanvasUnit = () => {
    const id = crypto.randomUUID();
    const sectionNumber = nextSectionNumber(formik.values.sections);
    const stepId = isStepper ? crypto.randomUUID() : undefined;
    const stepOrder = steps.length;
    formik.setFieldValue('sections', [
      ...formik.values.sections,
      {
        id,
        code: `SECTION_${sectionNumber}`,
        name: `Section ${isStepper ? 1 : sectionNumber}`,
        displayOrder: formik.values.sections.length,
        stepId,
        stepCode: stepId ? `STEP_${stepOrder + 1}` : undefined,
        stepName: stepId ? `Step ${stepOrder + 1}` : undefined,
        stepDisplayOrder: stepId ? stepOrder : undefined,
        fields: [],
      },
    ]);
    setSelectedSectionId(id);
    setSelectedFieldId(null);
  };
  const addField = (
    fieldType: CreateUpdateAdmissionForm['sections'][number]['fields'][number]['fieldType'],
    systemBinding?: string,
    preset?: AdmissionFieldPreset
  ) => {
    if (systemBinding && hasSystemBinding(formik.values.sections, systemBinding)) {
      shikshaMitraToast.error({
        message: 'This student field is already added to the form.',
      });
      return;
    }
    const selectedIndex = formik.values.sections.findIndex(
      (section) => section.id === selectedSectionId
    );
    const sectionIndex = selectedIndex >= 0 ? selectedIndex : 0;
    const section = formik.values.sections[sectionIndex] ?? {
      id: crypto.randomUUID(),
      code: 'SECTION_1',
      name: 'Student Details',
      displayOrder: 0,
      fields: [],
    };
    const metadata = systemFields.find((item) => item.key === systemBinding);
    const field = newField(
      section.id,
      nextFieldOrder(formik.values.sections),
      metadata?.fieldType ?? fieldType,
      preset
    );
    if (metadata) {
      field.code = metadata.key.replace(/[^A-Za-z0-9]+/g, '_').toUpperCase();
      field.label = metadata.displayName;
      field.bindingType = 0;
      field.bindingKey = metadata.key;
      field.readOnly = metadata.readOnly;
      field.optionsJson = metadata.optionsJson;
    }
    if (formik.values.sections.length)
      formik.setFieldValue(`sections[${sectionIndex}].fields`, [...section.fields, field]);
    else formik.setFieldValue('sections', [{ ...section, fields: [field] }]);
    setSelectedFieldId(field.id);
    setSelectedSectionId(section.id);
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId.startsWith('section:') && overId.startsWith('section:')) {
      const from = formik.values.sections.findIndex(
        (section) => `section:${section.id}` === activeId
      );
      const to = formik.values.sections.findIndex((section) => `section:${section.id}` === overId);
      if (from < 0 || to < 0) return;
      const sections = [...formik.values.sections];
      const [moved] = sections.splice(from, 1);
      sections.splice(to, 0, moved);
      formik.setFieldValue(
        'sections',
        sections.map((section, index) => ({ ...section, displayOrder: index }))
      );
      return;
    }
    if (!activeId.startsWith('field:') || !overId.startsWith('field:')) return;
    const [, activeSectionId, activeFieldId] = activeId.split(':');
    const [, overSectionId, overFieldId] = overId.split(':');
    const sourceIndex = formik.values.sections.findIndex(
      (section) => section.id === activeSectionId
    );
    const targetIndex = formik.values.sections.findIndex((section) => section.id === overSectionId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const sourceFields = [...formik.values.sections[sourceIndex].fields];
    const fieldIndex = sourceFields.findIndex((field) => field.id === activeFieldId);
    if (fieldIndex < 0) return;
    const [moved] = sourceFields.splice(fieldIndex, 1);
    const targetFields =
      sourceIndex === targetIndex ? sourceFields : [...formik.values.sections[targetIndex].fields];
    const targetFieldIndex = targetFields.findIndex((field) => field.id === overFieldId);
    targetFields.splice(targetFieldIndex < 0 ? targetFields.length : targetFieldIndex, 0, {
      ...moved,
      sectionId: formik.values.sections[targetIndex].id,
    });
    const sections = formik.values.sections.map((section, index) => ({
      ...section,
      fields: (index === sourceIndex
        ? sourceFields
        : index === targetIndex
          ? targetFields
          : section.fields
      ).map((field, order) => ({ ...field, displayOrder: order })),
    }));
    formik.setFieldValue('sections', sections);
    setSelectedSectionId(formik.values.sections[targetIndex].id);
  };
  const selectedLocation = formik.values.sections.reduce<{
    sectionIndex: number;
    fieldIndex: number;
  } | null>((found, section, sectionIndex) => {
    if (found) return found;
    const fieldIndex = section.fields.findIndex((field) => field.id === selectedFieldId);
    return fieldIndex >= 0 ? { sectionIndex, fieldIndex } : null;
  }, null);
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <Box
        sx={{
          height: { lg: 1 },
          maxHeight: { lg: 1 },
          minHeight: { xs: 0, lg: 520 },
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: 'minmax(240px, 0.8fr) minmax(520px, 2fr) minmax(340px, 1fr)',
          },
          gap: 1.5,
        }}
      >
        <Stack spacing={1.5} sx={{ height: { lg: 1 }, minHeight: 0, overflow: 'hidden' }}>
          <Box
            sx={{
              flex: 1,
              minHeight: { xs: 500, lg: 360 },
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <FormBuilderPalette
              systemFields={systemFields}
              targetLabel={
                isStepper
                  ? formik.values.sections.find((section) => section.id === selectedSectionId)?.name
                  : undefined
              }
              onAddField={addField}
            />
          </Box>
          <FormValidationPanel form={formik.values} onSelectField={setSelectedFieldId} />
        </Stack>
        <Stack
          sx={{
            minHeight: { xs: 500, lg: 0 },
            height: { lg: 1 },
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ p: 1.5, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}
          >
            <Box>
              <Typography variant="subtitle1">
                {isStepper ? 'Form steps' : 'Form canvas'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isStepper
                  ? 'Create steps, then add one or more sections inside each step.'
                  : 'Arrange sections and select a field to configure it.'}
              </Typography>
            </Box>
            <Button size="small" startIcon={<Iconify icon="mdi:plus" />} onClick={addCanvasUnit}>
              {isStepper ? 'Add step' : 'Add section'}
            </Button>
          </Stack>
          <Scrollbar fillContent sx={{ flex: 1, minHeight: 0 }}>
            <Box sx={{ p: 1.5 }}>
              {isStepper ? (
                <Stack spacing={1.5}>
                  {steps.map((step, stepIndex) => (
                    <FormBuilderStep
                      key={step.id}
                      formik={formik}
                      step={step}
                      stepIndex={stepIndex}
                      stepCount={steps.length}
                      selectedSectionId={selectedSectionId}
                      selectedFieldId={selectedFieldId}
                      onSelectSection={setSelectedSectionId}
                      onSelectField={(sectionId, fieldId) => {
                        setSelectedSectionId(sectionId);
                        setSelectedFieldId(fieldId);
                      }}
                    />
                  ))}
                </Stack>
              ) : (
                <SortableContext
                  items={formik.values.sections.map((section) => `section:${section.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <Stack spacing={1.5}>
                    {formik.values.sections.map((section, sectionIndex) => (
                      <FormBuilderSection
                        key={section.id}
                        formik={formik}
                        sectionIndex={sectionIndex}
                        selectedSectionId={selectedSectionId}
                        selectedFieldId={selectedFieldId}
                        onSelectSection={setSelectedSectionId}
                        onSelectField={(fieldId) => {
                          setSelectedSectionId(section.id);
                          setSelectedFieldId(fieldId);
                        }}
                      />
                    ))}
                  </Stack>
                </SortableContext>
              )}
            </Box>
          </Scrollbar>
        </Stack>
        <Box
          sx={{
            minHeight: { xs: 600, lg: 0 },
            height: { lg: 1 },
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <FormBuilderProperties formik={formik} selectedLocation={selectedLocation} />
        </Box>
      </Box>
    </DndContext>
  );
}
