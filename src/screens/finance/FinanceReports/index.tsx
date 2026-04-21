'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';
import { Box } from '@mui/material';
import CommonReport from 'src/components/common-report';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { MiscAdminReportsTitleOptions } from 'src/enums/misc-admin-reports';
import { SetupConfigReportTitleOptions } from 'src/enums/setup-config-reports';
import { PendingCoreReportsTitleOptions } from 'src/enums/pending-core-reports';
import { ExemptionNAReportsTitleOptions } from 'src/enums/exemption-na-reports';
import { ReceiptListReportsTitleOptions } from 'src/enums/receipt-list-reports';
import { PendingTotalReportsTitleOptions } from 'src/enums/pending-total-reports';
// Enums
import { FeeStatusReportTitleOptions } from 'src/enums/fee-status-general-reports';
import { FeeCollectionReportsTitleOptions } from 'src/enums/fee-collection-reports';
import { StudentCentricReportsTitleOptions } from 'src/enums/student-centric-reports';
import { ReceiptSummaryReportsTitleOptions } from 'src/enums/receipt-summary-reports';
import { PendingDetailedReportsTitleOptions } from 'src/enums/pending-detailed-reports';
import { FeeStatusClassDivReportsTitleOptions } from 'src/enums/fee-status-divisionClass';
import { CertificateRegisterReportTitleOptions } from 'src/enums/certificate-register-reports';
import { ReceiptSummaryAdvancedReportTitleOptions } from 'src/enums/receipt-summary-advanced-reports';
import { ReceiptListFeeHeadStudentReportsTitleOptions } from 'src/enums/receipt-list-fee-head-student-reports';

// Components
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
import { StudentFocusedReportsTitleOptions } from './Components/studentFocused/StudentFocusedReportsEnums';
import ReceiptSummaryAdvancedReports from './Components/receiptSummaryAdvanced/ReceiptSummaryAdvancedReports';
import FeeStatusClassDivisionReports from './Components/FeeStatusClassDivisionReport/FeeStatusClassDivisionReports';
import ReceiptListFeeHeadStudentReports from './Components/ReceiptListFeeHeadStudentReports/ReceiptListFeeHeadStudentReports';

