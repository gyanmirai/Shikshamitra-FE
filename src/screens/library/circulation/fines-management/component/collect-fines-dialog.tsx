import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Box, Grid, Button, MenuItem, TextField, DialogActions } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';

interface CollectFinesDialogProps {
    dialogValue: boolean;
    data: any;
    onSave: (values: any) => void;
    onClose: () => void;
}

const paymentModes = [
    { value: 'cash', label: 'Cash' },
    { value: 'online', label: 'Online Payment' },
    { value: 'bank', label: 'Bank Transfer' },
];

const CollectFinesDialog: React.FC<CollectFinesDialogProps> = ({ dialogValue, data, onSave, onClose }) => {
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('cash');

    const formik = useFormik({
        initialValues: {
            name: data?.memberName || '',
            fineAmount: data?.fineAmount || '',
            notes: '',
            paymentMode: 'cash',
            upiId: '',
            bankAccount: '',
            ifsc: '',
            accountHolder: '',
        },
        onSubmit: (values) => {
            console.log('Form Submitted:', values);
            onSave(values);
        },
    });

    const handlePaymentModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const mode = event.target.value;
        setSelectedPaymentMode(mode);
        formik.setFieldValue('paymentMode', mode);
    };

    return (
        <CustomDialog
            title="Collect Fine"
            open={dialogValue}
            handleClose={onClose}
            maxWidth="sm"
        >
            <Box>
                <form onSubmit={formik.handleSubmit}>
                    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
                        <Grid container spacing={3} pt="10px">
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="name"
                                    label="Name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    size="small"
                                    disabled
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="fineAmount"
                                    label="Fine Amount"
                                    value={formik.values.fineAmount}
                                    onChange={(e) => {
                                        const formattedValue = formatNumber(e.target.value, "INR");
                                        formik.setFieldValue('fineAmount', formattedValue);
                                    }}
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    name="paymentMode"
                                    label="Payment Mode"
                                    value={selectedPaymentMode}
                                    onChange={handlePaymentModeChange}
                                    size="small"
                                >
                                    {paymentModes.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {selectedPaymentMode === 'online' && (
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        name="upiId"
                                        label="UPI ID"
                                        value={formik.values.upiId}
                                        onChange={formik.handleChange}
                                        size="small"
                                    />
                                </Grid>
                            )}

                            {selectedPaymentMode === 'bank' && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            name="bankAccount"
                                            label="Bank Account Number"
                                            value={formik.values.bankAccount}
                                            onChange={formik.handleChange}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            name="ifsc"
                                            label="IFSC Code"
                                            value={formik.values.ifsc}
                                            onChange={formik.handleChange}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            name="accountHolder"
                                            label="Account Holder Name"
                                            value={formik.values.accountHolder}
                                            onChange={formik.handleChange}
                                            size="small"
                                        />
                                    </Grid>
                                </>
                            )}

                            <Grid item xs={12}>
                                <TextField
                                rows={4}
                                    multiline
                                    fullWidth
                                    name="notes"
                                    label="Notes"
                                    value={formik.values.notes}
                                    onChange={formik.handleChange}
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                    </Scrollbar>
                    <DialogActions>
                        <Button type="submit" variant="contained" size="small">
                           Collect Fine
                        </Button>
                    </DialogActions>
                </form>
            </Box>
        </CustomDialog>
    );
};

export default CollectFinesDialog;
