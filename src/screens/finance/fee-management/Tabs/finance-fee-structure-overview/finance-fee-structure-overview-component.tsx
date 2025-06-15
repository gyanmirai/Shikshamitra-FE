'use client';

import type { IFeeItem } from 'src/screens/finance/settings/fee-structure/fee-structure-interface';

import React, { useState } from 'react';

import { Box, Tooltip, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import feeStructureData from 'src/json/finance/fee-management/feeStructureData.json';
import ReadOnlyFeeStructureTable from 'src/screens/finance/settings/fee-structure/component/read-only-fee-structure-table';

import CustomDialog from 'src/components/customDialog';
import { Iconify } from 'src/components/iconify/iconify';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const FinanceFeeStructureOverviewComponent = () => {
  // Boolean state to control the visibility of detailed fee structure dialog/modal
  const detaiFeeStructure = useBoolean();

  // State to store and manage the fee structure table data, initialized with dummy data
  const [tableData, setTableData] = useState<IFeeStructure[]>(feeStructureData);

  // State to store the selected fee structure items when a row is clicked/selected
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<IFeeItem[]>();

  return (
    <>
      <CustomBreadcrumbs
        description="Here, you can view all active fee structures. If you wish to make any changes, go to Settings > Fee Structure Settings and update them accordingly. Note: Editing access is based on user permissions, so make sure you have the necessary rights."
        heading="Fee Structure Overview"
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fee Management', href: '/finance/fee-management/fee-structure-overview/' },
          { name: 'Fee Structure Overview' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />

      <Box pb="10px">
        <CustomizableTable
          noDataText={
            <>
              No Fee Structure Available.
              <Box
                component="a"
                display="flex"
                href="/finance/settings/fee-structure"
                color="primary.main"
                fontWeight={600}
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    cursor: 'pointer',
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                Add Fee Structure
              </Box>
            </>
          }
          tableId="fee-structure-overview"
          searchFieldProps={{
            placeholder: 'Search by Receipt Book, Class..',
            label: 'Search by Receipt Book, Class..',
            sx: {
              maxWidth: '400px',
              width: '100%',
            },
          }}
          columns={[
            {
              id: 'paymentDueDate',
              label: 'Payment Due Date',
              filterType: 'date',
            },
            {
              id: 'bookRecipt',
              label: 'Receipt Book',
              filterType: 'string',
            },

            { id: 'applicableGrade', label: 'Class', filterType: 'number' },

            {
              id: 'grossFee',
              label: 'Gross Fees',
              filterType: 'formattedNumber',
              align: 'right',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>{formatNumber(value, 'INR')}</Typography>
                );
              },
            },
            {
              id: 'totaldiscountAmount',
              label: 'General Discount',
              filterType: 'formattedNumber',
              align: 'right',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>{formatNumber(value, 'INR')}</Typography>
                );
              },
            },
            {
              id: 'payableFees',
              label: 'Payable Fees',
              filterType: 'formattedNumber',
              align: 'right',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>{formatNumber(value, 'INR')}</Typography>
                );
              },
            },

            {
              id: 'action',
              label: 'Action',
              isSort: false,
              isFilter: false,

              sticky: true,
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
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Detail Fee Structure Of Class 1</Typography>
            <Tooltip
              arrow
              placement="right"
              title="This is the detailed fee structure for class 1, applicable to all students of that class except for specific scenarios."
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
        <Scrollbar sx={{ p: 2, height: '600px' }}>
          <ReadOnlyFeeStructureTable data={selectedFeeStructure || []} />
        </Scrollbar>
      </CustomDialog>
    </>
  );
};

export default FinanceFeeStructureOverviewComponent;
