'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Button, Switch, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';
import hostelFeeData from 'src/json/hostel/hostelFeeStructure/hostel-fee-data.json';
// import FinanceEditFeeStructureSettingDialog from 'src/screens/finance/settings/fee-structure/component/finance-edit-fee-structure-setting-dialog';

import HostelFeeCategorySettingDialog from './components/feeStrutureForm';

import type { IFeeStrctureData } from './hostelFeeInterface';

const feeHeadList = [
  { value: 'tuitionFee', label: 'Tuition Fee' },
  { value: 'sportsFee', label: 'Sports Fee' },
  { value: 'transportFee', label: 'Transport Fee' },
];

const HostelFeeStructure = (props: TabComponentType) => {
  // Dialog state management using custom boolean hooks
  const dialog = useBoolean();
  const financeEditFeeStructureDialog = useBoolean();
  const dialogForDeleteConfirmation = useBoolean();

  // State for managing selected entries, edit mode, and table data
  const [selectedEntry, setSelectedEntry] = useState<IFeeStrctureData[]>(hostelFeeData.initialData);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState<IFeeStrctureData[]>(hostelFeeData.initialData);
  const [switchStates, setSwitchStates] = useState<Record<number, boolean[]>>({});

  // Initialize switch states for all rows on component mount
  useEffect(() => {
    const initialSwitchStates: Record<number, boolean[]> = {};
    tableData.forEach((row) => {
      initialSwitchStates[row.id] = row.feeSubCategoryList.map(() => true);
    });
    setSwitchStates(initialSwitchStates);
  }, [tableData]);

  // Handle saving of fee structure data from dialog
  const handleSave = (dataFromDialog: any) => {
    // Destructure data from dialog
    const {
      id,
      paymentDueDate,
      multipleApplicableGrade,
      amount,
      applicableGrade,
      bookRecipt,
      feeHead,
      feeAmountForAvailbleHead,
      discountAmount,
      discountCategory,
      totalAmount,
    } = dataFromDialog;

    // Format date and normalize strings
    const formattedPaymentDueDate = dayjs(paymentDueDate).format('DD-MM-YYYY');
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();
    const feeHeadLabel: any = feeHeadList.map((e) => (e.value === feeHead ? e.label : null));

    // Handle edit mode
    if (isEdit) {
      const existingIndex = tableData.findIndex((val) => val.id === id);

      if (existingIndex !== -1) {
        const rowData: any = tableData[existingIndex];

        // Check if fee subcategory already exists
        const existingIndexForSubCategory = rowData.feeSubCategoryList.findIndex(
          (val: any) => normalize(val.value) === normalize(feeHead)
        );

        rowData.paymentDueDate = formattedPaymentDueDate;

        // Update existing subcategory
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
        } else {
          // Add new subcategory
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
        }

        // Update switch states
        setSwitchStates({
          ...switchStates,
          [rowData.id]: rowData.feeSubCategoryList.map(() => true),
        });

        dialog.onFalse();
        return;
      }
    }

    // Handle multiple grade fee structures
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
          },
        ],
        statusToggle: true,
        action: 'View',
      }));

      // Update table data and switch states for multiple structures
      setTableData((prevTableData) => [...prevTableData, ...newFeeStructures]);

      newFeeStructures.forEach((newFeeStructure: any) => {
        setSwitchStates((prevSwitchStates) => ({
          ...prevSwitchStates,
          [newFeeStructure.id]: newFeeStructure.feeSubCategoryList.map(() => true),
        }));
      });
    } else {
      // Handle single fee structure
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

      // Update table data and switch states for single structure
      setTableData((prevTableData) => [...prevTableData, newFeeStructure]);

      setSwitchStates((prevSwitchStates) => ({
        ...prevSwitchStates,
        [newFeeStructure.id]: newFeeStructure.feeSubCategoryList.map(() => true),
      }));
    }

    dialog.onFalse();
  };

  const [open, setOpen] = useState(false);

  // Handler for closing the dialog
  const closeHandler = () => {
    setIsEdit(false);
    setOpen(false);
  };

  // Handler for creating new fee structure
  const newEntryHandler = () => {
    dialog.onTrue();
    setIsEdit(false);
    setOpen(true);
  };
  return (
    <>
      {open ? (
        <CustomDialog
          open={dialog.value}
          handleClose={() => {
            closeHandler();
          }}
          title={isEdit ? 'Edit Fee Structure' : 'Add Fee Structure'}
          maxWidth="md"
        >
          <HostelFeeCategorySettingDialog
            onSave={handleSave}
            dialogValue={dialog.value}
            onClose={closeHandler}
            data={selectedEntry}
            isEdit={isEdit}
            allData={tableData}
          />
        </CustomDialog>
      ) : (
        <>
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

          <CustomizableTable
            tableId="finance-fee-structure-setting-tab"
            columns={[
              {
                id: 'bookRecipt',
                label: 'Receipt Book',
              },
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
                sticky: true,
                isFilter: false,
                isSort: false,
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
      {/* {financeEditFeeStructureDialog.value && (
        <FinanceEditFeeStructureSettingDialog
          data={selectedEntry}
          dialogValue={financeEditFeeStructureDialog}
          onClose={() => {
            financeEditFeeStructureDialog.onFalse();
          }}
          setSelectedEntry={setSelectedEntry}
        />
      )} */}
    </>
  );
};

export default HostelFeeStructure;
