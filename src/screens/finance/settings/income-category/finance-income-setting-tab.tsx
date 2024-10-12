import React, { useState, useEffect } from 'react'

import { Box, Button, MenuItem, MenuList, Typography, } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceIncomeCategoryAddSettingDialog from './component/finance-income-category-add-setting-dialog';


let data = [
    {

        categoryName: 'Tuition Fees',
        description: '-',
        incomeType: 'Fees',
        amount: 5000000,
        action: 'View',
    },
    {

        categoryName: 'Donation',
        description: '-',
        incomeType: 'Donation',
        amount: 5000000,
        action: 'View',
    }, {

        categoryName: 'Grant',
        description: '-',
        incomeType: 'Grant',
        amount: 5000000,
        action: 'View',
    },

];

const FinanceIncomeSettingTab = () => {
    const dialog = useBoolean();
    const [selectedEntry, setSelectedEntry] = useState(data);
    const [isEdit, setIsEdit] = useState(false);
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
    const [tableData, setTableData] = useState(data);


    const handleCloseDuplicateDialog = () => {
        setShowDuplicateDialog(false);
    };

    const closeDialog = () => {
        setIsEdit(false)
        dialog.onFalse();
    }

    useEffect(() => { }, [selectedEntry, isEdit]);

    const handleSave = (dataFromDialog: any) => {
        const { categoryName, description, incomeType, effectiveDate, amount } = dataFromDialog;

        if (dataFromDialog) {
            const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();
            const existingEntryIndex = data.findIndex(val =>
                normalize(categoryName) === normalize(val.categoryName) &&
                normalize(incomeType) === normalize(val.incomeType)
            );

            if (existingEntryIndex !== -1 && !isEdit) {
                setShowDuplicateDialog(true);
                closeDialog();

                return;
            }

            const incomeSetting = {
                categoryName,
                description,
                incomeType,
                amount,
                action: 'View',
            };

            if (!isEdit && existingEntryIndex === -1) {
                data.push(incomeSetting);
            } else if (isEdit && existingEntryIndex !== -1) {
                const changeCategory = data[existingEntryIndex];
                changeCategory.categoryName = categoryName;
                changeCategory.incomeType = incomeType;
                changeCategory.description = description;
                changeCategory.amount = amount;
            }

        }
        closeDialog();
        console.log(dataFromDialog);
    }

    const handleDelete = (item: any) => {
        const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

        data = data.filter(val =>
            normalize(val.categoryName) !== normalize(item.categoryName) ||
            normalize(val.incomeType) !== normalize(item.incomeType)
        );

        setTableData([...data]);

    }


    return (
        <>
            <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">

                <Button onClick={dialog.onTrue} variant="contained" size="small">
                    Add New Income Source
                </Button>
            </Box>
            <Box>
                <Typography component="span" variant="h6" gutterBottom>
                    Income Categories
                </Typography>
            </Box>
            <CustomizableTable
                columns={[
                    { id: 'categoryName', label: 'Category Name' },
                    { id: 'description', label: 'Description' },
                    { id: 'incomeType', label: 'Income Type' },

                    { id: 'amount', label: 'Amount' },
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
                                                    handleDelete(row)

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
                    <FinanceIncomeCategoryAddSettingDialog
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
    )
}

export default FinanceIncomeSettingTab;
