import React from 'react';
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

interface AddNewBookDialogProps {
    dialogValue: boolean;
    data: any;
    onSave: (values: any) => void;
    onClose: () => void;
    isEdit: boolean;
}

const AddNewBookDialog: React.FC<AddNewBookDialogProps> = ({
    dialogValue,
    data,
    onSave,
    onClose,
    isEdit,
}) => {
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
            title={`${isEdit ? 'Edit' : 'Create New'} Book Entry`}
            open={dialogValue}
            handleClose={onClose}
        >
            <Box>
                <form onSubmit={formik.handleSubmit}>
                    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
                        <Grid container spacing={3} pt="10px">
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
                                    name="bookAuthor"
                                    label="Book Author"
                                    value={formik.values.bookAuthor}
                                    onChange={formik.handleChange}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="isbn"
                                    label="ISBN"
                                    value={formik.values.isbn}
                                    onChange={formik.handleChange}
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="tags"
                                    label="Tags"
                                    value={formik.values.tags}
                                    onChange={formik.handleChange}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="quantity"
                                    label="Quantity"
                                    value={formik.values.quantity}
                                    onChange={formik.handleChange}
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomSelect
                                    label="Year"
                                    options={[]}
                                    value={formik.values.year}
                                    onChange={(value) => formik.setFieldValue('year', value)}
                                    formControlProps={{ fullWidth: true }}
                                    disabled={isEdit}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomSelect
                                    label="Category"
                                    options={[]}
                                    value={formik.values.category}
                                    onChange={(value) => formik.setFieldValue('category', value)}
                                    formControlProps={{ fullWidth: true }}
                                    disabled={isEdit}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomSelect
                                    label="Condition"
                                    options={[]}
                                    value={formik.values.condition}
                                    onChange={(value) => formik.setFieldValue('condition', value)}
                                    formControlProps={{ fullWidth: true }}
                                    disabled={isEdit}
                                />
                            </Grid>
                        </Grid>
                    </Scrollbar>
                    <DialogActions>
                        <Button type="submit" variant="contained" size="small">
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Box>
        </CustomDialog>
    );
};

export default AddNewBookDialog;
