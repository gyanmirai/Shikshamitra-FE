import type { LabelColor } from 'src/components/label';

import React, { useMemo } from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { BudgetStatusType } from 'src/enums/budget-status';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Tab, Tabs, Button, MenuItem, MenuList } from '@mui/material';

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

  console.log('tabs vale-----', tabs.value);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
  };

  const tableData = useMemo(() => {
    if (tabs.value === 'All') return data;
    return data?.filter((i) => i.status === tabs.value);
  }, [data, tabs.value]);

  const getActionsForStatus = (status: string, row: any, pop: any) => {
    switch (status) {
      case 'pending':
        return (
          <MenuList>
            <MenuItem
              onClick={() => {
                onReview?.(row);
                pop.onClose();
              }}
            >
              <Iconify icon={GlobalIcons.eye} />
              Review
            </MenuItem>
          </MenuList>
        );

      case 'active':
        return (
          <MenuList>
            <MenuItem
              onClick={() => {
                // mark inactive logic
                pop.onClose();
              }}
            >
              <Iconify icon={GlobalIcons.cancel} />
              Inactive
            </MenuItem>
          </MenuList>
        );

      case 'inactive':
        return (
          <MenuList>
            <MenuItem
              onClick={() => {
                onViewDetail?.(row);
                pop.onClose();
              }}
            >
              <Iconify icon={GlobalIcons.eye} />
              View
            </MenuItem>
            <MenuItem
              onClick={() => {
                onDelete?.(row.id);
                pop.onClose();
              }}
            >
              <Iconify icon={GlobalIcons.delete} />
              Delete
            </MenuItem>
          </MenuList>
        );

      case 'archive':
        return (
          <MenuList>
            <MenuItem
              onClick={() => {
                onViewDetail?.(row);
                pop.onClose();
              }}
            >
              <Iconify icon={GlobalIcons.eye} />
              View
            </MenuItem>
          </MenuList>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
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
            { id: 'budgetTitle', label: 'Budget Title', align: 'left' },
            { id: 'budgetCategory', label: 'Type', align: 'left' },
            { id: 'startDate', label: 'Start Date', align: 'left', filterType: 'date' },
            { id: 'endDate', label: 'End Date', align: 'left', filterType: 'date' },
            {
              id: 'totalBudgetAmount',
              label: 'Total Budget Amount',
              align: 'left',
              filterType: 'number',
            },
            { id: 'allocated', label: 'Allocated', align: 'left', filterType: 'number' },
            { id: 'unallocated', label: 'Unallocated', align: 'left', filterType: 'number' },
            {
              id: 'action',
              label: 'Actions',
              align: 'left',
              isFilter: false,
              isSort: false,
              sticky: true,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    showViewIcon
                    showEditIcon
                    showDeleteIcon
                    handleViewClick={() => {
                      onViewDetail?.(row);
                    }}
                    handleEditClick={() => {
                      setOpenDialog?.(true);
                      setEditData?.(row);
                    }}
                    handleDeleteClick={() => {
                      onDelete?.(row.id);
                    }}
                    actions={(prop) => getActionsForStatus('pending', row, prop.popover)}
                    placement="right-top"
                  />
                );
              },
            },
          ]}
          data={tableData || []}
        />
      ) : tabs.value === 1 ? (
        <CustomizableTable
          tableId="budget-table-active"
          noDataText="Active Budgets Not Found"
          columns={[
            { id: 'budgetTitle', label: 'Budget Title', align: 'left' },
            { id: 'budgetCategory', label: 'Type', align: 'left' },
            { id: 'startDate', label: 'Start Date', align: 'left', filterType: 'date' },
            { id: 'endDate', label: 'End Date', align: 'left', filterType: 'date' },
            {
              id: 'totalBudgetAmount',
              label: 'Total Budget Amount',
              align: 'left',
              filterType: 'number',
            },
            { id: 'allocated', label: 'Allocated', align: 'left', filterType: 'number' },
            { id: 'unallocated', label: 'Unallocated', align: 'left', filterType: 'number' },
            {
              id: 'action',
              label: 'Actions',
              isFilter: false,
              isSort: false,
              align: 'left',
              sticky: true,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    showViewIcon
                    showDeleteIcon
                    handleViewClick={() => {
                      onViewDetail?.(row);
                    }}
                    handleDeleteClick={() => {
                      onDelete?.(row.id);
                    }}
                    actions={(prop) => getActionsForStatus('active', row, prop.popover)}
                    placement="right-top"
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
            { id: 'budgetTitle', label: 'Budget Title', align: 'left' },
            { id: 'budgetCategory', label: 'Type', align: 'left' },
            { id: 'startDate', label: 'Start Date', align: 'left', filterType: 'date' },
            { id: 'endDate', label: 'End Date', align: 'left', filterType: 'date' },
            {
              id: 'totalBudgetAmount',
              label: 'Total Budget Amount',
              align: 'left',
              filterType: 'number',
            },
            { id: 'allocated', label: 'Allocated', align: 'left', filterType: 'number' },
            { id: 'unallocated', label: 'Unallocated', align: 'left', filterType: 'number' },
            {
              id: 'action',
              label: 'Actions',
              isFilter: false,
              isSort: false,
              align: 'left',
              sticky: true,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    showViewIcon
                    showDeleteIcon
                    handleViewClick={() => {
                      onViewDetail?.(row);
                    }}
                    handleDeleteClick={() => {
                      onDelete?.(row.id);
                    }}
                    showThreeDots={false}
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
            { id: 'budgetTitle', label: 'Budget Title', align: 'left' },
            { id: 'budgetCategory', label: 'Type', align: 'left' },
            { id: 'startDate', label: 'Start Date', align: 'left', filterType: 'date' },
            { id: 'endDate', label: 'End Date', align: 'left', filterType: 'date' },
            {
              id: 'totalBudgetAmount',
              label: 'Total Budget Amount',
              align: 'left',
              filterType: 'number',
            },
            { id: 'allocated', label: 'Allocated', align: 'left', filterType: 'number' },
            { id: 'unallocated', label: 'Unallocated', align: 'left', filterType: 'number' },
            {
              id: 'action',
              label: 'Actions',
              align: 'left',
              isFilter: false,
              isSort: false,
              sticky: true,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    showViewIcon
                    handleViewClick={() => {
                      onViewDetail?.(row);
                    }}
                    showThreeDots={false}
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
    </Box>
  );
};

export default BudgetTable;
