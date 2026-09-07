'use client';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import { Stack, Button, DialogActions } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useAddYearMutation, useUpdateYearMutation } from 'src/redux/year/yearApi';

import { Iconify } from '../iconify';
import { ConfirmDialog } from '../confirm-dialog';
import { DialogScrollContent } from '../customDialog';
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
            onClick={saveAcademicYear}
          >
            Confirm
          </LoadingButton>
        }
      />
      <DialogScrollContent>
        <Stack spacing={2}>
          <DatePicker
            label="Start date"
            value={formik.values.startDate}
            format="DD-MMM-YYYY"
            onChange={(value) => formik.setFieldValue('startDate', value)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error: formik.touched.startDate && Boolean(formik.errors.startDate),
                helperText:
                  formik.touched.startDate && typeof formik.errors.startDate === 'string'
                    ? formik.errors.startDate
                    : undefined,
              },
            }}
          />
          <DatePicker
            label="End date"
            value={formik.values.endDate}
            format="DD-MMM-YYYY"
            minDate={dayjs(formik.values.startDate).add(1, 'day')}
            onChange={(value) => formik.setFieldValue('endDate', value)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error: formik.touched.endDate && Boolean(formik.errors.endDate),
                helperText:
                  formik.touched.endDate && typeof formik.errors.endDate === 'string'
                    ? formik.errors.endDate
                    : undefined,
              },
            }}
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
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
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          {editData ? 'Update year' : 'Create year'}
        </LoadingButton>
      </DialogActions>
    </>
  );
};
