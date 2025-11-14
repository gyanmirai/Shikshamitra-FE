'use client';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Button, Switch, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import FinanceAddFeeCategorySettingDialog from './component/finance-add-fee-category-setting-dialog';
import FinanceEditFeeStructureSettingDialog from './component/finance-edit-fee-structure-setting-dialog';

interface FeeSubCategoryList {
  id: number;
  name: string;
  amount: string;
  isCounted: boolean;
  value: string;
  paymentMethod?: string[];
  discountAmount: number;
  discountCategory: string;
}

const feeHeadList = [
  { value: 'tuitionFee', label: 'Tuition Fee' },
  { value: 'sportsFee', label: 'Sports Fee' },
  { value: 'transportFee', label: 'Transport Fee' },
];

interface Data {
  id: number;
  // feeCategoryName: string;

  applicableGrade: string;
  statusToggle: boolean;
  action: string;
  bookRecipt: string;
  feeSubCategoryList: FeeSubCategoryList[];
  paymentDueDate?: any;
  totalAmount: string;
  totaldiscountAmount: number;
  grossFee: number;
}

const initialData: Data[] = [
  {
    id: 1,
    totalAmount: '75000',
    totaldiscountAmount: 2000,
    grossFee: 77000,
    applicableGrade: '2',
    bookRecipt: 'CBSE',
    paymentDueDate: '20-12-2024',
    feeSubCategoryList: [
      {
        id: 1,
        name: 'Tuition Fee',
        amount: '50000',
        isCounted: true,
        value: 'tuitionFee',
        paymentMethod: ['cash', 'online'],
        discountAmount: 4000,
        discountCategory: 'Summer Campaign',
      },
      {
        id: 2,
        name: 'Sports Fee',
        amount: '15000',
        isCounted: false,
        value: 'sportsFee',
        paymentMethod: ['cash', 'online'],
        discountAmount: 0,
        discountCategory: '-',
      },
      {
        id: 3,
        name: 'Transport Fee',
        amount: '10000',
        isCounted: true,
        value: 'transportFee',
        paymentMethod: ['cash', 'online'],
        discountAmount: 0,
        discountCategory: '-',
      },
    ],
    statusToggle: true,
    action: 'View',
  },
];

