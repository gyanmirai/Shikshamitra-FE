'use client';

import type { IFeeItem } from 'src/screens/finance/settings/fee-structure/fee-structure-interface';

import React, { useState } from 'react';

import { Box, Tooltip, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import ReadOnlyFeeStructureTable from 'src/screens/finance/settings/fee-structure/component/read-only-fee-structure-table';

import CustomDialog from 'src/components/customDialog';
import { Iconify } from 'src/components/iconify/iconify';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { initialDataFeeStructure } from '../../data/fee-structure-dummy-data';

const FinanceFeeStructureOverviewComponent = () => {
  // Boolean state to control the visibility of detailed fee structure dialog/modal
  const detaiFeeStructure = useBoolean();

  // State to store and manage the fee structure table data, initialized with dummy data
  const [tableData, setTableData] = useState(initialDataFeeStructure);

  // State to store the selected fee structure items when a row is clicked/selected
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<IFeeItem[]>();
  return (
    <>
      <CustomBreadcrumbs
        description="Here, you can view all active fee structures. If you wish to make any changes, go to Settings > Fee Structure Settings and update them accordingly. Note: Editing access is based on user permissions, so make sure you have the necessary rights."
        heading="Fee Structure"
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fee Management' },
          { name: 'Fee Structure' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box pb="10px">
        <CustomizableTable
          tableId="fee-structure-overview"
          columns={[
            {
              id: 'bookRecipt',
              label: 'Receipt Book',
            },
            { id: 'applicableGrade', label: 'Applicable Class' },

            {
              id: 'grossFee',
              label: 'Gross Fees',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>{formatNumber(value, 'INR')}</Typography>
                );
              },
            },
            {
              id: 'totaldiscountAmount',
              label: 'General Discount',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>{formatNumber(value, 'INR')}</Typography>
                );
              },
            },
            {
              id: 'payableFees',
              label: 'Payable Fees',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>{formatNumber(value, 'INR')}</Typography>
                );
              },
            },

            {
              id: 'paymentDueDate',
              label: 'Payment Due Date',
            },

            {
              id: 'action',
              label: 'Action',
              render(value, row: any) {
                return (
                  <ThreeDotsActions
                    showThreeDots={false}
                    showViewIcon
                    handleViewClick={() => {
                      setSelectedFeeStructure(row.feeSubCategoryList);
                      detaiFeeStructure.onTrue();
                    }}
                  />
                );
              },
            },
          ]}
          data={tableData}
        />
      </Box>

      <CustomDialog
        maxWidth="xl"
        title={
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="h5">Detail Fee Structure For 1st standard</Typography>
            <Tooltip
              arrow
              placement="right"
              title="This is the detailed fee structure for 1st standard, applicable to all students of that class except for specific scenarios."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </Tooltip>
          </Box>
        }
        open={detaiFeeStructure.value}
        handleClose={() => {
          detaiFeeStructure.onFalse();
        }}
      >
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '600px' }}>
          <ReadOnlyFeeStructureTable data={selectedFeeStructure || []} />
        </Scrollbar>
      </CustomDialog>
    </>
  );
};

export default FinanceFeeStructureOverviewComponent;
