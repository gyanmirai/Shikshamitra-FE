
'use client';

import React, { useState } from 'react';

import {
  Box, Table, Paper,
  MenuItem,
  MenuList,
  TableRow,
  useTheme,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  DialogContent,
  InputAdornment,
  TableContainer,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import IssueBookDialog from './component/issue-book-dialog';
import ReturnBookDialog from './component/return-book-dialog';
import AddNewBookDialog from './component/add-new-book-dialog';
import CommonCtaComponent from '../component/common-cta-component';
import AddNewMemberDialog from '../member-management/component/add-new-member-dialog';

const bookData = [
  {
    id: "B001",
    title: "Introduction to Programming",
    author: "John Doe",
    publisher: "TechPress",
    editions: [
      {
        year: 2020,
        publisher: "TechPress",
        totalCopies: 5,
        availableCopies: 2,
      },
      {
        year: 2021,
        publisher: "TechPress",
        totalCopies: 3,
        availableCopies: 1,
      },
    ],
  },
  {
    id: "B002",
    title: "Advanced Programming Techniques",
    author: "Jane Smith",
    publisher: "CodePub",
    editions: [
      {
        year: 2021,
        publisher: "CodePub",
        totalCopies: 4,
        availableCopies: 2,
      },
      {
        year: 2022,
        publisher: "CodePub",
        totalCopies: 6,
        availableCopies: 4,
      },
    ],
  },
  {
    id: "B003",
    title: "Data Structures and Algorithms",
    author: "Michael Brown",
    publisher: "AlgoBooks",
    editions: [
      {
        year: 2019,
        publisher: "AlgoBooks",
        totalCopies: 3,
        availableCopies: 0, // No copies available
      },
      {
        year: 2020,
        publisher: "AlgoBooks",
        totalCopies: 5,
        availableCopies: 5, // Available for issue
      },
    ],
  },
];


const memberData = [
  {
    id: "S001",
    name: "Alice",
    role: "Student",
    pendingCharges: [
      { type: 'Damage Fee', amount: 100, status: 'Pending' },
      { type: 'Late Return Fee', amount: 30, status: 'Pending' },
    ],
  },
  {
    id: "S002",
    name: "Bob",
    role: "Student",
    pendingCharges: [
      { type: 'Overdue Fee', amount: 20, status: 'Pending' },
    ],
  },
  {
    id: "T001",
    name: "Charlie",
    role: "Teacher",
    pendingCharges: [],
  },
  {
    id: "T002",
    name: "Dana",
    role: "Teacher",
    pendingCharges: [
      { type: 'Damage Fee', amount: 100, status: 'Pending' },
      { type: 'Late Return Fee', amount: 30, status: 'Pending' },
    ],
  },

];


const books = [
  {
    id: "B001",
    title: "Introduction to Programming",
    author: "John Doe",
    publisher: "TechPress",
    editions: [
      {
        year: 2020,
        totalCopies: 5,
        availableCopies: 2,
        currentIssuers: [
          { userId: "S005", name: "Alice", role: "Student", issueDate: "2024-11-10", dueDate: "2024-12-01" },
          { userId: "S006", name: "Bob", role: "Student", issueDate: "2024-11-12", dueDate: "2024-12-02" },
        ],
        reservedList: [
          { userId: "S007", name: "Charlie", role: "Teacher", reservationDate: "2024-11-15" },
        ],
      },
      {
        year: 2021,
        totalCopies: 3,
        availableCopies: 1,
        currentIssuers: [
          { userId: "S008", name: "Dana", role: "Student", issueDate: "2024-11-15", dueDate: "2024-12-05" },
        ],
        reservedList: [],
      },
    ],
  },
  {
    id: "B002",
    title: "Data Structures and Algorithms",
    author: "Jane Smith",
    publisher: "CodeWorks",
    editions: [
      {
        year: 2019,
        totalCopies: 6,
        availableCopies: 0,
        currentIssuers: [
          { userId: "S009", name: "Eve", role: "Teacher", issueDate: "2024-11-01", dueDate: "2024-11-20" },
          { userId: "S010", name: "Frank", role: "Student", issueDate: "2024-11-05", dueDate: "2024-11-25" },
          { userId: "S011", name: "Grace", role: "Student", issueDate: "2024-11-08", dueDate: "2024-11-28" },
        ],
        reservedList: [
          { userId: "S012", name: "Hannah", role: "Teacher", reservationDate: "2024-11-18" },
          { userId: "S013", name: "Ivy", role: "Student", reservationDate: "2024-11-20" },
        ],
      },
      {
        year: 2020,
        totalCopies: 4,
        availableCopies: 1,
        currentIssuers: [
          { userId: "S014", name: "Jack", role: "Student", issueDate: "2024-11-12", dueDate: "2024-12-01" },
        ],
        reservedList: [],
      },
    ],
  },
  {
    id: "B003",
    title: "Modern Physics",
    author: "Albert Newton",
    publisher: "SciPub",
    editions: [
      {
        year: 2018,
        totalCopies: 2,
        availableCopies: 0,
        currentIssuers: [
          { userId: "S015", name: "Kim", role: "Student", issueDate: "2024-11-05", dueDate: "2024-11-25" },
          { userId: "S016", name: "Liam", role: "Teacher", issueDate: "2024-11-07", dueDate: "2024-11-27" },
        ],
        reservedList: [
          { userId: "S017", name: "Mia", role: "Student", reservationDate: "2024-11-20" },
        ],
      },
    ],
  },
  {
    id: "B004",
    title: "History of Civilizations",
    author: "Diana Prince",
    publisher: "HeritagePress",
    editions: [
      {
        year: 2017,
        totalCopies: 8,
        availableCopies: 5,
        currentIssuers: [
          { userId: "S018", name: "Noah", role: "Teacher", issueDate: "2024-11-15", dueDate: "2024-12-05" },
          { userId: "S019", name: "Olivia", role: "Student", issueDate: "2024-11-16", dueDate: "2024-12-06" },
        ],
        reservedList: [],
      },
    ],
  },
  {
    id: "B005",
    title: "Artificial Intelligence: Basics",
    author: "Sophia Robotics",
    publisher: "FutureTech",
    editions: [
      {
        year: 2023,
        totalCopies: 10,
        availableCopies: 10,
        currentIssuers: [],
        reservedList: [],
      },
    ],
  },
];


const LibraryBookManagementScreen = () => {
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);



  const [selectedBook, setSelectedBook] = useState<any>(null);

  const handleViewDetails = (book: any) => {
    setSelectedBook(book);
  };

  const handleCloseDialog = () => {
    setSelectedBook(null);
  };


  // Dialog state handlers
  const addMemberDialog = useBoolean();
  const addNewBookDialog = useBoolean();
  const issueBookDialog = useBoolean();
  const returnBookDialog = useBoolean();

  const data = [
    {
      bookId: 'A9i878',
      title: 'Maths',
      author: 'Vikas',
      isbn: '-',
      category: 'Education',
      year: '2024',
      availability: 'Not Available',
    },
  ];

  // Handlers for dialogs
  const openDialog = (dialog: any, entry: any = null, editMode = false) => {
    setSelectedEntry(entry);
    setIsEdit(editMode);
    dialog.onTrue();
  };

  const closeDialog = (dialog: any) => {
    setSelectedEntry(null);
    setIsEdit(false);
    dialog.onFalse();
  };

  const saveHandler = () => {
    console.log('Saved data:', data);

  };

  // Actions for the table rows
  const renderTableActions = (row: any) => (
    <ThreeDotsActions
      placement="right-top"
      actions={({ popover }: any) => (
        <MenuList>
          <MenuItem
            onClick={() => {
              openDialog(addNewBookDialog, row, true);
              popover.onClose()
            }}
          >
            <Iconify icon="mdi:eye" />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              openDialog(issueBookDialog, row);
              popover.onClose()
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Issue Book
          </MenuItem>
          <MenuItem
            onClick={() => {
              // Add delete logic here
              console.log('Delete:', row);
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      )}
    />
  );

  const headerCellStyle = {
    border: '1px solid #ccc',
    padding: '10px',
    position: 'sticky',
    top: 0,
    background: '#f4f6f8',
    zIndex: 1,
    width: "100px",
  };


  const cellStyle: React.CSSProperties = {
    // border: '1px solid #ccc',
    // padding: '10px',
    fontSize: '12px',
    // textAlign: 'center',
  };

  const theme = useTheme();
  return (
    <>
      <CustomBreadcrumbs
        heading="Book Management"
        links={[
          { name: 'Library' },
          { name: 'Book Management' },

        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box pb="20px" display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <TextField
          // fullWidth
          placeholder="Search by book name , category , status"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ color: 'text.disabled', width: 20, height: 20 }}
                />
              </InputAdornment>
            ),
          }}
          size="small"
          value=''
          onChange={() => { }}
          sx={{ '& input': { fontSize: '12px' }, width: "400px" }}
        />
        <CommonCtaComponent
          bookHandler={() => openDialog(addNewBookDialog)}
          issueBookHandler={() => openDialog(issueBookDialog)}
          returnBookHandler={() => openDialog(returnBookDialog)}
          createReservationHandler={() => openDialog(addMemberDialog)}
        />
      </Box>
      {/* <CustomizableTable
        columns={[
          { id: 'bookId', label: 'Book Id' },
          { id: 'title', label: 'Title' },
          { id: 'author', label: 'Author' },
          { id: 'isbn', label: 'ISBN' },
          { id: 'category', label: 'Category' },
          { id: 'availability', label: 'Availability' },
          { id: 'action', label: 'Action', render: (_, row) => renderTableActions(row) },
        ]}
        data={data}
      /> */}

      {/* Add/Edit Book Dialog */}
      {addNewBookDialog.value && (
        <AddNewBookDialog
          dialogValue={addNewBookDialog.value}
          data={selectedEntry}
          onSave={saveHandler}
          onClose={() => closeDialog(addNewBookDialog)}
          isEdit={isEdit}
        />
      )}

      {/* Issue Book Dialog */}
      {issueBookDialog.value && (
        <IssueBookDialog
          dialogValue={issueBookDialog.value}
          bookData={bookData}
          memberData={memberData}
          onSave={saveHandler}
          onClose={() => closeDialog(issueBookDialog)}
        />
      )}

      {/* Return Book Dialog */}
      {returnBookDialog.value && (
        <ReturnBookDialog
          dialogValue={returnBookDialog.value}
          onSave={saveHandler}
          bookData={bookData}
          memberData={memberData}
          onClose={() => closeDialog(returnBookDialog)}
        />
      )}
      {addMemberDialog &&
        <AddNewMemberDialog
          dialogValue={addMemberDialog.value}
          data={selectedEntry}
          onSave={saveHandler}
          onClose={() => closeDialog(addMemberDialog)}
          isEdit={isEdit}
          isRenewMembership={false}
        />
      }

      <div>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>

                <TableCell sx={{ ...headerCellStyle, width: "30px" }}>ISBN</TableCell>
                <TableCell sx={{ ...headerCellStyle, width: "330px" }}>Name</TableCell>
                {/* <TableCell sx={headerCellStyle}>Role</TableCell> */}
                <TableCell sx={{ ...headerCellStyle, width: "30px" }}>Borrowed</TableCell>
                <TableCell sx={{ ...headerCellStyle, width: "30px" }}>Overdue</TableCell>
                <TableCell sx={{ ...headerCellStyle, width: "30px" }}>Reserved</TableCell>
                <TableCell sx={{ ...headerCellStyle, width: "30px" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>

                  <TableCell sx={cellStyle}>{book.id}</TableCell>
                  <TableCell sx={cellStyle}>{book.title}</TableCell>
                  {/* <TableCell sx={cellStyle}>Author</TableCell> */}
                  <TableCell sx={cellStyle}>
                    {book.editions.reduce((acc, edition) => acc + edition.currentIssuers.length, 0)}
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    {/* Example logic for overdue */}
                    {book.editions.reduce(
                      (acc, edition) =>
                        acc +
                        edition.currentIssuers.filter(
                          (issuer) => new Date(issuer.dueDate) < new Date()
                        ).length,
                      0
                    )}
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    {book.editions.reduce((acc, edition) => acc + edition.reservedList.length, 0)}
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    <ThreeDotsActions
                      placement="right-top"
                      actions={({ popover }) => (
                        <MenuList>
                          <MenuItem
                            onClick={() => {
                              // handleDelete(book);
                              handleViewDetails(book)
                            }}
                          >
                            <Iconify icon="mdi:eye" />
                            View Details
                          </MenuItem>
                          {/* <MenuItem
                            onClick={() => {
                              setIsEdit(true);
                              console.log('data row', book);
                              addNewBookDialog.onTrue();
                              setSelectedEntry(book);
                            }}
                          >
                            <Iconify icon="solar:pen-bold" />
                            Edit
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              setSelectedEntry(book);
                              issueBookDialog.onTrue();
                            }}
                          >
                            <Iconify icon="solar:pen-bold" />
                            Issue Book
                          </MenuItem> */}
                          <MenuItem
                            onClick={() => {
                              // handleDelete(book);
                            }}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                            Delete
                          </MenuItem>
                        </MenuList>
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>

        {/* Dialog for Book Details */}
        {selectedBook && (
          <CustomDialog
            title={`${selectedBook.title}`}
            open={!!selectedBook}
            handleClose={handleCloseDialog}
            maxWidth="xl"
          >
            <Scrollbar sx={{ overflow: "auto", maxHeight: "550px" }}>
              <DialogContent>
                {/* Current Issuers Table */}
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                  Current Issuers
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headerCellStyle}>Name</TableCell>
                        <TableCell sx={headerCellStyle}>ID</TableCell>
                        <TableCell sx={headerCellStyle}>Role</TableCell>
                        <TableCell sx={headerCellStyle}>Issue Date</TableCell>
                        <TableCell sx={headerCellStyle}>Due Date</TableCell>
                        <TableCell sx={headerCellStyle}>Year</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedBook.editions.flatMap((edition: any) =>
                        edition.currentIssuers.map((issuer: any) => ({
                          ...issuer,
                          year: edition.year,
                        }))
                      ).length > 0 ? (
                        selectedBook.editions.flatMap((edition: any) =>
                          edition.currentIssuers.map((issuer: any) => (
                            <TableRow key={issuer.userId}>
                              <TableCell sx={cellStyle}>{issuer.name}</TableCell>
                              <TableCell sx={cellStyle}>{issuer.userId}</TableCell>
                              <TableCell sx={cellStyle}>{issuer.role}</TableCell>
                              <TableCell sx={cellStyle}>{issuer.issueDate}</TableCell>
                              <TableCell sx={cellStyle}>{issuer.dueDate}</TableCell>
                              <TableCell sx={cellStyle}>{edition.year}</TableCell>
                            </TableRow>
                          ))
                        )
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: "center", padding: "16px" }}>
                            No current issuers available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Reserved List Table */}
                <Typography variant="h6" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
                  Reserved List
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headerCellStyle}>Name</TableCell>
                        <TableCell sx={headerCellStyle}>ID</TableCell>
                        <TableCell sx={headerCellStyle}>Role</TableCell>
                        <TableCell sx={headerCellStyle}>Reservation Date</TableCell>
                        <TableCell sx={headerCellStyle}>Year</TableCell>
                        <TableCell sx={headerCellStyle}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedBook.editions.flatMap((edition: any) =>
                        edition.reservedList.map((reservation: any) => ({
                          ...reservation,
                          year: edition.year,
                        }))
                      ).length > 0 ? (
                        selectedBook.editions.flatMap((edition: any) =>
                          edition.reservedList.map((reservation: any) => (
                            <TableRow key={reservation.userId}>
                              <TableCell sx={cellStyle}>{reservation.name}</TableCell>
                              <TableCell sx={cellStyle}>{reservation.userId}</TableCell>
                              <TableCell sx={cellStyle}>{reservation.role}</TableCell>
                              <TableCell sx={cellStyle}>{reservation.reservationDate}</TableCell>
                              <TableCell sx={cellStyle}>{edition.year}</TableCell>
                              <TableCell sx={cellStyle}>
                                {/* Actions Dropdown */}
                                <ThreeDotsActions
                                  placement="right-top"
                                  actions={({ popover }) => (
                                    <MenuList>
                                      <MenuItem
                                        onClick={() => {
                                          // handleDelete(reservation);
                                        }}
                                      >
                                        <Iconify icon="solar:trash-bin-trash-bold" />
                                        Delete
                                      </MenuItem>
                                    </MenuList>
                                  )}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        )
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: "center", padding: "16px" }}>
                            No reservations made yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
            </Scrollbar>
            {/* <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions> */}
          </CustomDialog>)}
      </div>
    </>
  );
};

