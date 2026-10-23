'use client';

import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';

import { useState } from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import { CustomTabs } from 'src/components/custom-tabs';

import { Box, Tab, Typography, Tooltip } from '@mui/material';

import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import budgetExpenseData from 'src/json/finance/budget/budgetIncomeData.json';
import budgetIncomeData from 'src/json/finance/budget/budgetExpenseData.json';

import FinanceNewBudgetCreateDialog from './component/finance-new-budget-create-dialog';

import type { IIncomeCategory, IExpenseCategory } from './interface/budgeting_interface';
import CustomTooltip from 'src/components/custom-tooltip';

import budgetData from 'src/json/finance/budget/budgetData.json';

const TABS = [
  { value: 'income', label: 'Income', total: formatNumber(80000) },
  { value: 'expenses', label: 'Expenses', total: formatNumber(60000) },
];

const FinanceNewBudgetingScreen = () => {
  const theme = useTheme();
  const tabs = useTabs('income');
  const budgetDialog = useBoolean();

  const [isEdit, setIsEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<IIncomeCategory | IExpenseCategory | null>(
    null
  );

  const handleEditEntry = (entry: IIncomeCategory | IExpenseCategory) => {
    setIsEdit(true);
    setSelectedEntry(entry);
    budgetDialog.onTrue();
  };

  const dispatch = useDispatch();

  const renderTabLabel = (tab: (typeof TABS)[0]) => (
    <Box
      sx={{
        width: 1,
        display: 'flex',
        gap: { xs: 1, md: 2.5 },
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'center', md: 'flex-start' },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: '50%',
          alignItems: 'center',
          color: tab.value === 'expenses' ? 'warning.lighter' : 'primary.lighter',
          bgcolor: tab.value === 'expenses' ? 'warning.darker' : 'primary.darker',
          justifyContent: 'center',
          display: { xs: 'none', md: 'inline-flex' },
        }}
      >
        <Iconify
          width={24}
          icon={
            tab.value === 'expenses'
              ? 'eva:diagonal-arrow-right-up-fill'
              : 'eva:diagonal-arrow-left-down-fill'
          }
        />
      </Box>

      <div>
        <Box
          sx={{
            mb: 1,
            gap: 0.5,
            display: 'flex',
            alignItems: 'center',
            typography: 'subtitle2',
          }}
        >
          <Tooltip
            title={
              <Box sx={{ whiteSpace: 'pre-line' }}>
                {tab.value === 'income'
                  ? budgetData.incomeCategories.map((e: any) => e.name).join('\n')
                  : budgetData.expenseCategories.map((e: any) => e.name).join('\n')}
              </Box>
            }
            placement="top"
          >
            <Iconify width={16} icon="eva:info-outline" sx={{ color: 'text.disabled' }} />
          </Tooltip>

          {tab.label}
        </Box>
        <Box sx={{ typography: 'h4' }}>₹ {tab.total}</Box>
      </div>
    </Box>
  );

  const { handleClose, confirmation: discardConfirmation } = useFinanceFormClose(
    budgetDialog.value,
    () => {
      budgetDialog.onFalse();
      setSelectedEntry(null);
      setIsEdit(false);
    }
  );

  const renderTableColumns = (type: 'income' | 'expenses') => {
    const commonColumns = {
      name: { id: 'name', label: type === 'income' ? 'Income Category' : 'Expense Category' },
      action: {
        stickyPosition: 'right',
        excludeFromExport: true,
        id: 'action',
        label: 'Action',
        isFilter: false,
        isSort: false,
        align: 'left',
        sticky: true,
        render: (_: any, row: any) => (
          <AdaptiveThreeDotsActions
            directActionLimit={3}
            actions={[
              {
                id: 'edit',
                label: 'Edit',
                icon: 'solar:pen-bold',
                onClick: () => handleEditEntry(row),
              },
            ]}
          />
        ),
      },
    };

    const formatColumn = (id: string, label: string) => ({
      cellSx: { textAlign: 'right' as const },
      id,
      label,
      filterType: 'formattedNumber',
      align: 'left',
      render: (value: number) => (
        <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>
      ),
    });

    return type === 'income'
      ? [
          commonColumns.name,
          formatColumn('totalAmountExpected', 'Total Expected'),
          formatColumn('collectedAmount', 'Collected'),
          formatColumn('outstandingAmount', 'Outstanding'),
          {
            id: 'receivedPercantage',
            label: 'Received Percantage',
            // render(value, row) {
            //   return (
            //     // Circular progress indicator with percentage
            //     <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            //       <CircularProgress variant="determinate" value={value} />
            //       <Box
            //         sx={{
            //           top: 0,
            //           left: 0,
            //           bottom: 0,
            //           right: 0,
            //           position: 'absolute',
            //           display: 'flex',
            //           alignItems: 'center',
            //           justifyContent: 'center',
            //         }}
            //       >
            //         <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
            //           {value}%
            //         </Typography>
            //       </Box>
            //     </Box>
            //   );
            // },
          },
          commonColumns.action,
        ]
      : [
          commonColumns.name,
          formatColumn('allocatedAmount', 'Allocated Amount'),
          formatColumn('spentAmount', 'Spent Amount'),
          formatColumn('remainingAmount', 'Remaining Amount'),
          { id: 'expensePercantage', label: 'Expense Percantage %' },
          commonColumns.action,
        ];
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {discardConfirmation}
      <CustomBreadcrumbs
        description="The Budget screen provides an overview of income and expenses based on the selected tab. Easily track financial allocations and monitor spending for better financial planning."
        heading="Budgeting"
        links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Budgeting' }]}
      />

      <CustomTabs
        value={tabs.value}
        onChange={tabs.onChange}
        variant="fullWidth"
        sx={{ borderRadius: 2 }}
        slotProps={{
          indicator: { borderRadius: 1.5, boxShadow: theme.customShadows.z4 },
          tab: { p: 2 },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={renderTabLabel(tab)} />
        ))}
      </CustomTabs>

      {/* <Box mt={2} mb={2} display="flex" justifyContent="flex-end">
        <Button startIcon={<Add />} onClick={handleNewEntry} variant="contained" size="small">
          Budget
        </Button>
      </Box> */}

      <CustomizableTable
        noDataText={
          <>
            No budget has been created yet for {tabs.value} categories. Please set up a budget to
            track expected vs. actual collections.
            <Box
              color="primary.main"
              fontWeight={600}
              onClick={() => setOpen(true)}
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Create Budget
            </Box>
          </>
        }
        tableId={`${tabs.value}-table`}
        columns={renderTableColumns(tabs.value as 'income' | 'expenses')}
        data={tabs.value === 'income' ? budgetIncomeData : budgetExpenseData}
      />

      <CustomDialog
        guardUnsavedChanges={false}
        handleClose={() => handleClose()}
        open={budgetDialog.value}
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">{isEdit ? 'Edit Budget' : 'Create Budget'}</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                isEdit
                  ? 'You can modify the budget details including allocated amounts and categories for better financial planning.'
                  : 'Create a new budget entry by specifying the category and allocating amounts to track income/expenses effectively.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        {budgetDialog.value && (
          <FinanceNewBudgetCreateDialog
            onSave={() => {}}
            dialogValue={open}
            onClose={handleClose}
            data={selectedEntry}
            edit={isEdit}
            activeTab={tabs.value as string}
          />
        )}
      </CustomDialog>
    </Box>
  );
};

export default FinanceNewBudgetingScreen;
