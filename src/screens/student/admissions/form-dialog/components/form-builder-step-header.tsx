import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useRef, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Stack, ButtonBase, IconButton } from '@mui/material';

import { hasLockedInquiryFields } from '../inquiry-default-fields';
import { FormBuilderUnitActions } from './form-builder-unit-actions';
import { FormBuilderUnitSettings } from './form-builder-unit-settings';

import type { AdmissionFormStepGroup } from '../form-step-groups';
import type { BuilderNavigationRequest } from '../types/builder-navigation';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  step: AdmissionFormStepGroup;
  selected: boolean;
  onSelect: () => void;
  newlyAdded: boolean;
  onNewStepReady: (stepId: string | null) => void;
  readOnly?: boolean;
  navigationRequest?: BuilderNavigationRequest;
};

export function FormBuilderStepHeader({
  formik,
  step,
  selected,
  onSelect,
  newlyAdded,
  onNewStepReady,
  readOnly = false,
  navigationRequest,
}: Props) {
  const settings = useBoolean(newlyAdded);
  const deleteDisabled = hasLockedInquiryFields(
    formik.values.purpose,
    formik.values.sections.filter((section) =>
      step.sections.some((item) => item.section.id === section.id)
    )
  );
  const { onTrue: openSettings } = settings;
  const headingRef = useRef<HTMLButtonElement>(null);
  const path = `sections[${step.sections[0].sectionIndex}].stepName`;
  const meta = formik.getFieldMeta<string>(path);
  const nameError = meta.touched
    ? !step.name.trim()
      ? 'Step heading is required'
      : meta.error
    : undefined;
  const editing = !readOnly && (settings.value || Boolean(nameError));
  const wasEditing = useRef(editing);
  useEffect(() => {
    if (wasEditing.current && !editing) headingRef.current?.focus();
    wasEditing.current = editing;
  }, [editing]);
  useEffect(() => {
    if (newlyAdded) {
      openSettings();
      onNewStepReady(null);
    }
  }, [newlyAdded, onNewStepReady, openSettings]);
  useEffect(() => {
    const target = navigationRequest?.target;
    if (!target || target.kind !== 'step' || target.stepId !== step.id) return undefined;
    const editHeading = !readOnly && target.settingPath?.endsWith('.stepName');
    if (editHeading) openSettings();
    const frame = requestAnimationFrame(() => {
      const element = editHeading
        ? document.getElementById(`step-heading-${step.id}`)
        : headingRef.current;
      element?.scrollIntoView?.({ block: 'nearest' });
      element?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [navigationRequest, step.id, readOnly, openSettings]);
  const finishEditing = () => {
    formik.setFieldTouched(path, true);
    if (!step.name.trim()) return;
    settings.onFalse();
    headingRef.current?.focus();
  };
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        minWidth: 0,
        width: 1,
        px: 0.5,
        borderRadius: 1,
        bgcolor: 'background.paper',
      }}
    >
      {editing ? (
        <FormBuilderUnitSettings
          id={`step-heading-${step.id}`}
          unit="Step"
          name={step.name}
          nameError={nameError}
          onNameBlur={() => formik.setFieldTouched(path, true)}
          onNameChange={(stepName) =>
            formik.setFieldValue(
              'sections',
              formik.values.sections.map((section) =>
                (section.stepId ?? section.id) === step.id
                  ? { ...section, stepId: step.id, stepName }
                  : section
              )
            )
          }
          onDone={finishEditing}
        />
      ) : (
        <ButtonBase
          ref={headingRef}
          disabled={formik.isSubmitting}
          onClick={onSelect}
          aria-current={selected ? 'step' : undefined}
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 44,
            px: 0.5,
            textAlign: 'left',
            justifyContent: 'flex-start',
            borderRadius: 1,
            typography: 'subtitle2',
            color: selected ? 'text.primary' : 'text.secondary',
            '&:focus-visible': { outline: 2, outlineColor: 'primary.main' },
          }}
        >
          <Box component="span" sx={{ overflowWrap: 'anywhere' }}>
            {step.name}
          </Box>
        </ButtonBase>
      )}
      {readOnly ? null : editing ? (
        <IconButton
          size="small"
          aria-label="Finish editing step heading"
          onClick={finishEditing}
          sx={{ width: 44, height: 44 }}
        >
          <Iconify icon="mdi:check" width={18} />
        </IconButton>
      ) : (
        <FormBuilderUnitActions
          name={step.name}
          unit="step"
          disabled={formik.isSubmitting}
          deleteDisabled={deleteDisabled}
          onEdit={() => {
            onSelect();
            settings.onTrue();
          }}
          onDelete={() => {
            if (deleteDisabled) return;
            formik.setFieldValue(
              'sections',
              formik.values.sections.filter((section) => (section.stepId ?? section.id) !== step.id)
            );
          }}
        />
      )}
    </Stack>
  );
}
