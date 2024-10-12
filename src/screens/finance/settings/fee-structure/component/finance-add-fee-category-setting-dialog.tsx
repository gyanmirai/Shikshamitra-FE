import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Box, Button, Switch, TextField, DialogActions, FormControlLabel } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';


interface FinanceAddFeeCategorySettingDialogProps {
    dialogValue: boolean;
    data: any;
    onSave: (values: any) => void;
    onClose: () => void;
    isEdit: boolean;
}

interface FormikValue {
    feeName: string;
    amount: string;
    applicableGrade: string;
    paymentDueDate: string;
    paymentMethod: string;
    multipleApplicableGrade: string[];
}

const FinanceAddFeeCategorySettingDialog: React.FC<FinanceAddFeeCategorySettingDialogProps> = ({ dialogValue, data, onClose, onSave, isEdit }) => {
    // Using useFormik to manage form state
    const formik = useFormik<FormikValue>({
        initialValues: {
            feeName: isEdit ? data.feeCategoryName ?? '' : "",
            amount: isEdit ? data.amount ?? "" : "",
            applicableGrade: isEdit ? data.applicableGrade ?? "" : "",
            paymentDueDate: '',
            paymentMethod: '',
            multipleApplicableGrade: [],
        },
        // validationSchema: validationSchema,  // Uncomment this if you have validation schema
        onSubmit: (values) => {
            onSave(values)
            console.log('Form Submitted type', values);

        },
    });


    const [isBulkEdit, setIsBulkEdit] = useState(false)

    return (
        <CustomDialog title="Add/Edit Fee Structure" open={dialogValue} handleClose={onClose}>
            <Scrollbar>

                <Box px="15px" >
                    <FormControlLabel control={<Switch disabled={isEdit} value={isBulkEdit} onChange={(value) => { setIsBulkEdit(!isBulkEdit) }} />} label="Switch to Bulk Update" />
                    <form onSubmit={formik.handleSubmit}>
                        <Box pt="10px" display="flex" flexDirection="column" gap={3}>
                            <TextField
                                disabled={isEdit}
                                name="feeName"
                                label="Fee Name"
                                value={formik.values.feeName}
                                onChange={formik.handleChange}
                                size="small"
                                InputProps={{
                                    readOnly: isEdit, // Set read-only based on the variable
                                }}
                            // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
                            // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
                            />
                            <TextField
                                name="amount"
                                label="Amount"
                                value={formik.values.amount}
                                onChange={formik.handleChange}
                                size="small"

                            // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
                            // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
                            />
                            {isBulkEdit && (
                                <CustomSelect
                                    multiple
                                    label="Applicable Grade"
                                    options={[
                                        { value: '1', label: '1' },
                                        { value: '2', label: '2' },
                                        { value: '3', label: '3' },
                                    ]}
                                    // @ts-ignore
                                    value={formik.values.multipleApplicableGrade}
                                    onChange={(selectedValues) => formik.setFieldValue('multipleApplicableGrade', selectedValues as string[])}
                                    formControlProps={{ sx: { minWidth: 195 } }}
                                    disabled={isEdit}
                                />
                            )}

                            {!isBulkEdit && <CustomSelect

                                label="Applicable Grade"
                                options={[
                                    { value: '1', label: '1' },
                                    { value: '2', label: '2' },
                                    { value: '3', label: '3' },
                                ]}
                                value={formik.values.applicableGrade}
                                onChange={(e) => formik.setFieldValue('applicableGrade', e)}
                                formControlProps={{ sx: { minWidth: 195 } }}
                                disabled={isEdit} />}
                            <CustomSelect
                                label="Payment Method"
                                options={[
                                    { value: 'fullypaid', label: 'Fully Paid' },
                                    { value: 'partiallypaid', label: 'Partially Paid' },
                                    { value: 'overdue', label: 'Overdue' },
                                ]}
                                value={formik.values.paymentMethod}
                                onChange={(e) => formik.setFieldValue('paymentMethod', e)}
                                formControlProps={{ sx: { minWidth: 195 } }}

                            />


                            {/* <DatePicker
                                label="Payment Due Date"
                                // @ts-ignore
                                value={formik.values.paymentDueDate}
                                onChange={(newValue) => formik.setFieldValue('paymentDueDate', newValue)}
                                format="DD-MM-YYYY"
                                slotProps={{ textField: { size: 'small' } }}
                            /> */}

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
                </Box>
            </Scrollbar>
        </CustomDialog>
    );
};

export default FinanceAddFeeCategorySettingDialog;
