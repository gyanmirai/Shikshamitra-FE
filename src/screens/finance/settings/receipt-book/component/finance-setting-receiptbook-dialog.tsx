import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Box, Button, TextField, Typography, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';

interface FinanceSettingReceiptbookDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: FormikValue) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

interface FormikValue {
  id: number;
  receiptBookName: string;
}

const FinanceSettingReceiptbookDialog: React.FC<FinanceSettingReceiptbookDialogProps> = ({isEdit, data, onSave, onClose,allData, dialogValue}) => {
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);

    const formik = useFormik<FormikValue>({
        initialValues: {
            id: isEdit ? data.id : Math.floor(Math.random() * 10000),
           
            receiptBookName: isEdit ? data.receiptBookName ?? '' : '',
        },
        // validationSchema,
        onSubmit: (values) => {
            const existingEntryIndex = allData.findIndex(
                (val: any) => val.receiptBookName.toLowerCase() === values.receiptBookName.toLowerCase()
            );

            if (existingEntryIndex === -1 || isEdit) {
                setShowExistingEntryMessage(false);
                onSave(values);
            } else {
                setShowExistingEntryMessage(true);
                return;
            }

            console.log('Form Submitted:', values);
        },
    });
  return (
    <CustomDialog title={`${isEdit ? 'Edit' : 'Create New'} Receipt Book`} open={dialogValue} handleClose={onClose}>
    <Scrollbar>
        <Box px="15px">
            <form onSubmit={formik.handleSubmit}>
                <Box pt="10px" display="flex" flexDirection="column" gap={3}>
                    <TextField
                        fullWidth
                        name="receiptBookName"
                        label="Receipt Book Name"
                        value={formik.values.receiptBookName}
                        onChange={formik.handleChange}
                        error={formik.touched.receiptBookName && Boolean(formik.errors.receiptBookName)}
                        helperText={formik.touched.receiptBookName && formik.errors.receiptBookName}
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
            {showExistingEntryMessage ? ( <Typography fontSize={13} color="error">Book Receipt Already exists</Typography>) : <Box pb="13px" />}
        </Box>
    </Scrollbar>
</CustomDialog>
  )
}

export default FinanceSettingReceiptbookDialog