export default LibraryBookManagementScreen;


// {selectedBook && (
//   <CustomDialog
//     title={`Book Details - ${selectedBook.title}`}
//     open={!!selectedBook}
//     handleClose={handleCloseDialog}
//     maxWidth="xl"
//   >
//     <Scrollbar sx={{ overflow: 'auto', maxHeight: '550px' }}>
//       <DialogContent>
//         {selectedBook.editions.map((edition: any) => (
//           <Accordion key={edition.year}>
//             {/* Accordion Summary */}
//             <AccordionSummary
//               expandIcon={<Iconify icon="iconamoon:arrow-up-2-thin" />}

//             >
//               <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
//                 Year: {edition.year} | Publisher: {selectedBook.publisher}
//               </Typography>
//             </AccordionSummary>

//             {/* Accordion Details */}
//             <AccordionDetails>
//               <Typography>Total Copies: {edition.totalCopies}</Typography>
//               <Typography>Available Copies: {edition.availableCopies}</Typography>

//               {/* Current Issuers Table */}
//               <Typography sx={{ py: "15px", fontWeight: 'bold' }}>Current Issuers:</Typography>
//               <Table size="small">
//                 <TableHead>
//                   <TableRow>
//                     <TableCell sx={headerCellStyle}>Name</TableCell>
//                     <TableCell sx={headerCellStyle}>ID</TableCell>
//                     <TableCell sx={headerCellStyle}>Role</TableCell>
//                     <TableCell sx={headerCellStyle}>Issue Date</TableCell>
//                     <TableCell sx={headerCellStyle}>Due Date</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {edition.currentIssuers.length > 0 ? (
//                     edition.currentIssuers.map((issuer: any) => (
//                       <TableRow key={issuer.userId}>
//                         <TableCell sx={cellStyle}>{issuer.name}</TableCell>
//                         <TableCell sx={cellStyle}>{issuer.userId}</TableCell>
//                         <TableCell sx={cellStyle}>{issuer.role}</TableCell>
//                         <TableCell sx={cellStyle}>{issuer.issueDate}</TableCell>
//                         <TableCell sx={cellStyle}>{issuer.dueDate}</TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={5} sx={{ textAlign: "center", padding: "16px" }}>
//                         No current issuers available
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>

