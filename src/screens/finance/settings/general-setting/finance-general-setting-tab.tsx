'use client';

import React, { useMemo } from 'react';

import Add from '@mui/icons-material/Add';
import { Box, Tab, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import CustomDialog from 'src/components/customDialog';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SetFeeHeadDialog from './dialogs/set-fee-head-dialog';
import SetPaymentTerm from './component/setting-up-payment-term';
import SetPaymentMethodComponent from './component/set-payment-method';
import SetLateFeeTypeMethod from './component/set-late-fee-type-method';
import SetDefaultFeeComponent from './component/set-default-fee-component';
import AddPaymentTermDialog from './dialogs/finance-add-payment-term-dialog';
import AddPaymentMethodDialog from './dialogs/finance-add-payment-method-dialog';
import AddPaymentStatusDialog from './dialogs/finance-add-payment-status-dialog';
import AddBudgetCategoryDialog from './dialogs/finance-add-budget-category-dialog';
import AddLateFeeTypeDialog from './dialogs/finance-add-late-fee-type-method-dialog';
import AddBudgetSubcategoryDialog from './dialogs/finance-add-budget-sub-category-dialog';
import ConfigurePaymentStatusComponent from './component/configure-payment-status-component';
import PresetCategoryAndDepartmentForBudget from './component/preset-category-and-department-for-budget';
import PredefinedCategoryIncomeExpenseComponent from './component/predefined-category-income-expense-component';

const FinanceGeneralSettingTab = () => {
  // Default tab is set to 'setDefaultFeeComponents'
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'setDefaultFeeComponents' });

  // Dialog state management using useBoolean hook
  const setFeeHeadDialog = useBoolean();
  const setPaymentMethodDialog = useBoolean();
  const setLateFeeTypeDialog = useBoolean();
  const setPaymentTermDialog = useBoolean();

  const setPaymentStatusDialog = useBoolean();
  const presetCategoryAndDepartmentForBudgetDialog = useBoolean();
  const predefinedCategoryIncomeExpenseDialog = useBoolean();

  // Configuration for all tabs including their values, labels, button text, click handlers and components
  const TABS = useMemo(
    () => [
      {
        value: 'setDefaultFeeComponents',
        label: 'Fee Head',
        buttonText: 'Fee Head',
        onClick: () => {
          setFeeHeadDialog.onTrue();
        },
        component: () => <SetDefaultFeeComponent />,
      },
      {
        value: 'setPaymentMethodComponents',
        label: 'Payment Method',
        buttonText: 'Payment Method',
        onClick: () => {
          setPaymentMethodDialog.onTrue();
          console.log('Add Payment Method clicked');
        },
        component: () => <SetPaymentMethodComponent />,
      },
      {
        value: 'lateFeeType',
        label: 'Late Fee Type',
        buttonText: 'Late Fee Type',
        onClick: () => {
          setLateFeeTypeDialog.onTrue();
          console.log('Add Late Fee Type clicked');
        },
        component: () => <SetLateFeeTypeMethod />,
      },
      {
        value: 'setPaymentTerm',
        label: 'Payment Term',
        buttonText: 'Payment Term',
        onClick: () => {
          setPaymentTermDialog.onTrue();
          console.log('Add Payment Term clicked');
        },
        component: () => <SetPaymentTerm />,
      },
      {
        value: 'configurePaymentStatusOptions',
        label: 'Payment Status',
        buttonText: 'Payment Status',
        onClick: () => {
          setPaymentStatusDialog.onTrue();
          console.log('Add Payment Status Option clicked');
        },
        component: () => <ConfigurePaymentStatusComponent />,
      },
      {
        value: 'presentCategoriesandDepartmentsforBudgeting',
        label: 'Budget Category',
        buttonText: 'Budget Category',
        onClick: () => {
          presetCategoryAndDepartmentForBudgetDialog.onTrue();
          console.log('Add Budget Category clicked');
        },
        component: () => <PresetCategoryAndDepartmentForBudget />,
      },
      {
        value: 'predefinedCategoriesForincomeandexpenses',
        label: 'Budget Sub Category',
        buttonText: 'Budget Sub Category',
        onClick: () => {
          predefinedCategoryIncomeExpenseDialog.onTrue();
          console.log('Add Income/Expense Category clicked');
        },
        component: () => <PredefinedCategoryIncomeExpenseComponent />,
      },
    ],
    [
      setFeeHeadDialog,
      setPaymentMethodDialog,
      setLateFeeTypeDialog,
      setPaymentTermDialog,
      setPaymentStatusDialog,
      presetCategoryAndDepartmentForBudgetDialog,
      predefinedCategoryIncomeExpenseDialog,
    ]
  );

  const currentTab = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [TABS, searchParams?.tab]
  );

  // Handle click event for the add button in header
  const handleClick = () => {
    currentTab?.onClick?.(); // Safely call action if it exists
  };

  // Get the button text for the current active tab
  const getButtonText = () => currentTab?.buttonText || 'Add';

  return (
    <Box>
      <CustomBreadcrumbs
        heading="General Settings"
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'General Settings' },
          { name: currentTab?.label || '' },
        ]}
        sx={{ px: 1, mb: 2 }}
        description="This is the General Settings section for the Finance module, where you can manage fee heads, payment status options, and other required fields and details related to financial operations."
        action={
          <Button
            variant="contained"
            onClick={handleClick}
            startIcon={<Add />}
            sx={{ textTransform: 'capitalize' }}
          >
            {getButtonText()}
          </Button>
        }
      />

      <Card>
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab sx={{ fontSize: '12px' }} key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>

      <Box px={1} pt={2}>
        {currentTab?.component && <currentTab.component />}
      </Box>

      {setFeeHeadDialog.value && (
        <CustomDialog
          open={setFeeHeadDialog.value}
          handleClose={() => {
            setFeeHeadDialog.onFalse();
          }}
          title="Add Fee Head"
          maxWidth="sm"
        >
          <SetFeeHeadDialog
            onClose={() => {
              setFeeHeadDialog.onFalse();
            }}
            isEditMode={false}
            data={null}
            onSave={() => {
              setFeeHeadDialog.onFalse();
            }}
          />
        </CustomDialog>
      )}

      {setPaymentMethodDialog.value && (
        <CustomDialog
          open={setPaymentMethodDialog.value}
          handleClose={() => {
            setPaymentMethodDialog.onFalse();
          }}
          title="Add Payment Method"
          maxWidth="sm"
        >
          <AddPaymentMethodDialog
            onClose={() => {
              setPaymentMethodDialog.onFalse();
            }}
            isEditMode={false}
            data={null}
            onSave={() => {
              setPaymentMethodDialog.onFalse();
            }}
          />
        </CustomDialog>
      )}

      {setLateFeeTypeDialog.value && (
        <CustomDialog
          open={setLateFeeTypeDialog.value}
          handleClose={() => {
            setLateFeeTypeDialog.onFalse();
          }}
          title="Add Late Fee Type"
          maxWidth="sm"
        >
          <AddLateFeeTypeDialog
            onClose={() => {
              setLateFeeTypeDialog.onFalse();
            }}
            isEditMode={false}
            data={null}
            onSave={() => {
              setLateFeeTypeDialog.onFalse();
            }}
          />
        </CustomDialog>
      )}

      {setPaymentTermDialog.value && (
        <CustomDialog
          open={setPaymentTermDialog.value}
          handleClose={() => {
            setPaymentTermDialog.onFalse();
          }}
          title="Add Payment Term"
          maxWidth="sm"
        >
          <AddPaymentTermDialog
            onClose={() => {
              setPaymentTermDialog.onFalse();
            }}
            isEditMode={false}
            data={null}
            onSave={() => {
              setPaymentTermDialog.onFalse();
            }}
          />
        </CustomDialog>
      )}

      {setPaymentStatusDialog.value && (
        <CustomDialog
          open={setPaymentStatusDialog.value}
          handleClose={() => {
            setPaymentStatusDialog.onFalse();
          }}
          title="Add Payment Status"
          maxWidth="sm"
        >
          <AddPaymentStatusDialog
            onClose={() => {
              setPaymentStatusDialog.onFalse();
            }}
            isEditMode={false}
            data={null}
            onSave={() => {
              setPaymentStatusDialog.onFalse();
            }}
          />
        </CustomDialog>
      )}

      {presetCategoryAndDepartmentForBudgetDialog.value && (
        <CustomDialog
          open={presetCategoryAndDepartmentForBudgetDialog.value}
          handleClose={() => {
            presetCategoryAndDepartmentForBudgetDialog.onFalse();
          }}
          title="Add Budget Category"
          maxWidth="sm"
        >
          <AddBudgetCategoryDialog
            onClose={() => {
              presetCategoryAndDepartmentForBudgetDialog.onFalse();
            }}
            isEditMode={false}
            data={null}
            onSave={() => {
              presetCategoryAndDepartmentForBudgetDialog.onFalse();
            }}
          />
        </CustomDialog>
      )}

      {predefinedCategoryIncomeExpenseDialog.value && (
        <CustomDialog
          open={predefinedCategoryIncomeExpenseDialog.value}
          handleClose={() => {
            predefinedCategoryIncomeExpenseDialog.onFalse();
          }}
          title="Add Budget Sub Category"
          maxWidth="md"
        >
          <AddBudgetSubcategoryDialog
            onClose={() => {
              predefinedCategoryIncomeExpenseDialog.onFalse();
            }}
            isEditMode={false}
            data={null}
            onSave={() => {
              predefinedCategoryIncomeExpenseDialog.onFalse();
            }}
            categories={[]}
          />
        </CustomDialog>
      )}
    </Box>
  );
};
export default FinanceGeneralSettingTab;
