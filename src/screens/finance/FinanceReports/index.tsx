'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import { Tab, Box, Paper } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import MiscAdminReports from './Components/miscAdmin/MiscAdminReports';
import PendingCoreReports from './Components/pendingCore/PendingCoreReports';
import ReceiptListReports from './Components/receiptList/ReceiptListReports';
import SetupConfigReports from './Components/setupConfig/SetupConfigReports';
import PendingTotalReports from './Components/pendingTotal/PendingTotalReports';
import ExemptionNAReports from './Components/exemptionReports/ExemptionNAReports';
import FeeCollectionReports from './Components/feeCollection/FeeCollectionReports';
import StudentCentricReports from './Components/studentCentric/StudentCentricReports';
import ReceiptSummaryReports from './Components/receiptSummary/ReceiptSummaryReports';
import StudentFocusedReports from './Components/studentFocused/StudentFocusedReports';
import PendingDetailedReports from './Components/pendingDetailed/PendingDetailedReports';
import FeeStatusGeneralReports from './Components/feeStatusGeneral/FeeStatusGeneralReports';
import CertificateRegisterReports from './Components/certificatesRegister/CertificateRegisterReports';
import ReceiptSummaryAdvancedReports from './Components/receiptSummaryAdvanced/ReceiptSummaryAdvancedReports';
import FeeStatusClassDivisionReports from './Components/FeeStatusClassDivisionReport/FeeStatusClassDivisionReports';
import ReceiptListFeeHeadStudentReports from './Components/ReceiptListFeeHeadStudentReports/ReceiptListFeeHeadStudentReports';

const TABS = [
  {
    icon: <Iconify icon="mdi:chart-box-outline" width={20} />,
    value: 'feeStatusGeneral',
    label: 'Fee Status – General & Headwise',
    component: (props: TabComponentType) => <FeeStatusGeneralReports />,
  },
  {
    icon: <Iconify icon="mdi:account-multiple-outline" width={20} />,
    value: 'feeStatusClassDivision',
    label: 'Fee Status – Class/Division Wise',
    component: (props: TabComponentType) => <FeeStatusClassDivisionReports />,
  },
  {
    icon: <Iconify icon="mdi:alert-circle-outline" width={20} />,
    value: 'pendingCore',
    label: 'Pending Fee – Core',
    component: (props: TabComponentType) => <PendingCoreReports />,
  },
  {
    icon: <Iconify icon="mdi:filter-outline" width={20} />,
    value: 'pendingDetailed',
    label: 'Pending Fee – Detailed',
    component: (props: TabComponentType) => <PendingDetailedReports />,
  },
  {
    icon: <Iconify icon="mdi:calculator-variant-outline" width={20} />,
    value: 'pendingTotal',
    label: 'Pending Fee – Total Summary',
    component: (props: TabComponentType) => <PendingTotalReports />,
  },
  {
    icon: <Iconify icon="mdi:shield-off-outline" width={20} />,
    value: 'exemptionReports',
    label: 'Exemption & NA Reports',
    component: (props: TabComponentType) => <ExemptionNAReports />,
  },
  {
    icon: <Iconify icon="mdi:human-child" width={20} />,
    value: 'studentCentric',
    label: 'Student Centric Reports',
    component: (props: TabComponentType) => <StudentCentricReports />,
  },
  {
    icon: <Iconify icon="mdi:cog-outline" width={20} />,
    value: 'miscAdmin',
    label: 'Misc / Admin Reports',
    component: (props: TabComponentType) => <MiscAdminReports />,
  },
  {
    icon: <Iconify icon="mdi:cash-multiple" width={20} />,
    value: 'feeCollection',
    label: 'Fee Collection',
    component: (props: TabComponentType) => <FeeCollectionReports />,
  },
  {
    icon: <Iconify icon="mdi:receipt-text-outline" width={20} />,
    value: 'receiptList',
    label: 'Receipt List',
    component: (props: TabComponentType) => <ReceiptListReports />,
  },
  {
    icon: <Iconify icon="mdi:receipt-text" width={20} />,
    value: 'receiptListAdvanced',
    label: 'Receipt List – FeeHead & Student',
    component: (props: TabComponentType) => <ReceiptListFeeHeadStudentReports />,
  },
  {
    icon: <Iconify icon="mdi:chart-timeline-variant" width={20} />,
    value: 'receiptSummary',
    label: 'Receipt Summary',
    component: (props: TabComponentType) => <ReceiptSummaryReports />,
  },
  {
    icon: <Iconify icon="mdi:chart-areaspline" width={20} />,
    value: 'receiptSummaryAdvanced',
    label: 'Receipt Summary – Advanced',
    component: (props: TabComponentType) => <ReceiptSummaryAdvancedReports />,
  },
  {
    icon: <Iconify icon="mdi:certificate-outline" width={20} />,
    value: 'certificatesRegister',
    label: 'Certificates & Register',
    component: (props: TabComponentType) => <CertificateRegisterReports />,
  },
  {
    icon: <Iconify icon="mdi:tools" width={20} />,
    value: 'setupConfig',
    label: 'Setup & Configuration',
    component: (props: TabComponentType) => <SetupConfigReports />,
  },
  {
    icon: <Iconify icon="mdi:account-details-outline" width={20} />,
    value: 'studentFocused',
    label: 'Student Focused',
    component: (props: TabComponentType) => <StudentFocusedReports />,
  },
];

const FinanceReports = () => {
  // Initialize search params with default tab 'homeworkReports'
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'feeStatusGeneral' });

  // Find and memoize the currently active tab component based on search params
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  const dynamicLabel =
    currentActiveComponent?.value === 'homeworkReports'
      ? 'Homework Reports'
      : currentActiveComponent?.value === 'assignmentReports'
        ? 'Assignment Reports'
        : 'Analytics & Monitoring';
  const [isBackClick, setIsBackClick] = useState(false);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading={dynamicLabel}
        description={
          currentActiveComponent?.value === 'homeworkReports'
            ? 'Explore and export homework-related reports and insights.'
            : currentActiveComponent?.value === 'assignmentReports'
              ? 'Browse and export assignment reports for classes and subjects.'
              : 'Monitor trends, performance, and submission analytics.'
        }
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Homework & Assignment', href: '/academic/homeworkCreation' },
          { name: 'Reports', href: '#' },
          { name: dynamicLabel },
        ]}
        sx={{ mb: 2 }}
      />
      <Paper
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
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 }, borderRadius: 1.5, mb: 2 }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
      </Paper>
      <FormSlider
        steps={TABS}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{
          sx: {
            p: 0,
            minHeight: 0,
          },
        }}
      >
        <Box sx={{ height: '100%' }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          )}{' '}
        </Box>
      </FormSlider>
    </Box>
  );
};
export default FinanceReports;
