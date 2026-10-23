'use client';

import type { IParams } from 'src/components/customizabaleTable/types';

import type { RootState } from 'src/redux/store';

import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { useState, useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Card, Stack, Button, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  concessionTypeApi,
  useGetConcessionTypesQuery,
  useDeleteConcessionTypeMutation,
} from 'src/redux/finance/concessionType';

import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';

import ConcessionTypeTable from './Components/ConcessionTable';
import ConcessionTypeForm from './Components/ConcessionTypeForm';
import ConcessionDocumentTable from './Components/ConcessionDocuments';
import ConcessionTypeVersionHistoryDrawer from './Components/ConcessionTypeVersionHistoryDrawer';

import type { IConcessionTypeForm } from './type';

const ConcessionType = () => {
  const [archiveView, setArchiveView] = useState<'current' | 'archived'>('current');
  // State to track the currently selected concession type
  const [selectedConcessionType, setSelectedConcessionType] = useState<IConcessionTypeForm | null>(
    null
  );
  // Custom hook to manage dialog open/close state
  const addConcessionTypeDialog = useBoolean();
  const deleteConcessionTypeDialog = useBoolean();
  const viewConcessionTypeDialog = useBoolean();
  const [versionHistoryTarget, setVersionHistoryTarget] = useState<IConcessionTypeForm | null>(
    null
  );

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const actionPermissions = financePermissions.fees.settings.concessionTypeActions;
  const canView = hasGrantedPermission(permissions, actionPermissions.view);
  const canAdd = hasGrantedPermission(permissions, actionPermissions.add);
  const canEdit = hasGrantedPermission(permissions, actionPermissions.edit);
  const canChangeStatus = hasGrantedPermission(permissions, actionPermissions.changeStatus);
  const canDelete = hasGrantedPermission(permissions, actionPermissions.delete);
  const academicYearId = currentYear?.id ?? '';

  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 10, search: '' });
  const [filters, setFilters] = useState<IParams['filters']>([]);

  const handleServerPagination = useCallback((page: number, rowsPerPage: number) => {
    setQueryParams((prev) => ({ ...prev, page, pageSize: rowsPerPage }));
  }, []);

  const handleServerSearch = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const apiParams = {
    academicYearId,
    skipCount: (queryParams.page - 1) * queryParams.pageSize,
    maxResultCount: queryParams.pageSize,
    searchTerm: queryParams.search || undefined,
    filters: serializeFinanceTableFilters(filters),
    includeInactive: archiveView === 'archived',
    isActive: archiveView === 'current',
  };
  const { data: archivedSummary } = useGetConcessionTypesQuery(
    {
      academicYearId,
      skipCount: 0,
      maxResultCount: 1,
      includeInactive: true,
      isActive: false,
    },
    { skip: !academicYearId }
  );

  // Fetch concession type data
  const {
    data: concessionTypes,
    isLoading,
    isFetching,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypesQuery,
    params: apiParams,
    options: { skip: !academicYearId },
  });

  // Redux state and dispatch
  const dispatch = useDispatch();

  // Delete mutation
  const [deleteConcessionType, { isLoading: isLoadingDelete }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteConcessionTypeMutation,
  });

  const { confirmWithUndo } = useConfirmWithUndo();

  /**
   * Handles closing the concession type dialog
   */
  const { handleClose, confirmation } = useFinanceFormClose(addConcessionTypeDialog.value, () => {
    addConcessionTypeDialog.onFalse();
    setSelectedConcessionType(null);
  });

  return (
    <Box
      sx={{ height: '100%', minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}
    >
      {confirmation}
      <CustomBreadcrumbs
        description={
          addConcessionTypeDialog.value
            ? 'Access detailed information on the selected concession type such as discount rules and applicable conditions.'
            : 'Define and manage concession types by linking them with student categories and fee structures.'
        }
        heading="Concession Type"

        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/concession' },
          { name: 'Settings' },
          { name: 'Concession Type' },
        ]}
        action={
          canAdd && archiveView === 'current' ? (
            <Button
              onClick={() => {
                setSelectedConcessionType(null);
                dispatch(setIsChanges(false));
                addConcessionTypeDialog.onTrue();
              }}
              size="small"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              variant="contained"
              color="inherit"
            >
              Concession Type
            </Button>
          ) : undefined
        }
      />
      <Card sx={{ p: 1, mb: 1, flexShrink: 0 }}>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant={archiveView === 'current' ? 'contained' : 'outlined'}
            onClick={() => {
              setQueryParams((current) => ({ ...current, page: 1 }));
              setFilters((current) => current.filter((filter) => filter.column !== 'isActive'));
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
              setFilters((current) => current.filter((filter) => filter.column !== 'isActive'));
              setArchiveView('archived');
            }}
          >
            Archived ({archivedSummary?.data?.totalCount ?? 0})
          </Button>
        </Stack>
      </Card>
      <>
        {/* Form card for creating/editing concession types */}

        <CustomDialog
          open={addConcessionTypeDialog.value}
          guardUnsavedChanges={false}
          handleClose={() => handleClose()}
          maxWidth="lg"
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">
                {selectedConcessionType ? 'Update Concession Type' : 'Add Concession Type'}
              </Typography>
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title={
                  selectedConcessionType
                    ? 'Update existing concession details including percentage, amount and applicable fee heads'
                    : 'Define a new fee concession and specify how it applies to selected fee heads'
                }
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
        >
          {addConcessionTypeDialog.value && (
            <ConcessionTypeForm
              open={addConcessionTypeDialog}
              onClose={handleClose}
              editData={selectedConcessionType}
            />
          )}
        </CustomDialog>

        <ConcessionTypeTable
          filters={filters}
          onServerFilter={(next) => {
            setFilters(next);
            setQueryParams((current) => ({ ...current, page: 1 }));
          }}
          archived={archiveView === 'archived'}
          canView={canView}
          canAdd={canAdd}
          canEdit={canEdit}
          canChangeStatus={canChangeStatus}
          canDelete={canDelete}
          data={concessionTypes?.data?.items ?? []}
          isLoading={Boolean(currentYear?.id) && (isLoading || isFetching)}
          addConcessionType={addConcessionTypeDialog}
          setEditData={setSelectedConcessionType}
          onEdit={(data) => {
            addConcessionTypeDialog.onTrue();
            setSelectedConcessionType(data);
          }}
          onDelete={(data) => {
            deleteConcessionTypeDialog.onTrue();
            setSelectedConcessionType(data);
          }}
          onView={(data) => {
            viewConcessionTypeDialog.onTrue();
            setSelectedConcessionType(data);
          }}
          onVersionHistory={setVersionHistoryTarget}
          totalCount={concessionTypes?.data?.totalCount}
          page={queryParams.page - 1}
          rowsPerPage={queryParams.pageSize}
          searchTerm={queryParams.search}
          onServerPagination={handleServerPagination}
          onServerSearch={handleServerSearch}
        />

        <ConfirmDialog
          open={deleteConcessionTypeDialog.value}
          icon="error"
          onClose={() => {
            deleteConcessionTypeDialog.onFalse();
            setTimeout(() => {
              setSelectedConcessionType(null);
            }, 200);
          }}
          title="Delete"
          content={
            <>
              Are you sure you want to delete concession type{' '}
              <strong>
                {selectedConcessionType?.name || (selectedConcessionType as any)?.concessionName}
              </strong>
              ?
            </>
          }
          action={
            <LoadingButton
              startIcon={<Iconify icon="mdi:delete-outline" />}
              variant="contained"
              color="error"
              size="small"
              loading={isLoadingDelete}
              onClick={() => {
                confirmWithUndo({
                  item: selectedConcessionType,
                  onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                    dispatchFn(
                      concessionTypeApi.util.updateQueryData(
                        'getConcessionTypes',
                        apiParams,
                        (draft: any) => {
                          const index = draft.data?.items?.findIndex(
                            (b: any) => b.id === (selectedConcessionType as any)?.id
                          );
                          setDeleteIndex(index);
                          if (index !== -1) {
                            draft.data.items.splice(index, 1);
                          }
                        }
                      )
                    ),
                  onUndoRestore: () => refetch(),
                  onCommit: () =>
                    deleteConcessionType({
                      concessionTypeId: selectedConcessionType?.id,
                    }),
                });
                deleteConcessionTypeDialog.onFalse();
                setSelectedConcessionType(null);
              }}
            >
              Yes
            </LoadingButton>
          }
        />

        <CustomDialog
          open={viewConcessionTypeDialog.value}
          handleClose={() => {
            viewConcessionTypeDialog.onFalse();
            setSelectedConcessionType(null);
          }}
          maxWidth="md"
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">View Concession Type Details</Typography>
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title="View detailed information about this concession type including applicable rules and conditions"
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
        >
          <ConcessionDocumentTable data={selectedConcessionType} />
        </CustomDialog>

        <ConcessionTypeVersionHistoryDrawer
          open={Boolean(versionHistoryTarget)}
          concessionTypeId={versionHistoryTarget?.id ?? null}
          concessionTypeName={versionHistoryTarget?.name}
          onBackToDetails={() => {
            setSelectedConcessionType(versionHistoryTarget);
            setVersionHistoryTarget(null);
            viewConcessionTypeDialog.onTrue();
          }}
          onClose={() => setVersionHistoryTarget(null)}
        />
      </>
    </Box>
  );
};

export default ConcessionType;