//               {/* Reserved List Table */}
//               <Typography sx={{ py: "15px", fontWeight: 'bold' }}>Reserved List:</Typography>
//               <Table size="small">
//                 <TableHead>
//                   <TableRow>
//                     <TableCell sx={headerCellStyle}>Name</TableCell>
//                     <TableCell sx={headerCellStyle}>ID</TableCell>
//                     <TableCell sx={headerCellStyle}>Role</TableCell>
//                     <TableCell sx={headerCellStyle}>Reservation Date</TableCell>
//                     <TableCell sx={headerCellStyle}>Action</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {edition.reservedList.length > 0 ? (
//                     edition.reservedList.map((reservation: any) => (
//                       <TableRow key={reservation.userId}>
//                         <TableCell sx={cellStyle}>{reservation.name}</TableCell>
//                         <TableCell sx={cellStyle}>{reservation.userId}</TableCell>
//                         <TableCell sx={cellStyle}>{reservation.role}</TableCell>
//                         <TableCell sx={cellStyle}>{reservation.reservationDate}</TableCell>
//                         <TableCell sx={cellStyle}>
//                           <ThreeDotsActions
//                             placement="right-top"
//                             actions={({ popover }) => (
//                               <MenuList>
//                                 <MenuItem
//                                   onClick={() => {
//                                     // handleDelete(book);
//                                   }}
//                                 >
//                                   <Iconify icon="solar:trash-bin-trash-bold" />
//                                   Delete
//                                 </MenuItem>


