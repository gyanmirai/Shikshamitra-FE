import React, { useState, useEffect } from 'react'

import { Box, Paper, Button, Switch, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceAddFeeCategorySettingDialog from './component/finance-add-fee-category-setting-dialog';


let data = [

    {

        feeCategoryName: 'Fees',
        amount: '3,000',
        applicableGrade: '2',
        feeSubCategoryList: [
            {
                name: "Tution fee",
                amount: "500",
                isCounted: true,
            },
            {
                name: "Sports fee",
                amount: "1500",
                isCounted: false,

            },
            {
                name: "Transport fee",
                amount: "1000",
                isCounted: true,

            },
        ],
        statusToggle: true,
        action: 'View',

    },


]
const FinanceFeeStructureSettingTab = () => {
    const dialog = useBoolean();
    const [selectedEntry, setSelectedEntry] = useState(data);
    const [isEdit, setIsEdit] = useState(false);
    const [tableData, setTableData] = useState(data)

    const handleSave = () => {

    }

    // const handleSave = (dataFromDialog: any) => {
    //     const { feeName, amount, applicableGrade, multipleApplicableGrade } = dataFromDialog

    //     if (isEdit) {
    //         setIsEdit(false);
    //     }
    //     if (multipleApplicableGrade && multipleApplicableGrade.length > 0) {
    //         multipleApplicableGrade.forEach((grade: string) => {

    //             const existingEntryIndex = data.findIndex(val =>
    //                 feeName === val.feeCategoryName && grade === val.applicableGrade
    //             );


    //             if (existingEntryIndex !== -1) {

    //                 data[existingEntryIndex].amount = amount;
    //             } else {
    //                 const newEntry = {
    //                     feeCategoryName: feeName,
    //                     amount,
    //                     applicableGrade: grade,
    //                     statusToggle: true,
    //                     action: 'View',
    //                 };
    //                 data.push(newEntry);
    //             }
    //         });
    //     } else {

    //         const existingEntryIndex = data.findIndex(val =>
    //             feeName === val.feeCategoryName && applicableGrade === val.applicableGrade
    //         );

    //         if (existingEntryIndex !== -1) {

    //             data[existingEntryIndex].amount = amount;

    //         } else {

    //             const newEntry = {
    //                 feeCategoryName: feeName,
    //                 amount,
    //                 applicableGrade,
    //                 statusToggle: true,
    //                 action: 'View',
    //             };
    //             data.push(newEntry);
    //         }
    //     }



    //     dialog.onFalse();
    //     console.log(dataFromDialog)
    // }

    const closeDialog = () => {
        setIsEdit(false)
        dialog.onFalse();

    }

    useEffect(() => {


    }, [selectedEntry, isEdit])

    const handleDelete = (item: any) => {
        const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

        data = data.filter(val =>
            normalize(val.feeCategoryName) !== normalize(item.feeCategoryName) ||
            normalize(val.applicableGrade) !== normalize(item.applicableGrade)
        );

        setTableData([...data]);

    }
    return (
        <>
            <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
                <Button variant="contained" size="small">
                    Bulk Update Fees
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
                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            const [switchState, setSwitchState] = useState(
                                row.feeSubCategoryList.map(() => true)
                            );

                            const totalAmount = row.feeSubCategoryList.reduce((total: any, val: any, index: any) => switchState[index] ? total + Number(val.amount) : total, 0);

                            const handleSwitchChange = (index: number) => {
                                const updatedSwitchState = [...switchState];
                                updatedSwitchState[index] = !updatedSwitchState[index];
                                setSwitchState(updatedSwitchState);
                            };



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
                                                                onChange={() => handleSwitchChange(index)}
                                                            />
                                                        </Paper>


                                                    </Box>
                                                    {index < row.feeSubCategoryList.length - 1 && <Typography>+</Typography>}
                                                </React.Fragment>
                                            ))}
                                            <Typography>=</Typography>
                                            <Paper elevation={4} sx={{ p: 2 }}>
                                                Total: {totalAmount}
                                            </Paper>
                                        </Box>
                                    ) : (
                                        <Box>
                                            <Typography>No data</Typography>
                                        </Box>
                                    )}
                                </>
                            );
                        }
                    }
                    ,


                    { id: 'amount', label: 'Amount' },
                    { id: 'applicableGrade', label: 'Applicable Grade' },

                    {
                        id: 'statustoggle', label: 'Status Toggle', render(statusToggle) {

                            return (<Switch value={statusToggle} />
                            );
                        }
                    },

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
                                                    setSelectedEntry(row);
                                                    setIsEdit(true);
                                                    dialog.onTrue();
                                                    //   popover.onClose();
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
                    <FinanceAddFeeCategorySettingDialog
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

