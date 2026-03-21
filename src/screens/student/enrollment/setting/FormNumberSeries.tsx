'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/useBoolean';
import { useSelector, useDispatch } from 'react-redux';
import { Iconify } from 'src/components/iconify/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import CustomDialog, { DialogScrollContent } from 'src/components/custom-dialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

interface IFormNumberSeries {
  id: string;
  formNumberSeries: number;
}

const FormNumberSeries = () => {
  // State to control confirm dialog visibility
  const confirm = useBoolean();
  const formNumberSeriesDialog = useBoolean();

  // Get isChanges state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Redux dispatch function
  const dispatch = useDispatch();

  // State to store form number series data being edited
  const [editData, setEditData] = useState<null | IFormNumberSeries>(null);

  /**
   * Handles closing of the form number series dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      formNumberSeriesDialog.onFalse();
      setEditData(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      formNumberSeriesDialog.onFalse();
      setEditData(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Form Number Series"
        description="Define and manage the form number series used in student registrations."
        links={[
          { name: 'Student Enrollment', href: '/student/enrollment/dashboard/' },
          { name: 'Settings' },
          { name: 'Form Number Series' },
        ]}
        action={
          <Button
            startIcon={<Add />}
            onClick={formNumberSeriesDialog.onTrue}
            variant="contained"
            size="small"
            sx={{ px: '32px' }}
          >
            Form Number Series
          </Button>
        }
      />

      <CustomizableTable
        tableId="form-number-series"
        noDataText={
          <>
            No Form Number Series Found{' '}
            <Box
              onClick={() => formNumberSeriesDialog.onTrue()}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Form Number Series
            </Box>
          </>
        }
        columns={[
          { id: 'formNumberSeries', label: 'Form Number Series' },
          {
            id: 'action',
            label: 'Actions',
            isFilter: false,
            isSort: false,
            sticky: true,
            minWidth: 40,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showDeleteIcon
                  showEditIcon
                  handleDeleteClick={() => {
                    setEditData(row as IFormNumberSeries);
                    confirm.onTrue();
                  }}
                  handleEditClick={() => {
                    setEditData(row as IFormNumberSeries);
                    formNumberSeriesDialog.onTrue();
                  }}
                  showThreeDots={false}
                />
              );
            },
          },
        ]}
        data={[
          { id: '1', formNumberSeries: 1001 },
          { id: '2', formNumberSeries: 1002 },
          { id: '3', formNumberSeries: 1003 },
        ]}
      />

      <CustomDialog
        open={formNumberSeriesDialog.value}
        handleClose={() => {
          formNumberSeriesDialog.onFalse();
          setEditData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {editData ? 'Update Form Number Series' : 'Add Form Number Series'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Define the form number series used in registrations or applications."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <FormNumberSeriesForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default FormNumberSeries;

export const FormNumberSeriesForm = ({
  editData,
  handleClose,
}: {
  editData: null | IFormNumberSeries;
  handleClose?: (e: any, isSubmit: boolean) => void;
}) => {
  const { initialValues, values, setFieldValue, handleSubmit, errors, touched } = useFormik({
    initialValues: {
      formNumberSeries: editData?.formNumberSeries || '',
    },
    validationSchema: Yup.object({
      formNumberSeries: Yup.number()
        .typeError('Form number series must be a number')
        .required('Form number series is required'),
    }),
    onSubmit: async (formikValues) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `${formikValues.formNumberSeries} updated successfully`,
        });
        handleClose?.(null, true);
        return;
      }

      shikshaMitraToast.success({
        message: `${formikValues.formNumberSeries} added successfully`,
      });
      handleClose?.(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
      <DialogScrollContent>
        <Stack spacing={2}>
          <TextField
            fullWidth
            size="small"
            label="Form Number Series *"
            name="formNumberSeries"
            type="number"
            value={values.formNumberSeries}
            onChange={(e) => {
              const { value } = e.target;
              setFieldValue('formNumberSeries', value === '' ? '' : Number(value));
            }}
            error={Boolean(errors.formNumberSeries && touched.formNumberSeries)}
            helperText={(touched.formNumberSeries && errors.formNumberSeries) || ''}
          />
        </Stack>
      </DialogScrollContent>

      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          onClick={() => handleClose?.(null, false)}
          size="small"
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          onClick={(e: any) => handleSubmit(e)}
          type="submit"
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};
