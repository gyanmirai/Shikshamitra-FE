import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

interface IssueBookDialogProps {
    dialogValue: boolean;
    bookData: any[];
    memberData: any[];
    onSave: (values: any) => void;
    onClose: () => void;
}

const IssueBookDialog: React.FC<IssueBookDialogProps> = ({
    dialogValue,
    bookData,
    memberData,
    onSave,
    onClose,
}) => {
    const formik = useFormik<any>({
        initialValues: {
            bookID: '',
            editionYear: '',
            publisher: '',
            memberID: '',
            issueDate: dayjs(),
            dueDate: dayjs(),
        },
        onSubmit: (values: any) => {
            console.log('Form Submitted:', values);
            onSave(values);
        },
    });

    // Automatically calculate the due date based on role (e.g., 20 days for students, 30 for teachers)
    const calculateDueDate = (issueDate: Date, role: string) => {
        const daysToAdd = role === 'Student' ? 20 : 30;
        const newDate = new Date(issueDate);
        newDate.setDate(newDate.getDate() + daysToAdd);
        return newDate;
    };

    return (
        <CustomDialog
            title="Issue Book"
            open={dialogValue}
            handleClose={onClose}
            maxWidth="sm"
        >
            <Box>
                <form onSubmit={formik.handleSubmit}>
                    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', }}>
                        <Grid container spacing={3} pt="10px">
                            {/* Book Selection */}
                            <Grid item xs={12} md={6}>
                                <CustomSelect
                                    label="Book Title"
                                    options={bookData.map((book) => ({
                                        label: book.title,
                                        value: book.id,
                                    }))}
                                    value={formik.values.bookID}
                                    onChange={(value) => formik.setFieldValue('bookID', value)}
                                    formControlProps={{ fullWidth: true, sx: { width: '270px' }, }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomSelect
                                    label="Edition Year"
                                    options={
                                        bookData
                                            .find((book) => book.id === formik.values.bookID)
                                            ?.editions.map((edition: any) => ({
                                                label: edition.year,
                                                value: edition.year,
                                            })) || []
                                    }
                                    value={formik.values.editionYear}
                                    onChange={(value) => formik.setFieldValue('editionYear', value)}
                                    formControlProps={{ fullWidth: true, sx: { width: '270px' }, }}
                                    disabled={!formik.values.bookID}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomSelect
                                    label="Publisher"
                                    options={
                                        bookData
                                            .find((book) => book.id === formik.values.bookID)
                                            ?.editions
                                            .filter((edition: any) => edition.year === formik.values.editionYear)
                                            .map((edition: any) => ({
                                                label: edition.publisher,
                                                value: edition.publisher,
                                            })) || []
                                    }
                                    value={formik.values.publisher}
                                    onChange={(value) => formik.setFieldValue('publisher', value)}
                                    formControlProps={{ fullWidth: true, sx: { width: '270px' }, }}
                                    disabled={!formik.values.editionYear}
                                />
                            </Grid>

                            {/* Member Selection */}
                            <Grid item xs={12} md={6}>
                                <CustomSelect
                                    label="Member"
                                    options={memberData.map((member) => ({
                                        label: `${member.name} (${member.role})`,
                                        value: member.id,
                                    }))}
                                    value={formik.values.memberID}
                                    onChange={(value) => {
                                        formik.setFieldValue('memberID', value);
                                        const role = memberData.find((member) => member.id === value)?.role;
                                        const dueDate = calculateDueDate(formik.values.issueDate, role);
                                        formik.setFieldValue('dueDate', dueDate);
                                    }}
                                    formControlProps={{ fullWidth: true, sx: { width: '270px' }, }}
                                />
                            </Grid>

                            {/* Date Handling */}
                            {(formik.values.editionYear === 2020 || formik.values.editionYear === '') && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <DatePicker
                                            label="Issue Date"
                                            value={formik.values.issueDate}
                                            onChange={(value) => {
                                                formik.setFieldValue('issueDate', value);
                                                const role = memberData.find((member) => member.id === formik.values.memberID)?.role;
                                                const dueDate = calculateDueDate(value, role);
                                                formik.setFieldValue('dueDate', dueDate);
                                            }}
                                            format="DD-MM-YYYY"
                                            slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <DatePicker
                                            label="Due Date"
                                            value={formik.values.dueDate}
                                            format="DD-MM-YYYY"
                                            slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                            disabled
                                        />
                                    </Grid>
                                </>
                            )}

                            {formik.values.editionYear === 2021 && (<Grid item xs={12} md={6}>
                                <DatePicker
                                    label="Requested Date"
                                    value={formik.values.RequestedDate}
                                    format="DD-MM-YYYY"
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                    disabled
                                />
                            </Grid>)}
                        </Grid>
                    </Scrollbar>
                    <DialogActions>
                        <Button type="submit" variant="contained" size="small">
                            {(formik.values.editionYear === 2020 || formik.values.editionYear === "") ? "Issue Book" : "Make Reservation"}
                        </Button>
                    </DialogActions>
                </form>
            </Box>
        </CustomDialog>
    );
};

export default IssueBookDialog;




// import React from 'react'
// import { useFormik } from 'formik';

// import { DatePicker } from '@mui/x-date-pickers';
// import { Box, Grid, Button, TextField, DialogActions, } from '@mui/material';

// import { Scrollbar } from 'src/components/scrollbar';
// import CustomDialog from 'src/components/customDialog';

// interface IssueBookDialogProps {
//     dialogValue: boolean;

//     onSave: (values: any) => void;
//     onClose: () => void;
//     data?: any;

// }
// const IssueBookDialog: React.FC<IssueBookDialogProps> = ({ dialogValue, onSave, onClose, data}) => {
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
//             title='Issue Book'
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
//                                     name="memberID"
//                                     label="Member ID"
//                                     value={formik.values.memberID}
//                                     onChange={formik.handleChange}
//                                     size="small"
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <DatePicker
//                                     label="Suggested Return Date"
//                                     value={formik.values.date}
//                                     format="DD-MM-YYYY"
//                                     slotProps={{ textField: { size: 'small', fullWidth: true } }}
//                                     disabled
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <DatePicker
//                                     label="Return Date"
//                                     value={formik.values.returnDate}
//                                     format="DD-MM-YYYY"
//                                     slotProps={{ textField: { size: 'small', fullWidth: true } }}
//                                     disabled
//                                 />
//                             </Grid>



//                         </Grid>
//                     </Scrollbar>
//                     <DialogActions>
//                         <Button type="submit" variant="contained" size="small">
//                             Issue Book
//                         </Button>
//                     </DialogActions>
//                 </form>
//             </Box>
//         </CustomDialog>
//     )
// }

// export default IssueBookDialog