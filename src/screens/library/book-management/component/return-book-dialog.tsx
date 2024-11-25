import React from 'react'
import { useFormik } from 'formik';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, DialogActions, } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';

interface ReturnBookDialogProps {
    dialogValue: boolean;

    onSave: (values: any) => void;
    onClose: () => void;
    data?: any;

}
const ReturnBookDialog: React.FC<ReturnBookDialogProps> = ({ dialogValue, onSave, onClose, data }) => {
    const formik = useFormik<any>({
        initialValues: {
            bookTitle: '',
            bookAuthor: '',
            isbn: '',
            tags: '',
            quantity: '',
            category: '',
            condition: '',
        },
        onSubmit: (values: any) => {
            console.log('Form Submitted:', values);
            onSave(values);
        },
    });
    return (
        <CustomDialog
            title='Return Book'
            open={dialogValue}
            handleClose={onClose}
            maxWidth="md"
        >
            <Box>
                <form onSubmit={formik.handleSubmit}>
                    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '200px' }}>
                        <Grid container spacing={3} pt="10px">
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="bookID"
                                    label="Book ID"
                                    value={formik.values.bookID}
                                    onChange={formik.handleChange}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="bookTitle"
                                    label="Book Title"
                                    value={formik.values.bookTitle}
                                    onChange={formik.handleChange}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="memberID"
                                    label="Member Name"
                                    value={formik.values.memberID}
                                    onChange={formik.handleChange}
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="Due Date"
                                    value={formik.values.date}
                                    format="DD-MM-YYYY"
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="fineAmount"
                                    label="Fine Amount"
                                    value={formatNumber(formik.values.fineAmount, "INR")}
                                    onChange={formik.handleChange}
                                    size="small"
                                />
                            </Grid>



                        </Grid>
                    </Scrollbar>
                    <DialogActions>
                        <Button type="submit" variant="contained" size="small">
                            Mark As Returned
                        </Button>
                    </DialogActions>
                </form>
            </Box>
        </CustomDialog>
    )
}

export default ReturnBookDialog