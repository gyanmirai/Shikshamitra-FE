'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizable-table/types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import { useSelector, useDispatch } from 'react-redux';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { shikshaMitraToast } from 'src/components/toast';
import sortQueryString from 'src/utils/sort-query-string';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizable-table';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import { DocumentType, DocumentTypeArray } from 'src/enums/documnet-type';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CustomDialog, { DialogScrollContent } from 'src/components/custom-dialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
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
  StudentDocumentTypeApi,
  useGetStudentDocumentTypeQuery,
  useAddStudentDocumentTypeMutation,
  useUpdateStudentDocumentTypeMutation,
  useDeleteStudentDocumentTypeMutation,
} from 'src/redux/student/document-type/document-type-api';

import type { IStudentDocument } from './type';

const StudentDocumentType = () => {
  // Dialog state for add/edit form
  // const dialog = useBoolean();
  // Dialog state for delete confirmation
  const confirm = useBoolean();

  const defaultDocumentTypes = useBoolean();

  // State to store document being edited
  const [editData, setEditData] = useState<null | IStudentDocument>(null);
  // Get the isChanges state from the Redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Get the dispatch function from the Redux store
  const dispatch = useDispatch();
  // Fetch all student document types
  const [query, setQuery] = useState({
    sorting: '',
    skipCount: 0,
    maxResultCount: 10,
  });

  const {
    data: documents,
    isLoading,
    isFetching,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentDocumentTypeQuery,
    params: { ...query },
  });

  // Delete document mutation
  const [deleteDocument, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteStudentDocumentTypeMutation,
  });

  // Reset form and close dialog
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      defaultDocumentTypes.onFalse();
      setEditData(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      defaultDocumentTypes.onFalse();
      setEditData(null);
    }
  };

  const { confirmWithUndo } = useConfirmWithUndo();

  const columns: IColumn[] = useMemo(
    () => [
      { id: 'name', label: 'Document Name' },
      { id: 'maxSizeMB', label: 'Document Size (MB)' },
      {
        id: 'acceptedFormats',
        label: 'Accepted Format',
        align: 'left',
        render(value, row) {
          return value.map((item: number) => DocumentType[item]).join(', ');
        },
      },
      {
        id: 'action',
        label: 'Actions',
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
                defaultDocumentTypes?.onTrue();
              }}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Document Types"
        links={[
          { name: 'Student Enrollment', href: '/student/dashboard/' },
          { name: 'Settings', href: '/student/dashboard/' },
          { name: 'Document Types' },
        ]}
        action={
          <Button
            sx={{ width: '160px' }}
            startIcon={<Add />}
            variant="contained"
            onClick={defaultDocumentTypes.onTrue}
            size="small"
          >
            Document
          </Button>
        }
        description="Manage the types of documents required for student enrollment, including accepted formats and size limits."
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
            Are you sure you want to delete <strong>{editData?.name}</strong> document?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              confirmWithUndo({
                item: editData,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    StudentDocumentTypeApi.util.updateQueryData(
                      'getStudentDocumentType',
                      { ...query },
                      (draft: any) => {
                        const index = draft.items?.findIndex((b: any) => b.id === editData?.id);
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.items.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: () => refetch({ ...query }),
                onCommit: () => deleteDocument(editData?.id || ''),
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
        tableTitle="Document Type"
        tableId="student-document-type"
        noDataText={
          <>
            No Document Type Data Found{' '}
            <Box
              onClick={() => {
                defaultDocumentTypes.onTrue();
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
        isLoading={isLoading || isFetching}
        serverSide
        onServerSort={(column, sortData) => {
          setQuery((prev) => ({
            ...prev,
            sorting: sortQueryString(sortData),
          }));
        }}
        onServerPagination={(page: number, rowsPerPage: number) => {
          setQuery((prev) => ({
            ...prev,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
          }));
        }}
        columns={columns}
        data={documents?.items || []}
      />{' '}
      <CustomDialog
        open={defaultDocumentTypes?.value}
        handleClose={() => {
          defaultDocumentTypes.onFalse();
          setEditData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {editData ? 'Update Document Type' : 'Add Document Type'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Define a new document type by specifying its name, size limit, and allowed file formats."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
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
  const dispatch = useDispatch();

  const [addDocument, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentDocumentTypeMutation,
  });

  const [updateDocument, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentDocumentTypeMutation,
  });

  const formik = useFormik<{
    name: string;
    acceptedFormats: { label: string; value: number }[];
    maxSizeMB: number | string;
    isRequired: boolean;
  }>({
    initialValues: {
      name: editData?.name || '',
      acceptedFormats:
        editData?.acceptedFormats?.map((item: any) => ({
          label: DocumentType[item],
          value: item,
        })) || [],
      maxSizeMB: editData?.maxSizeMB || '',
      isRequired: editData?.isRequired || false,
    },
    validationSchema: Yup.object({
      name: Yup.string().trim('Document name is required').required('Document name is required'),
      acceptedFormats: Yup.array()
        .min(1, 'At least one document type is required')
        .required('Document type is required'),
      maxSizeMB: Yup.number().required('Document size is required'),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setSubmitting(true);
        const payload = {
          name: values.name,
          acceptedFormats: values.acceptedFormats.map((d) => d.value),
          maxSizeMB: values.maxSizeMB,
          isRequired: values.isRequired,
        };

        if (editData) {
          await updateDocument({ id: editData.id, body: payload }).unwrap();
          shikshaMitraToast.success({
            message: `${payload.name} document updated successfully`,
          });
          handleClose?.(null, true);
          return;
        }

        await addDocument(payload).unwrap();
        shikshaMitraToast.success({
          message: `${payload.name} document added successfully`,
        });
        handleClose?.(null, true);
        // setShowSuccessMessage(true);
        resetForm();
        dispatch(setIsChanges(false));
      } catch (error) {
        console.error('Error saving document:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, touched, errors, setFieldValue, handleSubmit } = formik;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={values}>
      {/* <form onSubmit={handleSubmit}> */}
      <DialogScrollContent>
        <Stack spacing={3}>
          {/* Document Name */}
          <ShakingTextField error={Boolean(touched.name && errors.name)}>
            <TextField
              fullWidth
              size="small"
              label="Document Name *"
              name="name"
              value={values.name}
              onChange={(e) => {
                let onlyText = e.target.value;
                onlyText = onlyText.replace(/^\s+/g, ''); // Remove leading spaces
                const capitalize = onlyText.charAt(0).toUpperCase() + onlyText.slice(1);
                setFieldValue('name', capitalize);
              }}
              error={Boolean(touched.name && errors.name)}
              helperText={touched.name && errors.name}
              inputProps={{
                maxLength: 40,
              }}
            />
          </ShakingTextField>

          {/* Document Size */}
          <ShakingTextField error={Boolean(touched.maxSizeMB && errors.maxSizeMB)}>
            <TextField
              label="Document Size (MB) *"
              value={values.maxSizeMB}
              size="small"
              type="number"
              name="maxSizeMB"
              fullWidth
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              inputProps={{ min: 1, max: 9 }}
              onChange={(e) => {
                const { value } = e.target;

                if (/^[1-9][0-9]?$/.test(value) && Number(value) >= 1 && Number(value) <= 50) {
                  setFieldValue('maxSizeMB', value);
                } else if (value === '') {
                  setFieldValue('maxSizeMB', '');
                }
              }}
              error={Boolean(touched.maxSizeMB && errors.maxSizeMB)}
              helperText={touched.maxSizeMB && errors.maxSizeMB}
            />
          </ShakingTextField>

          {/* Document Type */}
          <ShakingTextField error={Boolean(touched.acceptedFormats && errors.acceptedFormats)}>
            <Autocomplete
              multiple
              options={DocumentTypeArray}
              disableCloseOnSelect
              getOptionLabel={(option) => option.label}
              value={values.acceptedFormats}
              onChange={(_, newValue) => setFieldValue('acceptedFormats', newValue)}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon />}
                    checkedIcon={<CheckBoxIcon />}
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
                    {...getTagProps({ index })}
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
                  value={`${values.acceptedFormats?.length || 0} Document Selected`}
                  size="small"
                  error={Boolean(touched.acceptedFormats && errors.acceptedFormats)}
                  helperText={(touched.acceptedFormats && errors.acceptedFormats) as string}
                />
              )}
            />
          </ShakingTextField>

          {/* Is Required Switch */}
          {/* Uncomment if needed */}
          {/* <FormControlLabel
              control={
                <Switch
                  checked={values.isRequired}
                  onChange={(e) => setFieldValue('isRequired', e.target.checked)}
                />
              }
              label="Is Required"
            /> */}
        </Stack>
      </DialogScrollContent>

      <DialogActions>
        <Button
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          onClick={() => handleClose?.(null, false)}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          loading={isUpdateLoading || isLoading}
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          type="submit"
          onClick={(e: any) => {
            handleSubmit(e);
          }}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
      {/* </form> */}
    </BackPopUpChecked>
  );
};
