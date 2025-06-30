'use client';

import React, { useMemo, useState } from 'react';

import Add from '@mui/icons-material/Add';
import { Box, Tab, Card, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomTooltip from 'src/components/custom-tooltip';
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
        icon: <Iconify icon="ri:money-rupee-circle-fill" width={20} />,
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
        icon: <Iconify icon="hugeicons:payment-02" width={20} />,
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
        icon: <Iconify icon="streamline-freehand:wealth-time-money" width={20} />,
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
        icon: <Iconify icon="mdi:payment-clock" width={20} />,
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
        icon: <Iconify icon="hugeicons:payment-success-01" width={20} />,
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
        icon: (
          <Iconify
            icon="streamline-ultimate:presentation-projector-screen-budget-analytics"
            width={20}
          />
        ),
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
        icon: (
          <Iconify
            icon="streamline-freehand:presentation-projector-screen-budget-analytics"
            width={20}
          />
        ),
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

  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [TABS, searchParams?.tab]
  );
  const [isBackClick, setIsBackClick] = useState(false);
  // Get the button text for the current active tab
  const getButtonText = () => currentTab?.buttonText || 'Add';

  return (
    <Box>
      <CustomBreadcrumbs
        heading="General Setting"
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Setting' },
          { name: 'General Setting' },
        ]}
        sx={{ px: 1, mb: 2 }}
        description="This is the General Settings section for the Finance module, where you can manage fee heads, payment status options, and other required fields and details related to financial operations."
        action={
          <Button
            variant="contained"
            onClick={handleClick}
            startIcon={<Add />}
            size="small"
            sx={{ textTransform: 'capitalize' }}
          >
            {getButtonText()}
          </Button>
        }
      />

      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => {
            const newIndex = TABS.findIndex((tab) => tab.value === value);
            if (currentIndex > newIndex) {
              setIsBackClick(true);
            } else {
              setIsBackClick(false);
            }

            setSearchParams({ tab: value });
          }}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
      </Card>
      <FormSlider
        steps={TABS}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{
          sx: {
            p: 0,
          },
        }}
      >
        <Scrollbar sx={{ p: 1 }}>
          {currentTab?.component && (
            <currentTab.component
            // addSubjectDialog={addSubjectDialog}
            // addElectiveGroupDialog={addElectiveGroupDialog}
            // searchParams={searchParams}
            // setSearchParams={setSearchParams}
            />
          )}{' '}
        </Scrollbar>
      </FormSlider>

      {/* <Card>
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={tab.icon}
            />
          ))}
        </CustomTabs>
      </Card>

      <Box px={1} pt={2}>
        {currentTab?.component && <currentTab.component />}
      </Box> */}

      {setFeeHeadDialog.value && (
        <CustomDialog
          open={setFeeHeadDialog.value}
          handleClose={() => {
            setFeeHeadDialog.onFalse();
          }}
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">Add Fee Head</Typography>
              <CustomTooltip
                arrow
                placement="right"
                title="You can create a new fee head by entering the fee head name and other required details."
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
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
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">Add Payment Method</Typography>
              <CustomTooltip
                arrow
                placement="right"
                title="You can add a new payment method by specifying the method name and other payment processing details."
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
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
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">Add Late Fee Type</Typography>
              <CustomTooltip
                arrow
                placement="right"
                title="You can add a new late fee type by specifying the fee type and other related details."
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
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
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">Add Payment Term</Typography>
              <CustomTooltip
                arrow
                placement="right"
                title="You can add a new payment term by specifying the term duration, due dates, and other payment scheduling details. This helps establish when payments are expected and manages payment cycles effectively."
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
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

      <CustomDialog
        open={setPaymentStatusDialog.value}
        handleClose={() => {
          setPaymentStatusDialog.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Add Payment Status</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="You can add a new payment status to track different states of payments like Pending, Completed, Failed etc. This helps in monitoring and managing payment transactions effectively."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
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

      <CustomDialog
        open={presetCategoryAndDepartmentForBudgetDialog.value}
        handleClose={() => {
          presetCategoryAndDepartmentForBudgetDialog.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Add Budget Category</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="You can add a new budget category to organize and track different types of financial allocations. This helps in better financial planning and monitoring of expenses across various departments."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
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

      <CustomDialog
        open={predefinedCategoryIncomeExpenseDialog.value}
        handleClose={() => {
          predefinedCategoryIncomeExpenseDialog.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Add Budget Sub Category</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Add budget sub-categories to organize income and expenses."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
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
        />
      </CustomDialog>
    </Box>
  );
};
export default FinanceGeneralSettingTab;
