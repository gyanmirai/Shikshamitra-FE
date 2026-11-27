import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import Button from '@mui/material/Button';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Card, Stack, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { FormBuilderStep } from '../form-builder-step';
import { formStepTransition } from '../form-step-transition';
import { setInheritedStepName } from '../form-inheritance-model';
import { getAdmissionFormStepGroups } from '../form-step-groups';
import { isLockedInquiryField } from '../inquiry-default-fields';
import { useFormInheritance } from '../hooks/use-form-inheritance';
import { FormBuilderStepHeader } from './form-builder-step-header';
import { getFormBuilderMoveOrderError } from '../reorder-form-builder';
import { EffectiveFormBuilderSection } from './inherited-form-sections';
import { FormBuilderMoveFieldDialog } from './form-builder-move-field-dialog';
import { AdmissionFormStepNavigation } from '../../components/admission-form-step-navigation';
import { getFieldMoveDestinations, changeBuilderFieldLocations } from '../form-builder-field-move';
import {
  getBuilderAddressFieldGroup,
  getLinkedFieldDeletionReasons,
} from '../form-builder-linked-fields';

import type { BuilderNavigationRequest } from '../types/builder-navigation';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  selectedSectionId: string | null;
  selectedFieldId: string | null;
  showAllSteps?: boolean;
  onSelect: (sectionId: string, fieldId: string | null) => void;
  newStepId: string | null;
  onNewStepReady: (stepId: string | null) => void;
  footer?: ReactNode;
  beforeSections?: ReactNode;
  effectiveForm?: CreateUpdateAdmissionForm;
  navigationRequest?: BuilderNavigationRequest;
  projectForm?: (form: CreateUpdateAdmissionForm) => CreateUpdateAdmissionForm;
  onMoveComplete?: (sectionId: string, fieldId: string) => void;
};

