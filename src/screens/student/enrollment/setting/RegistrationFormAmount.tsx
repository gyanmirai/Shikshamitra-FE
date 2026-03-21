'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/useBoolean';
import { useSelector, useDispatch } from 'react-redux';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import { Box, Stack, Button, Typography, DialogActions } from '@mui/material';
// import {
//   useGetAmountPreferenceQuery,
//   useAddAmountPreferenceMutation,
//   useDeleteAmountPreferenceMutation,
//   useUpdateAmountPreferenceMutation,
// } from 'src/redux/student/amount-preference/amount-preference-api';

import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizable-table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import CustomDialog, { DialogScrollContent } from 'src/components/custom-dialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IRegistrationAmount } from './type';

const RegistrationAmount = () => {
  // Hook for managing confirm dialog state (open/close)
  const confirm = useBoolean();

  // Get the current state of unsaved changes from Redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const registrationAmountDialog = useBoolean();
  // Redux dispatch function for updating state
  const dispatch = useDispatch();

  // State for storing the currently selected registration amount data for editing/deleting
  const [editData, setEditData] = useState<null | IRegistrationAmount>(null);

  /**
   * Handles closing the amount preference dialog with proper change detection
   * @param _e - Event object (unused, hence prefixed with underscore)
   * @param isSubmit - Optional flag indicating if dialog is closing due to form submission
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // If submitting or user confirms leaving despite unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      registrationAmountDialog.onFalse(); // Close the dialog
      setEditData(null); // Clear the edit data
      dispatch(setIsChanges(false)); // Reset the changes flag in Redux
    }
    // If no unsaved changes, allow normal close
    else if (!isChanges) {
      registrationAmountDialog.onFalse(); // Close the dialog
      setEditData(null); // Clear the edit data
    }
    // If there are unsaved changes and user cancels, do nothing (dialog stays open)
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Registration Form Amount"
        description="Manage registration form amount settings for student enrollment."
        links={[
          { name: 'Student Enrollment', href: '/student/enrollment/dashboard/' },
          { name: 'Settings' },
          { name: 'Registration Form Amount' },
        ]}
        action={
          <Button
            sx={{ px: '32px' }}
            startIcon={<Add />}
            onClick={registrationAmountDialog.onTrue}
            variant="contained"
            size="small"
          >
            Amount
          </Button>
        }
      />
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
          setEditData(null);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete{' '}
            <Box component="span" fontWeight="bold" color="text.primary">
              {editData?.amount}
            </Box>
            ?
          </>
        }
        action={
          <LoadingButton
            // loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              //   await deletePreference(editData?.id);
              shikshaMitraToast.success({
                message: `${editData?.amount} amount deleted successfully`,
              });
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <CustomizableTable
        tableId="amount-preference"
        noDataText={
          <>
            No Amount Preference Data Found{' '}
            <Box
              onClick={() => {
                registrationAmountDialog.onTrue();
              }}
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
              Add Amount
            </Box>
          </>
        }
        // isLoading={isLoading}
        columns={[
          { id: 'amount', label: 'Amount' },
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
                    setEditData(row as IRegistrationAmount);
                    confirm.onTrue();
                  }}
                  handleEditClick={() => {
                    setEditData(row as IRegistrationAmount);
                    registrationAmountDialog.onTrue();
                  }}
                  showThreeDots={false}
                />
              );
            },
          },
        ]}
        data={[
          {
            id: '1',
            amount: 10000,
          },
          {
            id: '2',
            amount: 5000,
          },
          {
            id: '3',
            amount: 2500,
          },
        ]}
      />
      <CustomDialog
        open={registrationAmountDialog.value}
        handleClose={() => {
          registrationAmountDialog.onFalse();
          setEditData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {editData ? 'Update Amount Preference' : 'Add Amount Preference'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Define fixed or custom amount values for student-related entries."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <RegistrationAmountForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default RegistrationAmount;

export const RegistrationAmountForm = ({
  editData,
  handleClose,
}: {
  editData: null | IRegistrationAmount;
  handleClose?: (e: any, isSubmit: boolean) => void;
}) => {
  //   const [addDocument, { isLoading }] = useQueryAndMutation({
  //     type: 'mutation',
  //     currentQueryAndMutation: useAddAmountPreferenceMutation,
  //   });
  //   const [updateDocument, { isLoading: isUpdateLoading }] = useQueryAndMutation({
  //     type: 'mutation',
  //     currentQueryAndMutation: useUpdateAmountPreferenceMutation,
  //   });

  const { initialValues, values, setFieldValue, handleSubmit, errors, touched } = useFormik({
    initialValues: {
      amount: editData?.amount || null,
    },
    validationSchema: Yup.object({
      amount: Yup.number().required('Amount is required'),
    }),
    onSubmit: async (formikValues) => {
      if (editData) {
        // await updateDocument({
        //   id: editData.id,
        //   body: { amount: formikValues.amount },
        // });
        shikshaMitraToast.success({
          message: `${formikValues.amount} amount updated successfully`,
        });
        handleClose?.(null, true);
        return;
      }
      //   await addDocument({
      //     amountLabel: formikValues.amountLabel,
      //   });
      shikshaMitraToast.success({
        message: `${formikValues.amount} amount added successfully`,
      });
      handleClose?.(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
      <DialogScrollContent>
        <Stack spacing={2}>
          <ShakingTextField error={!!(touched.amount && errors.amount)}>
            <NumericFormatCustom
              fullWidth
              size="small"
              name="amount"
              label="Amount *"
              value={values.amount}
              onChange={(e) => {
                const rawValue = e.target.value; // Raw numeric value without formatting

                if (/^\d{0,3}$/.test(rawValue)) {
                  setFieldValue('amount', rawValue);
                } else if (rawValue === '') {
                  setFieldValue('amount', '');
                }
              }}
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              error={touched.amount && Boolean(errors.amount)}
              helperText={(touched.amount && errors.amount) || ''}
            />
          </ShakingTextField>
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
          //   loading={isUpdateLoading || isLoading}
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