const FinanceFeeStructureSettingTab = () => {
  const dialog = useBoolean();
  const financeEditFeeStructureDialog = useBoolean();
  const dialogForDeleteConfirmation = useBoolean();

  const [selectedEntry, setSelectedEntry] = useState<Data[]>(initialData);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState<Data[]>(initialData);
  const [switchStates, setSwitchStates] = useState<Record<number, boolean[]>>({});

  useEffect(() => {
    // Initialize switch states for all rows
    const initialSwitchStates: Record<number, boolean[]> = {};
    initialData.forEach((row) => {
      initialSwitchStates[row.id] = row.feeSubCategoryList.map(() => true);
    });
    setSwitchStates(initialSwitchStates);
  }, []);

  const handleSave = (dataFromDialog: any) => {
    const {
      id,
      paymentDueDate,
      multipleApplicableGrade,
      feeName,
      amount,
      applicableGrade,
      bookRecipt,
      feeHead,
      feeAmountForAvailbleHead,
      discountAmount,
      discountCategory,
      totalAmount,
    } = dataFromDialog;

    const formattedPaymentDueDate = dayjs(paymentDueDate).format('DD-MM-YYYY');
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();
    const feeHeadLabel: any = feeHeadList.map((e) => (e.value === feeHead ? e.label : null));

    console.log('Data from dialog', dataFromDialog);

    if (isEdit) {
      const existingIndex = tableData.findIndex((val) => val.id === id);

      if (existingIndex !== -1) {
        const rowData: any = tableData[existingIndex];

        const existingIndexForSubCategory = rowData.feeSubCategoryList.findIndex(
          (val: any) => normalize(val.value) === normalize(feeHead)
        );

        rowData.paymentDueDate = formattedPaymentDueDate;

        if (existingIndexForSubCategory !== -1) {
          rowData.feeSubCategoryList[existingIndexForSubCategory] = {
            ...rowData.feeSubCategoryList[existingIndexForSubCategory],
            name: feeHeadLabel,
            value: feeHead,
            amount: feeAmountForAvailbleHead || amount,
          };

          const updatedTableData = [...tableData];
          updatedTableData[existingIndex] = rowData;
          setTableData(updatedTableData);

          console.log('Updated rowData', rowData);
        } else {
          rowData.feeSubCategoryList.push({
            id: Math.floor(Math.random() * 10000),
            name: feeHeadLabel,
            amount: feeAmountForAvailbleHead || amount,
            isCounted: true,
            value: normalize(feeHead),
          });

          const updatedTableData = [...tableData];
          updatedTableData[existingIndex] = rowData;
          setTableData(updatedTableData);

          console.log('Added new subcategory', rowData);
        }

        setSwitchStates({
          ...switchStates,
          [rowData.id]: rowData.feeSubCategoryList.map(() => true),
        });

        dialog.onFalse();
        return;
      }
    }

    if (multipleApplicableGrade && multipleApplicableGrade.length > 0) {
      const newFeeStructures = multipleApplicableGrade.map((val: string) => ({
        id: Math.floor(Math.random() * 10000),
        amount,
        applicableGrade: val,
        bookRecipt: bookRecipt.toUpperCase(),
        paymentDueDate: formattedPaymentDueDate,
        feeSubCategoryList: [
          {
            id: Math.floor(Math.random() * 10000),
            name: feeHeadLabel,
            amount,
            isCounted: true,
            value: normalize(feeHead),
            // paymentDueDate: formattedPaymentDueDate,
          },
        ],
        statusToggle: true,
        action: 'View',
      }));

      setTableData((prevTableData) => [...prevTableData, ...newFeeStructures]);

      newFeeStructures.forEach((newFeeStructure: any) => {
        setSwitchStates((prevSwitchStates) => ({
          ...prevSwitchStates,
          [newFeeStructure.id]: newFeeStructure.feeSubCategoryList.map(() => true),
        }));
      });
    } else {
      // Single fee structure case
      const newFeeStructure: any = {
        id: Math.floor(Math.random() * 10000),
        totalAmount,
        applicableGrade,
        bookRecipt: bookRecipt.toUpperCase(),
        paymentDueDate: formattedPaymentDueDate,
        feeSubCategoryList: [
          {
            id: Math.floor(Math.random() * 10000),
            name: feeHeadLabel,
            amount,
            isCounted: true,
            value: normalize(feeHead),
            discountAmount,
            discountCategory,
          },
        ],
        statusToggle: true,
        action: 'View',
      };

      setTableData((prevTableData) => [...prevTableData, newFeeStructure]);

      setSwitchStates((prevSwitchStates) => ({
        ...prevSwitchStates,
        [newFeeStructure.id]: newFeeStructure.feeSubCategoryList.map(() => true),
      }));
    }

    dialog.onFalse();
  };

  const handleSwitchChange = (rowId: number, index: number) => {
    const updatedSwitchState = { ...switchStates };
    updatedSwitchState[rowId][index] = !updatedSwitchState[rowId][index];
    setSwitchStates(updatedSwitchState);
  };

  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };

  const handleDelete = (rowData: any) => {
    const updatedData = tableData.filter((val) => val.id !== rowData.id);
    setTableData(updatedData);
  };
  const [data, setData] = useState(initialData);
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
          onSave={handleSave}
          dialogValue={dialog}
          onClose={closeHandler}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
          setSelectedEntry={setSelectedEntry}
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
              links={[{ name: 'Finance' }, { name: 'Settings' }, { name: 'Fee Structure' }]}
              sx={{ mb: 2 }}
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
              { id: 'applicableGrade', label: 'Class' },

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
                id: 'amount',
                label: 'Payable Fees',
                render(value, row) {
                  const totalAmount = row.feeSubCategoryList.reduce(
                    (total: any, val: any, index: any) =>
                      switchStates[row.id] && switchStates[row.id][index]
                        ? total + Number(val.amount)
                        : total,
                    0
                  );

                  return (
                    <Typography sx={{ fontSize: '12px' }}>
                      {formatNumber(totalAmount, 'INR')}
                    </Typography>
                  );
                },
              },

              {
                id: 'paymentDueDate',
                label: 'Payment Due Date',
              },
              {
                id: 'statustoggle',
                label: 'Active',
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
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          title="Delete Item"
          content="Are you sure you want to delete?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={() => {}}>
              Yes
            </LoadingButton>
          }
        />
        // <DeleteConfirmationDialog
        //   open={dialogForDeleteConfirmation.value}
        //   onClose={() => {
        //     dialogForDeleteConfirmation.onFalse();
        //   }}
        //   onConfirm={() => {}}
        //   title="Delete Item"
        //   description="Are you sure you want to delete this item? This action cannot be undone."
        // />
      )}
      {financeEditFeeStructureDialog.value && (
        <FinanceEditFeeStructureSettingDialog
          data={selectedEntry}
          dialogValue={financeEditFeeStructureDialog}
          onClose={() => {
            financeEditFeeStructureDialog.onFalse();
          }}
          setSelectedEntry={setSelectedEntry}
        />
      )}
    </>
  );
};

export default FinanceFeeStructureSettingTab;
