import React from 'react'
import { useFormik } from 'formik';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, DialogActions, } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';

interface IssueBookDialogProps {
    dialogValue: boolean;

    onSave: (values: any) => void;
    onClose: () => void;
    data?: any;

}
const IssueBookDialog: React.FC<IssueBookDialogProps> = ({ dialogValue, onSave, onClose, data}) => {
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
            title='Issue Book'
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
                                    name="memberID"
                                    label="Member ID"
                                    value={formik.values.memberID}
                                    onChange={formik.handleChange}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="Suggested Return Date"
                                    value={formik.values.date}
                                    format="DD-MM-YYYY"
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="Return Date"
                                    value={formik.values.returnDate}
                                    format="DD-MM-YYYY"
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                    disabled
                                />
                            </Grid>



                        </Grid>
                    </Scrollbar>
                    <DialogActions>
                        <Button type="submit" variant="contained" size="small">
                            Issue Book
                        </Button>
                    </DialogActions>
                </form>
            </Box>
        </CustomDialog>
    )
}

export default IssueBookDialog