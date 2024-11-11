import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';

import { Box, Paper, Button, Switch, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceAddFeeCategorySettingDialog from './component/finance-add-fee-category-setting-dialog';

interface FeeSubCategoryList {
  id: number;
  name: string;
  amount: string;
  isCounted: boolean;
  value: string;
  paymentMethod?: string;
}

const feeHeadList = [
  { value: 'tuitionFee', label: 'Tuition Fee' },
  { value: 'sportsFee', label: 'Sports Fee' },
  { value: 'transportFee', label: 'Transport Fee' },
];

interface Data {
  id: number;
  // feeCategoryName: string;
  amount: string;
  applicableGrade: string;
  statusToggle: boolean;
  action: string;
  bookRecipt: string;
  feeSubCategoryList: FeeSubCategoryList[];
  paymentDueDate?: any;
}

const initialData: Data[] = [
  {
    id: 1,
    amount: '3,000',
    applicableGrade: '2',
    bookRecipt: 'CBSE',
    paymentDueDate: '20-12-2024',
    feeSubCategoryList: [
      {
        id: 1,
        name: 'Tuition Fee',
        amount: '500',
        isCounted: true,
        value: 'tuitionFee',
        paymentMethod: 'Cash',
      },
      {
        id: 2,
        name: 'Sports Fee',
        amount: '1500',
        isCounted: false,
        value: 'sportsFee',
        paymentMethod: 'Cash',
      },
      {
        id: 3,
        name: 'Transport Fee',
        amount: '1000',
        isCounted: true,
        value: 'transportFee',
        paymentMethod: 'Check',
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
        amount,
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
      <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
        <Button variant="contained" size="small">
          Save
        </Button>
        <Button onClick={dialog.onTrue} variant="contained" size="small">
          Add New Fee Category
        </Button>
      </Box>
      <Box>
        <Typography component="span" variant="h6" gutterBottom>
          Fee Categories Overview
        </Typography>
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
                            <Paper elevation={4} sx={{ p: 2 }}>
                              {val.name}: {val.amount}
                              <Switch
                                checked={switchState[index]}
                                onChange={() => handleSwitchChange(row.id, index)}
                              />
                              <Typography>Monthly: {(val.amount / 12).toFixed(2)}</Typography>
                              <Typography>Quartly: {(val.amount / 4).toFixed(2)}</Typography>
                              <Typography>Bi-annual: {(val.amount / 2).toFixed(2)}</Typography>
                              <Typography>Yearly: {val.amount}</Typography>
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

              return <Typography sx={{ fontSize: '14px' }}>{totalAmount}</Typography>;
            },
          },
          {
            id: 'paymentDueDate',
            label: 'Payment Due Date',
          },
          {
            id: 'statustoggle',
            label: 'Status Toggle',
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
