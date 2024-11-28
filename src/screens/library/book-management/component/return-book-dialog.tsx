import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import FormattedAmountInput from 'src/screens/finance/common/input-for-finance';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

interface ReturnBookDialogProps {
    dialogValue: boolean;
    onSave: (values: any) => void;
    onClose: () => void;
    data?: any; // Data for selected book and member
    bookData: any[]; // List of books
    memberData: any[]; // List of members
}

const ReturnBookDialog: React.FC<ReturnBookDialogProps> = ({ dialogValue, onSave, onClose, data, bookData, memberData }) => {
    const formik = useFormik<any>({
        initialValues: {
            bookID: '',
            bookTitle: '',
            bookAuthor: data?.bookAuthor || '',
            memberID: '',
            memberName: '',
            dueDate: data?.dueDate || null,
            fineAmount: data?.fineAmount || '',
            collectedFineAmount: '0',
        },
        onSubmit: (values: any) => {
            console.log('Form Submitted:', values);
            onSave(values);
        },
    });

    // Handling member and book selection based on passed data
    const handleBookSelect = (bookID: string) => {
        const selectedBook = bookData.find((book) => book.id === bookID);
        formik.setFieldValue('bookTitle', selectedBook?.title || '');
        formik.setFieldValue('bookAuthor', selectedBook?.author || '');
    };

    const handleMemberSelect = (memberID: string) => {
        const selectedMember = memberData.find((member) => member.id === memberID);
        formik.setFieldValue('memberName', selectedMember?.name || '');
    };

    const [receivedFineAmount, setReceivedFineAmount] = useState('0');

    const parseNumericValue = (formattedValue: string) =>
        parseFloat(formattedValue.replace(/,/g, '')) || 0;





    const handleChangeForLibrary = (formattedValue: string, numericValue: number) => {
        setReceivedFineAmount(formattedValue);
    };

    return (
        <CustomDialog
            title='Return Book'
            open={dialogValue}
            handleClose={onClose}
            maxWidth="sm"
        >
            <Box>
                <form onSubmit={formik.handleSubmit}>
                    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
                        <Grid container spacing={3} pt="10px">
                            <Grid item xs={12} md={6}>
                                <CustomSelect
                                    label="Book ID"
                                    options={[]}
                                    value={formik.values.BookID}
                                    onChange={(value) => formik.setFieldValue('bookID', value)}
                                    formControlProps={{ fullWidth: true, sx: { width: '270px' }, }}

                                />

                                {/* <TextField
                                    fullWidth
                                    name="bookID"
                                    label="Book ID"
                                    value={formik.values.bookID}
                                    onChange={formik.handleChange}
                                    size="small"
                                    select
                                    SelectProps={{
                                        native: true,
                                    }}
                                    onBlur={() => handleBookSelect(formik.values.bookID)}
                                >
                                    <option value="Select Book">Select Book</option>
                                    {bookData.map((book) => (
                                        <option key={book.id} value={book.id}>
                                            {book.title} ({book.publisher})
                                        </option>
                                    ))}
                                </TextField> */}
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="bookTitle"
                                    label="Book Title"
                                    value={formik.values.bookTitle}
                                    onChange={formik.handleChange}
                                    size="small"
                                    disabled
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
                                    disabled
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>

                                <CustomSelect
                                    label="Member ID"
                                    options={[]}
                                    value={formik.values.memberID}
                                    onChange={(value) => formik.setFieldValue('memberID', value)}
                                    formControlProps={{ fullWidth: true, sx: { width: '270px' }, }}
                                />

                                {/* <TextField
                                    fullWidth
                                    name="memberID"
                                    label="Member ID"
                                    value={formik.values.memberID}
                                    onChange={formik.handleChange}
                                    size="small"
                                    select
                                    SelectProps={{
                                        native: true,
                                    }}
                                    onBlur={() => handleMemberSelect(formik.values.memberID)}
                                >
                                    {/* <option value="2">Select Member</option> */}
                                {/* {memberData.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.role})
                                        </option>
                                    ))} */}
                                {/* </TextField> */}
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="memberName"
                                    label="Member Name"
                                    value={formik.values.memberName}
                                    onChange={formik.handleChange}
                                    size="small"
                                    disabled
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="Due Date"
                                    value={formik.values.dueDate}
                                    onChange={(value) => formik.setFieldValue('dueDate', value)}
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
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormattedAmountInput
                                    label="Received Fine Amount"
                                    value={receivedFineAmount}
                                    onChange={handleChangeForLibrary}
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
    );
};

export default ReturnBookDialog;















// import React from 'react'
// import { useFormik } from 'formik';

// import { DatePicker } from '@mui/x-date-pickers';
// import { Box, Grid, Button, TextField, DialogActions, } from '@mui/material';

// import { formatNumber } from 'src/utils/formate_number';

// import { Scrollbar } from 'src/components/scrollbar';
// import CustomDialog from 'src/components/customDialog';

// interface ReturnBookDialogProps {
//     dialogValue: boolean;

//     onSave: (values: any) => void;
//     onClose: () => void;
//     data?: any;

// }
// const ReturnBookDialog: React.FC<ReturnBookDialogProps> = ({ dialogValue, onSave, onClose, data }) => {
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
//             title='Return Book'
//             open={dialogValue}
//             handleClose={onClose}
//             maxWidth="md"
//         >
//             <Box>
//                 <form onSubmit={formik.handleSubmit}>
//                     <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '200px' }}>
//                         <Grid container spacing={3} pt="10px">
//                             <Grid item xs={12} md={6}>
//                                 <TextField
//                                     fullWidth
//                                     name="bookID"
//                                     label="Book ID"
//                                     value={formik.values.bookID}
//                                     onChange={formik.handleChange}
//                                     size="small"
//                                 />
//                             </Grid>
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
//                                     name="memberID"
//                                     label="Member Name"
//                                     value={formik.values.memberID}
//                                     onChange={formik.handleChange}
//                                     size="small"
//                                 />
//                             </Grid>

//                             <Grid item xs={12} md={6}>
//                                 <DatePicker
//                                     label="Due Date"
//                                     value={formik.values.date}
//                                     format="DD-MM-YYYY"
//                                     slotProps={{ textField: { size: 'small', fullWidth: true } }}
//                                     disabled
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <TextField
//                                     fullWidth
//                                     name="fineAmount"
//                                     label="Fine Amount"
//                                     value={formatNumber(formik.values.fineAmount, "INR")}
//                                     onChange={formik.handleChange}
//                                     size="small"
//                                 />
//                             </Grid>



//                         </Grid>
//                     </Scrollbar>
//                     <DialogActions>
//                         <Button type="submit" variant="contained" size="small">
//                             Mark As Returned
//                         </Button>
//                     </DialogActions>
//                 </form>
//             </Box>
//         </CustomDialog>
//     )
// }

// export default ReturnBookDialog