"use client";

import React, { useState, useEffect } from 'react';

import { Box, Button, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceExpenseAddSettingDialog from './component/finance-expense-add-setting-dialog';

let data = [
  {
    categoryName: 'Salaries',
    parentCategory: '-',
    assignDepartment: 'Teacher',
    budgetLimit: 5000000,
    action: 'View',
  },
  {
    categoryName: 'Salaries',
    parentCategory: '-',
    assignDepartment: 'Admin',
    budgetLimit: 400000,
    action: 'View',
  },
  {
    categoryName: 'Salaries',
    parentCategory: '-',
    assignDepartment: 'Helper',
    budgetLimit: 100000,
    action: 'View',
  },
];

const FinanceExpenseSettingTab = () => {
  const dialog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState(data);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(data);

  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };

  useEffect(() => {}, [selectedEntry, isEdit]);
  const handleSave = (dataFromDialog: any) => {
    const { categoryName, parentCategory, assignDepartment, budgetLimit } = dataFromDialog;

    if (dataFromDialog) {
      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();
      const existingEntryIndex = data.findIndex(
        (val) =>
          normalize(categoryName) === normalize(val.categoryName) &&
          normalize(assignDepartment) === normalize(val.assignDepartment)
      );

      if (existingEntryIndex !== -1 && !isEdit) {
        closeDialog();

        return;
      }

      const expenseSetting = {
        categoryName,
        parentCategory,
        assignDepartment,
        budgetLimit,
        action: 'View',
      };

      if (!isEdit && existingEntryIndex === -1) {
        data.push(expenseSetting);
      } else if (isEdit && existingEntryIndex !== -1) {
        const changeCategory = data[existingEntryIndex];
        changeCategory.categoryName = categoryName;
        changeCategory.parentCategory = parentCategory;
        changeCategory.assignDepartment = assignDepartment;
        changeCategory.budgetLimit = budgetLimit;
      }
    }
    closeDialog();
    console.log(dataFromDialog);
  };

  const handleDelete = (item: any) => {
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

    data = data.filter(
      (val) =>
        normalize(val.categoryName) !== normalize(item.categoryName) ||
        normalize(val.assignDepartment) !== normalize(item.assignDepartment)
    );

    setTableData([...data]);
  };

  return (
    <>
      <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
        <Button onClick={dialog.onTrue} variant="contained" size="small">
          Create New Category
        </Button>
      </Box>
      <Box>
        <Typography component="span" variant="h6" gutterBottom>
          Expense Categories Overview
        </Typography>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'categoryName', label: 'Category Name' },
          { id: 'parentCategory', label: 'Parent Category' },
          { id: 'assignDepartment', label: 'Assign Department' },
          { id: 'budgetLimit', label: 'Budget Limit' , render(value) {

            return (
              <Typography fontSize="12px">
                {formatNumber(value, "INR")}
              </Typography>
            );
          },},
          {
            id: 'action',
            label: 'Action',
            render(value, row: any) {
              return (
                <ThreeDotsActions
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          setIsEdit(true);
                          setSelectedEntry(row);

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
      <Box>
        {dialog.value && selectedEntry && (
          <FinanceExpenseAddSettingDialog
            onSave={handleSave}
            dialogValue={dialog.value}
            onClose={closeDialog}
            data={selectedEntry}
            isEdit={isEdit}
            allData={tableData}
          />
        )}
      </Box>
    </>
  );
};

export default FinanceExpenseSettingTab;