//                               </MenuList>
//                             )}
//                           />
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={5} sx={{ textAlign: "center", padding: "16px" }}>
//                         No reservations made yet
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </AccordionDetails>
//           </Accordion>
//         ))}
//       </DialogContent>
//     </Scrollbar>
//   </CustomDialog>
// )}








// 'use client'

// import React, { useState, useEffect } from 'react'

// import { MenuItem, MenuList } from '@mui/material';

// import { useBoolean } from 'src/hooks/use-boolean';

// import { Iconify } from 'src/components/iconify';
// import ThreeDotsActions from 'src/components/three-dots-actions';
// import CustomizableTable from 'src/components/customizabaleTable';

// import IssueBookDialog from './component/issue-book-dialog';
// import ReturnBookDialog from './component/return-book-dialog';
// import AddNewBookDialog from './component/add-new-book-dialog';
// import CommonCtaComponent from '../component/common-cta-component';

// const LibraryBookManagementScreen = () => {
//   const data = [
//     {
//       bookId: "A9i878",
//       title: "Maths",
//       author: "Vikas",
//       isbn: "-",
//       category: "Education",
//       year: "2024",
//       availability: "Not Available"

//     },

//   ];

//   const addNewBookDialogValue = useBoolean();
//   const [selectedEntry, setSelectedEntry] = useState<any>()
//   const [isEdit, setIsEdit] = useState(false)

