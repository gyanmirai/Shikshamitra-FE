import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import {
  Box,
  Stack,
  Switch,
  Button,
  Tooltip,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { DocumentType, DocumentTypeArray } from 'src/enums/documnet-type';
import {
  useGetStudentDocumentTypeQuery,
  useAddStudentDocumentTypeMutation,
  useUpdateStudentDocumentTypeMutation,
  useDeleteStudentDocumentTypeMutation,
} from 'src/redux/student/document-type/document-type-api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IStudentDocument } from './type';

const StudentDocumentType = () => {
  // Dialog state for add/edit form
  const dialog = useBoolean();
  // Dialog state for delete confirmation
  const confirm = useBoolean();
  // State to store document being edited
  const [editData, setEditData] = useState<null | IStudentDocument>(null);
  // Get the isChanges state from the Redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Get the dispatch function from the Redux store
  const dispatch = useDispatch();
  // Fetch all student document types
  const { data: documents, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentDocumentTypeQuery,
  });

  // Delete document mutation
  const [deleteDocument, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteStudentDocumentTypeMutation,
  });

  // Reset form and close dialog
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
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
        content="Are you sure want to delete?"
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            onClick={async () => {
              await deleteDocument(editData?.id);
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <Box display="flex" justifyContent="flex-end" mb={1}>
        <Button size="small" startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
          Document
        </Button>
      </Box>
      <CustomizableTable
        tableId="student-document-type"
        noDataText={
          <>
            No Document Type Data Found{' '}
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
              Add Document
            </Box>
          </>
        }
        searchFieldProps={{
          placeholder: 'Search by document name, type...',
          label: 'Search by document name, type...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        isLoading={isLoading}
        columns={[
          { id: 'documentName', label: 'Document' },
          {
            id: 'documentTypes',
            label: 'Type',
            render(value, row) {
              return value.map((item: number) => DocumentType[item]).join(', ');
            },
          },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            isFilter: false,
            minWidth: 50,
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showDeleteIcon
                  handleDeleteClick={() => {
                    setEditData(row as IStudentDocument);
                    confirm.onTrue();
                  }}
                  showThreeDots={false}
                  showEditIcon
                  handleEditClick={() => {
                    setEditData(row as IStudentDocument);
                    dialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={documents?.items || []}
      />{' '}
      <CustomDialog
        open={dialog.value}
        handleClose={() => {
          dialog.onFalse();
          setEditData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="h5">Document</Typography>
            <Tooltip
              arrow
              placement="right"
              title="This is the Document dialog, where you can add the required documents for registration along with their document types. By tapping the switch, you can mark a document as required or optional."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </Tooltip>
          </Box>
        }
      >
        <DocumentForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default StudentDocumentType;

export const DocumentForm = ({
  editData,
  handleClose,
}: {
  editData: null | IStudentDocument;
  handleClose?: (e: any, isSubmit: boolean) => void;
}) => {
  const [addDocument, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentDocumentTypeMutation,
  });
  const [updateDocument, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentDocumentTypeMutation,
  });

  const { initialValues, values, setFieldValue, handleSubmit, errors, touched } = useFormik<{
    title: string;
    documentType: DocumentType[];
    isRequired: boolean;
  }>({
    initialValues: {
      title: editData?.documentName || '',
      documentType: editData?.documentTypes || [],
      isRequired: editData?.isRequired || false,
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Document name is required'),
      documentType: Yup.array().min(1, 'At least one document type is required'),
    }),
    onSubmit: async (formikValues) => {
      console.log(formikValues);
      if (editData) {
        await updateDocument({
          id: editData.id,
          body: {
            documentName: formikValues.title,
            documentTypes: formikValues.documentType,
            isRequired: formikValues.isRequired,
          },
        });
        handleClose?.(null, true);
        return;
      }
      await addDocument({
        documentName: formikValues.title,
        documentTypes: formikValues.documentType,
        isRequired: formikValues.isRequired,
      });
      handleClose?.(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
      <form onSubmit={handleSubmit}>
        <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Document Name"
              name="document.title"
              value={values.title}
              onChange={(e) => setFieldValue('title', e.target.value)}
              error={Boolean(errors.title && touched.title)}
              helperText={(touched.title && errors.title) || ''}
            />

            <CustomSelect
              options={DocumentTypeArray}
              value={values.documentType}
              multiple
              label="Select document Type"
              onChange={(value) => setFieldValue('documentType', value)}
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              error={Boolean(errors.documentType && touched.documentType)}
              helperText={(touched.documentType && errors.documentType) as string}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={values.isRequired}
                  onChange={(e) => setFieldValue('isRequired', e.target.checked)}
                />
              }
              label="Is Required"
            />
          </Stack>
        </Scrollbar>
        <DialogActions>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            variant="outlined"
            onClick={() => {
              handleClose?.(null, false);
            }}
          >
            Cancel
          </Button>

          <SubmitButton loading={isUpdateLoading || isLoading} />
        </DialogActions>
      </form>
    </BackPopUpChecked>
  );
};
