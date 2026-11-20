'use client';

import type { RootState } from 'src/redux/store';
import type { ChargeEditorContext } from 'src/redux/library/charges-management/charge-editor-types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { DialogScrollContent } from 'src/components/customDialog';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Alert, Stack, Button, DialogActions, CircularProgress } from '@mui/material';
import {
  buildCreateChargePayload,
  buildUpdateChargePayload,
} from 'src/redux/library/library-adapters';
import {
  useAddLibraryChargeMutation,
  useUpdateLibraryChargeMutation,
} from 'src/redux/library/charges-management/charges-get-api';

import { ChargeAssessmentInputs } from './ChargeAssessmentInputs';
import { useOpenedChargeContext } from './useOpenedChargeContext';
import { assignLibraryChargeInitialValues } from './AssignChargeInitialValues';
import { ChargeSavedSource, ChargeCreateSource } from './ChargeEditorSourceFields';
import { assignLibraryChargeValidationSchema } from './AssignChargesValidationSchema';

import type { IAssignChargesFormProps } from './type';

function OpenedChargeEditor({
  onClose,
  yearId,
  context,
}: {
  onClose: IAssignChargesFormProps['onClose'];
  yearId: string;
  context?: ChargeEditorContext;
}) {
  const assessment = context?.assessment;
  const [fixed, setFixed] = useState(false);
  // An opened form retains its exact version until submitted or deliberately
  // reopened. A background query refresh must not rebind an unsaved draft.
  const [initial] = useState(() =>
    assignLibraryChargeInitialValues(
      assessment
        ? {
            ...assessment,
            role: assessment.role === 0 ? 'Student' : 'Staff',
            chargeCategory: assessment.chargeCategoryId,
            bookNumber: assessment.accessionNo || '',
            reason: assessment.remarks || '',
          }
        : undefined,
      yearId
    )
  );
  const [create, creating] = useAddLibraryChargeMutation();
  const [update, updating] = useUpdateLibraryChargeMutation();
  const [saveError, setSaveError] = useState<string | null>(null);
  const formik = useFormik({
    initialValues: initial,
    validationSchema: assignLibraryChargeValidationSchema(),
    onSubmit: async (values) => {
      setSaveError(null);
      try {
        const data = {
          ...values,
          schoolChargeDate: values.chargeDate,
          schoolDueDate: values.dueDate,
        };
        if (assessment)
          await update({ chargeId: assessment.id, body: buildUpdateChargePayload(data) }).unwrap();
        else await create({ body: buildCreateChargePayload(data) }).unwrap();
        shikshaMitraToast.success({
          message: assessment ? 'Charge updated successfully' : 'Charge assigned successfully',
        });
        onClose(null, true);
      } catch (failure) {
        const { detail } = parseApiProblemDetail(failure);
        setSaveError(detail);
        shikshaMitraToast.error({ message: detail });
      }
    },
  });
  const saving = creating.isLoading || updating.isLoading || formik.isSubmitting;
  const disabled = saving || Boolean(context && !context.canAmend);
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Stack spacing={2}>
          {!initial.academicYearId && (
            <Alert severity="warning">
              {assessment
                ? 'This assessment needs its original academic year reviewed before it can be amended.'
                : 'Choose an academic year in the header, then reopen this form.'}
            </Alert>
          )}
          {context?.amendmentBlockedReason && (
            <Alert severity="warning">{context.amendmentBlockedReason}</Alert>
          )}
          {assessment ? (
            <ChargeSavedSource assessment={assessment} />
          ) : (
            <ChargeCreateSource formik={formik} disabled={disabled} onFixedChange={setFixed} />
          )}
          <ChargeAssessmentInputs
            formik={formik}
            disabled={disabled}
            fixed={fixed}
            isUpdate={Boolean(assessment)}
          />
          {saveError && <Alert severity="error">{saveError}</Alert>}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onClose(null, false)}
          disabled={saving}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => formik.handleSubmit()}
          disabled={disabled || !initial.academicYearId}
          startIcon={
            saving ? <CircularProgress size={16} /> : <Iconify icon={GlobalIcons.submit} />
          }
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
}

export default function AssignChargesForm({ open, onClose, editData }: IAssignChargesFormProps) {
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear) as {
    id?: string;
  };
  const [yearId] = useState(() => currentYear?.id || '');
  const chargeId = editData ? String(editData.id) : '';
  const { context, query, retry } = useOpenedChargeContext(open, chargeId);
  if (!open) return null;
  if (editData && !context)
    return (
      <>
        <DialogScrollContent>
          {query.isError ? (
            <Alert severity="error" action={<Button onClick={retry}>Retry</Button>}>
              {parseApiProblemDetail(query.error).detail}
            </Alert>
          ) : (
            <CircularProgress size={24} aria-label="Load assessment" />
          )}
        </DialogScrollContent>
        <DialogActions>
          <Button onClick={() => onClose(null, false)}>Cancel</Button>
        </DialogActions>
      </>
    );
  return (
    <OpenedChargeEditor
      key={chargeId || `create:${yearId}`}
      onClose={onClose}
      yearId={yearId}
      context={context || undefined}
    />
  );
}
