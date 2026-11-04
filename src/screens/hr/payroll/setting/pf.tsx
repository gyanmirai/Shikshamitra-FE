'use client';

import type { RootState } from 'src/redux/store';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions/types';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Stack, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import CustomizableTable from 'src/components/customizabaleTable';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { pfApi, useGetPFQuery, useDeletePFMutation } from 'src/redux/PF/PFApi';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { PFForm } from './pf-rule-form';
import { PfCoverageSettings } from './pf-coverage-settings';

export { PFForm } from './pf-rule-form';

interface IPF {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  tenantId: string;
  code: string;
  name: string;
  employeePercentage: number;
  employerPercentage: number;
  contributionBasis: number;
  wageCeiling?: number | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  version: number;
}
const PF = () => {
  const discard = useBoolean();
  const [tableQuery, setTableQuery] = useState({ page: 1, pageSize: 20, search: '' });
  const exportTable = useHrTableExport('hr-pf-rules', tableQuery);
  const dialog = useBoolean();
  const confirm = useBoolean();
  const [editData, setEditData] = useState<null | IPF>(null);
  const [formBusy, setFormBusy] = useState(false);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManage = hasGrantedPermission(
    permissions,
    `${hrPermissions.payroll.settings.pfRule}.Add`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${hrPermissions.payroll.settings.pfRule}.Delete`
  );
  // const [employee, setEmployee] = useState<string[] | undefined>([]);
  // Redux state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const {
    data: PFData,
    isLoading,
    refetch,
    error: tableError,
    isFetching: tableFetching,
    tableProps: operationalTableProps,
  } = useHrTableQuery(
    {
      table: 'hr-pf-rules',
      query: tableQuery,
      page: tableQuery.page - 1,
      size: tableQuery.pageSize,
      resetPage: () => setTableQuery((current) => ({ ...current, page: 1 })),
    },
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetPFQuery,
      params: { academicYearId: currentYear?.id, ...tableQuery },
    })
  );
  const [deletePF, { isLoading: isPFDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeletePFMutation,
  });
  const dispatch = useDispatch();

  const closeForm = () => {
    dispatch(setIsChanges(false));
    dialog.onFalse();
    setEditData(null);
  };
  const handleClose = (_event?: unknown, isSubmit?: boolean) => {
    if (formBusy && !isSubmit) return;
    if (isSubmit || !isChanges) closeForm();
    else discard.onTrue();
  };

  const { confirmWithUndo } = useConfirmWithUndo();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <CustomBreadcrumbs
        heading="PF Rule"
        description="Manage contribution rates, wage limits, and effective dates for staff provident fund rules."
        links={[
          {
            name: 'Payroll Management',
            href: hrPaths.payroll.root,
          },
          { name: 'PF Rule' },
        ]}
        action={
          canManage ? (
            <Button
              size="small"
              aria-label="Add PF rule"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              variant="contained"
              onClick={() => {
                setEditData(null);
                dialog.onTrue();
              }}
            >
              PF Rule
            </Button>
          ) : undefined
        }
      />
      <PfCoverageSettings />
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        title="Discard Changes?"
        icon="warning"
        content="Your unsaved PF rule changes will be lost."
        cancelText="Keep editing"
        action={
          <Button
            size="small"
            variant="contained"
            color="warning"
            onClick={() => {
              discard.onFalse();
              closeForm();
            }}
          >
            Discard changes
          </Button>
        }
      />
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete PF Rule"
        content={
          <>
            Are you sure you want to delete <b>{editData?.name}</b> PF Rule?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isPFDeleteLoading}
            color="error"
            size="small"
            onClick={async () => {
              confirmWithUndo({
                item: editData,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    pfApi.util.updateQueryData(
                      'getPF',
                      { academicYearId: currentYear?.id },
                      (draft: any) => {
                        const index = draft.items?.findIndex((b: any) => b.id === editData?.id);
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.items.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) => refetch(),
                onCommit: () => deletePF(editData?.id || ''),
              });
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Delete
          </LoadingButton>
        }
      />

      <CustomizableTable
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        noDataText={
          <Stack spacing={1} alignItems="center">
            <span>No PF rules found.</span>
            {canManage && (
              <Button
                size="small"
                onClick={() => {
                  setEditData(null);
                  dialog.onTrue();
                }}
                startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              >
                Add PF rule
              </Button>
            )}
          </Stack>
        }
        wrapperProps={{ sx: { flex: 1, minHeight: 0, overflow: 'hidden' } }}
        tableContainerProps={{ sx: { height: 1 } }}
        tableId="pf-table"
        tableTitle="Provident fund rules"
        onExport={exportTable}
        error={tableError}
        onRetry={refetch}
        serverSidePagination
        serverSideSearch
        page={tableQuery.page - 1}
        rowsPerPage={tableQuery.pageSize}
        totalCount={PFData?.totalCount || 0}
        onServerPagination={(page, pageSize) =>
          setTableQuery((current) => ({ ...current, page, pageSize }))
        }
        onServerSearch={(value) =>
          setTableQuery((current) => ({ ...current, page: 1, search: value }))
        }
        isLoading={isLoading || (tableFetching && !PFData)}
        isRefreshing={tableFetching && Boolean(PFData)}
        columns={[
          { id: 'name', label: 'Name', sticky: true, minWidth: '140px', align: 'left' },
          { id: 'code', label: 'Code' },
          {
            id: 'employeePercentage',
            label: 'Staff percentage',
            filterType: 'number',
            align: 'right',
            render: (value) => `${value}%`,
            exportValue: (value) => Number(value),
          },
          {
            id: 'employerPercentage',
            label: 'Employer percentage',
            filterType: 'number',
            align: 'right',
            render: (value) => `${value}%`,
            exportValue: (value) => Number(value),
          },
          {
            id: 'contributionBasis',
            filterType: 'enum',
            enumOptions: [
              { label: 'Basic', value: 0 },
              { label: 'Basic + DA', value: 1 },
            ],
            label: 'Contribution basis',
            render(value) {
              return value === 1 ? 'Basic + DA' : 'Basic';
            },
          },
          {
            id: 'wageCeiling',
            label: 'Wage ceiling',
            align: 'right',
            render(value) {
              const numericValue = Number(value);
              return value == null || value === '' || !Number.isFinite(numericValue)
                ? 'No ceiling'
                : formatNumber(numericValue, 'INR', { fractionDigits: numericValue % 1 ? 2 : 0 });
            },
          },
          {
            id: 'effectiveFrom',
            label: 'Effective from',
            render(value) {
              return value ? fDate(value) : '-';
            },
          },
          {
            id: 'isActive',
            filterType: 'enum',
            enumOptions: [
              { label: 'Active', value: true },
              { label: 'Inactive', value: false },
            ],
            label: 'Status',
            render(value) {
              return (
                <Label color={value ? 'success' : 'default'}>{value ? 'Active' : 'Inactive'}</Label>
              );
            },
          },
          {
            id: 'action',
            label: 'Actions',
            excludeFromExport: true,
            isSort: false,
            isFilter: false,
            sticky: true,
            stickyPosition: 'right' as const,
            minWidth: '80px',
            render(value, row) {
              const actions: AdaptiveThreeDotsAction[] = [];
              if (canManage)
                actions.push({
                  id: 'edit',
                  label: `Edit ${row.name}`,
                  icon: GlobalIcons.edit,
                  onClick: () => {
                    setEditData(row as IPF);
                    dialog.onTrue();
                  },
                });
              if (canDelete)
                actions.push({
                  id: 'delete',
                  label: `Delete ${row.name}`,
                  icon: GlobalIcons.delete,
                  color: 'error.main',
                  onClick: () => {
                    setEditData(row as IPF);
                    confirm.onTrue();
                  },
                });
              return (
                <AdaptiveThreeDotsActions
                  actions={actions}
                  directActionLimit={2}
                  collapseOnOverflow={false}
                  moreLabel={`More actions for ${row.name}`}
                  sx={{ justifyContent: 'flex-end' }}
                />
              );
            },
          },
        ]}
        data={PFData?.items || []}
        {...operationalTableProps}
      />

      <CustomDialog
        open={dialog.value}
        handleClose={(e) => handleClose(e, false)}
        title={editData ? 'Edit PF Rule' : 'Create PF Rule'}
        titleInfo="Set employee and employer contributions, the wage basis, and the period when this rule applies. School PF coverage is configured separately."
        maxWidth="sm"
        hasForm={false}
        guardUnsavedChanges={false}
        disableClose={formBusy}
      >
        {dialog.value && (
          <PFForm
            key={editData?.id || 'new'}
            editData={editData}
            handleClose={handleClose}
            onBusyChange={setFormBusy}
          />
        )}
      </CustomDialog>
    </Box>
  );
};

export default PF;