//   const issueBookDialogValue = useBoolean();
//   const returnBookDialogValue = useBoolean();


//   const closeDialogHandler = () => {
//     setIsEdit(false)
//     addNewBookDialogValue.onFalse()
//   }
//   const saveHandler = () => {

//   }

//   const closeIsueBookDialog = () => {
//     issueBookDialogValue.onFalse();
//   }

//   const closeReturnBookDialog = () => {
//     returnBookDialogValue.onFalse();
//   }
//   const addNewBookCtaHandler = () => {
//     setIsEdit(false)
//     addNewBookDialogValue.onTrue()
//   }

//   const issueBookCtaHandler = () => {
//     issueBookDialogValue.onTrue();
//   }

//   const returnBookCtaHandler = () => {
//     returnBookDialogValue.onTrue();
//   }

//   useEffect(() => { }, [selectedEntry, isEdit,])

//   return (
//     <>
//       <CommonCtaComponent
//         bookHandler={addNewBookCtaHandler}
//         issueBookHandler={issueBookCtaHandler}
//         returnBookHandler={returnBookCtaHandler}
//       />
//       <CustomizableTable columns={
//         [
//           { id: "bookId", label: "Book Id" },
//           { id: "title", label: "Title" },
//           { id: "author", label: "Author" },
//           { id: "isbn", label: "ISBN" },
//           { id: "category", label: "Category" },
//           { id: "availability", label: "Availability" },
//           {
//             id: "action", label: "Action", render(value, row) {
//               return (
//                 <ThreeDotsActions
//                   placement="right-top"
//                   actions={({ popover }: any) => (
//                     <MenuList>
//                       <MenuItem
//                         onClick={() => {
//                           setIsEdit(true);
//                           console.log('data row', row);
//                           addNewBookDialogValue.onTrue();
//                           setSelectedEntry(row);
//                         }}
//                       >
//                         <Iconify icon="mdi:eye" />
//                         Edit
//                       </MenuItem>
//                       <MenuItem
//                         onClick={() => {

