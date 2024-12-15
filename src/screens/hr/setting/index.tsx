'use client';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import {
  Box,
  Stack,
  Button,
  MenuItem,
  MenuList,
  TextField,
  DialogActions,
  createFilterOptions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

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
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
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
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              await deleteDocument(deleteInformation?.id);
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
      <CustomBreadcrumbs
        heading="Setting"
        links={[{ name: 'HR' }, { name: 'Setting' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box display="flex" justifyContent="flex-end">
        <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
          Add New document
        </Button>
      </Box>
      <CustomizableTable
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
            render: (value, data) => (
              <ThreeDotsActions
                actions={({ popover }) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        setDeleteInformation(data);
                        confirm.onTrue();
                        popover.onClose();
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <Iconify
                        icon="solar:trash-bin-trash-bold"
                        sx={{ height: '16px', width: '16px' }}
                      />
                      Delete
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        setEditData(data);
                        dialog.onTrue();
                        popover.onClose();
                      }}
                    >
                      <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                      Edit
                    </MenuItem>
                  </MenuList>
                )}
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

const filter = createFilterOptions<{ title: string; inputValue?: string }>();

const DocumentForm = ({ handleClose, editData }: { handleClose?: () => void; editData?: any }) => {
  const [addDocument, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddDocumentMutation,
  });
  const [updateDocument, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateDocumentMutation,
  });

  const { values, setFieldValue, handleSubmit } = useFormik<{
    title: string;
    documentType: string[];
  }>({
    initialValues: {
      title: editData?.documentName || '',
      documentType: editData?.documentTypes || [],
    },
    // validationSchema: Yup.object({
    //   documentType: Yup.string().required('Document type is required'),
    // }),
    onSubmit: async (formikValues) => {
      if (editData) {
        await updateDocument({
          id: editData.id,
          body: {
            documentName: formikValues.title,
            documentTypes: formikValues.documentType,
          },
        });
        handleClose?.();
        return;
      }
      await addDocument({
        documentName: formikValues.title,
        documentTypes: formikValues.documentType,
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
            label="Document Name"
            name="document.title"
            value={values.title}
            onChange={(e) => setFieldValue('title', e.target.value)}
          />

          <CustomSelect
            options={DocumentTypeArray}
            value={values.documentType}
            multiple
            label="Select document Type"
            onChange={(value) => setFieldValue('documentType', value)}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton loading={isLoading || isUpdateLoading} variant="contained" type="submit">
          Submit
        </LoadingButton>
      </DialogActions>
    </form>
  );
};
