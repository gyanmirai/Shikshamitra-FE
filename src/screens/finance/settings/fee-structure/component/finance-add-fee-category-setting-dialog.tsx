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
    id: number,
    feeName: string;
    totalAmount: string;
    applicableGrade: string;
    paymentDueDate: string;
    paymentMethod: string;
    multipleApplicableGrade: string[];
    feeType: string[];
}

const FinanceAddFeeCategorySettingDialog: React.FC<FinanceAddFeeCategorySettingDialogProps> = ({ dialogValue, data, onClose, onSave, isEdit }) => {
    // Using useFormik to manage form state
    const [totalAmount, setTotalAmount] = useState(0)

    const formik = useFormik<FormikValue>({
        initialValues: {
            id: isEdit ? data.id : Math.floor(Math.random() * 10000),
            feeName: isEdit ? data.feeCategoryName ?? '' : "",
            totalAmount: isEdit ? data.amount : totalAmount,
            applicableGrade: isEdit ? data.applicableGrade ?? "" : "",
            paymentDueDate: '',
            paymentMethod: '',
            multipleApplicableGrade: [],
            feeType: []
        },
        // validationSchema: validationSchema,  // Uncomment this if you have validation schema
        onSubmit: (values) => {
            onSave(values)
            console.log('Form Submitted type', values);

        },
    });


    const [isBulkEdit, setIsBulkEdit] = useState(false)
    const calculateTotal = () => formik.values.feeType.reduce((total, feeType) => {
        // @ts-ignore
        const amount = parseFloat(formik.values[feeType]) || 0;
        return total + amount;
    }, 0)


    return (
        <CustomDialog title="Add/Edit Fee Structure" open={dialogValue} handleClose={onClose}>
            <Scrollbar>

                <Box px="15px" >
                    <FormControlLabel control={<Switch disabled={isEdit} value={isBulkEdit} onChange={(value) => { setIsBulkEdit(!isBulkEdit) }} />} label="Switch to Bulk Update" />
                    <form onSubmit={formik.handleSubmit}>
                        <Box pt="10px" display="flex" flexDirection="column" gap={3}>
                            <CustomSelect
                                multiple
                                label="Fee Type"
                                options={[
                                    { value: 'tuitionfee', label: 'Tuition Fee' },
                                    { value: 'sportsfee', label: 'Sports Fee' },
                                    { value: 'transportfee', label: 'Transport Fee' },
                                ]}
                                // @ts-ignore
                                value={formik.values.feeType}
                                onChange={(selectedValues) => formik.setFieldValue('feeType', selectedValues as string[])}
                                formControlProps={{ sx: { minWidth: 195 } }}
                                disabled={isEdit}
                            />


                            {formik.values.feeType.map((selectedFeeType: string) => {
                                const selectedOption = {
                                    tuitionfee: 'Tuition Fee Amount',
                                    sportsfee: 'Sports Fee Amount',
                                    transportfee: 'Transport Fee Amount',
                                }[selectedFeeType];

                                return (
                                    <TextField
                                        key={selectedFeeType}
                                        disabled={isEdit}
                                        name={selectedFeeType}
                                        label={selectedOption}
                                        // @ts-ignore
                                        value={formik.values[selectedFeeType] || ''}
                                        onChange={(event) => {
                                            const { value } = event.target;
                                            formik.setFieldValue(selectedFeeType, value);
                                        }}
                                        size="small"
                                        InputProps={{
                                            readOnly: isEdit,
                                        }}
                                    />
                                );
                            })}
                            <TextField
                                name="totalAmount"
                                label="Total Amount"
                                value={calculateTotal()}
                                onChange={formik.handleChange}
                                size="small"
                                disabled

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
