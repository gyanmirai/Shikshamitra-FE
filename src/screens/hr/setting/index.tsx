'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Autocomplete, LoadingButton } from '@mui/lab';
import { Add, CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { Box, Chip, Stack, Button, Checkbox, TextField, DialogActions } from '@mui/material';

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
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

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
        content={`Are you sure you want to delete ${deleteInformation?.documentName} ?`}
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
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          { name: 'Employee', href: '/hr/employee/' },
          { name: 'Setting' },
        ]}
        sx={{ px: 1, mb: 2 }}
        description="Add, Update and Delete Documents from employee"
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
        tableId="documents"
        isLoading={isLoading}
        isFilter={false}
        columns={[
          { id: 'documentName', label: 'Document Name' },
          {
            id: 'documentTypes',
            label: 'Accepted Format',
            isSort: false,
            render(value, row) {
              return value.map((item: number) => DocumentType[item]).join(', ');
            },
          },
          {
            label: 'Actions',
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
      <CustomDialog
        open={dialog.value}
        handleClose={() => {
          setEditData(null);
          dialog.onFalse();
        }}
        title={editData ? 'Update Document' : 'Add Document'}
      >
        <DocumentForm
          handleClose={() => {
            setEditData(null);
            dialog.onFalse();
          }}
          editData={editData}
        />
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
    documentType: { label: string; value: number }[];
  }>({
    initialValues: {
      title: editData?.documentName || '',
      documentType:
        editData?.documentTypes?.map((item: any) => ({ label: DocumentType[item], value: item })) ||
        [],
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
            documentTypes: formikValues.documentType.map((item: any) => item.value),
          },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Document updated successfully' });
        handleClose?.();
        return;
      }
      await addDocument({
        documentName: formikValues.title,
        documentTypes: formikValues.documentType.map((item: any) => item.value),
      }).unwrap();
      shikshaMitraToast.success({ message: 'Document added successfully' });
      handleClose?.();
    },
  });

  return (
    <>
      <DialogScrollContent>
        <Stack spacing={2}>
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
            <Autocomplete
              multiple
              options={DocumentTypeArray}
              disableCloseOnSelect
              getOptionLabel={(option) => option.label}
              value={values.documentType}
              onChange={(event, newValue) => setFieldValue('documentType', newValue || [])}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlank />}
                    checkedIcon={<CheckBox />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.label}
                </li>
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.label}
                    {...getTagProps({ index })} // 🔥 This is required for delete (close) icon
                    key={index}
                    variant="soft"
                    size="small"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Accepted Format *"
                  value={`${values.documentType?.length || 0} Document Selected`}
                  size="small"
                  error={touched.documentType && Boolean(errors.documentType)}
                  helperText={(touched.documentType && errors.documentType) as string}
                />
              )}
            />
            {/* <CustomSelect
              options={DocumentTypeArray}
              value={values.documentType}
              multiple
              label="Select Document Format *"
              onChange={(value) => setFieldValue('documentType', value)}
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              error={touched.documentType && Boolean(errors.documentType)}
              // @ts-ignore
              helperText={(touched.documentType && errors.documentType) || ''}
            /> */}
          </ShakingTextField>
        </Stack>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          onClick={handleClose}
          size="small"
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          loading={isLoading || isUpdateLoading}
          variant="contained"
          onClick={(e: any) => handleSubmit(e)}
          size="small"
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};
export const MultiDropdownListPopover = ({ data, count }: { data: any[]; count: number }) => (
  <CustomTooltip
    title={
      <Box
        sx={{
          p: 1,
          maxWidth: 180,
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {data.map((teacher) => (
          <Chip
            key={teacher.value}
            variant="soft"
            // avatar={<Avatar sx={{ width: 24, height: 24 }}>{teacher.label.charAt(0)}</Avatar>}
            label={teacher.label}
            sx={{ mb: 1 }}
            size="small"
          />
        ))}
      </Box>
    }
    placement="bottom-start"
    arrow
  >
    <Chip label={`+${count}`} sx={{ ml: 0.5, cursor: 'pointer' }} size="small" variant="soft" />
  </CustomTooltip>
);
