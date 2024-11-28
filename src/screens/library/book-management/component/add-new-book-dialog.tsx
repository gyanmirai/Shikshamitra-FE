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
            totalCopies: '',
            availableCopies: '',
            category: '',
            condition: '',
            year: '',
            publisher: '',
            language: '',
            editionNotes: '',
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
                    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '400px' }}>
                        <Grid container spacing={3} pt="10px">
                            {/* Book Details */}
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
                                    name="publisher"
                                    label="Publisher"
                                    value={formik.values.publisher}
                                    onChange={formik.handleChange}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomSelect
                                    label="Language"

                                    options={[{ value: 'English', lable: 'English' },

                                    ]}
                                    value={formik.values.language}
                                    onChange={(value) => formik.setFieldValue('language', value)}
                                    formControlProps={{ fullWidth: true }}
                                />
                            </Grid>

                            {/* Edition Details */}
                            <Grid item xs={12} md={6}>
                                <CustomSelect
                                    label="Year"
                                    options={[{ value: "2020", lable: '2020' }, { value: "2021", lable: '2021' },

                                    ]}
                                    value={formik.values.year}
                                    onChange={(value) => formik.setFieldValue('year', value)}
                                    formControlProps={{ fullWidth: true }}
                                    disabled={isEdit}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="totalCopies"
                                    label="Total Copies"
                                    value={formik.values.totalCopies}
                                    onChange={formik.handleChange}
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="availableCopies"
                                    label="Available Copies"
                                    value={formik.values.availableCopies}
                                    onChange={formik.handleChange}
                                    size="small"
                                    type="number"
                                />
                            </Grid>
                            <Grid item xs={12} md={12}>
                                <TextField
                                    fullWidth
                                    name="editionNotes"
                                    label="Edition Notes"
                                    value={formik.values.editionNotes}
                                    onChange={formik.handleChange}
                                    size="small"
                                    multiline
                                    rows={3}
                                />
                            </Grid>

                            {/* Additional Metadata */}
                            <Grid item xs={12} md={6}>
                                <CustomSelect
                                    label="Category"
                                    options={[{ value: "Fiction", lable: 'Fiction' }, { value: 'Non-Fiction', lable: 'Non-Fiction' }]}
                                    value={formik.values.category}
                                    onChange={(value) => formik.setFieldValue('category', value)}
                                    formControlProps={{ fullWidth: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomSelect
                                    label="Condition"
                                    options={[{ value: "Good", lable: "Good" }, { value: "Bad", lable: "Bad" }]}
                                    value={formik.values.condition}
                                    onChange={(value) => formik.setFieldValue('condition', value)}
                                    formControlProps={{ fullWidth: true }}
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






















// import React from 'react';
// import { useFormik } from 'formik';

// import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

// import { Scrollbar } from 'src/components/scrollbar';
// import CustomDialog from 'src/components/customDialog';
// import CustomSelect from 'src/components/custom-select';

// interface AddNewBookDialogProps {
//     dialogValue: boolean;
//     data: any;
//     onSave: (values: any) => void;
//     onClose: () => void;
//     isEdit: boolean;
// }

// const AddNewBookDialog: React.FC<AddNewBookDialogProps> = ({
//     dialogValue,
//     data,
//     onSave,
//     onClose,
//     isEdit,
// }) => {
//     const formik = useFormik<any>({
//         initialValues: {
//             bookTitle: '',
//             bookAuthor: '',
//             isbn: '',
//             tags: '',
//             quantity: '',
//             category: '',
//             condition: '',
//         },
//         onSubmit: (values: any) => {
//             console.log('Form Submitted:', values);
//             onSave(values);
//         },
//     });

//     return (
//         <CustomDialog
//             title={`${isEdit ? 'Edit' : 'Create New'} Book Entry`}
//             open={dialogValue}
//             handleClose={onClose}
//         >
//             <Box>
//                 <form onSubmit={formik.handleSubmit}>
//                     <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
//                         <Grid container spacing={3} pt="10px">
//                             <Grid item xs={12} md={6}>
//                                 <TextField
//                                     fullWidth
//                                     name="bookTitle"
//                                     label="Book Title"
//                                     value={formik.values.bookTitle}
//                                     onChange={formik.handleChange}
//                                     size="small"
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <TextField
//                                     fullWidth
//                                     name="bookAuthor"
//                                     label="Book Author"
//                                     value={formik.values.bookAuthor}
//                                     onChange={formik.handleChange}
//                                     size="small"
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <TextField
//                                     fullWidth
//                                     name="isbn"
//                                     label="ISBN"
//                                     value={formik.values.isbn}
//                                     onChange={formik.handleChange}
//                                     size="small"
//                                     type="number"
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <TextField
//                                     fullWidth
//                                     name="tags"
//                                     label="Tags"
//                                     value={formik.values.tags}
//                                     onChange={formik.handleChange}
//                                     size="small"
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <TextField
//                                     fullWidth
//                                     name="quantity"
//                                     label="Quantity"
//                                     value={formik.values.quantity}
//                                     onChange={formik.handleChange}
//                                     size="small"
//                                     type="number"
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <CustomSelect
//                                     label="Year"
//                                     options={[]}
//                                     value={formik.values.year}
//                                     onChange={(value) => formik.setFieldValue('year', value)}
//                                     formControlProps={{ fullWidth: true }}
//                                     disabled={isEdit}
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <CustomSelect
//                                     label="Category"
//                                     options={[]}
//                                     value={formik.values.category}
//                                     onChange={(value) => formik.setFieldValue('category', value)}
//                                     formControlProps={{ fullWidth: true }}
//                                     disabled={isEdit}
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <CustomSelect
//                                     label="Condition"
//                                     options={[]}
//                                     value={formik.values.condition}
//                                     onChange={(value) => formik.setFieldValue('condition', value)}
//                                     formControlProps={{ fullWidth: true }}
//                                     disabled={isEdit}
//                                 />
//                             </Grid>
//                         </Grid>
//                     </Scrollbar>
//                     <DialogActions>
//                         <Button type="submit" variant="contained" size="small">
//                             Save
//                         </Button>
//                     </DialogActions>
//                 </form>
//             </Box>
//         </CustomDialog>
//     );
// };

// export default AddNewBookDialog;
