import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Box, Button, TextField, Typography, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

interface FinanceExpenseAddSettingDialogProps {
    dialogValue: boolean;
    data: any;
    onSave: (values: any) => void;
    onClose: () => void;
    isEdit: boolean;
    allData: any;
}

interface FormikValue {
    categoryName: string,
    parentCategory: string,
    assignDepartment: string,
    budgetLimit: string,
}

const FinanceExpenseAddSettingDialog: React.FC<FinanceExpenseAddSettingDialogProps> = ({ dialogValue, data, onClose, onSave, isEdit, allData }) => {

    const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false)

    const formik = useFormik<FormikValue>({
        initialValues: {

            categoryName: isEdit ? data.categoryName ?? '' : "",
            parentCategory: isEdit ? data.parentCategory ?? "" : "",
            assignDepartment: isEdit ? data.assignDepartment ?? "" : "",
            budgetLimit: isEdit ? data.budgetLimit ?? "" : "",

        },
        // validationSchema: validationSchema,  // Uncomment this if you have validation schema
        onSubmit: (values) => {
            const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

            const existingEntryIndex = allData.findIndex((val: any) => normalize(val.categoryName) === normalize(values.categoryName))
            if (!isEdit) {
                if (existingEntryIndex === -1) {
                    setShowExistingEntryMessage(false)
                    onSave(values)

                } else {
                    setShowExistingEntryMessage(true)

                }

            } else {
                onSave(values)
            }


        },
    });


    return (
        <CustomDialog title={`${isEdit ? "Edit" : "Create New"} Expense Category`} open={dialogValue} handleClose={onClose}>
            <Box px="20px">{showExistingEntryMessage ? (<Typography component="span" fontSize="14" color="red">This Expense Category is Already Exists</Typography>) : (<Box height="25px" />)}
            </Box>
            <Scrollbar>
                <Box px="15px" >
                    <form onSubmit={formik.handleSubmit}>
                        <Box pt="15px" display="flex" flexDirection="column" gap={3}>
                            <TextField
                                disabled={isEdit}
                                name="categoryName"
                                label="Category Name"
                                value={formik.values.categoryName}
                                onChange={formik.handleChange}
                                size="small"

                            // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
                            // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
                            />
                            <CustomSelect
                                label="Parent Category"
                                options={[
                                    { value: 'utlities', label: 'Utlities' },
                                    { value: 'maintenance', label: 'Maintenance' },

                                ]}
                                // @ts-ignore
                                value={formik.values.parentCategory}
                                onChange={(selectedValues) => formik.setFieldValue('parentCategory', selectedValues)}
                                formControlProps={{ sx: { minWidth: 195 } }}
                                disabled={isEdit}
                            />
                            <CustomSelect
                                label="Assign Department"
                                options={[
                                    { value: 'Teacher', label: 'Teacher' },
                                    { value: 'Admin', label: 'Admin' },
                                    { value: 'Helper', label: 'Helper' },
                                ]}
                                value={formik.values.assignDepartment}
                                onChange={(e) => formik.setFieldValue('assignDepartment', e)}
                                formControlProps={{ sx: { minWidth: 195 } }}
                                disabled={isEdit} />
                            <TextField
                                name="budgetLimit"
                                label="Budget Limit"
                                value={formik.values.budgetLimit}
                                onChange={formik.handleChange}
                                size="small"

                            // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
                            // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
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
                </Box>
            </Scrollbar>
        </CustomDialog>
    )
}

export default FinanceExpenseAddSettingDialog