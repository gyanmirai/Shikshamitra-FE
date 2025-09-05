import type { RootState } from 'src/redux/store';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { shikshaMitraToast } from 'src/components/toast';
import sortQueryString from 'src/utils/sort-query-string';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { DocumentType, DocumentTypeArray } from 'src/enums/documnet-type';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
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
  useGetStudentDocumentTypeQuery,
  useAddStudentDocumentTypeMutation,
  useUpdateStudentDocumentTypeMutation,
  useDeleteStudentDocumentTypeMutation,
} from 'src/redux/student/document-type/document-type-api';

import type { IStudentDocument } from './type';

const StudentDocumentType = ({
  defaultDocumentTypes,
}: {
  defaultDocumentTypes: UseBooleanReturn;
}) => {
  // Dialog state for add/edit form
  // const dialog = useBoolean();
  // Dialog state for delete confirmation
  const confirm = useBoolean();
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

  const { data: documents, isLoading } = useQueryAndMutation({
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
            Are you sure you want to delete <strong>{editData?.documentName}</strong> document?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              await deleteDocument(editData?.id);
              shikshaMitraToast.success({
                message: `${editData?.documentName} document deleted successfully`,
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
        isLoading={isLoading}
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
        columns={[
          { id: 'documentName', label: 'Document Name' },
          { id: 'documentSize', label: 'Document Size' },
          {
            id: 'documentTypes',
            label: 'Accepted Format',
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
        ]}
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

// export const DocumentForm = ({
//   editData,
//   handleClose,
// }: {
//   editData: null | IStudentDocument;
//   handleClose?: (e: any, isSubmit: boolean) => void;
// }) => {
//   const dispatch = useDispatch();
//   const [showSuccessMessage, setShowSuccessMessage] = useState(false);

//   const [addDocument, { isLoading }] = useQueryAndMutation({
//     type: 'mutation',
//     currentQueryAndMutation: useAddStudentDocumentTypeMutation,
//   });
//   const [updateDocument, { isLoading: isUpdateLoading }] = useQueryAndMutation({
//     type: 'mutation',
//     currentQueryAndMutation: useUpdateStudentDocumentTypeMutation,
//   });

//   const formik = useFormik<{
//     title: string;
//     documentType: DocumentType[];
//     isRequired: boolean;
//   }>({
//     initialValues: {
//       title: editData?.documentName || '',
//       documentType: editData?.documentTypes || [],
//       isRequired: editData?.isRequired || false,
//     },
//     validationSchema: Yup.object({
//       title: Yup.string().required('Document name is required'),
//       documentType: Yup.array().min(1, 'At least one document type is required'),
//     }),
//     onSubmit: async (formikValues, { resetForm, setSubmitting }) => {
//       try {
//         setSubmitting(true);

//         if (editData) {
//           // Update existing document and close popup
//           await updateDocument({
//             id: editData.id,
//             body: {
//               documentName: formikValues.title,
//               documentTypes: formikValues.documentType,
//               isRequired: formikValues.isRequired,
//             },
//           });
//           handleClose?.(null, true);
//           return;
//         }

//         // Add new document - DON'T close dialog
//         await addDocument({
//           documentName: formikValues.title,
//           documentTypes: formikValues.documentType,
//           isRequired: formikValues.isRequired,
//         });

//         // Show success message
//         setShowSuccessMessage(true);

//         // Reset form for next entry
//         resetForm();

//         // Reset the changes state so dialog doesn't prompt for confirmation
//         dispatch(setIsChanges(false));

//         // Hide success message after 3 seconds
//         setTimeout(() => {
//           setShowSuccessMessage(false);
//         }, 3000);
//       } catch (error) {
//         console.error('Error saving document:', error);
//       } finally {
//         setSubmitting(false);
//       }
//     },
//   });

//   const { values, setFieldValue, handleSubmit, errors, touched } = formik;

//   // Function to handle "Add Another" button
//   const handleAddAnother = (e: React.FormEvent) => {
//     e.preventDefault();
//     handleSubmit();
//   };

//   // Function to handle "Save & Close" button
//   const handleSaveAndClose = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (editData) {
//       handleSubmit();
//       return;
//     }
//     handleSubmit();
//     handleClose?.(null, true);
//   };

//   return (
//     <BackPopUpChecked initialValues={formik.initialValues} currentValues={values}>
//       <form onSubmit={handleSubmit}>
//         <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
//           <Stack spacing={2}>
//             {!editData && (
//               <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
//                 {/* <Button
//                   size="small"
//                   variant="outlined"
//                   startIcon={<Iconify icon="eva:plus-fill" />}
//                   onClick={handleAddAnother}
//                   disabled={isLoading || isUpdateLoading}
//                 >
//                   {isLoading ? 'Adding...' : 'Add Another'}
//                 </Button> */}
//               </Box>
//             )}
//             {/* Success Message */}
//             {showSuccessMessage && (
//               <Box
//                 sx={{
//                   p: 2,
//                   bgcolor: 'success.lighter',
//                   border: '1px solid',
//                   borderColor: 'success.main',
//                   borderRadius: 1,
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 1,
//                 }}
//               >
//                 <Iconify icon="eva:checkmark-circle-2-fill" color="success.main" />
//                 <Typography variant="body2" color="success.dark">
//                   Document added successfully! You can add another document.
//                 </Typography>
//               </Box>
//             )}

//             <ShakingTextField error={!!(touched.title && errors.title) || false}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 label="Document Name *"
//                 name="title"
//                 value={values.title}
//                 onChange={(e) => setFieldValue('title', e.target.value)}
//                 error={Boolean(errors.title && touched.title)}
//                 helperText={(touched.title && errors.title) || ''}
//               />
//             </ShakingTextField>

//             <ShakingTextField error={!!(touched.documentType && errors.documentType) || false}>
//               <CustomSelect
//                 options={DocumentTypeArray}
//                 value={values.documentType}
//                 multiple
//                 label="Select document Type *"
//                 onChange={(value) => setFieldValue('documentType', value)}
//                 formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
//                 error={Boolean(errors.documentType && touched.documentType)}
//                 helperText={(touched.documentType && errors.documentType) as string}
//               />
//             </ShakingTextField>

//             <FormControlLabel
//               control={
//                 <Switch
//                   checked={values.isRequired}
//                   onChange={(e) => setFieldValue('isRequired', e.target.checked)}
//                 />
//               }
//               label="Is Required"
//             />
//           </Stack>
//         </Scrollbar>

//         <DialogActions sx={{ px: 2 }}>
//           <Button
//             size="small"
//             startIcon={<Iconify icon={GlobalIcons.cancel} />}
//             variant="outlined"
//             onClick={() => {
//               handleClose?.(null, false);
//             }}
//           >
//             Cancel
//           </Button>
//           <LoadingButton
//             size="small"
//             variant="contained"
//             loading={isUpdateLoading || isLoading}
//             startIcon={<Iconify icon={GlobalIcons.submit} />}
//             onClick={handleSaveAndClose}
//           >
//             {editData ? 'Update' : 'Submit'}
//           </LoadingButton>
//         </DialogActions>
//       </form>
//     </BackPopUpChecked>
//   );
// };

export const DocumentForm = ({
  editData,
  handleClose,
}: {
  editData: null | IStudentDocument;
  handleClose?: (e: any, isSubmit: boolean) => void;
}) => {
  const dispatch = useDispatch();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [addDocument, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentDocumentTypeMutation,
  });

  const [updateDocument, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentDocumentTypeMutation,
  });

  const formik = useFormik<{
    title: string;
    documentType: { label: string; value: number }[];
    documentSize: number | string;
    isRequired: boolean;
  }>({
    initialValues: {
      title: editData?.documentName || '',
      documentType:
        editData?.documentTypes?.map((item: any) => ({ label: DocumentType[item], value: item })) ||
        [],
      documentSize: editData?.documentSize || '',
      isRequired: editData?.isRequired || false,
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Document name is required'),
      documentType: Yup.array()
        .min(1, 'At least one document type is required')
        .required('Document type is required'),
      documentSize: Yup.number().required('Document size is required'),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setSubmitting(true);
        const payload = {
          documentName: values.title,
          documentTypes: values.documentType.map((d) => d.value),
          documentSize: values.documentSize,
          isRequired: values.isRequired,
        };

        if (editData) {
          await updateDocument({ id: editData.id, body: payload }).unwrap();
          shikshaMitraToast.success({
            message: `${payload.documentName} document updated successfully`,
          });
          handleClose?.(null, true);
          return;
        }

        await addDocument(payload).unwrap();
        shikshaMitraToast.success({
          message: `${payload.documentName} document added successfully`,
        });
        setShowSuccessMessage(true);
        resetForm();
        dispatch(setIsChanges(false));
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } catch (error) {
        console.error('Error saving document:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, touched, errors, setFieldValue, handleChange, handleSubmit } = formik;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={values}>
      {/* <form onSubmit={handleSubmit}> */}
      <DialogScrollContent>
        <Stack spacing={3}>
          {/* Document Name */}
          <ShakingTextField error={Boolean(touched.title && errors.title)}>
            <TextField
              fullWidth
              size="small"
              label="Document Name *"
              name="title"
              value={values.title}
              onChange={(e) => {
                const onlyText = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                setFieldValue('title', onlyText);
              }}
              error={Boolean(touched.title && errors.title)}
              helperText={touched.title && errors.title}
            />
          </ShakingTextField>

          {/* Document Size */}
          <ShakingTextField error={Boolean(touched.documentSize && errors.documentSize)}>
            <TextField
              label="Document Size (MB) *"
              value={values.documentSize}
              size="small"
              type="number"
              name="documentSize"
              fullWidth
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              inputProps={{ min: 1, max: 9 }}
              onChange={(e) => {
                const { value } = e.target;

                if (/^[1-9]$/.test(value)) {
                  setFieldValue('documentSize', value);
                } else if (value === '') {
                  setFieldValue('documentSize', '');
                }
              }}
              error={Boolean(touched.documentSize && errors.documentSize)}
              helperText={touched.documentSize && errors.documentSize}
            />
          </ShakingTextField>

          {/* Document Type */}
          <ShakingTextField error={Boolean(touched.documentType && errors.documentType)}>
            <Autocomplete
              multiple
              options={DocumentTypeArray}
              disableCloseOnSelect
              getOptionLabel={(option) => option.label}
              value={values.documentType}
              onChange={(_, newValue) => setFieldValue('documentType', newValue)}
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
                  value={`${values.documentType?.length || 0} Document Selected`}
                  size="small"
                  error={Boolean(touched.documentType && errors.documentType)}
                  helperText={(touched.documentType && errors.documentType) as string}
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
