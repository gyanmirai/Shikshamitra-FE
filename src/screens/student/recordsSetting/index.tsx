'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import base64ToFile from 'src/utils/base64ToFile';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { fileToBase64 } from 'src/utils/file-to-base64';
import FileUploader from 'src/components/custom-upload';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { Box, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  useGetAllGroupQuery,
  useDeleteGroupMutation,
  useAddStudentGroupMutation,
  useUpdateStudentGroupMutation,
} from 'src/redux/student/student-group/student-group';

import type { IGroup } from '../management/group-managemnet/type';

const HouseSetting = () => {
  const { data: groupData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllGroupQuery,
  });

  const [deleteGroup, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteGroupMutation,
  });
  const dialog = useBoolean();
  // Dialog state for delete confirmation
  const confirm = useBoolean();
  // State to store group data being edited

  const [editData, setEditData] = useState<null | IGroup>(null);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Handles closing the incident form
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dispatch(setIsChanges(false));
      setEditData(null);
      dialog.onFalse();
    } else if (!isChanges) {
      setEditData(null);
      dialog.onFalse();
    }
  };
  return (
    <Box sx={{ minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Setting"
        description="Student Inquiry: Captures and manages admission-related inquiries from prospective students or parents."
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Student Records', href: '/student/overview/' },
          { name: 'Setting' },
        ]}
        sx={{ mb: 1 }}
        action={
          <Button
            size="small"
            startIcon={<Add />}
            variant="contained"
            onClick={dialog.onTrue}
            sx={{ px: '32px' }}
          >
            House
          </Button>
        }
      />
      <CustomizableTable
        tableId="group-management-table"
        noDataText={
          <>
            No House Data Found{' '}
            <Box
              onClick={dialog.onTrue}
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
              Add House
            </Box>{' '}
          </>
        }
        totalCount={groupData?.totalCount || 0}
        // isLoading={isLoading}
        // serverSide
        // onServerPagination={async (page, rowPerPage) => {
        //   const newParams = {
        //     ...queryParams,
        //     SkipCount: page * rowPerPage,
        //     MaxResultCount: rowPerPage,
        //   };
        //   setQueryParams(newParams);
        // }}
        onServerSort={async (column, sort) => {}}
        columns={[
          {
            label: 'House Name',
            id: 'name',
            render(value, row) {
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SubjectColorIndicator color={row.color} />
                  <Typography variant="caption" fontSize="13px">
                    {value}
                  </Typography>
                </Box>
              );
            },
          },
          {
            label: 'Actions',
            id: 'action',
            isSort: false,
            isFilter: false,
            sticky: true,
            minWidth: '40px',
            align: 'left',
            render(value, row) {
              return (
                <ThreeDotsActions
                  showEditIcon
                  showDeleteIcon
                  showThreeDots={false}
                  handleEditClick={() => {
                    setEditData(row as any);
                    dialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setEditData(row as any);
                    confirm.onTrue();
                  }}
                  placement="right-top"
                  //   actions={({ popover }) => (
                  //     <MenuList>
                  //       <MenuItem
                  //         onClick={() => {
                  //           setEditData(row as IGroup);
                  //           assignStudentDialog.onTrue();
                  //           popover.onClose();
                  //         }}
                  //       >
                  //         <Iconify icon="hugeicons:student" />
                  //         Assign Student
                  //       </MenuItem>
                  //       <MenuItem
                  //         onClick={() => {
                  //           setEditData(row as IGroup);
                  //           assignLeaderDialog.onTrue();
                  //           popover.onClose();
                  //         }}
                  //       >
                  //         <Iconify icon="fluent-mdl2:party-leader" />
                  //         Assign leader
                  //       </MenuItem>
                  //     </MenuList>
                  //   )}
                />
              );
            },
          },
        ]}
        data={groupData?.items || []}
      />{' '}
      <CustomDialog
        open={dialog.value}
        handleClose={() => {
          setEditData(null);
          dialog.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">{editData ? 'Update House' : 'Add House'}</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                editData
                  ? 'You can update the house name.'
                  : 'You can create a new house by entering the house name.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <GroupManagementForm editData={editData} handleClose={handleClose} />
      </CustomDialog>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete house <strong>{editData?.name}</strong>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={isDeleteLoading}
            onClick={async () => {
              try {
                await deleteGroup(editData?.id).unwrap();
                confirm.onFalse();
                shikshaMitraToast.success({
                  message: `${editData?.name} House Deleted Successfully`,
                });
              } catch (error) {
                console.error(error);
              }
              setEditData(null);
            }}
            // startIcon={<Iconify icon={GlobalIcons.delete} />}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default HouseSetting;

const GroupManagementForm = ({
  editData,
  handleClose,
}: {
  editData: IGroup | null;
  handleClose: (e: any, isSubmit: boolean) => void;
}) => {
  // Hooks for adding and updating student groups using custom query and mutation hook
  const [addGroup, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentGroupMutation,
  });
  // Custom hook for updating student group data
  // Returns mutation function and loading state
  // updateGroup: Function to update existing group
  // isUpdateLoading: Boolean indicating if update is in progress
  const [updateGroup, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentGroupMutation,
  });

  // Initialize formik form with initial values and submit handler
  const formik = useFormik({
    // Set initial name value from editData if exists, otherwise empty string
    initialValues: {
      name: editData?.name || '',
      color: editData?.color || '#000000',
      logo: editData?.logo ? base64ToFile(editData?.logo as string) : '',
      description: editData?.description || '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required('House Name is required'),
      color: Yup.string().required('Color is required'),
    }),
    // Handle form submission for both add and update operations
    onSubmit: async (values) => {
      try {
        if (editData) {
          // Update existing group if editData exists
          await updateGroup({
            id: editData.id,
            body: {
              name: values.name,
              color: values.color,
              logo: values.logo ? await fileToBase64(values.logo as File) : '',
              description: values.description,
            },
          }).unwrap();
          shikshaMitraToast.success({ message: `${values.name} House Updated Successfully` });
        } else {
          // Add new group if no editData
          await addGroup({
            name: values.name,
            color: values.color,
            logo: values.logo ? await fileToBase64(values.logo as File) : '',
            description: values.description,
          }).unwrap();
          shikshaMitraToast.success({ message: `${values.name} House Added Successfully` });
        }
        // Close dialog after successful operation
        handleClose(null, true);
      } catch (error) {
        console.error(error);
      }
    },
  });
  return (
    <Box>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <DialogScrollContent>
          <Stack spacing={3} p={0}>
            <ShakingTextField error={!!(formik.touched.name && formik.errors.name) || false}>
              <TextField
                size="small"
                value={formik.values.name}
                name="name"
                fullWidth
                label="House Name *"
                autoFocus
                onChange={(e) => {
                  const value = capitalize(e.target.value);
                  formik.setFieldValue('name', value);
                }}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </ShakingTextField>
            <ColorPickerCircle
              onSelect={(color: string) => formik.setFieldValue('color', color)}
              initialColor={formik.values.color}
            />
            <FileUploader
              value={formik.values.logo as File}
              multiple={false}
              onChange={(value) => {
                // const reader = new FileReader();
                formik.setFieldValue('logo', value);
                // reader.readAsDataURL(value as File);
                // reader.readAsDataURL(value as File);
                // reader.onload = () => {
                //   const base64String = reader.result;
                // };
              }}
              primaryText="Please Upload Your logo"
              secondaryText="Maximum file size is 3MB"
            />
            <TextField
              multiline
              rows={4}
              size="small"
              value={formik.values.description || ''}
              name="description"
              fullWidth
              label="Description"
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </Stack>
        </DialogScrollContent>
      </BackPopUpChecked>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
          variant="outlined"
          onClick={() => {
            handleClose(null, false);
          }}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          type="submit"
          variant="contained"
          loading={isLoading || isUpdateLoading}
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
