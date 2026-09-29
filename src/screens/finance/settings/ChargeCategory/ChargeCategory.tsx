'use client';

import type { RootState } from 'src/redux/store';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import type { IColumn } from 'src/components/customizabaleTable/types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomSelect from 'src/components/custom-select';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useRef, useMemo, useState, useCallback } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetIncomeCategoriesQuery } from 'src/redux/finance/incomeCategory';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { financePermissions } from 'src/constants/finance-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import DownstreamUsageWarning from 'src/screens/finance/settings/components/DownstreamUsageWarning';
import {
  Box,
  Card,
  Chip,
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
  usePatchChargeCategoryStatusMutation,
} from 'src/redux/finance/chargeCategory';

const ARCHIVE_REASON_MAX_LENGTH = 500;

const FinanceChargeCategory = () => {
  const [archiveView, setArchiveView] = useState<'current' | 'archived'>('current');
  const addDialog = useBoolean();
  const editDialog = useBoolean();
  const confirm = useBoolean();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const auth = useSelector((state: RootState) => state.auth);
  const categoryPermissions = financePermissions.fees.settings.chargeCategoryActions;
  const canAdd = hasGrantedPermission(auth.permissions, categoryPermissions.add);
  const canEdit = hasGrantedPermission(auth.permissions, categoryPermissions.edit);
  const canChangeStatus = hasGrantedPermission(auth.permissions, categoryPermissions.changeStatus);
  const canDelete = hasGrantedPermission(auth.permissions, categoryPermissions.delete);
  const academicYearId = currentYear?.id ?? '';

  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 10, search: '' });

  const handleServerPagination = useCallback((page: number, rowsPerPage: number) => {
    setQueryParams((prev) => ({ ...prev, page, pageSize: rowsPerPage }));
  }, []);

  const handleServerSearch = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  // Get charge categories data
  const { data, isLoading, isFetching, refetch } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargeCategoriesQuery,
    params: {
      academicYearId,
      page: queryParams.page,
      pageSize: queryParams.pageSize,
      search: queryParams.search || undefined,
      isActive: archiveView === 'current',
    },
  });
  const { data: archivedSummary } = useGetChargeCategoriesQuery(
    {
      academicYearId,
      page: 1,
      pageSize: 1,
      isActive: false,
    },
    { skip: !academicYearId }
  );

  // Delete mutation
  const [deleteChargeCategory, { isLoading: isDeleting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteChargeCategoryMutation,
  });

  const [patchChargeCategoryStatus, { isLoading: isStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchChargeCategoryStatusMutation,
  });

  const statusConfirm = useBoolean();
  const [statusData, setStatusData] = useState<any>(null);
  const [deactivationReason, setDeactivationReason] = useState('');

  const handleOpenStatusConfirm = (row: any) => {
    setStatusData(row);
    setDeactivationReason('');
    statusConfirm.onTrue();
  };

  const nextStatus = statusData ? !statusData.isActive : false;

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
            {
              academicYearId: currentYear?.id,
              page: queryParams.page,
              pageSize: queryParams.pageSize,
              search: queryParams.search || undefined,
              isActive: archiveView === 'current',
            },
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
        id: 'incomeCategoryName',
        label: 'Income Category',
        minWidth: '220px',
        align: 'left',
        render: (_value: unknown, row: any) =>
          row.isAccountingReady
            ? `${row.incomeCategoryName || '-'} → ${row.incomeAccountHeadName || '-'}`
            : 'Accounting mapping required',
      },
      {
        id: 'name',
        label: 'Name',
        minWidth: '200px',
        isSort: true,
        isFilter: true,
        align: 'left',
        sticky: true,
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
        id: 'isActive',
        label: 'Status',
        minWidth: '140px',
        sticky: true,
        render(value: boolean, row: any) {
          return (
            <Chip
              size="small"
              label={row.isActive ? 'Active' : 'Archived'}
              color={row.isActive ? 'success' : 'default'}
              variant="soft"
            />
          );
        },
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
            <AdaptiveThreeDotsActions
              placement="right-top"
              actions={[
                ...(canEdit && archiveView === 'current'
                  ? [
                      {
                        id: 'edit',
                        label: 'Edit',
                        icon: 'solar:pen-bold',
                        onClick: () => handleEdit(row),
                      },
                    ]
                  : []),
                ...(canDelete && archiveView === 'current' && !row.isUsedInDownstream
                  ? [
                      {
                        id: 'delete',
                        label: 'Delete',
                        icon: 'solar:trash-bin-trash-bold',
                        color: 'error.main',
                        onClick: () => handleDeleteAction(row),
                      },
                    ]
                  : []),
                ...(canChangeStatus
                  ? [
                      {
                        id: 'status',
                        label: archiveView === 'archived' ? 'Restore' : 'Archive',
                        icon:
                          archiveView === 'archived'
                            ? 'mdi:archive-arrow-up-outline'
                            : 'mdi:archive-outline',
                        disabled: isStatusLoading,
                        onClick: () => handleOpenStatusConfirm(row),
                      },
                    ]
                  : []),
              ]}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [archiveView, canChangeStatus, canDelete, canEdit, isStatusLoading]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Charge Category"
        description="This screen displays all created charge Category, helping the school manage additional fees or penalties that can be applied to students"
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/charge-management' },
          { name: 'Settings' },
          { name: 'Charge Category' },
        ]}
        action={
          canAdd && archiveView === 'current' ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={handleAdd}
              sx={{ px: '32px' }}
            >
              Charge Category
            </Button>
          ) : undefined
        }
      />

      <Card sx={{ p: 1, mb: 1.5 }}>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant={archiveView === 'current' ? 'contained' : 'outlined'}
            onClick={() => {
              setQueryParams((current) => ({ ...current, page: 1 }));
              setArchiveView('current');
            }}
          >
            Current
          </Button>
          <Button
            size="small"
            variant={archiveView === 'archived' ? 'contained' : 'outlined'}
            onClick={() => {
              setQueryParams((current) => ({ ...current, page: 1 }));
              setArchiveView('archived');
            }}
            endIcon={
              <Label color="default" variant="soft">
                {archivedSummary?.totalCount ?? 0}
              </Label>
            }
          >
            Archived
          </Button>
        </Stack>
      </Card>

      <CustomizableTable
        tableId="charge-category-table"
        noDataText={
          archiveView === 'archived'
            ? 'No archived charge categories.'
            : 'No charge categories found.'
        }
        isLoading={isLoading || isFetching}
        columns={columns}
        data={data?.items || []}
        serverSidePagination
        serverSideSearch
        totalCount={data?.totalCount}
        onServerPagination={handleServerPagination}
        onServerSearch={handleServerSearch}
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
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={isDeleting}
            onClick={handleDelete}
          >
            Yes
          </LoadingButton>
        }
      />

      {/* Status Confirmation Dialog */}
      <ConfirmDialog
        open={statusConfirm.value}
        onClose={() => {
          statusConfirm.onFalse();
          setStatusData(null);
          setDeactivationReason('');
        }}
        title={nextStatus ? 'Restore Charge Category' : 'Archive Charge Category'}
        content={
          <Stack spacing={2}>
            <Typography variant="body2">
              {nextStatus ? 'Restore' : 'Archive'}{' '}
              <Box component="span" fontWeight="bold" color="text.primary">
                {statusData?.name}
              </Box>
              ?
            </Typography>
            {!nextStatus && (
              <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                label="Archive reason"
                required
                error={deactivationReason.length > 0 && !deactivationReason.trim()}
                helperText={
                  deactivationReason.length > 0 && !deactivationReason.trim()
                    ? 'Archive reason is required.'
                    : `${deactivationReason.trim().length}/${ARCHIVE_REASON_MAX_LENGTH} characters`
                }
                value={deactivationReason}
                onChange={(event) => setDeactivationReason(event.target.value)}
                inputProps={{ maxLength: ARCHIVE_REASON_MAX_LENGTH }}
              />
            )}
          </Stack>
        }
        action={
          <LoadingButton
            loading={isStatusLoading}
            disabled={!nextStatus && !deactivationReason.trim()}
            variant="contained"
            color={nextStatus ? 'primary' : 'warning'}
            size="small"
            onClick={async () => {
              if (!statusData) return;
              try {
                await patchChargeCategoryStatus({
                  id: statusData.id,
                  body: {
                    isActive: nextStatus,
                    reason: nextStatus ? null : deactivationReason.trim() || null,
                  },
                }).unwrap();
                shikshaMitraToast.success({
                  message: `Charge Category ${nextStatus ? 'restored' : 'archived'} successfully`,
                });
                statusConfirm.onFalse();
                setStatusData(null);
                setDeactivationReason('');
              } catch {
                // Keep dialog open on error
              }
            }}
          >
            {nextStatus ? 'Restore' : 'Archive'}
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

interface ChargeCategoryFormValues {
  chargeName: string;
  isRefundable: boolean;
  description: string;
  incomeCategoryId: string;
}

const ChargeCategoryDialog = ({ open, onClose, editData }: ChargeCategoryDialogProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [showDownstreamWarning, setShowDownstreamWarning] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<ChargeCategoryFormValues | null>(null);

  const { data: incomeCategoryData, isLoading: incomeCategoryLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomeCategoriesQuery,
    params: {
      academicYearId: currentYear?.id,
      page: 1,
      pageSize: 100,
      includeInactive: false,
    },
    options: { skip: !currentYear?.id || !open },
  });

  const incomeCategoryOptions = useMemo(
    () =>
      (incomeCategoryData?.items ?? []).map((category: any) => ({
        id: category.id,
        displayName: `${category.code ? `${category.code} — ` : ''}${category.name} → ${
          category.defaultAccountHeadName || 'No account head'
        }`,
      })),
    [incomeCategoryData]
  );

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

  const { data: chargeCategoriesData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargeCategoriesQuery,
    params: {
      academicYearId: currentYear?.id,
    },
    options: {
      skip: !currentYear?.id || !open,
    },
  });

  const existingNames = useMemo(
    () =>
      new Set<string>(
        (chargeCategoriesData?.items ?? []).map((t: any) => t.name.trim().toLowerCase())
      ),
    [chargeCategoriesData]
  );
  const existingNamesRef = useRef<Set<string>>(new Set());
  existingNamesRef.current = existingNames;

  // Form validation schema using Yup
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        chargeName: Yup.string()
          .required('Charge Category Name is required')
          .test('unique-charge-category', 'This charge category name already exists', (value) => {
            if (!value?.trim()) return true;
            const trimmed = value.trim().toLowerCase();
            // Allow saving the same name when editing the current record
            if (editData && editData.name.trim().toLowerCase() === trimmed) return true;
            return !existingNamesRef.current.has(trimmed);
          }),
        isRefundable: Yup.boolean().required(),
        description: Yup.string().optional(),
        incomeCategoryId: Yup.string().required('Income Category is required'),
      }),
    [editData]
  );

  // Initialize formik form with initial values and submit handler
  const formik = useFormik<ChargeCategoryFormValues>({
    initialValues: {
      chargeName: editData?.name || '',
      isRefundable: editData?.isApprovalRequired || false,
      description: editData?.description || '',
      incomeCategoryId: editData?.incomeCategoryId || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      // Check if updating an item that is used downstream
      if (editData?.isUsedInDownstream && editData?.id) {
        setPendingFormValues(values);
        setShowDownstreamWarning(true);
        return;
      }

      // Proceed with submission if not used downstream
      await performSubmission(values);
    },
  });

  // Perform the actual form submission
  const performSubmission = async (values: ChargeCategoryFormValues) => {
    try {
      const payload = {
        name: values.chargeName,
        isApprovalRequired: values.isRefundable,
        description: values.description || '',
        incomeCategoryId: values.incomeCategoryId,
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
  };

  // Handle dialog cancellation and form reset
  const handleClose = () => {
    formik.resetForm();
    onClose(null, false);
  };

  return (
    <Box>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <DialogScrollContent>
          <Stack spacing={2} p={0}>
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
                  const onlyLetters = e.target.value
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .replace(/^\s+/g, '')
                    .trimStart();
                  const newName = onlyLetters
                    .split(' ')
                    .map(
                      (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    )
                    .join(' ');
                  formik.setFieldValue('chargeName', newName);
                }}
                error={formik.touched.chargeName && Boolean(formik.errors.chargeName)}
                inputProps={{ maxLength: 40 }}
                helperText={
                  formik.touched.chargeName && typeof formik.errors.chargeName === 'string'
                    ? formik.errors.chargeName
                    : undefined
                }
              />
            </ShakingTextField>

            {/* Income category determines the income account used when the charge is collected. */}
            <ShakingTextField
              error={!!(formik.touched.incomeCategoryId && formik.errors.incomeCategoryId) || false}
            >
              <CustomSelect
                name="incomeCategoryId"
                label="Income Category *"
                options={incomeCategoryOptions}
                value={formik.values.incomeCategoryId || ''}
                labelKey="displayName"
                valueKey="id"
                isLoading={incomeCategoryLoading}
                disabled={Boolean(editData?.isUsedInDownstream)}
                onChange={(value) => formik.setFieldValue('incomeCategoryId', value)}
                error={formik.touched.incomeCategoryId && Boolean(formik.errors.incomeCategoryId)}
                helperText={
                  formik.touched.incomeCategoryId && formik.errors.incomeCategoryId
                    ? (formik.errors.incomeCategoryId as string)
                    : 'Its default income account will be used for collection posting.'
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

      {/* Downstream Usage Warning Dialog */}
      <DownstreamUsageWarning
        open={showDownstreamWarning}
        itemName={editData?.name || ''}
        itemType="Charge Category"
        isLoading={postLoading || putLoading}
        onConfirm={async () => {
          if (pendingFormValues) {
            await performSubmission(pendingFormValues);
            setShowDownstreamWarning(false);
            setPendingFormValues(null);
          }
        }}
        onCancel={() => {
          setShowDownstreamWarning(false);
          setPendingFormValues(null);
        }}
      />
    </Box>
  );
};
