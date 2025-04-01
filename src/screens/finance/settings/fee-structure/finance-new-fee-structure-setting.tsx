'use client';

import React, { useState } from 'react';

import { Box, Button, Switch, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DeleteConfirmationDialog } from 'src/components/delete-confirmation';

import FinanceAddFeeCategorySettingDialog from './component/finance-add-fee-category-setting-dialog';
import FinanceEditFeeStructureSettingDialog from './component/finance-edit-fee-structure-setting-dialog';

const initialData: any = [
  {
    id: 1,
    totalPayableFee: 75000,
    totaldiscountAmount: 2000,
    grossFee: 77000,
    applicableGrade: '1',
    bookRecipt: 'CBSE',
    feeSubCategoryList: [
      {
        id: 1,
        receiptBook: 'CBSE',
        feeHead: 'Tuition',
        grossFee: 5000,
        payableFee: 4500,
        generalDiscount: 500,
        discountAmount: 0,
        discountRemark: '',
        paymentMethod: ['cash', 'online'],
        lateFeeChargesType: 'perDay',
        lateFeeChargesAmount: '1',
        isActive: true,
        paymentDueDate: '20-05-2025',
        applicableClass: ['1', '2', '3'],
      },
      {
        receiptBook: 'CBSE',
        feeHead: 'Admission',
        grossFee: 1000,
        payableFee: 1000,
        discountAmount: 0,
        discountRemark: '',
        paymentMethod: ['cash'],
        lateFeeChargesType: 'fixed',
        lateFeeChargesAmount: '1000',
        isActive: true,
        paymentDueDate: '20-04-2024',
        applicableClass: ['1'],
      },
    ],
    isActive: true,
  },
];

const FinanceNewFeeStructureSetting = () => {
  const dialog = useBoolean();
  const financeEditFeeStructureDialog = useBoolean();
  const dialogForDeleteConfirmation = useBoolean();

  const [selectedEntry, setSelectedEntry] = useState<any[]>(initialData);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState<any[]>(initialData);

  const [open, setOpen] = useState(false);

  const closeHandler = () => {
    setIsEdit(false);
    setOpen(false);
  };

  const newEntryHandler = () => {
    setIsEdit(false);
    setOpen(true);
  };

  return (
    <>
      {open ? (
        <FinanceAddFeeCategorySettingDialog
          onSave={() => {}}
          dialogValue={dialog.value}
          onClose={closeHandler}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
        />
      ) : (
        <>
          <Box
            pb="20px"
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <CustomBreadcrumbs
              heading="Fee Structure"
              links={[
                { name: 'Finance', href: '/finance/dashboard' },
                { name: 'Settings' },
                { name: 'Fee Structure' },
              ]}
              description="This is the Fee Structure section, where you can create, enable, or disable fee structures as needed."
              sx={{ px: 1, mb: 2 }}
            />
            <Box display="flex" flexDirection="row" justifyContent="flex-end">
              <Button
                startIcon={<Iconify icon="ic:outline-plus" />}
                onClick={newEntryHandler}
                variant="contained"
                size="small"
              >
                New Fee Structure
              </Button>
            </Box>
          </Box>

          <CustomizableTable
            tableId="finance-fee-structure-setting-tab"
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
                id: 'totalPayableFee',
                label: 'Payable Fees',
                render(value, row) {
                  return (
                    <Typography sx={{ fontSize: '12px' }}>{formatNumber(value, 'INR')}</Typography>
                  );
                },
              },

              {
                id: 'isActive',
                label: 'InActive/Active',
                render(statusToggle) {
                  return <Switch value={statusToggle} />;
                },
              },
              {
                id: 'action',
                label: 'Action',
                render(value, row: any) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showDeleteIcon
                      handleDeleteClick={() => {
                        dialogForDeleteConfirmation.onTrue();

                        // handleDelete(row);
                      }}
                      showEditIcon
                      handleEditClick={() => {
                        setSelectedEntry(row);

                        dialog.onFalse();
                        financeEditFeeStructureDialog.onTrue();
                      }}
                    />
                  );
                },
              },
            ]}
            data={tableData}
          />
        </>
      )}

      {dialogForDeleteConfirmation.value && (
        <DeleteConfirmationDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          onConfirm={() => {}}
          title="Delete Item"
          description="Are you sure you want to delete this item? This action cannot be undone."
        />
      )}
      {financeEditFeeStructureDialog.value && (
        <FinanceEditFeeStructureSettingDialog
          data={selectedEntry}
          dialogValue={financeEditFeeStructureDialog.value}
          onClose={() => {
            financeEditFeeStructureDialog.onFalse();
          }}
        />
      )}
    </>
  );
};

export default FinanceNewFeeStructureSetting;
