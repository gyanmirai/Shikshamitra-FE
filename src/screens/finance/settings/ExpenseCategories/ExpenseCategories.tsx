'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetBudgetOptionsQuery,
  useGetExpenseCategoryQuery,
} from 'src/redux/finance/expenseCategory';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

const FinanceExpenseCategory = () => {
  const addDialog = useBoolean();
  const editDialog = useBoolean();
  const confirm = useBoolean();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get expense categories data
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExpenseCategoryQuery,
  });

  // Handle save operation (create/update)
  const handleSave = async (values: any) => {
    try {
      if (selectedItem) {
        // Update logic
        shikshaMitraToast.success({
          message: `${values.expenseCategoryName} Expense Category Updated Successfully`,
        });
      } else {
        // Create logic
        shikshaMitraToast.success({
          message: `${values.expenseCategoryName} Expense Category Added Successfully`,
        });
      }
    } catch (error) {
      shikshaMitraToast.error({
        message: 'Failed to save expense category',
      });
      throw error;
    }
  };

  // Handle delete operation
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      // Delete logic

      shikshaMitraToast.success({
        message: `${selectedItem.expenseCategoryName} Expense Category Deleted Successfully`,
      });

      setTimeout(() => {
        setSelectedItem(null);
      }, 200);
      confirm.onFalse();
    } catch (error) {
      console.error('Delete operation failed:', error);
      shikshaMitraToast.error({
        message: 'Failed to delete expense category',
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
    addDialog.onFalse();
    editDialog.onFalse();
    setTimeout(() => {
      setSelectedItem(null);
    }, 200);
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Expense Category"
        description="This screen displays all created expense categories and provides an option to create a new category."
        links={[
          { name: 'Finance', href: '/finance' },
          { name: 'Setting', href: '/finance/setting' },
          { name: 'Expense Category', href: '/finance/settings/expense-category' },
        ]}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleAdd}
          >
            Expense Category
          </Button>
        }
        sx={{ mb: 2 }}
      />

      <CustomizableTable
        tableId="expense-category-table"
        noDataText={<>No Expense Category Data Found</>}
        isLoading={isLoading}
        columns={[
          {
            id: 'expenseCategoryName',
            label: 'Expense Category Name',
            minWidth: '220px',
            isSort: true,
            isFilter: true,
            align: 'left',
          },
          {
            id: 'budget',
            label: 'Budget',
            minWidth: '200px',
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
      <ExpenseCategoryDialog
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
            Are you sure you want to delete expense category{' '}
            <b>{selectedItem?.expenseCategoryName}</b>?{' '}
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

export default FinanceExpenseCategory;

interface ExpenseCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  editData?: any | null;
  onSave: (values: any) => Promise<void>;
}

const ExpenseCategoryDialog = ({ open, onClose, editData, onSave }: ExpenseCategoryDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Get budget options from API
  const { data: budgetOptions = [] } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBudgetOptionsQuery,
  });

  // Prepare budget options for dropdown
  const budgetDropdownOptions = Array.isArray(budgetOptions)
    ? budgetOptions.map((item) => ({
        id: typeof item === 'string' ? item : item.name,
        name: typeof item === 'string' ? item : item.name,
      }))
    : [];

  // Handle budget change
  const handleBudgetChange = (value: string | number | string[] | number[]) => {
    formik.setFieldValue('budget', value);
    formik.setFieldTouched('budget', false);
  };

  // Form validation schema using Yup
  const validationSchema = Yup.object().shape({
    expenseCategoryName: Yup.string().required('Expense Category Name is required'),
    budget: Yup.string().required('Budget is required'),
    description: Yup.string().optional(),
  });

  // Initialize formik form with initial values and submit handler
  const formik = useFormik({
    initialValues: {
      expenseCategoryName: editData?.expenseCategoryName || '',
      budget: editData?.budget || '',
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
            {editData ? 'Update Expense Category' : 'Add Expense Category'}
          </Typography>
          <CustomTooltip
            arrow
            placement="right"
            sx={{ textAlign: 'justify' }}
            title="This modal allows the user to fill in all required fields to create a new expense category."
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
              {/* Expense Category Name Field */}
              <ShakingTextField
                error={
                  !!(formik.touched.expenseCategoryName && formik.errors.expenseCategoryName) ||
                  false
                }
              >
                <TextField
                  size="small"
                  value={formik.values.expenseCategoryName}
                  name="expenseCategoryName"
                  fullWidth
                  label="Expense Category Name *"
                  onChange={(e: any) => {
                    const withoutNumbers = e.target.value.replace(/[0-9]/g, '');
                    const newName = withoutNumbers
                      .split(' ')
                      .map(
                        (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      )
                      .join(' ');
                    formik.setFieldValue('expenseCategoryName', newName);
                  }}
                  error={
                    formik.touched.expenseCategoryName && Boolean(formik.errors.expenseCategoryName)
                  }
                  helperText={
                    formik.touched.expenseCategoryName &&
                    typeof formik.errors.expenseCategoryName === 'string'
                      ? formik.errors.expenseCategoryName
                      : undefined
                  }
                />
              </ShakingTextField>

              {/* Budget Dropdown */}
              <ShakingTextField error={!!(formik.touched.budget && formik.errors.budget) || false}>
                <CustomSelect
                  name="budget"
                  label="Budget *"
                  options={budgetDropdownOptions}
                  value={formik.values.budget}
                  labelKey="name"
                  valueKey="id"
                  onChange={handleBudgetChange}
                  error={!!(formik.touched.budget && formik.errors.budget) || false}
                  helperText={
                    formik.touched.budget && typeof formik.errors.budget === 'string'
                      ? formik.errors.budget
                      : ''
                  }
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
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
