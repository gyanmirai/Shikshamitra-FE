import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Box, Button, TextField, Typography, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';

interface FinanceSettingPaymentMethodDialogProps {
    dialogValue: boolean;
    data: any;
    onSave: (values: any) => void;
    onClose: () => void;
    isEdit: boolean;
    allData: any;
}
interface ServiceProviderDetail {
    serviceProviderName: string,
    serviceProviderMobile: string,

}

interface FormikValue {
    paymentMethodName: string;
    serviceProviderDetail: ServiceProviderDetail;
    processingFee: string;
    id: number;
    integrationKey: string;
}

const validationSchema = Yup.object({
    paymentMethodName: Yup.string().required("Payment Method Name can't be empty"),
    serviceProviderDetail: Yup.object({
        serviceProviderName: Yup.string().required("Service Provider Name can't be empty"),
        serviceProviderMobile: Yup.string().required("Service Provider Mobile can't be empty"),
    }),
    processingFee: Yup.string().required("Processing Fee can't be empty"),
    integrationKey: Yup.string().required("Integration key can't be empty"),
});


const FinanceSettingPaymentMethodDialog: React.FC<FinanceSettingPaymentMethodDialogProps> = ({ data, dialogValue, onClose, onSave, allData, isEdit }) => {
    const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false)


    const formik = useFormik<FormikValue>({
        initialValues: {
            paymentMethodName: isEdit ? data.paymentMethodName ?? '' : "",
            serviceProviderDetail: {
                serviceProviderName: isEdit ? data.serviceProviderDetail?.serviceProviderName ?? "" : "",
                serviceProviderMobile: isEdit ? data.serviceProviderDetail?.serviceProviderMobile ?? "" : "",
            },
            processingFee: isEdit ? data.processingFee ?? "" : "",
            id: isEdit ? data.id : Math.floor(Math.random() * 10000),
            integrationKey: isEdit ? data.integrationKey ?? "" : "",
        },
        validationSchema,
        onSubmit: (values) => {
            onSave(values);
            // const existingEntryIndex = allData.findIndex((val: any) => normalize(val.taxName) === normalize(values.taxName))
            // if (existingEntryIndex === -1) {
            //     // setShowExistingEntryMessage(false)


            // } else {
            //     setShowExistingEntryMessage(true)
            //     return;
            // }


            console.log('Form Submitted type', values);

        },
    });
    return (
        <CustomDialog title={`${isEdit ? "Edit" : "Create New"} Tax Configuration`} open={dialogValue} handleClose={onClose}>

            <Scrollbar>
                <Box px="15px" >
                    <form onSubmit={formik.handleSubmit}>
                        <Box pt="10px" display="flex" flexDirection="column" gap={3}>
                            <TextField
                                fullWidth
                                id="paymentMethodName"
                                name="paymentMethodName"
                                label="Payment Method Name"
                                value={formik.values.paymentMethodName}
                                onChange={formik.handleChange}
                                error={formik.touched.paymentMethodName && Boolean(formik.errors.paymentMethodName)}
                                helperText={formik.touched.paymentMethodName && formik.errors.paymentMethodName}
                            />
                            <TextField
                                fullWidth
                                id="serviceProviderDetail.serviceProviderName"
                                name="serviceProviderDetail.serviceProviderName"
                                label="Service Provider Name"
                                value={formik.values.serviceProviderDetail.serviceProviderName}
                                onChange={formik.handleChange}
                                error={formik.touched.serviceProviderDetail?.serviceProviderName && Boolean(formik.errors.serviceProviderDetail?.serviceProviderName)}
                                helperText={formik.touched.serviceProviderDetail?.serviceProviderName && formik.errors.serviceProviderDetail?.serviceProviderName}
                            />
                            <TextField
                                fullWidth
                                id="serviceProviderDetail.serviceProviderMobile"
                                name="serviceProviderDetail.serviceProviderMobile"
                                label="Service Provider Mobile"
                                value={formik.values.serviceProviderDetail.serviceProviderMobile}
                                onChange={formik.handleChange}
                                error={formik.touched.serviceProviderDetail?.serviceProviderMobile && Boolean(formik.errors.serviceProviderDetail?.serviceProviderMobile)}
                                helperText={formik.touched.serviceProviderDetail?.serviceProviderMobile && formik.errors.serviceProviderDetail?.serviceProviderMobile}
                            />
                            <TextField
                                fullWidth
                                id="processingFee"
                                name="processingFee"
                                label="Processing Fee"
                                value={formik.values.processingFee}
                                onChange={formik.handleChange}
                                error={formik.touched.processingFee && Boolean(formik.errors.processingFee)}
                                helperText={formik.touched.processingFee && formik.errors.processingFee}
                            />

                        </Box>
                        <DialogActions>
                            <Button onClick={onClose} variant="contained" size="small">
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" size="small">
                                Save
                            </Button>
                        </DialogActions>
                    </form>
                    {showExistingEntryMessage && <Typography>Entry Existed</Typography>}
                </Box>
            </Scrollbar>
        </CustomDialog>
    )
}

export default FinanceSettingPaymentMethodDialog