import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  useGetInquiryPreferenceQuery,
  useAddInquiryPreferenceMutation,
  useDeleteInquiryPreferenceMutation,
  useUpdateInquiryPreferenceMutation,
} from 'src/redux/student/inquiry-preference/inquiry-preference-api';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import SubmitButton from 'src/components/submit-button';
import { Iconify } from 'src/components/iconify/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IInquiryPreference } from './type';

const InquiryPreference = () => {
  // Dialog state for add/edit inquiry preference form
  const dialog = useBoolean();
  // Dialog state for delete confirmation
  const confirm = useBoolean();
  // Get the isChanges state from the Redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Get the dispatch function from the Redux store
  const dispatch = useDispatch();
  const [editData, setEditData] = useState<null | IInquiryPreference>(null);

  const { data: inquiryPreference, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInquiryPreferenceQuery,
  });

  const [deletePreference, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteInquiryPreferenceMutation,
  });

  // Reset form and close dialog
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dialog.onFalse();
      setEditData(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      dialog.onFalse();
      setEditData(null);
    }
  };

  return (
    <Box>
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
              {editData?.preferenceName}
            </Box>
            ?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              await deletePreference(editData?.id);
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <CustomizableTable
        tableId="inquiry-preference"
        noDataText={
          <>
            No Inquiry Preference Data Found{' '}
            <Box
              onClick={() => {
                dialog.onTrue();
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
              Add Inquiry Preference
            </Box>
          </>
        }
        isLoading={isLoading}
        columns={[
          { id: 'preferenceName', label: 'Preference Name' },
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
                    setEditData(row as IInquiryPreference);
                    confirm.onTrue();
                  }}
                  handleEditClick={() => {
                    setEditData(row as IInquiryPreference);
                    dialog.onTrue();
                  }}
                  showThreeDots={false}
                />
              );
            },
          },
        ]}
        data={inquiryPreference?.items || []}
      />{' '}
      <CustomDialog
        open={dialog.value}
        handleClose={() => {
          dialog.onFalse();
          setEditData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Inquiry Preference</Typography>
            <CustomTooltip arrow placement="right" title="?.">
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <InquiryPreferenceForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default InquiryPreference;

export const InquiryPreferenceForm = ({
  editData,
  handleClose,
}: {
  editData: null | IInquiryPreference;
  handleClose?: (e: any, isSubmit: boolean) => void;
}) => {
  const [addDocument, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddInquiryPreferenceMutation,
  });
  const [updateDocument, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateInquiryPreferenceMutation,
  });

  const { initialValues, values, setFieldValue, handleSubmit, errors, touched } = useFormik<{
    fieldName: string;
  }>({
    initialValues: {
      fieldName: editData?.preferenceName || '',
    },
    validationSchema: Yup.object({
      fieldName: Yup.string().required('Preference Name is required'),
    }),
    onSubmit: async (formikValues) => {
      console.log(formikValues);
      if (editData) {
        await updateDocument({
          id: editData.id,
          body: {
            preferenceName: formikValues.fieldName,
          },
        });
        handleClose?.(null, false);
        return;
      }
      await addDocument({
        preferenceName: formikValues.fieldName,
      });
      handleClose?.(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
      <form onSubmit={handleSubmit}>
        <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
          <Stack spacing={2}>
            <ShakingTextField error={!!(touched.fieldName && errors.fieldName) || false}>
              <TextField
                fullWidth
                size="small"
                label="Preference Name *"
                name="fieldName"
                value={values.fieldName}
                onChange={(e) => setFieldValue('fieldName', e.target.value)}
                error={Boolean(errors.fieldName && touched.fieldName)}
                helperText={(touched.fieldName && errors.fieldName) || ''}
              />
            </ShakingTextField>
          </Stack>
        </Scrollbar>
        <DialogActions>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            variant="outlined"
            onClick={() => {
              handleClose?.(null, false);
            }}
            size="small"
          >
            Cancel
          </Button>

          <SubmitButton loading={isUpdateLoading || isLoading} />
        </DialogActions>
      </form>
    </BackPopUpChecked>
  );
};