//                           setSelectedEntry(row);
//                           issueBookDialogValue.onTrue();
//                           // dialog.onTrue();
//                         }}
//                       >
//                         <Iconify icon="solar:pen-bold" />
//                         Issue Book
//                       </MenuItem>
//                       <MenuItem
//                         onClick={() => {
//                           // handleDelete(row);
//                         }}
//                       >
//                         <Iconify icon="solar:trash-bin-trash-bold" />
//                         Delete
//                       </MenuItem>
//                     </MenuList>
//                   )}
//                 />
//               );
//             },
//           },

//         ]
//       }
//         data={data} />
//       {addNewBookDialogValue && <AddNewBookDialog
//         dialogValue={addNewBookDialogValue.value}
//         data={selectedEntry}
//         onSave={saveHandler}
//         onClose={closeDialogHandler}
//         isEdit={isEdit}

//       />}

//       {issueBookDialogValue &&
//         <IssueBookDialog
//           dialogValue={issueBookDialogValue.value}
//           data={selectedEntry}
//           onSave={saveHandler}
//           onClose={closeIsueBookDialog}
//         />
//       }

//       {returnBookDialogValue.value &&
//         <ReturnBookDialog
//           dialogValue={returnBookDialogValue.value}
//           onSave={saveHandler}
//           onClose={closeReturnBookDialog} />
//       }
//     </>


//   )
// }

// export default LibraryBookManagementScreen