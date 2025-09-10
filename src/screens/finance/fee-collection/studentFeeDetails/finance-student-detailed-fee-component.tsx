'use client';

import React, { useState } from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify/iconify';
import { Box, Tab, Card, Button, Typography } from '@mui/material';
import data from 'src/json/finance/fee-collection/student-additional-discount.json';

import { students } from './student-fee-data/student-fee-data';
import FeeRefundScreen from '../../fee-refund/fee-refund-screen';
import FinanceCollectCharges from '../charges/component/collect-charges';
import FinanceStudentFeeBreakdownTab from './finance-student-fee-breakdown-tab';
import FeeCollectionTable from '../new-collect-fee/component/new-fee-collection-tableview';
import FinanceStudentAdditionalDiscountDialog from './component/student-additional-discount';
import FinanceFeeCollectionCharges from '../collectFees/new-component/finance-fee-collection-charges';
import FinanceStudentPendingFeeTab from '../collectFees/new-component/finance-student-pending-fee-tab';
import FinanceFeeRefundAllocationDialog from '../../fee-refund/component/finance-fee-refund-allocated';
// import FinanceFeeCollectionRefundTab from '../feeRefund/finance-fee-collection-refund';
import FinanceFeeCollectionPaymentHistoryComponent from '../collectFees/new-component/finance-fee-collection-payment-history-component';

import type { Student } from './student-fee-data/student-fee-data';

const TABS = [
  {
    value: 'fee-breakdown',
    label: 'Fee Breakdown',
    component: () => <FinanceStudentFeeBreakdownTab />,
  },
  {
    value: 'payment-history',
    label: 'Payment History',
    component: () => <FinanceFeeCollectionPaymentHistoryComponent />,
  },
  {
    value: 'pending-fees',
    label: 'Pending Fees',
    component: () => <FinanceStudentPendingFeeTab />,
  },
  {
    value: 'charges',
    label: 'Charges',
    component: () => <FinanceFeeCollectionCharges />,
  },
  {
    value: 'fee-refund',
    label: 'Refund History',
    component: () => <FeeRefundScreen fromStudentDetailedView />,

    // <FinanceFeeRefundHistory />,
  },
];

interface FinanceStudentDetailedFeeComponentProps {
  studentId: string;
}

const FinanceStudentDetailedFeeComponent: React.FC<FinanceStudentDetailedFeeComponentProps> = ({
  studentId,
}) => {
  const tabs = useTabs('fee-breakdown');
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  // Dialog state management using useBoolean hook
  const dialog = useBoolean();
  const feeRefundDialog = useBoolean();
  const financeStudentAdditionalDiscountDialog = useBoolean();
  const collectChargesDialog = useBoolean();

  // State to track the currently selected student, initialized with first student
  const [selectedStudent, setSelectedStudent] = useState<Student>(students[0]);

  // Handler to close the main fee collection dialog
  const closeDialog = () => {
    dialog.onFalse();
  };

  // Handler to close the fee refund dialog
  const feeRefundCloseDialog = () => {
    feeRefundDialog.onFalse();
  };

  // Handler to close the additional discount dialog
  const additionalDiscountCloseDialog = () => {
    financeStudentAdditionalDiscountDialog.onFalse();
  };
  return (
    <Box py="25px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} px={2}>
        <Typography variant="h6">Detailed Fee View</Typography>

        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Button
            onClick={() => {
              feeRefundDialog.onFalse();
              dialog.onFalse();
              setSelectedStudent(students[0]);
              financeStudentAdditionalDiscountDialog.onTrue();
            }}
            startIcon={<Iconify icon="iconamoon:discount-thin" />}
            variant="outlined"
            sx={{ backgroundColor: 'transparent', color: '#1a91bc' }}
          >
            Additional Discount
          </Button>

          <Button
            onClick={() => {
              financeStudentAdditionalDiscountDialog.onFalse();
              feeRefundDialog.onFalse();
              setSelectedStudent(students[0]);
              dialog.onTrue();
            }}
            startIcon={<Iconify icon="game-icons:receive-money" />}
            variant="outlined"
            color="primary"
          >
            Collect Fees
          </Button>

          <Button
            onClick={() => {
              feeRefundDialog.onFalse();
              dialog.onFalse();
              setSelectedStudent(students[0]);
              collectChargesDialog.onTrue();
            }}
            startIcon={<Iconify icon="fa6-solid:piggy-bank" />}
            variant="outlined"
            color="secondary"
          >
            Collect Charges
          </Button>

          <Button
            onClick={() => {
              financeStudentAdditionalDiscountDialog.onFalse();
              dialog.onFalse();
              setSelectedStudent(students[0]);
              feeRefundDialog.onTrue();
            }}
            startIcon={
              <Iconify
                icon="game-icons:pay-money"
                style={{
                  fontSize: '24px',
                  fill: '#000',
                  stroke: '#000',
                  strokeWidth: '1.5px',
                }}
              />
            }
            variant="outlined"
            sx={{ backgroundColor: 'transparent', color: '#ad7c00' }}
          >
            Process For Refund
          </Button>
        </Box>
      </Box>

      <Card>
        <CustomTabs value={tabs.value} onChange={tabs.onChange} variant="fullWidth">
          {TABS.map((tab) => (
            <Tab sx={{ fontSize: '12px' }} key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {CurrentComponent?.()}
      </Box>

      {financeStudentAdditionalDiscountDialog.value && (
        <FinanceStudentAdditionalDiscountDialog
          dialogValue={financeStudentAdditionalDiscountDialog.value}
          onClose={additionalDiscountCloseDialog}
          studentData={data}
        />
      )}
      {dialog.value && (
        <CustomDialog
          maxWidth="xl"
          open={dialog.value}
          handleClose={() => {
            dialog.onFalse();
          }}
          title="Collect Fees"
        >
          <FeeCollectionTable />
        </CustomDialog>
      )}

      {collectChargesDialog.value && (
        <FinanceCollectCharges
          dialogValue={collectChargesDialog.value}
          onClose={() => {
            collectChargesDialog.onFalse();
          }}
          data={selectedStudent}
        />
      )}

      {feeRefundDialog.value && (
        <FinanceFeeRefundAllocationDialog
          dialogValue={feeRefundDialog.value}
          onClose={feeRefundCloseDialog}
          selectedData={selectedStudent}
        />
      )}
    </Box>
  );
};

export default FinanceStudentDetailedFeeComponent;