export default FinanceFeeStructureSettingTab


// Example function to handle save action
//  const handleSave = async (dataFromDialog: any) => {
//     const { feeName, amount, applicableGrade, multipleApplicableGrade } = dataFromDialog;

//     // Function to check existing entry and show a confirmation dialog
//     const checkExistingEntry = (grade: string) => data.find(val =>
//         feeName === val.feeCategoryName && grade === val.applicableGrade
//     );

//     // Function to show confirmation dialog
//     const showConfirmationDialog = (existingEntry: any) => new Promise((resolve) => {
//         // This is where you implement your dialog logic
//         // For example, using Material-UI's Dialog component
//         const handleClose = (action: string) => {
//             if (action === 'edit') {
//                 resolve('edit'); // User wants to edit
//             } else if (action === 'delete') {
//                 resolve('delete'); // User wants to delete
//             } else {
//                 resolve('cancel'); // User cancels
//             }
//         };

//         // Example dialog implementation
//         return (
//             <Dialog open onClose={() => handleClose('cancel')}>
//                 <DialogTitle>Entry Already Exists</DialogTitle>
//                 <DialogContent>
//                     <p>The entry for {existingEntry.applicableGrade} already exists. Would you like to edit or delete it?</p>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={() => handleClose('edit')} color="primary">Edit</Button>
//                     <Button onClick={() => handleClose('delete')} color="secondary">Delete</Button>
//                     <Button onClick={() => handleClose('cancel')} >Cancel</Button>
//                 </DialogActions>
//             </Dialog>
//         );
//     });

//     // Check if multiple grades are selected
//     const promises = [];
//     if (multipleApplicableGrade && multipleApplicableGrade.length > 0) {
//         multipleApplicableGrade.forEach(async (grade: string) => {
//             const existingEntry = checkExistingEntry(grade);
//             if (existingEntry) {
//                 // Show confirmation dialog and wait for user response
//                 const userAction = await showConfirmationDialog(existingEntry);
//                 if (userAction === 'edit') {
//                     // Update the existing entry with the new amount
//                     existingEntry.amount = amount; // Update amount
//                 } else if (userAction === 'delete') {
//                     // Delete the existing entry
//                     data = data.filter(val => !(feeName === val.feeCategoryName && grade === val.applicableGrade));
//                 }
//             } else {
//                 // Create a new entry
//                 const newEntry = {
//                     feeCategoryName: feeName,
//                     amount,
//                     applicableGrade: grade,
//                     statusToggle: true,
//                     action: 'View',
//                 };
//                 data.push(newEntry);
//             }
//         });
//     } else {
//         // Handle single grade similarly
//         const existingEntry = checkExistingEntry(applicableGrade);
//         if (existingEntry) {
//             // Show confirmation dialog and wait for user response
//             const userAction = await showConfirmationDialog(existingEntry);
//             if (userAction === 'edit') {
//                 existingEntry.amount = amount; // Update amount
//             } else if (userAction === 'delete') {
//                 data = data.filter(val => !(feeName === val.feeCategoryName && applicableGrade === val.applicableGrade));
//             }
//         } else {
//             // Create a new entry
//             const newEntry = {
//                 feeCategoryName: feeName,
//                 amount,
//                 applicableGrade,
//                 statusToggle: true,
//                 action: 'View',
//             };
//             data.push(newEntry);
//         }
//     }

//     dialog.onFalse(); // Close the dialog
//     console.log(dataFromDialog); // Optional: Log the dialog data for debugging
// };
