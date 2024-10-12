import React, { useState, useEffect } from 'react'

import { Box, Button, Switch, MenuItem, MenuList, Typography, } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceSettingPaymentMethodDialog from './component/finance-setting-payment-method-dialog';



interface ServiceProviderDetail {
    serviceProviderName: string,
    serviceProviderMobile: string,

}
interface Data {
    paymentMethodName: string,
    serviceProviderDetail: ServiceProviderDetail,
    processingFee: string,
    id: number,
    action?: string,
}


let data: Data[] = [
    {
        id: 1,
        paymentMethodName: 'stripe',
        serviceProviderDetail: {
            serviceProviderName: "jack",
            serviceProviderMobile: "98498989844",
        },
        processingFee: "3000",
        action: 'View',
    },
    {
        id: 2,
        paymentMethodName: 'stripe',
        serviceProviderDetail: {
            serviceProviderName: "jack",
            serviceProviderMobile: "98498989844",
        },
        processingFee: "3000",
        action: 'View',
    },
]
const FinancePaymentMethodSettingTab = () => {
    const dialog = useBoolean();
    const [selectedEntry, setSelectedEntry] = useState(data);
    const [isEdit, setIsEdit] = useState(false);
    const [tableData, setTableData] = useState(data)
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
        // const { id, taxName, taxPercentage, applicableRegion, applicableCategory } = dataFromDialog;

        // if (dataFromDialog) {
        //     const existingEntryIndex = data.findIndex(val => id === val.id);

        //     if (existingEntryIndex !== -1 && !isEdit) {
        //         // setShowDuplicateDialog(true)
        //         ;
        //         closeDialog();
        //         return;
        //     }

        //     // Prepare the new entry
        //     const taxSetting = {
        //         id,
        //         taxName,
        //         taxPercentage,
        //         applicableRegion: applicableRegion || [], // Ensure it's an array
        //         applicableCategory: applicableCategory || [], // Ensure it's an array
        //         action: 'View',
        //     };

        //     // Check for duplicate regions and categories
        //     if (existingEntryIndex !== -1 && isEdit) {
        //         const existingEntry = data[existingEntryIndex];
        //         existingEntry.applicableRegion = applicableRegion;
        //         existingEntry.applicableCategory = applicableCategory;
        //     } else if (existingEntryIndex === -1 && !isEdit) {
        //         data.push(taxSetting);

        //     }

        // }

        // closeDialog();
        // console.log(dataFromDialog);
    };
    return (
        <>
            <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">

                <Button onClick={dialog.onTrue} variant="contained" size="small">
                    Add Payment Method
                </Button>
            </Box>
            <Box>
                <Typography component="span" variant="h6" gutterBottom>
                    Payment Methods Overview
                </Typography>
            </Box>
            <CustomizableTable
                columns={[
                    { id: 'paymentMethodName', label: 'Payment Method Name' },
                    {
                        id: 'serviceProviderDetail',
                        label: 'Service Provider Details',
                        render(value, row) {
                            return (
                                <Box>
                                    <Typography>{row.serviceProviderDetail.serviceProviderName}</Typography>
                                    <Typography>{row.serviceProviderDetail.serviceProviderMobile}</Typography>
                                </Box>
                            );
                        },
                    },
                    { id: 'processingFee', label: 'Processing Fee' },
                    {
                        id: "toggle", label: "Status Toggle", render(val) {

                            return (<Switch value={val} />)
                        },
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
                                                Edit
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => {
                                                    handleDelete(row)

                                                }}
                                            >
                                                <Iconify color="red" icon="solar:trash-bin-trash-bold" />
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
                    <FinanceSettingPaymentMethodDialog
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

export default FinancePaymentMethodSettingTab;
