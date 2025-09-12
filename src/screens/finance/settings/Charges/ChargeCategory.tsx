'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetChargeCategoryQuery } from 'src/redux/finance/chargeCategory';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Stack,
  Button,
  Switch,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

const FinanceChargeCategory = () => {
  const addDialog = useBoolean();
  const editDialog = useBoolean();
  const confirm = useBoolean();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get charge categories data
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargeCategoryQuery,
  });

  // Handle save operation (create/update)
  const handleSave = async (values: any) => {
    try {
      if (selectedItem) {
        // Update logic
        shikshaMitraToast.success({
          message: `${values.chargeName} Charge Category Updated Successfully`,
        });
      } else {
        // Create logic
        shikshaMitraToast.success({
          message: `${values.chargeName} Charge Category Added Successfully`,
        });
      }
    } catch (error) {
      shikshaMitraToast.error({
        message: 'Failed to save charge category',
      });
      throw error;
    }
  };

  // Handle delete operation
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      // Delete logic here

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
    } finally {
      setIsDeleting(false);
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

  // Handle dialog close
  const handleDialogClose = () => {
    setTimeout(() => {
      setSelectedItem(null);
    }, 200);
    addDialog.onFalse();
    editDialog.onFalse();
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Charge Category"
        description="This screen displays all created charge Category, helping the school manage additional fees or penalties that can be applied to students"
        links={[
          { name: 'Finance', href: '/finance' },
          { name: 'Setting', href: '/finance/setting' },
          { name: 'Charge Category', href: '/finance/settings/charge-category' },
        ]}
        action={
          <Button variant="contained" size="small" startIcon={<Add />} onClick={handleAdd}>
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
            label: 'Charge Name',
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
      <ChargeCategoryDialog
        open={addDialog.value || editDialog.value}
        onClose={handleDialogClose}
        editData={selectedItem}
        onSave={handleSave}
      />

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
  onClose: () => void;
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

  const { data, isLoading: roleLoading } = useQueryAndMutation({
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
    onClose();
  };

  return (
    <CustomDialog
      open={open}
      handleClose={handleClose}
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <Typography variant="h6">
            {editData ? 'Update Charge Category' : 'Add Charge Category'}
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
      paperProps={{
        sx: {
          width: '580px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
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
                    const withoutNumbers = e.target.value.replace(/[0-9]/g, '');
                    const newName = withoutNumbers
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
    </CustomDialog>
  );
};
