import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';

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
      bookTitle: '',
      bookID: '',
      editionYear: '',
      publisher: '',
      memberID: '',
      issueDate: dayjs(),
      dueDate: dayjs(),
      RequestedDate: dayjs(), // Ensure safe initialization
    },
    onSubmit: (values: any) => {
      console.log('Form Submitted:', values);
      onSave(values);
    },
  });

  const calculateDueDate = (issueDate: any, role: string) => {
    if (!issueDate || !role) return dayjs();
    const daysToAdd = role === 'Student' ? 20 : 30;
    return dayjs(issueDate).add(daysToAdd, 'day');
  };

  const [addedBooks, setAddedBooks] = useState<any[]>([]);

  const handleAddBook = () => {
    if (
      !formik.values.bookID ||
      !formik.values.editionYear ||
      !formik.values.publisher ||
      !formik.values.title
    ) {
      alert('Please fill all the book details before adding.');
      return;
    }
    const newBook = {
      bookID: formik.values.bookID,
      editionYear: formik.values.editionYear,
      publisher: formik.values.publisher,
      title: formik.values.bookTitle,
    };
    setAddedBooks([...addedBooks, newBook]);
    formik.setFieldValue('bookID', '');
    formik.setFieldValue('editionYear', '');
    formik.setFieldValue('publisher', '');
    formik.setFieldValue('bookTitle', '');
  };
  return (
    <CustomDialog title="Issue Book" open={dialogValue} handleClose={onClose} maxWidth="md">
      <Box>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
            <Grid container spacing={3} pt="10px">
              {/* Book Selection */}

              <Grid size={{ xs: 12, md: 6 }}>
                <CustomSelect
                  label="Standard"
                  options={[]} // Empty options for Standard
                  value={formik.values.standard}
                  onChange={(value) => formik.setFieldValue('standard', value)}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomSelect
                  label="Division"
                  options={[]} // Empty options for Division
                  value={formik.values.division}
                  onChange={(value) => formik.setFieldValue('division', value)}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  loading={false}
                  noOptionsText="No Gr Found"
                  fullWidth
                  // value={props.formik.values.sponsorStudent}
                  // onChange={(e, value: any) => {
                  //   props.formik.setFieldValue('sponsorStudent', value);
                  // }}
                  options={[]}
                  getOptionLabel={(option: any) => option?.firstName || ''}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Gr Number"
                      placeholder="Search  Gr Number"
                      fullWidth
                    />
                  )}
                  renderOption={(prop: any, option: any) => (
                    <li {...prop} key={option.id}>
                      {option.firstName}
                    </li>
                  )}
                />
                {/* <CustomSelect
                                    label="GR Number"
                                    options={grOptions}
                                    value={grNumber}
                                    onChange={(value) => setGrNumber(value)}
                                    formControlProps={{ fullWidth: true }}

                                    isSearch
                                /> */}
              </Grid>

              {/* Member Selection */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  loading={false}
                  noOptionsText="No Student Found"
                  fullWidth
                  onChange={(e, value: any) => {
                    console.log('e');
                  }}
                  options={[]}
                  getOptionLabel={(option: any) => `${option.name} (${option.role})`} // Use the formatted label
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Student Name"
                      placeholder="Search Student Name"
                      fullWidth
                      disabled
                    />
                  )}
                  renderOption={(prop: any, option: any) => (
                    <li {...prop} key={option.id}>
                      {option.name} ({option.role}) {/* Display formatted name and role */}
                    </li>
                  )}
                />

                {/* <CustomSelect
                                    isSearch
                                    label="Student Name"
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
                                    formControlProps={{ fullWidth: true }}
                                /> */}
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Book Id"
                  value={formik.values.bookID}
                  onChange={(value) => formik.setFieldValue('bookID', value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomSelect
                  label="Book Title"
                  options={bookData.map((book) => ({
                    label: book.title,
                    value: book.id,
                  }))}
                  value={formik.values.bookTitle}
                  onChange={(value) => formik.setFieldValue('bookTitle', value)}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
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
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomSelect
                  label="Publisher"
                  options={
                    bookData
                      .find((book) => book.id === formik.values.bookID)
                      ?.editions.filter(
                        (edition: any) => edition.year === formik.values.editionYear
                      )
                      .map((edition: any) => ({
                        label: edition.publisher,
                        value: edition.publisher,
                      })) || []
                  }
                  value={formik.values.publisher}
                  onChange={(value) => formik.setFieldValue('publisher', value)}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>

              {/* Dates */}
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Issue Date"
                  value={formik.values.issueDate}
                  onChange={(value) => {
                    formik.setFieldValue('issueDate', value);
                    const role = memberData.find(
                      (member) => member.id === formik.values.memberID
                    )?.role;
                    const dueDate = calculateDueDate(value, role);
                    formik.setFieldValue('dueDate', dueDate);
                  }}
                  format="DD-MM-YYYY"
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Due Date"
                  value={formik.values.dueDate}
                  format="DD-MM-YYYY"
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  disabled
                />
              </Grid>
              {/* Added Books */}
              {addedBooks.length > 0 && (
                <Grid size={12}>
                  <Typography variant="h6">Books to be Issued:</Typography>
                  <CustomizableTable
                    tableId="issue-book-table"
                    isFilter={false}
                    isSearch={false}
                    isShowedDense={false}
                    columns={[
                      { id: 'bookID', label: 'Book ID' },
                      { id: 'editionYear', label: 'Edition Year' },
                      { id: 'publisher', label: 'Publisher' },
                      { id: 'bookTilte', label: 'Tilte' },
                    ]}
                    data={addedBooks}
                  />
                </Grid>
              )}
              {/* Member Information Table */}

              <Grid size={12}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Member Information
                  </Typography>
                  {memberData.find((member) => member.id === formik.values.memberID)?.pendingCharges
                    .length > 0 ? (
                    <>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        The selected member has pending charges:
                      </Typography>
                      <CustomizableTable
                        tableId="member-charges-table"
                        isFilter={false}
                        isSearch={false}
                        isShowedDense={false}
                        columns={[
                          { id: 'type', label: 'Charge Type' },
                          { id: 'amount', label: 'Amount (₹)' },
                          {
                            id: 'status',
                            label: 'Status',
                            render: (value) => (
                              <Label
                                variant="soft"
                                color={value === 'Pending' ? 'warning' : 'success'}
                              >
                                {value}
                              </Label>
                            ),
                          },
                        ]}
                        data={
                          memberData
                            .find((member) => member.id === formik.values.memberID)
                            ?.pendingCharges.map((charge: any) => ({
                              type: charge.type,
                              amount: charge.amount,
                              status: charge.status,
                            })) || []
                        }
                      />
                    </>
                  ) : (
                    <Typography variant="body2" color="success.main">
                      No pending charges for the selected member.
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Scrollbar>
          <DialogActions>
            <Button type="button" variant="outlined" size="small" onClick={handleAddBook}>
              Add Book
            </Button>
            <Button type="submit" variant="contained" size="small">
              {formik.values.editionYear === 2020 || !formik.values.editionYear
                ? 'Issue Book'
                : 'Make Reservation'}
            </Button>
          </DialogActions>
        </form>
      </Box>
    </CustomDialog>
  );
};

export default IssueBookDialog;

// import React from 'react';
// import dayjs from 'dayjs';
// import { useFormik } from 'formik';

// import { DatePicker } from '@mui/x-date-pickers';
// import { Box, Grid, Button, Typography, DialogActions } from '@mui/material';

// import { Label } from 'src/components/label';
// import { Scrollbar } from 'src/components/scrollbar';
// import CustomDialog from 'src/components/customDialog';
// import CustomSelect from 'src/components/custom-select';
// import CustomizableTable from 'src/components/customizabaleTable';

// interface IssueBookDialogProps {
//     dialogValue: boolean;
//     bookData: any[];
//     memberData: any[];
//     onSave: (values: any) => void;
//     onClose: () => void;
// }

// const IssueBookDialog: React.FC<IssueBookDialogProps> = ({
//     dialogValue,
//     bookData,
//     memberData,
//     onSave,
//     onClose,
// }) => {
//     const formik = useFormik<any>({
//         initialValues: {
//             bookID: '',
//             editionYear: '',
//             publisher: '',
//             memberID: '',
//             issueDate: dayjs(),
//             dueDate: dayjs(),
//         },
//         onSubmit: (values: any) => {
//             console.log('Form Submitted:', values);
//             onSave(values);
//         },
//     });

//     // Automatically calculate the due date based on role (e.g., 20 days for students, 30 for teachers)
//     const calculateDueDate = (issueDate: Date, role: string) => {
//         const daysToAdd = role === 'Student' ? 20 : 30;
//         const newDate = new Date(issueDate);
//         newDate.setDate(newDate.getDate() + daysToAdd);
//         return newDate;
//     };

//     // Dummy data for reservation list
//     const reservationData = [
//         { memberName: 'Tom Brown', status: 'Notified', dueDate: '5-11-2024' },
//         { memberName: 'John Doe', status: 'Notified', dueDate: '11-11-2024' },
//         { memberName: 'Michael Johnson', status: 'Notified', dueDate: '12-11-2024' },
//         { memberName: 'Lucy Green', status: 'Waiting', dueDate: '' },
//         { memberName: 'Michael Johnson', status: 'Waiting', dueDate: '' },
//     ];

//     return (
//         <CustomDialog
//             title="Issue Book"
//             open={dialogValue}
//             handleClose={onClose}
//             maxWidth="md"
//         >
//             <Box>
//                 <form onSubmit={formik.handleSubmit}>
//                     <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', }}>
//                         <Grid container spacing={3} pt="10px">
//                             {/* Book Selection */}
//                             <Grid size={{ xs: 12, md: 6 }}>
//                                 <CustomSelect
//                                     label="Book Title"
//                                     options={bookData.map((book) => ({
//                                         label: book.title,
//                                         value: book.id,
//                                     }))}
//                                     value={formik.values.bookID}
//                                     onChange={(value) => formik.setFieldValue('bookID', value)}
//                                     formControlProps={{ fullWidth: true, }}
//                                 />
//                             </Grid>
//                             <Grid size={{ xs: 12, md: 6 }}>
//                                 <CustomSelect
//                                     label="Edition Year"
//                                     options={
//                                         bookData
//                                             .find((book) => book.id === formik.values.bookID)
//                                             ?.editions.map((edition: any) => ({
//                                                 label: edition.year,
//                                                 value: edition.year,
//                                             })) || []
//                                     }
//                                     value={formik.values.editionYear}
//                                     onChange={(value) => formik.setFieldValue('editionYear', value)}
//                                     formControlProps={{ fullWidth: true, }}
//                                     disabled={!formik.values.bookID}
//                                 />
//                             </Grid>
//                             <Grid size={{ xs: 12, md: 6 }}>
//                                 <CustomSelect
//                                     label="Publisher"
//                                     options={
//                                         bookData
//                                             .find((book) => book.id === formik.values.bookID)
//                                             ?.editions
//                                             .filter((edition: any) => edition.year === formik.values.editionYear)
//                                             .map((edition: any) => ({
//                                                 label: edition.publisher,
//                                                 value: edition.publisher,
//                                             })) || []
//                                     }
//                                     value={formik.values.publisher}
//                                     onChange={(value) => formik.setFieldValue('publisher', value)}
//                                     formControlProps={{ fullWidth: true, }}
//                                     disabled={!formik.values.editionYear}
//                                 />
//                             </Grid>

//                             <Grid size={{ xs: 12, md: 6 }}>
//                                 <CustomSelect
//                                     label="Standard"
//                                     options={
//                                         []
//                                     }
//                                     value={formik.values.standard}
//                                     onChange={(value) => formik.setFieldValue('standard', value)}
//                                     formControlProps={{ fullWidth: true, }}

//                                 />
//                             </Grid>

//                             <Grid size={{ xs: 12, md: 6 }}>
//                                 <CustomSelect
//                                     label="Division"
//                                     options={
//                                         []
//                                     }
//                                     value={formik.values.division}
//                                     onChange={(value) => formik.setFieldValue('division', value)}
//                                     formControlProps={{ fullWidth: true, }}

//                                 />
//                             </Grid>
//                             <Grid size={{ xs: 12, md: 6 }}>
//                                 <CustomSelect
//                                     label="Gr Number"
//                                     options={
//                                         []
//                                     }
//                                     value={formik.values.grNumber}
//                                     onChange={(value) => formik.setFieldValue('grNumber', value)}
//                                     formControlProps={{ fullWidth: true, }}

//                                 />
//                             </Grid>

//                             {/* Member Selection */}
//                             <Grid size={{ xs: 12, md: 6 }}>
//                                 <CustomSelect
//                                     isSearch
//                                     label="Student Name"
//                                     options={memberData.map((member) => ({
//                                         label: `${member.name} (${member.role})`,
//                                         value: member.id,
//                                     }))}
//                                     value={formik.values.memberID}
//                                     onChange={(value) => {
//                                         formik.setFieldValue('memberID', value);
//                                         const role = memberData.find((member) => member.id === value)?.role;
//                                         const dueDate = calculateDueDate(formik.values.issueDate, role);
//                                         formik.setFieldValue('dueDate', dueDate);
//                                     }}
//                                     formControlProps={{ fullWidth: true, }}
//                                 />
//                             </Grid>

//                             {/* Date Handling */}
//                             {(formik.values.editionYear === 2020 || formik.values.editionYear === '') && (
//                                 <>
//                                     <Grid size={{ xs: 12, md: 6 }}>
//                                         <DatePicker
//                                             label="Issue Date"
//                                             value={formik.values.issueDate}
//                                             onChange={(value) => {
//                                                 formik.setFieldValue('issueDate', value);
//                                                 const role = memberData.find((member) => member.id === formik.values.memberID)?.role;
//                                                 const dueDate = calculateDueDate(value, role);
//                                                 formik.setFieldValue('dueDate', dueDate);
//                                             }}
//                                             format="DD-MM-YYYY"
//                                             slotProps={{ textField: { size: 'small', fullWidth: true } }}
//                                         />
//                                     </Grid>
//                                     <Grid size={{ xs: 12, md: 6 }}>
//                                         <DatePicker
//                                             label="Due Date"
//                                             value={formik.values.dueDate}
//                                             format="DD-MM-YYYY"
//                                             slotProps={{ textField: { size: 'small', fullWidth: true } }}
//                                             disabled
//                                         />
//                                     </Grid>
//                                 </>
//                             )}

//                             {formik.values.editionYear === 2021 && (
//                                 <Grid size={{ xs: 12, md: 6 }}>
//                                     <DatePicker
//                                         label="Requested Date"
//                                         value={formik.values.RequestedDate}
//                                         format="DD-MM-YYYY"
//                                         slotProps={{ textField: { size: 'small', fullWidth: true } }}
//                                         disabled
//                                     />
//                                 </Grid>)}

//                             {/* Reservation List Table */}
//                             {(formik.values.memberID) &&
//                                 <Grid size={12}>
//                                     <Box
//                                         sx={{
//                                             p: 2,
//                                             border: '1px solid',
//                                             borderColor: 'grey.300',
//                                             borderRadius: 2,
//                                             bgcolor: 'background.paper',
//                                         }}
//                                     >
//                                         <Typography variant="h6" sx={{ mb: 2 }}>
//                                             Member Information
//                                         </Typography>

//                                         {memberData
//                                             .find((member) => member.id === formik.values.memberID)
//                                             ?.pendingCharges.length > 0 ? (
//                                             <>
//                                                 <Typography variant="body1" sx={{ mb: 1 }}>
//                                                     The selected member has pending charges:
//                                                 </Typography>
//                                                 <CustomizableTable
//                                                     isFilter={false}
//                                                     isSearch={false}
//                                                     isShowedDense={false}
//                                                     columns={[
//                                                         { id: 'type', label: 'Charge Type' },
//                                                         { id: 'amount', label: 'Amount (₹)' },
//                                                         {
//                                                             id: 'status',
//                                                             label: 'Status',
//                                                             render: (value) => (
//                                                                 <Label
//                                                                     variant="soft"
//                                                                     color={value === 'Pending' ? 'warning' : 'success'}
//                                                                 >
//                                                                     {value}
//                                                                 </Label>
//                                                             ),
//                                                         },
//                                                     ]}
//                                                     data={memberData
//                                                         .find((member) => member.id === formik.values.memberID)
//                                                         ?.pendingCharges.map((charge: any) => ({
//                                                             type: charge.type,
//                                                             amount: charge.amount,
//                                                             status: charge.status,
//                                                         })) || []}
//                                                 />
//                                             </>
//                                         ) : (
//                                             <Typography variant="body2" color="success.main">
//                                                 No pending charges for the selected member.
//                                             </Typography>
//                                         )}
//                                     </Box>
//                                 </Grid>}
//                         </Grid>
//                     </Scrollbar>
//                     <DialogActions>
//                         <Button type="submit" variant="contained" size="small">
//                             {(formik.values.editionYear === 2020 || formik.values.editionYear === "") ? "Issue Book" : "Make Reservation"}
//                         </Button>
//                     </DialogActions>
//                 </form>
//             </Box>
//         </CustomDialog>
//     );
// };

// export default IssueBookDialog;

// // import React from 'react'
// // import { useFormik } from 'formik';

// // import { DatePicker } from '@mui/x-date-pickers';
// // import { Box, Grid, Button, TextField, DialogActions, } from '@mui/material';

// // import { Scrollbar } from 'src/components/scrollbar';
// // import CustomDialog from 'src/components/customDialog';

// // interface IssueBookDialogProps {
// //     dialogValue: boolean;

// //     onSave: (values: any) => void;
// //     onClose: () => void;
// //     data?: any;

// // }
// // const IssueBookDialog: React.FC<IssueBookDialogProps> = ({ dialogValue, onSave, onClose, data}) => {
// //     const formik = useFormik<any>({
// //         initialValues: {
// //             bookTitle: '',
// //             bookAuthor: '',
// //             isbn: '',
// //             tags: '',
// //             quantity: '',
// //             category: '',
// //             condition: '',
// //         },
// //         onSubmit: (values: any) => {
// //             console.log('Form Submitted:', values);
// //             onSave(values);
// //         },
// //     });
// //     return (
// //         <CustomDialog
// //             title='Issue Book'
// //             open={dialogValue}
// //             handleClose={onClose}
// //             maxWidth="md"
// //         >
// //             <Box>
// //                 <form onSubmit={formik.handleSubmit}>
// //                     <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '200px' }}>
// //                         <Grid container spacing={3} pt="10px">
// //                             <Grid size={{ xs: 12, md: 6 }}>
// //                                 <TextField
// //                                     fullWidth
// //                                     name="bookID"
// //                                     label="Book ID"
// //                                     value={formik.values.bookID}
// //                                     onChange={formik.handleChange}
// //                                     size="small"
// //                                 />
// //                             </Grid>
// //                             <Grid size={{ xs: 12, md: 6 }}>
// //                                 <TextField
// //                                     fullWidth
// //                                     name="memberID"
// //                                     label="Member ID"
// //                                     value={formik.values.memberID}
// //                                     onChange={formik.handleChange}
// //                                     size="small"
// //                                 />
// //                             </Grid>
// //                             <Grid size={{ xs: 12, md: 6 }}>
// //                                 <DatePicker
// //                                     label="Suggested Return Date"
// //                                     value={formik.values.date}
// //                                     format="DD-MM-YYYY"
// //                                     slotProps={{ textField: { size: 'small', fullWidth: true } }}
// //                                     disabled
// //                                 />
// //                             </Grid>
// //                             <Grid size={{ xs: 12, md: 6 }}>
// //                                 <DatePicker
// //                                     label="Return Date"
// //                                     value={formik.values.returnDate}
// //                                     format="DD-MM-YYYY"
// //                                     slotProps={{ textField: { size: 'small', fullWidth: true } }}
// //                                     disabled
// //                                 />
// //                             </Grid>

// //                         </Grid>
// //                     </Scrollbar>
// //                     <DialogActions>
// //                         <Button type="submit" variant="contained" size="small">
// //                             Issue Book
// //                         </Button>
// //                     </DialogActions>
// //                 </form>
// //             </Box>
// //         </CustomDialog>
// //     )
// // }

// // export default IssueBookDialog
