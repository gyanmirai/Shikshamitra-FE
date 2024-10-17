import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Box, Button, TextField, Typography, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

interface FinanceTaxSettingDialogProps {
    dialogValue: boolean;
    data: any;
    onSave: (values: any) => void;
    onClose: () => void;
    isEdit: boolean;
    allData: any;
}

interface FormikValue {
    taxName: string,
    taxPercentage: string,
    applicableRegion: string[],
    applicableCategory: string[],
    id: number,

}

const validationSchema = Yup.object({
    taxName: Yup.string().required("Tax Name can't be empty"),
    taxPercentage: Yup.string().required("Tax Percentage can't be empty"),
    applicableRegion: Yup.array().min(1, "Please select at least one region").required(),
    applicableCategory: Yup.array().min(1, "Please select at least one category").required(),
});



const FinanceTaxSettingDialog: React.FC<FinanceTaxSettingDialogProps> = ({ dialogValue, data, onSave, onClose, isEdit, allData }) => {
    const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false)

    const formik = useFormik<FormikValue>({
        initialValues: {

            taxName: isEdit ? data.taxName ?? '' : "",
            taxPercentage: isEdit ? data.taxPercentage ?? "" : "",
            applicableRegion: isEdit ? data.applicableRegion ?? [] : [],
            applicableCategory: isEdit ? data.applicableCategory ?? [] : [],
            id: isEdit ? data.id : Math.floor(Math.random() * 10000),

        },
        validationSchema,
        onSubmit: (values) => {
            const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

            const existingEntryIndex = allData.findIndex((val: any) => normalize(val.taxName) === normalize(values.taxName))
            if (!isEdit) {
                if (existingEntryIndex === -1) {
                    setShowExistingEntryMessage(false)
                    onSave(values)

                } else {
                    setShowExistingEntryMessage(true)
                    return;
                }

            } else {
                onSave(values)
            }



            console.log('Form Submitted type', values);

        },
    });
    return (
        <CustomDialog title={`${isEdit ? "Edit" : "Create New"} Tax Configuration`} open={dialogValue} handleClose={onClose}>
            <Box px="15px">{showExistingEntryMessage ? (<Typography component="span" variant="h6">This Tax System Already Exists</Typography>) : (<Box height="25px" />)}
            </Box>
            <Scrollbar>
                <Box px="15px" >
                    <form onSubmit={formik.handleSubmit}>

                        <Box pt="10px" display="flex" flexDirection="column" gap={3}>
                            <TextField
                                disabled={isEdit}
                                name="taxName"
                                label="Tax Name"
                                value={formik.values.taxName}
                                onChange={formik.handleChange}
                                size="small"
                                error={formik.touched.taxName && Boolean(formik.errors.taxName)}
                                helperText={formik.touched.taxName && formik.errors.taxName}

                            />
                            <TextField
                                disabled={isEdit}
                                name="taxPercentage"
                                label="Tax Percentage"
                                value={formik.values.taxPercentage}
                                onChange={formik.handleChange}
                                size="small"
                                error={formik.touched.taxPercentage && Boolean(formik.errors.taxPercentage)}
                                helperText={formik.touched.taxPercentage && formik.errors.taxPercentage}
                            />
                            <CustomSelect
                                multiple
                                label="Applicable Region"
                                options={[
                                    { value: 'India', label: 'India' },
                                    { value: 'Nepal', label: 'Nepal' },
                                    { value: 'Bhutan', label: 'Bhutan' },
                                    { value: 'Usa', label: 'Usa' },

                                ]}
                                // @ts-ignore
                                value={formik.values.applicableRegion}
                                onChange={(selectedValues) => formik.setFieldValue('applicableRegion', selectedValues)}
                                formControlProps={{ sx: { minWidth: 195 } }}
                                error={formik.touched.applicableRegion && Boolean(formik.errors.applicableRegion)}
                                // @ts-ignore   
                                helperText={formik.touched.applicableRegion && formik.errors.applicableRegion}
                            />
                            <CustomSelect
                                multiple
                                label="Applicable Categories"
                                options={[
                                    { value: 'Sports Fee', label: 'Sport Fee' },
                                    { value: 'Tuition Fee', label: 'Tuition Fee' },
                                ]}
                                // @ts-ignore
                                value={formik.values.applicableCategory}
                                onChange={(e) => formik.setFieldValue('applicableCategory', e)}
                                formControlProps={{ sx: { minWidth: 195 } }}
                                error={formik.touched.applicableCategory && Boolean(formik.errors.applicableCategory)}
                                // @ts-ignore
                                helperText={formik.touched.applicableCategory && formik.errors.applicableCategory}
                            />
                            {/* <TextField
                                name="budgetLimit"
                                label="Budget Limit"
                                value={formik.values.budgetLimit}
                                onChange={formik.handleChange}
                                size="small"

                            // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
                            // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
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
    )
}

export default FinanceTaxSettingDialog