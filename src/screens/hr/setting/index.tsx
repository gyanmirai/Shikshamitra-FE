'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Box, Stack, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { DocumentType, DocumentTypeArray } from 'src/enums/documnet-type';
import {
  useGetDocumentsQuery,
  useAddDocumentMutation,
  useDeleteDocumentMutation,
  useUpdateDocumentMutation,
} from 'src/redux/document/documentApi';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const HrSetting = () => {
  const dialog = useBoolean();
  const confirm = useBoolean();
  const [deleteInformation, setDeleteInformation] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);

  const { data: documents, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDocumentsQuery,
  });

  const [deleteDocument] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteDocumentMutation,
  });
  return (
    <Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              await deleteDocument(deleteInformation?.id);
              confirm.onFalse();
            }}
          >
            Yes
          </Button>
        }
      />
      <CustomBreadcrumbs
        heading="Setting"
        links={[{ name: 'HR', href: '/hr/dashboard/' }, { name: 'Setting' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue} size="small">
            Document
          </Button>
        }
      />

      <CustomizableTable
        noDataText={
          <>
            No Document Found{' '}
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
          placeholder: 'Search by Document Name, Document Type..',
          label: 'Search by Document Name, Document Type..',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        tableId="documents"
        isLoading={isLoading}
        columns={[
          { id: 'documentName', label: 'Documents Name' },
          {
            id: 'documentTypes',
            label: 'Document Type',
            isSort: false,
            render(value, row) {
              return value.map((item: number) => DocumentType[item]).join(', ');
            },
          },
          {
            label: 'Action',
            id: 'action',
            isSort: false,
            isFilter: false,
            sticky: true,
            minWidth: 50,
            render: (value, data) => (
              <ThreeDotsActions
                showEditIcon
                showDeleteIcon
                showThreeDots={false}
                handleDeleteClick={() => {
                  setDeleteInformation(data);
                  confirm.onTrue();
                }}
                handleEditClick={() => {
                  setEditData(data);
                  dialog.onTrue();
                }}
              />
            ),
          },
        ]}
        data={documents?.items || []}
      />
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Add Document">
        <DocumentForm handleClose={dialog.onFalse} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default HrSetting;

const DocumentForm = ({ handleClose, editData }: { handleClose?: () => void; editData?: any }) => {
  const [addDocument, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddDocumentMutation,
  });
  const [updateDocument, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateDocumentMutation,
  });

  const { values, setFieldValue, handleSubmit, errors, touched } = useFormik<{
    title: string;
    documentType: string[];
  }>({
    initialValues: {
      title: editData?.documentName || '',
      documentType: editData?.documentTypes || [],
    },
    validationSchema: Yup.object().shape({
      title: Yup.string().required('Document name is required'),
      documentType: Yup.array()
        .min(1, 'At least one document type must be selected')
        .required('Document type is required'),
    }),
    onSubmit: async (formikValues) => {
      if (editData) {
        await updateDocument({
          id: editData.id,
          body: {
            documentName: formikValues.title,
            documentTypes: formikValues.documentType,
          },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Document updated successfully' });
        handleClose?.();
        return;
      }
      await addDocument({
        documentName: formikValues.title,
        documentTypes: formikValues.documentType,
      }).unwrap();
      shikshaMitraToast.success({ message: 'Document added successfully' });
      handleClose?.();
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={3}>
          <ShakingTextField error={touched.title && Boolean(errors.title)}>
            <TextField
              fullWidth
              size="small"
              label="Document Name *"
              name="document.title"
              value={values.title}
              onChange={(e) => setFieldValue('title', e.target.value)}
              error={touched.title && Boolean(errors.title)}
              helperText={touched.title && errors.title}
            />
          </ShakingTextField>

          <ShakingTextField error={touched.documentType && Boolean(errors.documentType)}>
            <CustomSelect
              options={DocumentTypeArray}
              value={values.documentType}
              multiple
              label="Select document Type *"
              onChange={(value) => setFieldValue('documentType', value)}
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              error={touched.documentType && Boolean(errors.documentType)}
              // @ts-ignore
              helperText={(touched.documentType && errors.documentType) || ''}
            />
          </ShakingTextField>
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
        <LoadingButton
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          loading={isLoading || isUpdateLoading}
          variant="contained"
          type="submit"
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </form>
  );
};
