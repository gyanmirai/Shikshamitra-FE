import React, { useState, useEffect } from 'react'

import { Box, Button, MenuItem, MenuList, useTheme, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { AppWidgetSummary } from 'src/sections/overview/app/app-widget-summary';

import FinanceSettingCreateBudgetDialog from './component/finance-setting-create-budget-dialog';

interface Data {

    departmentName: string,
    allocatedAmount: string,
    utilizeAmount?: string,
    id: number,
    action?: string;


}


let data: Data[] = [
    {
        id: 1,
        departmentName: 'IT',
        allocatedAmount: '10000000',
        utilizeAmount: "50% utilized",
        action: 'View',
    },
    {
        id: 2,
        departmentName: 'HR',
        allocatedAmount: '1000000',
        utilizeAmount: "50% utilized",
        action: 'View',
    },
]

const FinanceBudgetSettingTab = () => {
    const theme = useTheme();

    const dialog = useBoolean();
    const [selectedEntry, setSelectedEntry] = useState(data);
    const [isEdit, setIsEdit] = useState(false);
    const [tableData, setTableData] = useState(data)
    // const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);



    const closeDialog = () => {
        setIsEdit(false)
        dialog.onFalse();

    }

    useEffect(() => {


    }, [selectedEntry, isEdit, tableData])

    const handleDelete = (item: any) => {

        data = data.filter(val =>
            (val.id) !== (item.id) ||
            (val.id) !== (item.id)
        );

        setTableData([...data]);

    }

    const handleSave = (dataFromDialog: any) => {
        const { id, departmentName, allocatedAmount, startDate, endDate } = dataFromDialog;

        if (dataFromDialog) {
            const existingEntryIndex = data.findIndex(val => departmentName === val.departmentName);

            if (existingEntryIndex !== -1 && !isEdit) {
                // setShowDuplicateDialog(true);
                closeDialog();

                return;
            }

            const budget = {
                id,
                departmentName,
                allocatedAmount,

                action: 'View',
            };

            if (existingEntryIndex === -1) {
                setTableData([...tableData, budget])
            } else if (isEdit && existingEntryIndex !== -1) {
                const updatedTableData = [...tableData];
                updatedTableData[existingEntryIndex] = {
                    ...updatedTableData[existingEntryIndex],
                    allocatedAmount,
                };

                setTableData(updatedTableData);

            }

            closeDialog();
            console.log(dataFromDialog);
        };
    }
    return (
        <>
            <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">

                <Button onClick={dialog.onTrue} variant="contained" size="small">
                    Create New Budget
                </Button>
            </Box>
            <Box display="flex" flexDirection="row" gap={3}>
                <AppWidgetSummary
                    title="Total Expenses"
                    percent={73.9}
                    total={73900}
                    chart={{
                        colors: [theme.vars.palette.warning.main],
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                        series: [15, 18, 12, 51, 68, 11, 39, 37],
                    }}
                />
                {/* <BookingAvailable
                    title="Budget OverView"
                    chart={{
                        series: [
                            { label: 'Expense', value: 90 },
                            { label: 'Income', value: 66 },
                        ],
                    }}
                /> */}

            </Box>
            <Box>
                <Typography component="span" variant="h6" gutterBottom>
                    Budget Allocation Overview
                </Typography>
            </Box>
            <CustomizableTable
                columns={[
                    { id: 'departmentName', label: 'Department/Project Name' },
                    { id: 'allocatedAmount', label: 'Allocated Budget Amount' },
                    {
                        id: 'utilizeAmount', label: 'Budget Utilization Status',
                    },



                    {
                        id: 'action',
                        label: 'Action',
                        render(value, row: any) {
                            return (
                                <ThreeDotsActions
                                    actions={({ popover }: any) => (
                                        <MenuList >
                                            <MenuItem
                                                onClick={() => {
                                                    setSelectedEntry(row);
                                                    setIsEdit(true);
                                                    dialog.onTrue();
                                                    //   popover.onClose();
                                                }}
                                            >
                                                <Iconify color="blue" icon="solar:pen-bold" />
                                                Allocate Budget
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
                    <FinanceSettingCreateBudgetDialog
                        onSave={handleSave}
                        dialogValue={dialog.value}
                        onClose={closeDialog}
                        data={selectedEntry}
                        isEdit={isEdit}
                    />
                )}
            </Box>
        </>
    )
}
export default FinanceBudgetSettingTab