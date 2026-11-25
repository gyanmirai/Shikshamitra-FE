'use client';

import type { RootState } from 'src/redux/store';
import type { IParams } from 'src/components/customizabaleTable/types';

import { GlobalIcons } from 'src/utils/icons';
import { useState, useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { FinanceSettingDeleteDialog } from 'src/screens/finance/settings/components/FinanceSettingDeleteDialog';
import { financePermissions } from 'src/constants/finance-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';
import { FinanceSetupManagerHeader } from 'src/screens/finance/setup/embedding/FinanceSetupManagerHeader';
import {
  useGetConcessionTypesQuery,
  useDeleteConcessionTypeMutation,
} from 'src/redux/finance/concessionType';

import ConcessionTypeTable, { canDeleteConcessionType } from './Components/ConcessionTable';
import ConcessionTypeDrawer from './Components/ConcessionTypeDrawer';
import ConcessionDocumentTable from './Components/ConcessionDocuments';
import ConcessionTypeVersionHistoryDrawer from './Components/ConcessionTypeVersionHistoryDrawer';

import type { IConcessionTypeForm } from './type';

const ConcessionType = () => {
  // State to track the currently selected concession type
  const [selectedConcessionType, setSelectedConcessionType] = useState<IConcessionTypeForm | null>(
    null
  );
  // Custom hook to manage dialog open/close state
  const addConcessionTypeDialog = useBoolean();
  const [isFormBusy, setIsFormBusy] = useState(false);
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
    includeInactive: true,
  };

  // Fetch concession type data
  const {
    data: concessionTypes,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypesQuery,
    params: apiParams,
    options: { skip: !academicYearId },
  });

  // Redux state and dispatch
  const dispatch = useDispatch();

  // Delete mutation
  const [deleteConcessionType, { isLoading: isLoadingDelete }] = useDeleteConcessionTypeMutation();


  /**
   * Handles closing the concession type dialog
   */
  const { handleClose, confirmation } = useFinanceFormClose(
    addConcessionTypeDialog.value,
    () => {
      addConcessionTypeDialog.onFalse();
      setSelectedConcessionType(null);
      setIsFormBusy(false);
    },
    isFormBusy
  );

  return (
    <Box
      sx={{ height: '100%', minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}
    >
      {confirmation}
      <FinanceSetupManagerHeader
        editorOpen={addConcessionTypeDialog.value || deleteConcessionTypeDialog.value || isFormBusy || isLoadingDelete}
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
          canAdd ? (
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
      <>
        <ConcessionTypeDrawer
          open={addConcessionTypeDialog}
          onClose={handleClose}
          editData={selectedConcessionType}
          onBusyChange={setIsFormBusy}
        />

        <ConcessionTypeTable
          filters={filters}
          onServerFilter={(next) => {
            setFilters(next);
            setQueryParams((current) => ({ ...current, page: 1 }));
          }}
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
            if (!canDelete || !data.id || !canDeleteConcessionType(data)) return;
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

        <FinanceSettingDeleteDialog
          open={deleteConcessionTypeDialog.value}
          title="Delete Concession Type"
          onClose={() => {
            deleteConcessionTypeDialog.onFalse();
            setSelectedConcessionType(null);
          }}
          onDelete={
            canDelete && selectedConcessionType?.id && canDeleteConcessionType(selectedConcessionType)
              ? () => deleteConcessionType({ concessionTypeId: selectedConcessionType.id }).unwrap()
              : undefined
          }
          successMessage="Concession type deleted successfully."
        >
          Delete concession type <strong>{selectedConcessionType?.name}</strong>?
        </FinanceSettingDeleteDialog>

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
