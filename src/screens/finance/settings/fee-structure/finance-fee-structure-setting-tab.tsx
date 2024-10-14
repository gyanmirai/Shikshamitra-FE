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
}

interface Data {
    id: number;
    feeCategoryName: string;
    amount: string;
    applicableGrade: string;
    statusToggle: boolean;
    action: string;
    feeSubCategoryList: FeeSubCategoryList[];
}

let initialData: Data[] = [
    {
        id: 1,
        feeCategoryName: 'Fees',
        amount: '3,000',
        applicableGrade: '2',
        feeSubCategoryList: [
            {
                id: 1,
                name: 'Tuition fee',
                amount: '500',
                isCounted: true,
            },
            {
                id: 2,
                name: 'Sports fee',
                amount: '1500',
                isCounted: false,
            },
            {
                id: 3,
                name: 'Transport fee',
                amount: '1000',
                isCounted: true,
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
        const { id, feeName, amount, applicableGrade } = dataFromDialog;

        const newFeeStructure: Data = {
            id: Math.floor(Math.random() * 10000),
            feeCategoryName: 'Fees',
            amount,
            applicableGrade,
            feeSubCategoryList: [
                {
                    id,
                    name: feeName,
                    amount,
                    isCounted: true,
                },
            ],
            statusToggle: true,
            action: 'View',
        };

        // if(isEdit){
        //   const isExistingIndex =   tableData.findIndex((val)=> val.id === id)

        //   tableData[isExistingIndex];
        // }
        setTableData([...tableData, newFeeStructure]);

        // Initialize switch state for the new row
        setSwitchStates({
            ...switchStates,
            [newFeeStructure.id]: newFeeStructure.feeSubCategoryList.map(() => true),
        });

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
        initialData = initialData.filter((val) => val.id !== rowData.id)
        setTableData(initialData);
    }

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
                        id: 'feeCategoryName',
                        label: 'Fee Category Name',
                        children(row) {
                            // Get the switch state for this specific row
                            const switchState = switchStates[row.id] || [];

                            const totalAmount = row.feeSubCategoryList.reduce(
                                (total: any, val: any, index: any) => (switchState[index] ? total + Number(val.amount) : total),
                                0
                            );

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
                    { id: 'amount', label: 'Amount' },
                    { id: 'applicableGrade', label: 'Applicable Grade' },
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
            {dialog.value && selectedEntry && (
                <FinanceAddFeeCategorySettingDialog
                    onSave={handleSave}
                    dialogValue={dialog.value}
                    onClose={closeDialog}
                    data={selectedEntry}
                    isEdit={isEdit}
                />
            )}
        </>
    );
};

export default FinanceFeeStructureSettingTab;
