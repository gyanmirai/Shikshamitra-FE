'use client';

import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Tab, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useCustomSearchParams } from 'src/hooks/use-search-param';

import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SalaryStructure from './salary-structure';
import EarningComponent from './earning-component';
import DeductionComponent from './deduction-component';

const TABS = [
  {
    value: 'earningComponent',
    label: 'Earning Component',
    component: (props: any) => <EarningComponent {...props} />,
    icon: <Iconify icon="mdi:attach-money" />,
  },
  {
    value: 'deductionComponent',
    label: 'Deduction Component',
    component: (props: any) => <DeductionComponent {...props} />,
    icon: <Iconify icon="ic:sharp-money-off-csred" />,
  },
  {
    value: 'salaryStructure',
    label: 'Salary Structure',
    component: (props: any) => <SalaryStructure {...props} />,
    icon: <Iconify icon="fluent:money-calculator-24-regular" />,
  },
  // {
  //   value: 'pf',
  //   label: 'PF',
  //   component: (props: any) => <PF {...props} />,
  // },
  // {
  //   value: 'professionalTax',
  //   label: 'Professional Tax',
  //   component: (props: any) => <ProfessionalTax {...props} />,
  // },
  // { value: 'tds', label: 'TDS', component: () => <TDS /> },
];

const PayrollSettingScreen = () => {
  const isEarningComponentOpen = useBoolean();
  const isDeductionComponentOpen = useBoolean();
  const isSalaryStructureOpen = useBoolean();
  const isPFOpen = useBoolean();

  const { getAllParams, setParam } = useCustomSearchParams({ tab: 'earningComponent' });

  const allParams = getAllParams();

  const CurrentComponent = TABS.find((tab) => tab.value === allParams.tab)?.component;

  const currentTabIndex = TABS.findIndex((tab) => tab.value === allParams.tab);

  const [isBackClick, setIsBackClick] = useState(false);

  const renderBUtton = {
    earningComponent: (
      <Button
        sx={{ minWidth: '200px', width: '100%' }}
        startIcon={<Add />}
        variant="contained"
        size="small"
        onClick={isEarningComponentOpen.onTrue}
      >
        {' '}
        Earning Component
      </Button>
    ),
    deductionComponent: (
      <Button
        sx={{ minWidth: '200px', width: '100%' }}
        startIcon={<Add />}
        variant="contained"
        size="small"
        onClick={isDeductionComponentOpen.onTrue}
      >
        {' '}
        Deduction Component
      </Button>
    ),
    salaryStructure: (
      <Button
        sx={{ minWidth: '200px', width: '100%' }}
        startIcon={<Add />}
        variant="contained"
        size="small"
        onClick={isSalaryStructureOpen.onTrue}
      >
        {' '}
        Salary Structure
      </Button>
    ),
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        links={[{ name: 'HR' }, { name: 'Payroll Management' }, { name: 'Setting' }]}
        sx={{ mb: 2 }}
        description="In this section, you can configure payroll settings, including Professional Tax, Provident Fund (PF), and Salary Components to ensure accurate salary processing."
        action={renderBUtton[allParams.tab as keyof typeof renderBUtton]}
      />

      <CustomTabs
        value={allParams.tab}
        onChange={(e, value) => {
          const newIndex = TABS.findIndex((tab) => tab.value === value);
          const isBack = newIndex < currentTabIndex;
          setIsBackClick(isBack);
          setParam('tab', value);
        }}
        sx={{ borderRadius: 2, marginBottom: -2 }}
        // variant="fullWidth"
        // slotProps={{ tab: { px: 0 } }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
        ))}
      </CustomTabs>

      <FormSlider isBackClick={isBackClick} step={currentTabIndex} steps={TABS}>
        <Box pt={2}>
          {CurrentComponent && (
            <CurrentComponent
              isEarningComponentOpen={isEarningComponentOpen}
              isDeductionComponentOpen={isDeductionComponentOpen}
              isSalaryStructureOpen={isSalaryStructureOpen}
            />
          )}
        </Box>
      </FormSlider>
    </Box>
  );
};

export default PayrollSettingScreen;
