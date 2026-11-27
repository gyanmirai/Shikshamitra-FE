import type { ReactNode } from 'react';
import type {
  AssignmentDetails,
  AssignmentPolicySelection,
} from 'src/redux/finance/studentFeeAssignment';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { fDate } from 'src/utils/format-time';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailField } from 'src/screens/finance/components/detail-view';
import { Stack, Alert, Button, Divider, Typography } from '@mui/material';
import {
  assignmentError,
  assignmentPolicyFamilies,
  useAssignmentPolicyOptionsQuery,
  useAssignmentUpdatePoliciesMutation,
} from 'src/redux/finance/studentFeeAssignment';

import AssignmentReview from './AssignmentReview';
import AssignmentPolicies from './AssignmentPolicies';
import VariableFeeChangeEditor from './VariableFeeChangeEditor';
import OptionalFeeServiceStops from './OptionalFeeServiceStops';
import AssignmentFeeHeadSummary from './AssignmentFeeHeadSummary';
import AssignmentForm, { AssignmentPreviewDialog } from './AssignmentForm';

export default function AssignedPolicyEditor({
  data,
  onCancel,
  onSaved,
  onBusyChange,
  onDirtyChange,
  children,
  canStopOptionalService,
  canRestartOptionalService,
  canOverridePolicies = true,
  canChangeVariableFees = false,
  onOptionalServiceSaved,
  onEditFees,
}: {
  data: AssignmentDetails;
  onCancel: () => void;
  onSaved: () => void;
  onBusyChange?: (busy: boolean) => void;
  onDirtyChange: (dirty: boolean) => void;
  children?: ReactNode;
  canStopOptionalService?: boolean;
  canRestartOptionalService?: boolean;
  canOverridePolicies?: boolean;
  canChangeVariableFees?: boolean;
  onOptionalServiceSaved?: () => void;
  onEditFees?: () => void;
}) {
  const [save, state] = useAssignmentUpdatePoliciesMutation();
  const policyOptions = useAssignmentPolicyOptionsQuery(
    { studentId: data.assignment.studentId, academicYearId: data.assignment.academicYearId },
    { skip: !canOverridePolicies }
  );
  const [error, setError] = useState('');
  const pending = useRef(false);
  const assignmentStamp = useRef(data.concurrencyStamp);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [variableEditorOpen, setVariableEditorOpen] = useState(false);
  const [variableDraftDirty, setVariableDraftDirty] = useState(false);
  const editFeesButton = useRef<HTMLButtonElement>(null);
  const restoreEditFocus = useRef(false);
  const [serviceBusy, setServiceBusy] = useState(false);
  const busy = state.isLoading || serviceBusy;
  const policiesDiffer = (policies: AssignmentPolicySelection[]) =>
    policies.some(
      (policy) =>
        policy.versionId !==
        (data.assignment.policies.find((saved) => saved.family === policy.family)?.versionId ??
          null)
    );
  const formik = useFormik<{ policies: AssignmentPolicySelection[]; reason: string }>({
    validateOnChange: false,
    initialValues: {
      policies: assignmentPolicyFamilies
        .filter((family) => family !== 'proration')
        .map((family) => ({
          family,
          versionId: data.assignment.policies.find((p) => p.family === family)?.versionId ?? null,
        })),
      reason: '',
    },
    validationSchema: !canOverridePolicies
      ? Yup.object({})
      : Yup.object({
          reason: Yup.string()
            .trim()
            .max(500)
            .test(
              'changed-policy-reason',
              'Enter a policy change reason.',
              (value, context) => !policiesDiffer(context.parent.policies) || Boolean(value)
            ),
          policies: Yup.array()
            .test(
              'collection',
              'Select a collection policy.',
              (policies) => !!policies?.find((p) => p.family === 'collection')?.versionId
            )
            .test(
              'refund',
              'Select a refund policy.',
              (policies) => !!policies?.find((p) => p.family === 'refund')?.versionId
            ),
        }),
    onSubmit: async (values) => {
      if (pending.current || busy) return;
      if (!policiesDiffer(values.policies)) {
        onCancel();
        return;
      }
      if (!canOverridePolicies) return;
      pending.current = true;
      setError('');
      try {
        await save({
          studentId: data.assignment.studentId,
          academicYearId: data.assignment.academicYearId,
          concurrencyStamp: assignmentStamp.current,
          ...values,
        }).unwrap();
        onDirtyChange(false);
        shikshaMitraToast.success({ message: 'Assigned policies updated.' });
        onSaved();
      } catch (e) {
        setError(assignmentError(e));
      } finally {
        pending.current = false;
      }
    },
  });
  const policiesChanged = policiesDiffer(formik.values.policies);
  const formBusy = busy || formik.isSubmitting;
  const variableHeads =
    data.assignment.heads?.filter((head) => head.isVariable && head.included) ?? [];
  const canEditVariable =
    canChangeVariableFees && variableHeads.some((head) => head.canChangeVariableFee);
  const editRestriction = formBusy
    ? 'Wait for the current fee assignment operation to finish.'
    : formik.dirty
      ? 'Save or discard the pending policy changes before editing fees.'
      : !canEditVariable && !onEditFees
        ? !canChangeVariableFees
          ? 'Editing variable fees requires an active enrollment and permission to edit service dates.'
          : `No variable fee has an eligible monthly schedule.${data.structureEditBlocker ? ` ${data.structureEditBlocker}` : ''}`
        : undefined;
  const openPreview = async () => {
    if (formBusy || formik.isValidating || variableEditorOpen) return;
    setError('');
    if (policiesChanged) {
      const errors = await formik.validateForm();
      if (errors.reason || typeof errors.policies === 'string') {
        setError(errors.reason || String(errors.policies));
        return;
      }
    }
    setPreviewOpen(true);
  };
  useEffect(() => {
    onBusyChange?.(formBusy);
    return () => onBusyChange?.(false);
  }, [formBusy, onBusyChange]);
  useEffect(() => {
    onDirtyChange(formik.dirty || variableDraftDirty);
    return () => onDirtyChange(false);
  }, [formik.dirty, variableDraftDirty, onDirtyChange]);
  useEffect(() => {
    if (variableEditorOpen) {
      restoreEditFocus.current = true;
    } else if (restoreEditFocus.current) {
      editFeesButton.current?.focus();
      restoreEditFocus.current = false;
    }
  }, [variableEditorOpen]);
  return (
    <>
      <AssignmentForm
        busy={formBusy && !variableEditorOpen}
        busyLabel="Saving…"
        onCancel={onCancel}
        onPreview={async (event) => {
          event.preventDefault();
          await openPreview();
        }}
        previewDisabled={formBusy || formik.isValidating || variableEditorOpen}
      >
        <Stack role="region" aria-label="Assigned policy fields" spacing={2}>
          {error && !previewOpen && <Alert severity="error">{error}</Alert>}
          {!variableEditorOpen && (onEditFees || variableHeads.length > 0) && (
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
              {canEditVariable && onEditFees && (
                <Button
                  size="small"
                  variant="outlined"
                  disabled={Boolean(editRestriction)}
                  onClick={onEditFees}
                >
                  Edit assignment
                </Button>
              )}
              <CustomTooltip title={editRestriction ?? ''} describeChild arrow>
                <span
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keep the disabled action's explanation reachable by keyboard.
                  tabIndex={editRestriction && !formBusy ? 0 : undefined}
                  style={{ display: 'inline-flex' }}
                >
                  <Button
                    ref={editFeesButton}
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon={GlobalIcons.edit} />}
                    disabled={Boolean(editRestriction)}
                    onClick={canEditVariable ? () => setVariableEditorOpen(true) : onEditFees}
                  >
                    Edit fees
                  </Button>
                </span>
              </CustomTooltip>
            </Stack>
          )}
          {variableEditorOpen && (
            <VariableFeeChangeEditor
              data={data}
              onClose={() => setVariableEditorOpen(false)}
              onSaved={() => {
                setVariableEditorOpen(false);
                onSaved();
              }}
              onBusyChange={setServiceBusy}
              onDirtyChange={setVariableDraftDirty}
            />
          )}
          {children}
          <FormSectionCard
            title="Fee Structure"
            icon="mdi:file-document-outline"
            descriptionTooltip="The saved fee structure and revision for this student and academic year."
          >
            <Typography variant="body2">{data.assignment.structureName}</Typography>
          </FormSectionCard>
          <AssignmentPolicies
            studentId={data.assignment.studentId}
            academicYearId={data.assignment.academicYearId}
            defaults={data.assignment.policies}
            selections={formik.values.policies}
            reason={formik.values.reason}
            editing
            canOverride={canOverridePolicies}
            disabled={busy || variableEditorOpen}
            onChange={(policies, reason) => {
              formik.setValues({
                policies: [...policies].sort(
                  (a, b) =>
                    assignmentPolicyFamilies.indexOf(a.family) -
                    assignmentPolicyFamilies.indexOf(b.family)
                ),
                reason,
              });
            }}
          />
          <FormSectionCard
            title="Required Fee Heads"
            icon="mdi:format-list-checks"
            descriptionTooltip={
              onEditFees
                ? 'Review the saved amounts and service dates for required fees. See Preview for calculations.'
                : data.structureEditBlocker ||
                  'Required fees are read-only. See Preview for calculations.'
            }
          >
            <Stack spacing={1.5} divider={<Divider flexItem />}>
              {(data.assignment.heads ?? [])
                .filter((head) => !head.isOptional && head.included)
                .map((head) => (
                  <AssignmentFeeHeadSummary
                    key={head.feeHeadId}
                    head={head}
                    currency={data.assignment.currency}
                    serviceDetails={
                      <DetailField
                        label="Service dates"
                        value={
                          head.servicePeriod?.startDate && head.servicePeriod?.endDate
                            ? `${fDate(head.servicePeriod.startDate)} – ${fDate(head.servicePeriod.endDate)}`
                            : 'Not recorded'
                        }
                      />
                    }
                  />
                ))}
            </Stack>
          </FormSectionCard>
          {(data.assignment.heads ?? []).some((head) => head.isOptional) && (
            <OptionalFeeServiceStops
              assignment={data.assignment}
              canRestart={canRestartOptionalService}
              disabled={!canStopOptionalService || formik.dirty || busy || variableEditorOpen}
              disabledReason={
                !canStopOptionalService
                  ? 'Optional service cancellation requires the Stop Optional Service permission and an active enrollment.'
                  : formik.dirty
                    ? 'Save or discard the pending policy changes before changing an optional service.'
                    : variableEditorOpen
                      ? 'Finish editing the variable fee before changing an optional service.'
                      : busy
                        ? 'Another fee assignment operation is in progress.'
                        : undefined
              }
              onSaved={onOptionalServiceSaved}
              onBusyChange={setServiceBusy}
            />
          )}
        </Stack>
      </AssignmentForm>
      {previewOpen && (
        <AssignmentPreviewDialog
          busy={formBusy}
          onClose={() => setPreviewOpen(false)}
          action={
            policiesChanged && canOverridePolicies
              ? { label: 'Save policies', onClick: formik.handleSubmit }
              : undefined
          }
        >
          {error && (
            <Alert severity="error">
              {error} Reopen the assignment if another user changed it.
            </Alert>
          )}
          {formik.errors.reason && <Alert severity="error">{formik.errors.reason}</Alert>}
          <AssignmentReview data={data.assignment} committed />
          {policiesChanged && (
            <FormSectionCard
              title="Policy Changes"
              icon="mdi:shield-check-outline"
              descriptionTooltip="Review the pending policies before saving. Assigned amounts are unchanged."
            >
              <AssignmentPolicies
                studentId={data.assignment.studentId}
                academicYearId={data.assignment.academicYearId}
                defaults={[...data.assignment.policies, ...(policyOptions.data ?? [])]}
                selections={formik.values.policies}
                reason={formik.values.reason}
                canOverride={false}
                onChange={() => {}}
              />
              <DetailField label="Policy change reason" value={formik.values.reason} />
            </FormSectionCard>
          )}
        </AssignmentPreviewDialog>
      )}
    </>
  );
}
