import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Box, Stack, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import SubmitButton from 'src/components/submit-button';
import { Iconify } from 'src/components/iconify/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IExamType } from './type';

const ExamType = () => {
  // Dialog state for opening/closing modal
  const dialog = useBoolean();
  // Dialog state for confirmation modal
  const confirm = useBoolean();

  // State to store exam type data being edited
  const [editData, setEditData] = useState<null | IExamType>(null);

  //   const { data: inquiryPreference, isLoading } = useQueryAndMutation({
  //     type: 'query',
  //     currentQueryAndMutation: useGetInquiryPreferenceQuery,
  //   });

  //   const [deletePreference, { isLoading: isDeleteLoading }] = useQueryAndMutation({
  //     type: 'mutation',
  //     currentQueryAndMutation: useDeleteInquiryPreferenceMutation,
  //   });

  // Handler to close dialog and reset edit data
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
            // loading={isDeleteLoading}
            variant="contained"
            color="error"
            onClick={async () => {
              //   await deletePreference(editData?.id);
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
          Entrance Exam Type
        </Button>
      </Box>
      <CustomizableTable
        tableId="exam-type"
        noDataText={
          <>
            No Entrance Exam Type Data Found{' '}
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
              Add Entrance Exam Type
            </Box>
          </>
        }
        searchFieldProps={{
          placeholder: 'Search by exam type',
          label: 'Search by exam type',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        // isLoading={isLoading}
        columns={[
          { id: 'examType', label: 'Exam Type' },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showDeleteIcon
                  showEditIcon
                  handleDeleteClick={() => {
                    setEditData(row as IExamType);
                    confirm.onTrue();
                  }}
                  handleEditClick={() => {
                    setEditData(row as IExamType);
                    dialog.onTrue();
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
            examType: 'Midterm Exam',
            class: '10th Grade',
          },
          {
            id: '2',
            examType: 'Final Exam',
            class: '12th Grade',
          },
          {
            id: '3',
            examType: 'Unit Test',
            class: '8th Grade',
          },
          {
            id: '4',
            examType: 'Weekly Quiz',
            class: '7th Grade',
          },
          {
            id: '5',
            examType: 'Practical Exam',
            class: '11th Grade',
          },
        ]}
      />{' '}
      <CustomDialog open={dialog.value} handleClose={handleClose} title="Exam Type">
        <ExamTypeForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default ExamType;

export const ExamTypeForm = ({
  editData,
  handleClose,
}: {
  editData: null | IExamType;
  handleClose?: () => void;
}) => {
  const { values, setFieldValue, handleSubmit, errors, touched } = useFormik<{
    examType: string;
  }>({
    initialValues: {
      examType: editData?.examType || '',
    },
    validationSchema: Yup.object({
      fieldName: Yup.string().required('Preference Name is required'),
    }),
    onSubmit: async (formikValues) => {
      console.log(formikValues);
      //   if (editData) {
      //     await updateDocument({
      //       id: editData.id,
      //       body: {
      //         preferenceName: formikValues.fieldName,
      //       },
      //     });
      //     handleClose?.();
      //     return;
      //   }
      //   await addDocument({
      //     preferenceName: formikValues.fieldName,
      //   });
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
            value={values.examType}
            onChange={(e) => setFieldValue('fieldName', e.target.value)}
            error={Boolean(errors.examType && touched.examType)}
            helperText={(touched.examType && errors.examType) || ''}
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          onClick={handleClose}
        >
          Cancel
        </Button>

        <SubmitButton />
      </DialogActions>
    </form>
  );
};
