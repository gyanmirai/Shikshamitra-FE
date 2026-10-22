import type { LabelColor } from 'src/components/label';

import React, { useMemo } from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatNumber } from 'src/utils/formate_number';
import { BudgetStatusType } from 'src/enums/budget-status';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Tab, Tabs, Button, Typography } from '@mui/material';

interface IBudgetTableProps {
  data: any[];
  setOpenDialog?: (value: boolean) => void;
  setEditData?: (value: any) => void;
  onDelete?: (id: string) => void;
  onViewDetail?: (data: any) => void;
  onReview?: (data: any) => void;
}

const BudgetTable: React.FC<IBudgetTableProps> = ({
  data,
  setOpenDialog,
  setEditData,
  onDelete,
  onViewDetail,
  onReview,
}) => {
  const archiveDialog = useBoolean();
  const [selectedBudget, setSelectedBudget] = React.useState<string | null>(null);

  // Tabs setup
  const tabs = useTabs(0);

  const budgetCounts = useMemo(
    () => ({
      pending: data?.filter((i) => i.status === BudgetStatusType.Pending)?.length || 0,
      active: data?.filter((i) => i.status === BudgetStatusType.Active)?.length || 0,
      Inactive: data?.filter((i) => i.status === BudgetStatusType.Inactive)?.length || 0,
      archieve: data?.filter((i) => i.status === BudgetStatusType.Archive)?.length || 0,
    }),
    [data]
  );

  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: BudgetStatusType.Pending,
        count: budgetCounts.pending,
        color: 'warning',
      },
      {
        label: 'Active',
        value: BudgetStatusType.Active,
        count: budgetCounts.active,
        color: 'success',
      },
      {
        label: 'Inactive',
        value: BudgetStatusType.Inactive,
        count: budgetCounts.Inactive,
        color: 'error',
      },
      {
        label: 'Archive',
        value: BudgetStatusType.Archive,
        count: budgetCounts.archieve,
        color: 'default',
      },
    ],
    [budgetCounts]
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
  };

  const tableData = useMemo(() => {
    if (tabs.value === 'All') return data;
    return data?.filter((i) => i.status === tabs.value);
  }, [data, tabs.value]);

  return (
    <>
      <Box display="flex" justifyContent="flex-start" sx={{ mt: '4px', mb: 2 }}>
        <Tabs
          value={tabs.value}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-flexContainer': { gap: 2 },
            flexGrow: 1,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              key={tab.value}
              label={
                <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                  {tab.label}{' '}
                  <Label variant="soft" color={(tab?.color as LabelColor) || 'default'}>
                    {tab.count}
                  </Label>
                </Box>
              }
              value={tab.value}
            />
          ))}
        </Tabs>
      </Box>

      {/* Table */}
      {tabs.value === 0 ? (
        <CustomizableTable
          tableId="budget-table-pending"
          noDataText="Pending Budgets Not Found"
          columns={[
            {
              stickyPosition: 'left',
              id: 'budgetTitle',
              label: 'Budget Title',
              align: 'left',
              minWidth: '150px',
              sticky: true,
            },
            { id: 'budgetCategory', label: 'Type', align: 'left' },
            {
              id: 'startDate',
              label: 'Start Date',
              align: 'left',
              filterType: 'date',
              minWidth: '120px',
            },
            {
              id: 'endDate',
              label: 'End Date',
              align: 'left',
              filterType: 'date',
              minWidth: '120px',
            },
            {
              id: 'totalBudgetAmount',
              label: 'Total Budget Amount',
              align: 'left',
              filterType: 'number',
              minWidth: '200px',
              render(value) {
                return (
                  <Typography variant="caption" fontSize="13px">
                    {formatNumber(value, 'INR')}
                  </Typography>
                );
              },
            },
            { id: 'allocated', label: 'Allocated', align: 'left', filterType: 'number' },
            // { id: 'unallocated', label: 'Unallocated', align: 'left', filterType: 'number' },
            // {
            //   id: 'action',
            //   label: 'Actions',
            //   align: 'left',
            //   isFilter: false,
            //   isSort: false,
            //   sticky: true,
            //   render(value, row) {
            //     return (
            //       <ThreeDotsActions
            //         showViewIcon
            //         showEditIcon
            //         showDeleteIcon
            //         handleViewClick={() => {
            //           onViewDetail?.(row);
            //         }}
            //         handleEditClick={() => {
            //           setOpenDialog?.(true);
            //           setEditData?.(row);
            //         }}
            //         handleDeleteClick={() => {
            //           onDelete?.(row.id);
            //         }}
            //         actions={(prop) => getActionsForStatus('pending', row, prop.popover)}
            //         placement="right-top"
            //       />
            //     );
            //   },
            // },
          ]}
          data={tableData || []}
        />
      ) : tabs.value === 1 ? (
        <CustomizableTable
          tableId="budget-table-active"
          noDataText="Active Budgets Not Found"
          columns={[
            { id: 'budgetTitle', label: 'Budget Title', align: 'left', minWidth: '150px' },
            { id: 'budgetCategory', label: 'Type', align: 'left' },
            {
              id: 'startDate',
              label: 'Start Date',
              align: 'left',
              filterType: 'date',
              minWidth: '120px',
            },
            {
              id: 'endDate',
              label: 'End Date',
              align: 'left',
              filterType: 'date',
              minWidth: '120px',
            },
            {
              id: 'totalBudgetAmount',
              label: 'Total Budget Amount',
              align: 'left',
              filterType: 'number',
              minWidth: '200px',
              render(value) {
                return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
              },
            },
            { id: 'allocated', label: 'Allocated', align: 'left', filterType: 'number' },
            { id: 'unallocated', label: 'Unallocated', align: 'left', filterType: 'number' },
            {
              stickyPosition: 'right',
              excludeFromExport: true,
              id: 'action',
              label: 'Actions',
              isFilter: false,
              isSort: false,
              align: 'left',
              sticky: true,
              render(value, row) {
                return (
                  <AdaptiveThreeDotsActions directActionLimit={2}
                    placement="right-top"
                    actions={[
                      {
                        id: 'view',
                        label: 'View',
                        icon: 'carbon:view-filled',
                        onClick: () => onViewDetail?.(row),
                      },
                      {
                        id: 'delete',
                        label: 'Delete',
                        icon: 'solar:trash-bin-trash-bold',
                        color: 'error.main',
                        onClick: () => onDelete?.(row.id),
                      },
                      {
                        id: 'inactive',
                        label: 'Inactive',
                        icon: GlobalIcons.cancel,
                        onClick: () => { },
                      },
                    ]}
                  />
                );
              },
            },
          ]}
          data={tableData || []}
        />
      ) : tabs.value === 2 ? (
        <CustomizableTable
          tableId="budget-table-inactive"
          noDataText="Inactive Budgets Not Found"
          columns={[
            { id: 'budgetTitle', label: 'Budget Title', align: 'left', minWidth: '150px' },
            { id: 'budgetCategory', label: 'Type', align: 'left' },
            {
              id: 'startDate',
              label: 'Start Date',
              align: 'left',
              filterType: 'date',
              minWidth: '120px',
            },
            {
              id: 'endDate',
              label: 'End Date',
              align: 'left',
              filterType: 'date',
              minWidth: '120px',
            },
            {
              id: 'totalBudgetAmount',
              label: 'Total Budget Amount',
              align: 'left',
              filterType: 'number',
              minWidth: '200px',
              render(value) {
                return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
              },
            },
            { id: 'allocated', label: 'Allocated', align: 'left', filterType: 'number' },
            { id: 'unallocated', label: 'Unallocated', align: 'left', filterType: 'number' },
            {
              stickyPosition: 'right',
              excludeFromExport: true,
              id: 'action',
              label: 'Actions',
              isFilter: false,
              isSort: false,
              align: 'left',
              sticky: true,
              render(value, row) {
                return (
                  <AdaptiveThreeDotsActions directActionLimit={2}
                    actions={[
                      {
                        id: 'view',
                        label: 'View',
                        icon: 'carbon:view-filled',
                        onClick: () => {
                          onViewDetail?.(row);
                        },
                      },
                      {
                        id: 'delete',
                        label: 'Delete',
                        icon: 'solar:trash-bin-trash-bold',
                        onClick: () => {
                          onDelete?.(row.id);
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
          data={tableData || []}
        />
      ) : (
        <CustomizableTable
          tableId="budget-table-archive"
          noDataText="Archived Budgets Not Found"
          columns={[
            { id: 'budgetTitle', label: 'Budget Title', align: 'left', minWidth: '150px' },
            { id: 'budgetCategory', label: 'Type', align: 'left' },
            {
              id: 'startDate',
              label: 'Start Date',
              align: 'left',
              filterType: 'date',
              minWidth: '120px',
            },
            {
              id: 'endDate',
              label: 'End Date',
              align: 'left',
              filterType: 'date',
              minWidth: '120px',
            },
            {
              id: 'totalBudgetAmount',
              label: 'Total Budget Amount',
              align: 'left',
              filterType: 'number',
              minWidth: '200px',
              render(value) {
                return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
              },
            },
            { id: 'allocated', label: 'Allocated', align: 'left', filterType: 'number' },
            { id: 'unallocated', label: 'Unallocated', align: 'left', filterType: 'number' },
            {
              stickyPosition: 'right',
              excludeFromExport: true,
              id: 'action',
              label: 'Actions',
              align: 'left',
              isFilter: false,
              isSort: false,
              sticky: true,
              render(value, row) {
                return (
                  <AdaptiveThreeDotsActions directActionLimit={2}
                    actions={[
                      {
                        id: 'view',
                        label: 'View',
                        icon: 'carbon:view-filled',
                        onClick: () => {
                          onViewDetail?.(row);
                        },
                      },
                    ]}
                    placement="right-top"
                  />
                );
              },
            },
          ]}
          data={tableData || []}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={archiveDialog.value}
        onClose={() => {
          archiveDialog.onFalse();
          setSelectedBudget(null);
        }}
        title="Archive"
        content={
          <>
            Are you sure you want to archive{' '}
            <Box component="span" fontWeight="bold" color="text.primary">
              {selectedBudget}
            </Box>
            ?
          </>
        }
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.archive} />}
            onClick={() => {
              // archive logic
              archiveDialog.onFalse();
              setSelectedBudget(null);
            }}
            size="small"
          >
            Archive
          </Button>
        }
      />
    </>
  );
};

export default BudgetTable;
