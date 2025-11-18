'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Add, CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { DocumentType, DocumentTypeArray } from 'src/enums/documnet-type';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Chip,
  Stack,
  Button,
  Checkbox,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';
import {
  useGetDocumentsQuery,
  useAddDocumentMutation,
  useDeleteDocumentMutation,
  useUpdateDocumentMutation,
} from 'src/redux/document/documentApi';

const HrSetting = () => {
  const dialog = useBoolean();
  const confirm = useBoolean();
  const [deleteInformation, setDeleteInformation] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);

  const { data: documents, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDocumentsQuery,
  });

  const [deleteDocument, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteDocumentMutation,
  });

  const tableData = useMemo(
    () =>
      documents?.items.map((item: any) => ({
        ...item,
        documentTypesString: item.documentTypes.map((ite: any) => DocumentType[ite]).join(', '),
      })),
    [documents?.items]
  );
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure you want to delete <strong>{deleteInformation?.documentName}</strong> ?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            size="small"
            color="error"
            onClick={async () => {
              await deleteDocument(deleteInformation?.id);
              shikshaMitraToast.success({
                message: `${deleteInformation?.documentName} Document deleted successfully`,
              });
              setDeleteInformation(null);
              confirm.onFalse();
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <CustomBreadcrumbs
        heading="Document Types"
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          { name: 'Employee', href: '/hr/employee/' },
          { name: 'Setting' },
        ]}
        sx={{ px: 1, mb: 1 }}
        description="Add, update or delete documents associated with an employee."
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
          { id: 'documentSize', label: 'Document Size (MB)', minWidth: '200px', align: 'left' },
          {
            id: 'documentTypesString',
            label: 'Accepted Format',
            isSort: false,
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
        data={tableData || []}
      />
      <CustomDialog
        open={dialog.value}
        handleClose={() => {
          setEditData(null);
          dialog.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">{editData ? 'Update Document' : 'Add Document'}</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                editData
                  ? 'Update document details such as name, size, and accepted formats.'
                  : 'Enter name, size, and format to create a new document.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
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

  const { values, setFieldValue, handleSubmit, errors, touched, handleChange } = useFormik<{
    title: string;
    documentType: { label: string; value: number }[];
    documentSize: number;
  }>({
    initialValues: {
      title: editData?.documentName || '',
      documentType:
        editData?.documentTypes?.map((item: any) => ({ label: DocumentType[item], value: item })) ||
        [],
      documentSize: editData?.documentSize || 5,
    },
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema: Yup.object().shape({
      title: Yup.string().required('Document name is required'),
      documentType: Yup.array()
        .min(1, 'At least one Document Type must be selected')
        .required('Document Type is required'),
      documentSize: Yup.number()
        .required('Document size is required')
        .min(1, 'Document size must be greater than 1 MB')
        .max(20, 'Document size must be less than 20 MB')
        .positive('Document size must be a positive number')
        .integer('Document size must be an integer'),
    }),
    onSubmit: async (formikValues) => {
      if (editData) {
        await updateDocument({
          id: editData.id,
          body: {
            documentName: formikValues.title,
            documentTypes: formikValues.documentType.map((item: any) => item.value),
            documentSize: formikValues.documentSize,
          },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Document updated successfully' });
        handleClose?.();
        return;
      }
      await addDocument({
        documentName: formikValues.title,
        documentTypes: formikValues.documentType.map((item: any) => item.value),
        documentSize: formikValues.documentSize,
      }).unwrap();
      shikshaMitraToast.success({ message: 'Document added successfully' });
      handleClose?.();
    },
  });

  return (
    <>
      <DialogScrollContent>
        <Stack spacing={3}>
          <ShakingTextField error={touched.title && Boolean(errors.title)}>
            <TextField
              fullWidth
              size="small"
              label="Document Name *"
              name="document.title"
              value={values.title}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                setFieldValue('title', value);
              }}
              error={touched.title && Boolean(errors.title)}
              helperText={touched.title && errors.title}
            />
          </ShakingTextField>

          <ShakingTextField error={touched.documentSize && Boolean(errors.documentSize)}>
            <TextField
              label="Document Size (MB) *"
              value={values.documentSize}
              size="small"
              type="number"
              name="documentSize"
              fullWidth
              inputProps={{ min: 1, max: 20 }}
              onChange={handleChange}
              helperText={touched.documentSize && errors.documentSize}
              error={touched.documentSize && Boolean(errors.documentSize)}
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
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          loading={isLoading || isUpdateLoading}
          variant="contained"
          onClick={(e: any) => handleSubmit(e)}
          size="small"
        >
          {editData ? 'Update' : 'Submit'}
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
