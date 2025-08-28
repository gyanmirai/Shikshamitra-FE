import type { LabelColor } from 'src/components/label';

import React, { useMemo } from 'react';

import { Box, Tab, Tabs, Button, MenuItem, MenuList } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import {
  BudgetStatusType,
  BudgetStatusOptions,
  BudgetStatusTypeColors,
} from 'src/enums/budget-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface IBudgetTableProps {
  data: any[];
  setOpenDialog?: (value: boolean) => void;
  setEditData?: (value: any) => void;
  onDelete?: (id: string) => void;
  onViewDetail?: (data: any) => void;
}

const BudgetTable: React.FC<IBudgetTableProps> = ({
  data,
  setOpenDialog,
  setEditData,
  onDelete,
  onViewDetail,
}) => {
  const archiveDialog = useBoolean();
  const [selectedBudget, setSelectedBudget] = React.useState<string | null>(null);

  // Tabs setup
  const tabs = useTabs('All');

  const budgetCounts = useMemo(
    () => ({
      active: data?.filter((i) => i.status === BudgetStatusType.Active)?.length || 0,
      archived: data?.filter((i) => i.status === BudgetStatusType.Draft)?.length || 0,
    }),
    [data]
  );

  const TABS = useMemo(
    () => [
      {
        label: 'All',
        value: 'All',
        count: data?.length || 0,
        color: 'default',
      },
      {
        label: 'Active',
        value: BudgetStatusType.Active,
        count: budgetCounts.active,
        color: 'success',
      },
      {
        label: 'Archive',
        value: BudgetStatusType.Draft,
        count: budgetCounts.archived,
        color: 'warning',
      },
    ],
    [budgetCounts, data]
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
  };

  const tableData = useMemo(() => {
    if (tabs.value === 'All') return data;
    return data?.filter((i) => i.status === tabs.value);
  }, [data, tabs.value]);

  const actions = ({ popover: pop, row }: any) => (
    <MenuList>
      <MenuItem
        onClick={() => {
          setSelectedBudget(row.budgetTitle);
          archiveDialog.onTrue();
          pop.onClose();
        }}
      >
        <Iconify icon={GlobalIcons.archive} />
        Archive
      </MenuItem>
    </MenuList>
  );

  return (
    <Box>
      {/* Tabs */}
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
                  <Label
                    variant={tab.value === 'All' ? 'filled' : 'soft'}
                    color={(tab?.color as LabelColor) || 'default'}
                  >
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
      <CustomizableTable
        tableId="budget-table"
        noDataText="Budget Data Not Found"
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
            id: 'status',
            label: 'Status',
            align: 'left',
            filterType: 'enum',
            enumOptions: BudgetStatusOptions,
            sticky: true,
            render(value, row) {
              const color = BudgetStatusTypeColors[value as BudgetStatusType] as LabelColor;
              return <Label color={color}>{BudgetStatusType[value as BudgetStatusType]}</Label>;
            },
          },
          {
            id: 'action',
            label: 'Actions',
            minWidth: 80,
            align: 'left',
            isSort: false,
            sticky: true,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                  showDeleteIcon
                  showEditIcon
                  handleDeleteClick={() => onDelete?.(row.id)}
                  handleEditClick={() => {
                    setOpenDialog?.(true);
                    setEditData?.(row);
                  }}
                  showViewIcon
                  handleViewClick={() => {
                    onViewDetail?.(row);
                  }}
                />
              );
            },
          },
        ]}
        data={tableData || []}
      />

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
