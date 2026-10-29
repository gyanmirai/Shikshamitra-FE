'use client';

import type { IParams } from 'src/components/customizabaleTable/types';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useRef, useMemo, useState, useCallback } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';

import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetFinanceRoutingOptionsQuery } from 'src/redux/finance/financeRoutingApi';
import DownstreamUsageWarning from 'src/screens/finance/settings/components/DownstreamUsageWarning';
import {
  Box,
  Chip,
  Stack,
  Button,
  TextField,
  Typography,
  DialogActions,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  type ChargeCategoryUsage,
  useLazyGetChargeCategoryUsageQuery,
  useGetChargeCategoriesQuery,
  usePutChargeCategoryMutation,
  usePostChargeCategoryMutation,
  useDeleteChargeCategoryMutation,
  usePatchChargeCategoryStatusMutation,
} from 'src/redux/finance/chargeCategory';

const ARCHIVE_REASON_MAX_LENGTH = 500;

const FinanceChargeCategory = () => {
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
  const canReviewCharges = hasGrantedPermission(
    auth.permissions,
    financePermissions.fees.chargeActions.view
  );
  const academicYearId = currentYear?.id ?? '';

  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 10, search: '' });
  const [filters, setFilters] = useState<IParams['filters']>([]);

  const handleServerPagination = useCallback((page: number, rowsPerPage: number) => {
    setQueryParams((prev) => ({ ...prev, page, pageSize: rowsPerPage }));
  }, []);

  const handleServerSearch = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  // Get charge categories data
  const { data, isLoading, isFetching } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargeCategoriesQuery,
    params: {
      academicYearId,
      page: queryParams.page,
      pageSize: queryParams.pageSize,
      search: queryParams.search || undefined,
      filters: serializeFinanceTableFilters(filters),
    },
  });

  const [deleteChargeCategory, { isLoading: isDeleting }] = useDeleteChargeCategoryMutation();
  const [getCategoryUsage] = useLazyGetChargeCategoryUsageQuery();
  const [deletionUsage, setDeletionUsage] = useState<ChargeCategoryUsage | null>(null);
  const [isCheckingUsage, setIsCheckingUsage] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const deleteInFlight = useRef(false);
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

  const checkDeletionUsage = async (id: string) => {
    setIsCheckingUsage(true);
    setDeleteError('');
    try {
      const usage = await getCategoryUsage(id, false).unwrap();
      setDeletionUsage(usage);
    } catch (error) {
      setDeletionUsage(null);
      setDeleteError(`Unable to check charge dependencies. ${parseApiProblemDetail(error).detail}`);
    } finally {
      setIsCheckingUsage(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry?.id || !deletionUsage?.canDelete || deleteInFlight.current) return;
    deleteInFlight.current = true;
    setDeleteError('');
    try {
      await deleteChargeCategory({ chargeCategoryId: selectedEntry.id }).unwrap();
      shikshaMitraToast.success({ message: 'Charge category deleted successfully' });
      confirm.onFalse();
      setSelectedEntry(null);
      setDeletionUsage(null);
    } catch (error) {
      const problem = parseApiProblemDetail(error);
      if (problem.errorCode === 'Finance:Charge:010028') {
        await checkDeletionUsage(selectedEntry.id);
      } else {
        setDeleteError(problem.detail);
      }
    } finally {
      deleteInFlight.current = false;
    }
  };
  // Handle edit action
  const handleEdit = (item: any) => {
    setSelectedItem(item);
    editDialog.onTrue();
  };

  // Handle delete action
  const handleDeleteAction = (item: any) => {
    setSelectedEntry(item);
    setDeletionUsage(null);
    confirm.onTrue();
    void checkDeletionUsage(item.id);
  };

  // Handle add new item
  const handleAdd = () => {
    setSelectedItem(null);
    addDialog.onTrue();
  };

  /**
   * Handles closing the charge category dialog
   */
  const { handleClose: handleDialogClose, confirmation: discardConfirmation } = useFinanceFormClose(
    addDialog.value || editDialog.value,
    () => {
      addDialog.onFalse();
      editDialog.onFalse();
      setSelectedItem(null);
    }
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Name',
        filterType: 'string' as const,
        width: 200,
        minWidth: 170,
        isSort: true,
        isFilter: true,
        align: 'left',
        sticky: true,
        stickyPosition: 'left',
      },
      {
        id: 'incomeCategoryName',
        isFilter: true,
        label: 'Income Category',
        filterType: 'string' as const,
        width: 220,
        minWidth: 180,
        align: 'left',
        render: (_value: unknown, row: any) =>
          row.isAccountingReady ? row.incomeCategoryName || '-' : 'Income Category required',
      },
      {
        id: 'isApprovalRequired',
        isFilter: true,
        label: 'Approval Required',
        filterType: 'enum' as const,
        enumOptions: [
          { label: 'Yes', value: 1 },
          { label: 'No', value: 0 },
        ],
        width: 170,
        minWidth: 160,
        align: 'left',
        render: (_value, row) => (row.isApprovalRequired === false ? 'No' : 'Yes'),
      },
      {
        id: 'description',
        label: 'Description',
        filterType: 'string' as const,
        width: 260,
        minWidth: 180,
        isSort: true,
        isFilter: true,
        align: 'left',
        render: (value) => (
          <CustomTooltip title={typeof value === 'string' ? value : ''}>
            <Typography variant="body2" noWrap tabIndex={0} sx={{ maxWidth: 260 }}>
              {value || '-'}
            </Typography>
          </CustomTooltip>
        ),
      },
      {
        id: 'isActive',
        isFilter: true,
        label: 'Status',
        filterType: 'enum' as const,
        enumOptions: [
          { label: 'Active', value: 1 },
          { label: 'Archived', value: 0 },
        ],
        width: 110,
        minWidth: 100,
        align: 'left',
        sticky: true,
        stickyPosition: 'right',
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
        width: 120,
        minWidth: 120,
        isSort: false,
        isFilter: false,
        align: 'left',
        sticky: true,
        stickyPosition: 'right',
        excludeFromExport: true,
        render(value, row: any) {
          return (
            <AdaptiveThreeDotsActions
              directActionLimit={3}
              placement="right-top"
              actions={[
                ...(canEdit && row.isActive
                  ? [
                      {
                        id: 'edit',
                        label: 'Edit',
                        icon: 'solar:pen-bold',
                        onClick: () => handleEdit(row),
                      },
                    ]
                  : []),
                ...(canDelete && row.isActive
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
                        label: !row.isActive ? 'Restore' : 'Archive',
                        icon: !row.isActive
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
    [canChangeStatus, canDelete, canEdit, isStatusLoading]
  );

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, minWidth: 0 }}
    >
      {discardConfirmation}
      <CustomBreadcrumbs
        description="This screen displays all created charge Category, helping the school manage additional fees or penalties that can be applied to students"
        heading="Charge Category"

        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/charge-management' },
          { name: 'Settings' },
          { name: 'Charge Category' },
        ]}
        action={
          canAdd ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              onClick={handleAdd}
              color="inherit"
            >
              Add Charge Category
            </Button>
          ) : undefined
        }
      />

      <CustomizableTable
        tableId="charge-category-table"
        tableTitle="Charge Categories"
        wrapperProps={{ sx: { flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' } }}
        tableContainerProps={{ sx: { height: 1 } }}
        noDataText="No charge categories found."
        isLoading={isLoading || isFetching}
        columns={columns}
        data={data?.items || []}
        serverSideFilter
        filters={filters}
        onServerFilter={(next) => {
          setFilters(next);
          setQueryParams((current) => ({ ...current, page: 1 }));
        }}
        serverSidePagination
        serverSideSearch
        totalCount={data?.totalCount}
        page={queryParams.page - 1}
        rowsPerPage={queryParams.pageSize}
        searchTerm={queryParams.search}
        onServerPagination={handleServerPagination}
        onServerSearch={handleServerSearch}
      />

      {/* Add/Edit Dialog */}
      <CustomDialog
        open={addDialog.value || editDialog.value}
        guardUnsavedChanges={false}
        handleClose={() => handleDialogClose()}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h6">
              {selectedItem ? 'Update Charge Category' : 'Add Charge Category'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Set the category name, income category, and whether new charges require approval."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        {(addDialog.value || editDialog.value) && (
          <ChargeCategoryDialog
            open={addDialog.value || editDialog.value}
            onClose={handleDialogClose}
            editData={selectedItem}
          />
        )}
      </CustomDialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          if (isCheckingUsage || isDeleting) return;
          confirm.onFalse();
          setSelectedEntry(null);
          setDeletionUsage(null);
          setDeleteError('');
        }}
        disableCancel={isCheckingUsage || isDeleting}
        title={
          deletionUsage && !deletionUsage.canDelete
            ? 'Charge Category In Use'
            : 'Delete Charge Category?'
        }
        icon={deletionUsage && !deletionUsage.canDelete ? 'warning' : 'error'}
        content={
          <Stack spacing={1.5}>
            {isCheckingUsage ? (
              <Typography variant="body2" role="status">
                Checking charge dependencies…
              </Typography>
            ) : deletionUsage && !deletionUsage.canDelete ? (
              <>
                <Typography variant="body2">
                  <b>{deletionUsage.categoryName}</b> cannot be deleted because it is currently used
                  by{' '}
                  <b>
                    {deletionUsage.chargeCount}{' '}
                    {deletionUsage.chargeCount === 1 ? 'charge' : 'charges'}
                  </b>
                  {deletionUsage.studentAssignmentCount > 0 &&
                    ` (${deletionUsage.studentAssignmentCount} student assignments)`}
                  .
                </Typography>
                {deletionUsage.chargeNames.length > 0 && (
                  <Box component="ul" sx={{ my: 0, pl: 2.5 }}>
                    {deletionUsage.chargeNames.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </Box>
                )}
                <Typography variant="body2">
                  Review the related charges. Archive this category to stop new use while preserving
                  existing student records.
                  {deletionUsage.chargeNames.length === 0 &&
                    ' Charge details may require additional access.'}
                </Typography>
              </>
            ) : deletionUsage ? (
              <Typography variant="body2">
                Delete charge category <b>{deletionUsage.categoryName}</b>? This action cannot be
                undone.
              </Typography>
            ) : null}
            {deleteError && (
              <Typography variant="body2" color="error" role="alert">
                {deleteError}
              </Typography>
            )}
          </Stack>
        }
        action={
          deletionUsage && !deletionUsage.canDelete ? (
            canReviewCharges ? (
              <Button
                href={financePaths.fees.charges}
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon={GlobalIcons.eye} />}
              >
                Review charges
              </Button>
            ) : null
          ) : deleteError && !deletionUsage ? (
            <Button
              variant="contained"
              startIcon={<Iconify icon="mdi:refresh" />}
              onClick={() => selectedEntry?.id && void checkDeletionUsage(selectedEntry.id)}
            >
              Retry
            </Button>
          ) : (
            <LoadingButton
              type="button"
              startIcon={<Iconify icon={GlobalIcons.delete} />}
              variant="contained"
              color="error"
              size="small"
              disabled={isCheckingUsage || !deletionUsage?.canDelete}
              loading={isDeleting}
              onClick={handleDelete}
            >
              Delete
            </LoadingButton>
          )
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
                  (deactivationReason.length > 0 && !deactivationReason.trim()
                    ? 'Archive reason is required.'
                    : undefined) || undefined
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
            startIcon={<Iconify icon={nextStatus ? 'mdi:restore' : 'mdi:archive-outline'} />}
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
  description: string;
  incomeCategoryId: string;
  isApprovalRequired: boolean;
}

export const ChargeCategoryDialog = ({ open, onClose, editData }: ChargeCategoryDialogProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [showDownstreamWarning, setShowDownstreamWarning] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<ChargeCategoryFormValues | null>(null);

  const { data: incomeCategoryData, isLoading: incomeCategoryLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFinanceRoutingOptionsQuery,
    params: {
      academicYearId: currentYear?.id,
      page: 1,
      pageSize: 100,
      operation: 'charge-category',
    },
    options: { skip: !currentYear?.id || !open },
  });

  const incomeCategoryOptions = useMemo(
    () =>
      (incomeCategoryData?.items ?? []).map((category: any) => ({
        id: category.id,
        displayName: category.name,
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
        description: Yup.string().optional(),
        incomeCategoryId: Yup.string().required('Income Category is required'),
      }),
    [editData]
  );

  // Initialize formik form with initial values and submit handler
  const formik = useFormik<ChargeCategoryFormValues>({
    initialValues: {
      chargeName: editData?.name || '',
      description: editData?.description || '',
      incomeCategoryId: editData?.incomeCategoryId || '',
      isApprovalRequired: editData?.isApprovalRequired ?? true,
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
        isApprovalRequired: values.isApprovalRequired,
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
                  (formik.touched.chargeName && typeof formik.errors.chargeName === 'string'
                    ? formik.errors.chargeName
                    : undefined) || undefined
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
                  (formik.touched.incomeCategoryId && formik.errors.incomeCategoryId
                    ? (formik.errors.incomeCategoryId as string)
                    : undefined) || undefined
                }
              />
            </ShakingTextField>

            <Box>
              <FormControlLabel
                sx={{ m: 0 }}
                label="Approval Required"
                control={
                  <Switch
                    name="isApprovalRequired"
                    checked={formik.values.isApprovalRequired}
                    onChange={(_, checked) => formik.setFieldValue('isApprovalRequired', checked)}
                  />
                }
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