export function FormBuilderCanvas({
  formik,
  selectedSectionId,
  selectedFieldId,
  showAllSteps = false,
  onSelect,
  newStepId,
  onNewStepReady,
  footer,
  beforeSections,
  effectiveForm = formik.values,
  navigationRequest,
  projectForm = (form) => form,
  onMoveComplete = onSelect,
}: Props) {
  const inheritance = useFormInheritance();
  const [fieldAction, setFieldAction] = useState<{ id: string; type: 'move' | 'delete' }>();
  const isStepper = effectiveForm.layoutType === 1;
  const steps = getAdmissionFormStepGroups(effectiveForm.sections);
  const baseFields = formik.values.sections.flatMap((section) => section.fields);
  const effectiveFields = effectiveForm.sections.flatMap((section) => section.fields);
  const linkedFieldLocks = new Map([
    ...getLinkedFieldDeletionReasons(baseFields),
    ...getLinkedFieldDeletionReasons(effectiveFields),
  ]);
  const fieldForAction = (id: string) => {
    const base = baseFields.find((field) => field.id === id);
    const effective = effectiveFields.find((field) => field.id === id);
    if (!base || base.inheritedFrom || effective?.inheritedFrom) return undefined;
    const address =
      (effective && getBuilderAddressFieldGroup(effectiveFields, effective)) ??
      getBuilderAddressFieldGroup(baseFields, base);
    const fields = address?.fields.map((field) =>
      baseFields.find((item) => item.id === field.id)
    ) ?? [base];
    const hasInheritedField =
      address?.fields.some((field) => field.inheritedFrom) ||
      fields.some((field) => !field || field.inheritedFrom);
    return {
      fields: fields.filter((field) => field !== undefined),
      address: Boolean(address),
      name: new Intl.ListFormat('en').format(
        (address?.fields ?? [base]).map((field) => field.label || 'Untitled field')
      ),
      blockedReason:
        address?.blockedReason ??
        (hasInheritedField
          ? 'Move or delete these address fields in the source Inquiry form.'
          : undefined),
      deleteReason:
        isLockedInquiryField(formik.values.purpose, base, formik.values.coreFieldPolicyVersion) ||
        (!address && linkedFieldLocks.has(id)),
    };
  };
  const requestFieldAction = (id: string, type: 'move' | 'delete') => {
    const action = fieldForAction(id);
    if (!action || formik.isSubmitting || (type === 'delete' && action.deleteReason)) return;
    if (action.blockedReason) {
      shikshaMitraToast.warning({ message: action.blockedReason });
      return;
    }
    if (type === 'delete' && !action.address) {
      formik.setFieldValue(
        'sections',
        changeBuilderFieldLocations(formik.values.sections, action.fields)
      );
      return;
    }
    setFieldAction({ id, type });
  };
  const action = fieldAction && fieldForAction(fieldAction.id);
  const destinations = action
    ? getFieldMoveDestinations(formik.values, effectiveForm, action.fields)
    : [];
  const registrationSteps = formik.values.inheritance?.useRegistrationSteps
    ? getAdmissionFormStepGroups(formik.values.sections)
    : undefined;
  const activeStepIndex = Math.max(
    0,
    steps.findIndex((step) => step.sections.some(({ section }) => section.id === selectedSectionId))
  );
  const activeStep = steps[activeStepIndex];
  const selectSection = (sectionId: string) => onSelect(sectionId, null);
  const selectField = (sectionId: string, fieldId: string) => onSelect(sectionId, fieldId);
  const renderSection = (sectionIndex: number) => (
    <EffectiveFormBuilderSection
      key={effectiveForm.sections[sectionIndex].id}
      formik={formik}
      effectiveForm={effectiveForm}
      sectionIndex={sectionIndex}
      selectedSectionId={selectedSectionId}
      selectedFieldId={selectedFieldId}
      onSelect={onSelect}
      navigationRequest={navigationRequest}
      linkedFieldLocks={linkedFieldLocks}
      onFieldAction={requestFieldAction}
    />
  );
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1}
      sx={{
        height: 1,
        minHeight: 0,
        p: 1,
        bgcolor: 'background.paper',
        ...(footer && { pr: 0, pb: 0 }),
      }}
    >
      {isStepper && (
        <Box
          sx={{
            width: { xs: 1, md: 240, xl: 260 },
            flexShrink: 0,
            minHeight: 0,
            overflow: 'hidden',
            mb: footer ? 1 : 0,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              height: { xs: 'auto', md: 1 },
              maxHeight: 1,
              borderRadius: 2,
              borderColor: 'divider',
              '& .MuiStepLabel-root': { py: 0.5 },
              '& .MuiStepConnector-line': { minHeight: 16 },
            }}
          >
            <Scrollbar fillContent sx={{ flex: { xs: '0 1 auto', md: 1 }, minHeight: 0 }}>
              <Box sx={{ p: 1.5 }}>
                <AdmissionFormStepNavigation
                  steps={steps.map((step) => ({
                    id: step.id,
                    name: step.name,
                    caption: `${step.sections.length} ${step.sections.length === 1 ? 'section' : 'sections'}`,
                  }))}
                  activeStep={activeStepIndex}
                  onStepChange={(index) => selectSection(steps[index].sections[0].section.id)}
                  disabled={formik.isSubmitting}
                  renderStepLabel={(index) => {
                    const effectiveStep = steps[index];
                    const editableSections = effectiveStep.sections.flatMap(({ section }) => {
                      const sectionIndex = formik.values.sections.findIndex(
                        (base) => base.id === section.id
                      );
                      return sectionIndex >= 0 ? [{ section, sectionIndex }] : [];
                    });
                    const registrationStep = registrationSteps?.find(
                      (step) => step.id === effectiveStep.id
                    );
                    const sourceOwned = registrationSteps
                      ? !registrationStep
                      : editableSections.length !== effectiveStep.sections.length ||
                        formik.values.layoutType === 0;
                    const sourceId =
                      effectiveStep.sections
                        .flatMap(({ section }) => section.fields)
                        .find((field) => field.inheritedFrom)?.inheritedFrom
                        ?.inquiryFormDefinitionId ?? inheritance?.sourceId;
                    const renameCandidate =
                      !registrationSteps &&
                      editableSections.length !== effectiveStep.sections.length &&
                      Boolean(sourceId) &&
                      Boolean(formik.values.inheritance?.enabled);
                    const sourceIndex =
                      formik.values.inheritance?.sources.findIndex(
                        (source) => source.inquiryFormDefinitionId === sourceId
                      ) ?? -1;
                    const canRenameInquiry = renameCandidate && sourceIndex >= 0;
                    return (
                      <FormBuilderStepHeader
                        formik={formik}
                        step={
                          registrationStep ??
                          (sourceOwned
                            ? effectiveStep
                            : { ...effectiveStep, sections: editableSections })
                        }
                        readOnly={sourceOwned && !canRenameInquiry}
                        namePath={
                          canRenameInquiry
                            ? `inheritance.sources[${sourceIndex}].stepNames.${effectiveStep.code}`
                            : undefined
                        }
                        onRename={
                          canRenameInquiry
                            ? (name) =>
                                formik.setValues(
                                  setInheritedStepName(
                                    formik.values,
                                    sourceId!,
                                    effectiveStep.code,
                                    name
                                  )
                                )
                            : undefined
                        }
                        navigationRequest={navigationRequest}
                        linkedFieldLocks={linkedFieldLocks}
                        selected={index === activeStepIndex}
                        onSelect={() => selectSection(steps[index].sections[0].section.id)}
                        newlyAdded={steps[index].id === newStepId}
                        onNewStepReady={onNewStepReady}
                      />
                    );
                  }}
                />
              </Box>
            </Scrollbar>
          </Card>
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, minWidth: 0 }}>
        <Scrollbar
          fillContent
          sx={{
            height: footer ? 'auto' : 1,
            flex: footer ? 1 : undefined,
            '& .simplebar-content-wrapper': { overflowX: 'hidden !important' },
            '& .simplebar-track.simplebar-horizontal': { display: 'none' },
          }}
        >
          <Stack spacing={1} sx={{ pb: 0.5, pr: footer ? 1 : 0.25 }}>
            {beforeSections}
            {!effectiveForm.sections.length && (
              <Typography variant="body2" color="text.secondary">
                This draft has no sections. Add a section to start building the form.
              </Typography>
            )}
            {isStepper ? (
              (showAllSteps ? steps : activeStep ? [activeStep] : []).map((step) => (
                <Box key={step.id} sx={formStepTransition}>
                  <FormBuilderStep
                    formik={formik}
                    step={step}
                    selectedSectionId={selectedSectionId}
                    selectedFieldId={selectedFieldId}
                    onSelectSection={selectSection}
                    onSelectField={selectField}
                    renderSection={renderSection}
                  />
                </Box>
              ))
            ) : (
              <SortableContext
                items={effectiveForm.sections.map((section) => `section:${section.id}`)}
                strategy={verticalListSortingStrategy}
              >
                {effectiveForm.sections.map((_, sectionIndex) => renderSection(sectionIndex))}
              </SortableContext>
            )}
          </Stack>
        </Scrollbar>
        {footer}
      </Box>
      {action && fieldAction?.type === 'move' && (
        <FormBuilderMoveFieldDialog
          key={fieldAction.id}
          name={action.name}
          address={action.address}
          destinations={destinations}
          onClose={() => setFieldAction(undefined)}
          onMove={(sectionId) => {
            if (action.blockedReason) return action.blockedReason;
            const destination = destinations.find((option) => option.value === sectionId);
            if (!destination || destination.reason || formik.isSubmitting)
              return 'Choose an available destination section.';
            const sections = changeBuilderFieldLocations(
              formik.values.sections,
              action.fields,
              sectionId
            );
            const orderError = getFormBuilderMoveOrderError(
              effectiveForm,
              projectForm({ ...formik.values, sections })
            );
            if (orderError) return orderError;
            formik.setFieldValue('sections', sections);
            setFieldAction(undefined);
            onMoveComplete(sectionId, fieldAction.id);
            return undefined;
          }}
        />
      )}
      {action && fieldAction?.type === 'delete' && (
        <ConfirmDialog
          open
          title="Delete address fields?"
          content={`This removes ${action.name} together from this draft.`}
          onClose={() => setFieldAction(undefined)}
          action={
            <Button
              type="button"
              variant="contained"
              color="error"
              startIcon={<Iconify icon={GlobalIcons.delete} />}
              disabled={Boolean(action.blockedReason || action.deleteReason || formik.isSubmitting)}
              onClick={() => {
                formik.setFieldValue(
                  'sections',
                  changeBuilderFieldLocations(formik.values.sections, action.fields)
                );
                setFieldAction(undefined);
              }}
            >
              Delete fields
            </Button>
          }
        />
      )}
    </Stack>
  );
}
