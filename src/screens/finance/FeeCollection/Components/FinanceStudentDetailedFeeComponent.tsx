'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { PaymentHistoryItem } from 'src/redux/feeCollection/feeCollection';

import React, { useState } from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Box, Tab, Card, Button } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify/iconify';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import FinanceFeeAuditDrawer from 'src/screens/finance/AuditTrail/components/FinanceFeeAuditDrawer';
import { useFinancePermissions } from 'src/screens/finance/hooks/useFinancePermissions';

import FeeConcession from './ViewDetailsComponent/FeeConcession';
import PaymentHistory from './ViewDetailsComponent/PaymentHistory';
import OutstandingFee from './ViewDetailsComponent/OutstandingFees';
import OverviewFeeDetails from './ViewDetailsComponent/OverviewFeeDetails';

import type { IStudentFee } from './type';

const TABS = [
  {
    value: 'overview',
    label: 'Overview',
    icon: <Iconify icon="mdi:chart-line" />, // example icon
    component: ({ student }: { student: IStudentFee | null }) => (
      <OverviewFeeDetails student={student} />
    ),
  },
  {
    value: 'outstanding-fees',
    label: 'Outstanding Fees',
    icon: <Iconify icon="mdi:clock-outline" />,
    component: ({ student }: { student: IStudentFee | null }) => (
      <OutstandingFee student={student} />
    ),
  },
  {
    value: 'payment-history',
    label: 'Payment History',
    icon: <Iconify icon="mdi:bank-outline" />,
    component: ({ payments }: { payments?: PaymentHistoryItem[] }) => (
      <PaymentHistory payments={payments} />
    ),
  },
  {
    value: 'concessions',
    label: 'Concessions',
    icon: <Iconify icon="mdi:cash-refund" />,
    component: ({ student }: { student: IStudentFee | null }) => (
      <FeeConcession student={student} />
    ),
  },
];

interface FinanceStudentDetailedFeeComponentProps {
  studentId: string;
  student: IStudentFee | null;
  payments?: PaymentHistoryItem[];
  collectFeesDialog: UseBooleanReturn;
  viewDialog: UseBooleanReturn;
}

const FinanceStudentDetailedFeeComponent: React.FC<FinanceStudentDetailedFeeComponentProps> = ({
  studentId,
  student,
  payments,
  collectFeesDialog,
  viewDialog,
}) => {
  const collectionAccess = useFinancePermissions('Finance.Fees.FeeCollections');
  const auditAccess = useFinancePermissions('Finance.Auditing');
  // Initialize tab state, defaulting to 'overview'
  const tabs = useTabs('overview');
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);

  // Find the currently selected tab's component to render
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  const studentDisplayName =
    student?.name ?? (student as { studentName?: string })?.studentName ?? undefined;

  return (
    <Card sx={{ boxShadow: 'var(--shadows-4)' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pr: 2,
          mt: 2,
        }}
      >
        <CustomTabs value={tabs.value} onChange={tabs.onChange}>
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {tab.icon}
                  {tab.label}
                </Box>
              }
              sx={{
                fontSize: '14px',
                textTransform: 'none',
              }}
            />
          ))}
        </CustomTabs>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {auditAccess.canView && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="mdi:history" />}
              onClick={() => setAuditDrawerOpen(true)}
            >
              Audit Trail
            </Button>
          )}
          {collectionAccess.canAdd && (
            <Button
              variant="contained"
              startIcon={<CreditCardIcon />}
              color="primary"
              size="small"
              onClick={() => {
                if (!collectionAccess.canAdd) return;
                collectFeesDialog.onTrue();
                viewDialog.onFalse();
              }}
            >
              Collect Fees
            </Button>
          )}
        </Box>
      </Box>

      <FinanceFeeAuditDrawer
        open={auditDrawerOpen}
        studentId={studentId}
        studentName={studentDisplayName}
        onClose={() => setAuditDrawerOpen(false)}
      />

      <Box px={1} pt={2}>
        {CurrentComponent?.({ student, payments })}
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mt: 2,
          ml: 1,
          mb: 2,
          alignItems: 'center',
          justifyItems: 'space-between',
        }}
      >
        {/* <Button variant="outlined" startIcon={<ArrowForwardIcon />} size="small">
          Send Reminder
        </Button> */}
      </Box>
    </Card>
  );
};

export default FinanceStudentDetailedFeeComponent;
