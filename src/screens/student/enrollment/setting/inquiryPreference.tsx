import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Box, Stack, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetInquiryPreferenceQuery,
  useAddInquiryPreferenceMutation,
  useDeleteInquiryPreferenceMutation,
  useUpdateInquiryPreferenceMutation,
} from 'src/redux/student/inquiry-preference/inquiry-preference-api';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface IInquiryPreference {
  id: string;
  preferenceName: string;
}

const InquiryPreference = () => {
  const dialog = useBoolean();
  const confirm = useBoolean();

  const [editData, setEditData] = useState<null | IInquiryPreference>(null);

  const { data: inquiryPreference, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInquiryPreferenceQuery,
  });

  const [deletePreference, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteInquiryPreferenceMutation,
  });

  const handleClose = () => {
    setEditData(null);
    dialog.onFalse();
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
        content="Are you sure want to delete?"
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            onClick={async () => {
              await deletePreference(editData?.id);
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <Box display="flex" justifyContent="flex-end">
        <Button size="small" startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
          Inquiry Preference
        </Button>
      </Box>
      <CustomizableTable
        tableId="inquiry-preference"
        isLoading={isLoading}
        columns={[
          { id: 'preferenceName', label: 'Name' },
          {
            id: 'action',
            label: 'Action',
            isFilter: false,
            isSort: false,
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
      />
      <CustomDialog open={dialog.value} handleClose={handleClose} title="Inquiry Preference">
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
  handleClose?: () => void;
}) => {
  const [addDocument, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddInquiryPreferenceMutation,
  });
  const [updateDocument, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateInquiryPreferenceMutation,
  });

  const { values, setFieldValue, handleSubmit, errors, touched } = useFormik<{
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
        handleClose?.();
        return;
      }
      await addDocument({
        preferenceName: formikValues.fieldName,
      });
      handleClose?.();
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            size="small"
            label="Name"
            name="fieldName"
            value={values.fieldName}
            onChange={(e) => setFieldValue('fieldName', e.target.value)}
            error={Boolean(errors.fieldName && touched.fieldName)}
            helperText={(touched.fieldName && errors.fieldName) || ''}
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton loading={isUpdateLoading || isLoading} variant="contained" type="submit">
          Submit
        </LoadingButton>
      </DialogActions>
    </form>
  );
};
