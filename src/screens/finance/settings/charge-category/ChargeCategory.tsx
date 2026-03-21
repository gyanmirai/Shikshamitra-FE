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
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizable-table';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import CustomDialog, { DialogScrollContent } from 'src/components/custom-dialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Stack,
  Button,
  Switch,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import {
  chargeCategoryApi,
  useGetChargeCategoriesQuery,
  usePutChargeCategoryMutation,
  usePostChargeCategoryMutation,
  useDeleteChargeCategoryMutation,
} from 'src/redux/finance/chargeCategory';

const FinanceChargeCategory = () => {
  const addDialog = useBoolean();
  const editDialog = useBoolean();
  const confirm = useBoolean();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Get charge categories data
  const { data, isLoading, refetch } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargeCategoriesQuery,
    params: {
      academicYearId: currentYear?.id,
    },
  });

  // Delete mutation
  const [deleteChargeCategory] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteChargeCategoryMutation,
  });

  const { confirmWithUndo } = useConfirmWithUndo();

  // Handle delete operation
  const handleDelete = async () => {
    if (!selectedEntry?.id) return;

    confirmWithUndo({
      item: selectedEntry,
      onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
        dispatchFn(
          chargeCategoryApi.util.updateQueryData(
            'getChargeCategories',
            { academicYearId: currentYear?.id },
            (draft: any) => {
              const index = draft.items?.findIndex((b: any) => b.id === (selectedEntry as any)?.id);
              setDeleteIndex(index);
              if (index !== -1) {
                draft.items.splice(index, 1);
              }
            }
          )
        ),
      onUndoRestore: () => refetch(),
      onCommit: () => deleteChargeCategory({ chargeCategoryId: selectedEntry.id }),
    });
    confirm.onFalse();
    setSelectedEntry(null);
  };

  // Handle edit action
  const handleEdit = (item: any) => {
    setSelectedItem(item);
    editDialog.onTrue();
  };

  // Handle delete action
  const handleDeleteAction = (item: any) => {
    setSelectedEntry(item);
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

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Name',
        minWidth: '200px',
        isSort: true,
        isFilter: true,
        align: 'left',
      },
      {
        id: 'isApprovalRequired',
        label: 'Approval Required',
        minWidth: '200px',
        isSort: true,
        isFilter: true,
        align: 'left',
        render: (value: boolean) => (value ? 'Yes' : 'No'),
      },
      {
        id: 'description',
        label: 'Description',
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
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Charge Category"
        description="This screen displays all created charge Category, helping the school manage additional fees or penalties that can be applied to students"
        links={[
          { name: 'Finance', href: '/finance' },
          { name: 'Settings', href: '/finance/setting' },
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
            Charge Category
          </Button>
        }
      />

      <CustomizableTable
        tableId="charge-category-table"
        noDataText={<>No Charge Category Data Found</>}
        isLoading={isLoading}
        columns={columns}
        data={data?.items || []}
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
        />
      </CustomDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
          setSelectedEntry(null);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete charge category <b>{selectedEntry?.name}</b>?{' '}
          </>
        }
        action={
          <LoadingButton variant="contained" color="error" size="small" onClick={handleDelete}>
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
}

const ChargeCategoryDialog = ({ open, onClose, editData }: ChargeCategoryDialogProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // PUT mutation for updating
  const [putChargeCategory, { isLoading: putLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePutChargeCategoryMutation,
  });
  // POST mutation for creating
  const [postChargeCategory, { isLoading: postLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePostChargeCategoryMutation,
  });

  // Form validation schema using Yup
  const validationSchema = Yup.object().shape({
    chargeName: Yup.string().required('Charge Category Name is required'),
    isRefundable: Yup.boolean().required(),
    description: Yup.string().optional(),
  });

  // Initialize formik form with initial values and submit handler
  const formik = useFormik({
    initialValues: {
      chargeName: editData?.name || '',
      isRefundable: editData?.isApprovalRequired || false,
      description: editData?.description || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const payload = {
          name: values.chargeName,
          isApprovalRequired: values.isRefundable,
          description: values.description || '',
        };

        if (editData?.id) {
          await putChargeCategory({
            chargeCategoryId: editData.id,
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message: `${values.chargeName} Charge Category Updated Successfully`,
          });
        } else {
          await postChargeCategory({
            academicYearId: currentYear?.id,
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message: `${values.chargeName} Charge Category Added Successfully`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Save failed:', error);
        shikshaMitraToast.error({
          message: `Failed to ${editData ? 'update' : 'create'} charge category`,
        });
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
          loading={postLoading || putLoading}
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
