'use client';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useBoolean } from 'src/hooks/use-boolean';
import { Button, DialogActions } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useAddYearMutation, useUpdateYearMutation } from 'src/redux/year/yearApi';

import { ConfirmDialog } from '../confirm-dialog';
import { DialogScrollContent } from '../customDialog';
import { AcademicFormSection } from './academic-form-section';
import { useAcademicFormClose } from './academic-form-close-context';
import { AcademicFormActionIcon } from './academic-form-action-icon';
import { AcademicYearDateFields } from './academic-year-date-fields';
import { formatAcademicYearDateForPayload } from './academic-year-date-utils';
import {
  buildAcademicYearName,
  getAcademicYearInitialValues,
  academicYearValidationSchema,
} from './academic-year-form-model';

import type { AcademicYearRecord } from './academic-setup-model';

type AcademicYearFormProps = { editData: AcademicYearRecord | null; onClose: () => void };

export const AcademicYearForm = ({ editData, onClose }: AcademicYearFormProps) => {
  const confirm = useBoolean();
  const [addYear, { isLoading: isAdding }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddYearMutation,
    popupConfig: { success: true, successMessage: 'Academic year created successfully' },
  });
  const [updateYear, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateYearMutation,
    popupConfig: { success: true, successMessage: 'Academic year updated successfully' },
  });
  const isSaving = isAdding || isUpdating;

  const formik = useFormik({
    initialValues: getAcademicYearInitialValues(editData),
    validationSchema: academicYearValidationSchema,
    enableReinitialize: true,
    onSubmit: confirm.onTrue,
  });
  const requestClose = useAcademicFormClose(formik.dirty, isSaving, onClose);

  const saveAcademicYear = async () => {
    const { startDate, endDate } = formik.values;
    const body = {
      name: buildAcademicYearName(startDate, endDate),
      startYear: formatAcademicYearDateForPayload(startDate),
      endYear: formatAcademicYearDateForPayload(endDate),
    };

    try {
      if (editData) await updateYear({ id: editData.id, body }).unwrap();
      else await addYear(body).unwrap();
      confirm.onFalse();
      onClose();
    } catch {
      confirm.onFalse();
    }
  };

  return (
    <>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={editData ? 'Update academic year' : 'Create academic year'}
        content={`Are you sure you want to ${editData ? 'update' : 'create'} this academic year?`}
        action={
          <LoadingButton
            size="small"
            variant="contained"
            loading={isSaving}
            startIcon={<AcademicFormActionIcon action="confirm" />}
            onClick={saveAcademicYear}
          >
            Confirm
          </LoadingButton>
        }
      />
      <DialogScrollContent>
        <AcademicFormSection kind="year">
          <AcademicYearDateFields formik={formik} />
        </AcademicFormSection>
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          onClick={requestClose}
          disabled={isSaving}
          startIcon={<AcademicFormActionIcon action="cancel" />}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          loading={isSaving}
          onClick={() => {
            formik.setTouched({ startDate: true, endDate: true });
            formik.handleSubmit();
          }}
          startIcon={<AcademicFormActionIcon action="submit" />}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};
