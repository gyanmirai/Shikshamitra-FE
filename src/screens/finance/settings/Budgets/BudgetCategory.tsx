'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';

import { ConfirmDialog } from 'src/components/confirm-dialog';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetBudgetCategoryQuery } from 'src/redux/finance/budgetsCategory';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';

const FinanceBudgetCategorySettings = () => {
  const addDialog = useBoolean();
  const editDialog = useBoolean();
  const confirm = useBoolean();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get budget categories data
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBudgetCategoryQuery,
  });

  // Handle save operation (create/update)
  const handleSave = async (values: any) => {
    try {
      if (selectedItem) {
        // Update logic here - you can implement API call
        shikshaMitraToast.success({
          message: `${values.categoryName} Budget Category Updated Successfully`,
        });
      } else {
        // Create logic here - you can implement API call
        shikshaMitraToast.success({
          message: `${values.categoryName} Budget Category Added Successfully`,
        });
      }
    } catch (error) {
      shikshaMitraToast.error({
        message: 'Failed to save budget category',
      });
      throw error;
    }
  };

  // Handle delete operation
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      // Delete logic here - you can implement API call

      shikshaMitraToast.success({
        message: `${selectedItem.categoryName} Budget Category Deleted Successfully`,
      });

      setSelectedItem(null);
      confirm.onFalse();
    } catch (error) {
      console.error('Delete operation failed:', error);
      shikshaMitraToast.error({
        message: 'Failed to delete budget category',
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
    setSelectedItem(null);
    addDialog.onFalse();
    editDialog.onFalse();
  };

  return (
    <Box>
      <CustomBreadcrumbs
        description="This screen displays all the budget categories created in the system and provides an option to add new budget categories."
        heading="Budget Category"

        links={[
          { name: 'Finance', href: '/finance' },
          { name: 'Setting', href: '/finance/setting' },
          { name: 'Budget Category', href: '/finance/settings/budget-category' },
        ]}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleAdd}
          >
            Budget Category
          </Button>
        }
      />

      <CustomizableTable
        tableId="budget-category-table"
        noDataText={<>No Budget Category Data Found</>}
        isLoading={isLoading}
        columns={[
          {
            id: 'categoryName',
            label: 'Category Name',
            minWidth: '150px',
            isSort: true,
            isFilter: true,
            align: 'left',
          },
          {
            id: 'code',
            label: 'Code',
            minWidth: '80px',
            isSort: true,
            isFilter: true,
            align: 'left',
          },
          {
            id: 'createdBy',
            label: 'Created by',
            minWidth: '150px',
            isSort: true,
            isFilter: true,
            align: 'left',
          },
          {
            id: 'description',
            label: 'Description',
            minWidth: '300px',
            isSort: false,
            isFilter: false,
            align: 'left',
          },
          {
            stickyPosition: 'right',
            excludeFromExport: true,
            id: 'actions',
            label: 'Actions',
            minWidth: '90px',
            isSort: false,
            isFilter: false,
            align: 'left',
            sticky: true,
            render(value, row: any) {
              return (
                <AdaptiveThreeDotsActions
                  directActionLimit={2}
                  actions={[
                    {
                      id: 'edit',
                      label: 'Edit',
                      icon: 'solar:pen-bold',
                      onClick: () => {
                        handleEdit(row);
                      },
                    },
                    {
                      id: 'delete',
                      label: 'Delete',
                      icon: 'solar:trash-bin-trash-bold',
                      onClick: () => {
                        handleDeleteAction(row);
                      },
                      color: 'error.main',
                    },
                  ]}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={data || []}
      />

      {/* Add/Edit Dialog */}
      <BudgetCategoryDialog
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
            Are you sure you want to delete budget category <b>{selectedItem?.categoryName}</b>
            ?{' '}
          </>
        }
        action={
          <LoadingButton
            startIcon={<Iconify icon="mdi:delete-outline" />}
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

export default FinanceBudgetCategorySettings;

interface BudgetCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  editData?: any | null;
  onSave: (values: any) => Promise<void>;
}

const BudgetCategoryDialog = ({ open, onClose, editData, onSave }: BudgetCategoryDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Form validation schema using Yup
  const validationSchema = Yup.object().shape({
    categoryName: Yup.string().required('Budget Category Name is required'),
    code: Yup.string().optional(),
    description: Yup.string().optional(),
  });

  // Initialize formik form with initial values and submit handler
  const formik = useFormik({
    initialValues: {
      categoryName: editData?.categoryName || '',
      code: editData?.code || '',
      description: editData?.description || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        await onSave(values);
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
            {editData ? 'Update Budget Category' : 'Add Budget Category'}
          </Typography>
          <CustomTooltip
            arrow
            placement="right"
            sx={{ textAlign: 'justify' }}
            title="This modal allows the admin to create a new budget category by entering its name, unique code, and description, then submitting to save it in the system."
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
              {/* Budget Category Name Field */}
              <ShakingTextField
                error={!!(formik.touched.categoryName && formik.errors.categoryName) || false}
              >
                <TextField
                  size="small"
                  value={formik.values.categoryName}
                  name="categoryName"
                  fullWidth
                  label="Budget Category Name *"
                  onChange={(e: any) => {
                    const withoutNumbers = e.target.value.replace(/[0-9]/g, '');
                    const newName = withoutNumbers
                      .split(' ')
                      .map(
                        (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      )
                      .join(' ');
                    formik.setFieldValue('categoryName', newName);
                  }}
                  error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
                  helperText={
                    (formik.touched.categoryName && typeof formik.errors.categoryName === 'string'
                      ? formik.errors.categoryName
                      : undefined) || undefined
                  }
                />
              </ShakingTextField>

              {/* Code/Short Name Field */}
              <ShakingTextField error={!!(formik.touched.code && formik.errors.code) || false}>
                <TextField
                  size="small"
                  value={formik.values.code}
                  name="code"
                  fullWidth
                  label="Code/Short Name"
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    formik.setFieldValue('code', value);
                  }}
                  onBlur={formik.handleBlur}
                />
              </ShakingTextField>

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
