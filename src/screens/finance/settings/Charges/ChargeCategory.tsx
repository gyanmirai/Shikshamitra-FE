'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Chip,
  Stack,
  Button,
  Switch,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import {
  useGetChargeCategoryQuery,
  usePutChargeCategoryMutation,
  usePostChargeCategoryMutation,
  useDeleteChargeCategoryMutation,
} from 'src/redux/finance/chargeCategory';

const FinanceChargeCategory = () => {
  const addDialog = useBoolean();
  const editDialog = useBoolean();
  const confirm = useBoolean();

  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Get charge categories data
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargeCategoryQuery,
  });

  // POST mutation for creating
  const { postChargeCategory, isLoading: isCreating } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePostChargeCategoryMutation,
  });

  // PUT mutation for updating
  const { putChargeCategory, isLoading: isUpdating } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePutChargeCategoryMutation,
  });

  // DELETE mutation
  const { deleteChargeCategory, isLoading: isDeleting } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteChargeCategoryMutation,
  });

  // Handle save operation (create/update)
  const handleSave = async (values: any) => {
    try {
      // Transform form data to API format
      const payload = {
        name: values.chargeName,
        isApprovalRequired: values.isRefundable,
        description: values.description || '',
      };

      if (selectedItem?.id) {
        // Update existing charge category
        await putChargeCategory({
          chargeCategoryId: selectedItem.id,
          body: payload,
        }).unwrap();

        shikshaMitraToast.success({
          message: `${values.chargeName} Charge Category Updated Successfully`,
        });
      } else {
        // Create new charge category
        await postChargeCategory(payload).unwrap();

        shikshaMitraToast.success({
          message: `${values.chargeName} Charge Category Added Successfully`,
        });
      }
    } catch (error) {
      console.error('Save operation failed:', error);
      shikshaMitraToast.error({
        message: `Failed to ${selectedItem ? 'update' : 'create'} charge category`,
      });
      throw error;
    }
  };

  // Handle delete operation
  const handleDelete = async () => {
    if (!selectedItem?.id) return;

    try {
      await deleteChargeCategory(selectedItem.id).unwrap();

      shikshaMitraToast.success({
        message: `${selectedItem.chargeName} Charge Category Deleted Successfully`,
      });

      setTimeout(() => {
        setSelectedItem(null);
      }, 200);

      confirm.onFalse();
    } catch (error) {
      console.error('Delete operation failed:', error);
      shikshaMitraToast.error({
        message: 'Failed to delete charge category',
      });
    }
  };

  // Handle edit action
  const handleEdit = (item: any) => {
    setSelectedItem(item);
    editDialog.onTrue();
  };

  // Handle delete action
  const handleDeleteAction = (item: any) => {
    setSelectedItem(item);
    confirm.onTrue();
  };

  // Handle add new item
  const handleAdd = () => {
    setSelectedItem(null);
    addDialog.onTrue();
  };

  // Redux state and dispatch
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  /**
   * Handles closing the charge category dialog
   */
  const handleDialogClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addDialog.onFalse();
      editDialog.onFalse();
      setTimeout(() => {
        setSelectedItem(null);
      }, 200);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addDialog.onFalse();
      editDialog.onFalse();
      setTimeout(() => {
        setSelectedItem(null);
      }, 200);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Charge Category"
        description="This screen displays all created charge Category, helping the school manage additional fees or penalties that can be applied to students"
        links={[
          { name: 'Finance', href: '/finance' },
          { name: 'Setting', href: '/finance/setting' },
          { name: 'Charge Category', href: '/finance/settings/charge-category' },
        ]}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={handleAdd}
            sx={{ px: '32px' }}
          >
            Charge Type
          </Button>
        }
        sx={{ mb: 2 }}
      />

      <CustomizableTable
        tableId="charge-category-table"
        noDataText={<>No Charge Category Data Found</>}
        isLoading={isLoading}
        columns={[
          {
            id: 'chargeName',
            label: 'Name',
            minWidth: '200px',
            isSort: true,
            isFilter: true,
            align: 'left',
          },
          {
            id: 'isRefundable',
            label: 'Approval Required',
            minWidth: '200px',
            isSort: true,
            isFilter: true,
            align: 'left',
          },
          {
            id: 'roles',
            label: 'Roles',
            minWidth: '200px',
            isSort: true,
            isFilter: true,
            align: 'left',
          },
          {
            id: 'actions',
            label: 'Actions',
            minWidth: '70px',
            isSort: false,
            isFilter: false,
            align: 'left',
            sticky: true,
            render(value, row: any) {
              return (
                <ThreeDotsActions
                  showEditIcon
                  showDeleteIcon
                  showThreeDots={false}
                  placement="right-top"
                  handleDeleteClick={() => {
                    handleDeleteAction(row);
                  }}
                  handleEditClick={() => {
                    handleEdit(row);
                  }}
                />
              );
            },
          },
        ]}
        data={data || []}
      />

      {/* Add/Edit Dialog */}
      <CustomDialog
        open={addDialog.value || editDialog.value}
        handleClose={() => {
          addDialog.onFalse();
          editDialog.onFalse();
          setTimeout(() => {
            setSelectedItem(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h6">
              {selectedItem ? 'Update Charge Category' : 'Add Charge Category'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal allows you to create a new charge Category by defining its name, selecting whether it is fixed or percentage-based, and entering the respective amount or percentage."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
        fullWidth
      >
        <ChargeCategoryDialog
          open={addDialog.value || editDialog.value}
          onClose={handleDialogClose}
          editData={selectedItem}
          onSave={handleSave}
        />
      </CustomDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
          setSelectedItem(null);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete charge category <b>{selectedItem?.chargeName}</b>?{' '}
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isDeleting}
            color="error"
            size="small"
            onClick={handleDelete}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default FinanceChargeCategory;

interface ChargeCategoryDialogProps {
  open: boolean;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: any | null;
  onSave: (values: any) => Promise<void>;
}

const ChargeCategoryDialog = ({ open, onClose, editData, onSave }: ChargeCategoryDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Form validation schema using Yup
  const validationSchema = Yup.object().shape({
    chargeName: Yup.string().required('Charge Category Name is required'),
    isRefundable: Yup.boolean().required(),
    roles: Yup.array().when('isRefundable', {
      is: true,
      then: (schema) =>
        schema
          .min(1, 'At least one role must be selected when approval is required')
          .required('Role is required when approval is required'),
      otherwise: (schema) => schema.optional(),
    }),
    description: Yup.string().optional(),
  });

  const { data } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });

  // Initialize formik form with initial values and submit handler
  const formik = useFormik({
    initialValues: {
      chargeName: editData?.chargeName || '',
      isRefundable: editData?.isRefundable === 'Yes' || false,
      roles: editData?.roles || [],
      description: editData?.description || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const submitValues = {
          ...values,
          isRefundable: values.isRefundable ? 'Yes' : 'No',
        };
        await onSave(submitValues);
        handleClose();
      } catch (error) {
        console.error('Save failed:', error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Handle dialog cancellation and form reset
  const handleClose = () => {
    formik.resetForm();
    onClose(null, false);
  };

  return (
    <Box>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <DialogScrollContent>
          <Stack spacing={3} p={0}>
            {/* Charge Category Name Field */}
            <ShakingTextField
              error={!!(formik.touched.chargeName && formik.errors.chargeName) || false}
            >
              <TextField
                size="small"
                value={formik.values.chargeName}
                name="chargeName"
                fullWidth
                label="Charge Category Name *"
                onChange={(e: any) => {
                  const onlyLetters = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                  const newName = onlyLetters
                    .split(' ')
                    .map(
                      (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    )
                    .join(' ');
                  formik.setFieldValue('chargeName', newName);
                }}
                error={formik.touched.chargeName && Boolean(formik.errors.chargeName)}
                helperText={
                  formik.touched.chargeName && typeof formik.errors.chargeName === 'string'
                    ? formik.errors.chargeName
                    : undefined
                }
              />
            </ShakingTextField>

            {/* Approval Required Switch */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isRefundable}
                    onChange={(e) => formik.setFieldValue('isRefundable', e.target.checked)}
                    name="isRefundable"
                  />
                }
                label="Approval Required?"
              />
            </Box>

            {formik.values.isRefundable && (
              <ShakingTextField error={!!(formik.touched.roles && formik.errors.roles) || false}>
                <Autocomplete
                  disabled={isLoading}
                  multiple
                  options={data?.items || []}
                  value={formik.values.roles}
                  getOptionLabel={(option: any) => option?.name || ''}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => {
                      const tagProps = getTagProps({ index });
                      return (
                        <Chip
                          // Key is already provided by getTagProps
                          label={option.name}
                          variant="soft"
                          size="small"
                          {...tagProps} // now safe to spread the rest
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Role *"
                      size="small"
                      fullWidth
                      sx={{ width: '100%', minWidth: '200px' }}
                      error={formik.touched.roles && Boolean(formik.errors.roles)}
                      helperText={(formik.touched.roles && formik.errors.roles) as string}
                    />
                  )}
                  onChange={(e, newValue) => {
                    formik.setFieldValue('roles', newValue);
                  }}
                />
              </ShakingTextField>
            )}

            {/* Description Field */}
            <ShakingTextField
              error={!!(formik.touched.description && formik.errors.description) || false}
            >
              <TextField
                multiline
                rows={4}
                size="small"
                value={formik.values.description}
                name="description"
                fullWidth
                label="Description"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </ShakingTextField>
          </Stack>
        </DialogScrollContent>
      </BackPopUpChecked>

      {/* Dialog action buttons */}
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
          variant="outlined"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          type="submit"
          variant="contained"
          loading={isLoading}
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
