'use client';

import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';

import { Box, Paper, Button, Switch, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinanceAddFeeCategorySettingDialog from './component/finance-add-fee-category-setting-dialog';

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

}

const initialData: Data[] = [
  {
    id: 1,
    totalAmount: "75000",
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
        discountCategory: "Summer Campaign"

      },
      {
        id: 2,
        name: 'Sports Fee',
        amount: '15000',
        isCounted: false,
        value: 'sportsFee',
        paymentMethod: ['cash', 'online'],
        discountAmount: 0,
        discountCategory: "-"
      },
      {
        id: 3,
        name: 'Transport Fee',
        amount: '10000',
        isCounted: true,
        value: 'transportFee',
        paymentMethod: ['cash', 'online'],
        discountAmount: 0,
        discountCategory: "-"
      },
    ],
    statusToggle: true,
    action: 'View',
  },
];

const FinanceFeeStructureSettingTab = () => {
  const dialog = useBoolean();

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
      totalAmount
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
      const newFeeStructure: Data = {
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

  return (
    <>
    <CustomBreadcrumbs
        heading="Fee Structure"
        links={[{ name: 'Finance' },{ name: 'Settings' }, { name: 'Fee Structure' },]}
        sx={{ px: 1, mb: 2 }}

      />
      <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
        {/* <Button variant="contained" size="small">
          Save
        </Button> */}
        <Button onClick={dialog.onTrue} variant="contained" size="small">
          Add New Fee Structure
        </Button>
      </Box>
      <Box>
        {/* <Typography component="span" variant="h6" gutterBottom>
          Fee Categories Overview
        </Typography> */}
      </Box>
      <CustomizableTable
        columns={[
          {
            id: 'bookRecipt',
            label: 'Book Recipt',
            children(row) {
              const switchState = switchStates[row.id] || [];
              return (
                <>
                  {row.feeSubCategoryList.length > 0 ? (
                    <Box display="flex" gap={2} alignItems="center">
                      {row.feeSubCategoryList.map((val: any, index: any) => (
                        <React.Fragment key={index}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Paper elevation={4} sx={{ p: 2, fontSize: "13PX" }}>
                              {val.name}: {formatNumber(val.amount, "INR")}
                              <Switch
                                checked={switchState[index]}
                                onChange={() => handleSwitchChange(row.id, index)}
                              />
                              <Typography fontSize="13PX">Monthly: {formatNumber((val.amount / 12), "INR")}</Typography>
                              <Typography fontSize="13PX">Quartly: {formatNumber((val.amount / 4), "INR")}</Typography>
                              <Typography fontSize="13PX">Bi-annual: {formatNumber((val.amount / 2), "INR")}</Typography>
                              <Typography fontSize="13PX">Yearly: {formatNumber((val.amount), "INR")}</Typography>
                            </Paper>
                          </Box>
                        </React.Fragment>
                      ))}
                    </Box>
                  ) : (
                    <Box>
                      <Typography>No data</Typography>
                    </Box>
                  )}
                </>
              );
            },
          },
          { id: 'applicableGrade', label: 'Applicable Grade' },
          {
            id: 'amount',
            label: 'Amount',
            render(value, row) {
              const totalAmount = row.feeSubCategoryList.reduce(
                (total: any, val: any, index: any) =>
                  switchStates[row.id] && switchStates[row.id][index]
                    ? total + Number(val.amount)
                    : total,
                0
              );

              console.log('Row data:', row);
              console.log('Total amount:', totalAmount);

              return <Typography sx={{ fontSize: '12px' }}>{formatNumber(totalAmount, "INR")}</Typography>;
            },
          },
          {
            id: 'paymentDueDate',
            label: 'Payment Due Date',
          },
          {
            id: 'statustoggle',
            label: 'Unpublish/Publish',
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
                  actions={({ popover }) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          setSelectedEntry(row);
                          setIsEdit(true);
                          dialog.onTrue();
                        }}
                      >
                        <Iconify icon="solar:pen-bold" />
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDelete(row);
                        }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                        Delete
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={tableData}
      />
      {dialog.value && selectedEntry && (
        <FinanceAddFeeCategorySettingDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
        />
      )}
    </>
  );
};

export default FinanceFeeStructureSettingTab;