const FinanceReports = ({ addReportDialog }: { addReportDialog: UseBooleanReturn }) => {
  const categories = [
    {
      name: 'Fee Status – General & Headwise',
      id: 'feeStatusGeneral',
      icon: 'mdi:chart-box-outline',
    },
    {
      name: 'Fee Status – Class/Division Wise',
      id: 'feeStatusClassDivision',
      icon: 'mdi:account-multiple-outline',
    },
    {
      name: 'Pending Fee – Core',
      id: 'pendingCore',
      icon: 'mdi:alert-circle-outline',
    },
    {
      name: 'Pending Fee – Detailed',
      id: 'pendingDetailed',
      icon: 'mdi:filter-outline',
    },
    {
      name: 'Pending Fee – Total Summary',
      id: 'pendingTotal',
      icon: 'mdi:calculator-variant-outline',
    },
    {
      name: 'Exemption & NA Reports',
      id: 'exemptionReports',
      icon: 'mdi:shield-off-outline',
    },
    {
      name: 'Student Centric Reports',
      id: 'studentCentric',
      icon: 'mdi:human-child',
    },
    {
      name: 'Misc / Admin Reports',
      id: 'miscAdmin',
      icon: 'mdi:cog-outline',
    },
    {
      name: 'Fee Collection',
      id: 'feeCollection',
      icon: 'mdi:cash-multiple',
    },
    {
      name: 'Receipt List',
      id: 'receiptList',
      icon: 'mdi:receipt-text-outline',
    },
    {
      name: 'Receipt List – FeeHead & Student',
      id: 'receiptListAdvanced',
      icon: 'mdi:receipt-text',
    },
    {
      name: 'Receipt Summary',
      id: 'receiptSummary',
      icon: 'mdi:chart-timeline-variant',
    },
    {
      name: 'Receipt Summary – Advanced',
      id: 'receiptSummaryAdvanced',
      icon: 'mdi:chart-areaspline',
    },
    {
      name: 'Certificates & Register',
      id: 'certificatesRegister',
      icon: 'mdi:certificate-outline',
    },
    {
      name: 'Setup & Configuration',
      id: 'setupConfig',
      icon: 'mdi:tools',
    },
    {
      name: 'Student Focused',
      id: 'studentFocused',
      icon: 'mdi:account-details-outline',
    },
  ];

  const feeStatusGeneralSubCategories = FeeStatusReportTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `FeeStatusGeneral-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'feeStatusGeneral',
    render: () => <FeeStatusGeneralReports report={opt.name} />,
  }));

  const feeStatusClassDivisionSubCategories = FeeStatusClassDivReportsTitleOptions.map(
    (opt, index) => ({
      name: opt.label,
      id: `FeeStatusClassDivision-${opt.label.replace(/\s+/g, '-')}-${index}`,
      icon: '',
      description: opt.label,
      categoryId: 'feeStatusClassDivision',
      render: () => <FeeStatusClassDivisionReports report={opt.name} />,
    })
  );

  const pendingCoreSubCategories = PendingCoreReportsTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `PendingCore-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'pendingCore',
    render: () => <PendingCoreReports report={opt.name} />,
  }));

  const pendingDetailedSubCategories = PendingDetailedReportsTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `PendingDetailed-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'pendingDetailed',
    render: () => <PendingDetailedReports report={opt.name} />,
  }));

  const pendingTotalSubCategories = PendingTotalReportsTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `PendingTotal-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'pendingTotal',
    render: () => <PendingTotalReports report={opt.name} />,
  }));

  const exemptionReportsSubCategories = ExemptionNAReportsTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `ExemptionNA-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'exemptionReports',
    render: () => <ExemptionNAReports report={opt.name} />,
  }));

  const studentCentricSubCategories = StudentCentricReportsTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `StudentCentric-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'studentCentric',
    render: () => <StudentCentricReports report={opt.name} />,
  }));

  const miscAdminSubCategories = MiscAdminReportsTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `MiscAdmin-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'miscAdmin',
    render: () => <MiscAdminReports report={opt.name} />,
  }));

  const feeCollectionSubCategories = FeeCollectionReportsTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `FeeCollection-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'feeCollection',
    render: () => <FeeCollectionReports report={opt.name} />,
  }));

  const receiptListSubCategories = ReceiptListReportsTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `ReceiptList-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'receiptList',
    render: () => <ReceiptListReports report={opt.name} />,
  }));

  const receiptListAdvancedSubCategories = ReceiptListFeeHeadStudentReportsTitleOptions.map(
    (opt, index) => ({
      name: opt.label,
      id: `ReceiptListAdvanced-${opt.label.replace(/\s+/g, '-')}-${index}`,
      icon: '',
      description: opt.label,
      categoryId: 'receiptListAdvanced',
      render: () => <ReceiptListFeeHeadStudentReports report={opt.name} />,
    })
  );

  const receiptSummarySubCategories = ReceiptSummaryReportsTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `ReceiptSummary-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'receiptSummary',
    render: () => <ReceiptSummaryReports report={opt.name} />,
  }));

  const receiptSummaryAdvancedSubCategories = ReceiptSummaryAdvancedReportTitleOptions.map(
    (opt, index) => ({
      name: opt.label,
      id: `ReceiptSummaryAdvanced-${opt.label.replace(/\s+/g, '-')}-${index}`,
      icon: '',
      description: opt.label,
      categoryId: 'receiptSummaryAdvanced',
      render: () => <ReceiptSummaryAdvancedReports report={opt.name} />,
    })
  );

  const certificatesRegisterSubCategories = CertificateRegisterReportTitleOptions.map(
    (opt, index) => ({
      name: opt.label,
      id: `CertificatesRegister-${opt.label.replace(/\s+/g, '-')}-${index}`,
      icon: '',
      description: opt.label,
      categoryId: 'certificatesRegister',
      render: () => <CertificateRegisterReports report={opt.name} />,
    })
  );

  const setupConfigSubCategories = SetupConfigReportTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `SetupConfig-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'setupConfig',
    render: () => <SetupConfigReports report={opt.name} />,
  }));

  const studentFocusedSubCategories = StudentFocusedReportsTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `StudentFocused-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'studentFocused',
    render: () => <StudentFocusedReports report={opt.name} />,
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Generate Reports"
        description="Generate and export various finance reports."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Reports' },
          { name: 'Generate Reports' },
        ]}
        isBack={addReportDialog?.value}
        onBack={() => {
          addReportDialog?.onFalse();
        }}
      />

      <CommonReport
        categories={categories}
        subCategories={[
          ...feeStatusGeneralSubCategories,
          ...feeStatusClassDivisionSubCategories,
          ...pendingCoreSubCategories,
          ...pendingDetailedSubCategories,
          ...pendingTotalSubCategories,
          ...exemptionReportsSubCategories,
          ...studentCentricSubCategories,
          ...miscAdminSubCategories,
          ...feeCollectionSubCategories,
          ...receiptListSubCategories,
          ...receiptListAdvancedSubCategories,
          ...receiptSummarySubCategories,
          ...receiptSummaryAdvancedSubCategories,
          ...certificatesRegisterSubCategories,
          ...setupConfigSubCategories,
          ...studentFocusedSubCategories,
        ]}
      />
    </Box>
  );
};

export default FinanceReports;
