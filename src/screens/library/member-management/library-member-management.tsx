'use client';

import React, { useState } from 'react';

import { Box, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AddNewMemberDialog from './component/add-new-member-dialog';
import CommonCtaComponent from '../component/common-cta-component';
import MemberDetailsDialog from './component/member-details-dialog';
import IssueBookDialog from '../book-management/component/issue-book-dialog';
import ReturnBookDialog from '../book-management/component/return-book-dialog';
import AddNewBookDialog from '../book-management/component/add-new-book-dialog';

const memberDummyData = [
  {
    memberId: 'A9i878',
    name: 'Vikas',
    role: 'Student',
    memberStatus: 'Active',
    class: '10',
    borrowLimit: 1,
    currentIssue: 5,
    pendingReturn: 3,
    overdueReturn: 3,
    issuedBooks: [
      {
        bookId: 'B1',
        title: 'Introduction to Algorithms',
        issueDate: '2024-11-01',
        dueDate: '2024-12-01',
        issueCount: 2,
      },
    ],
    reservedBooks: [
      {
        bookId: 'B2',
        title: 'JavaScript The Good Parts',
        reservationDate: '2024-11-15',
      },
    ],
  },
  {
    memberId: 'A9i879',
    name: 'Vishal',
    role: 'Student',
    memberStatus: 'Active',
    class: '9',
    borrowLimit: 1,
    currentIssue: 0,
    pendingReturn: 0,
    overdueReturn: 0,
    issuedBooks: [],
    reservedBooks: [],
  },
  {
    memberId: 'A9i880',
    name: 'Ramesh',
    role: 'Teacher',
    memberStatus: 'Active',
    borrowLimit: 5,
    currentIssue: 5,
    pendingReturn: 3,
    overdueReturn: 3,
    issuedBooks: [
      {
        bookId: 'B3',
        title: 'Advanced Mathematics',
        issueDate: '2024-10-20',
        dueDate: '2024-11-20',
        issueCount: 1,
      },
    ],
    reservedBooks: [],
  },
];

const bookData = [
  {
    id: 'B001',
    title: 'Introduction to Programming',
    author: 'John Doe',
    publisher: 'TechPress',
    editions: [
      {
        year: 2020,
        publisher: 'TechPress',
        totalCopies: 5,
        availableCopies: 2,
      },
      {
        year: 2021,
        publisher: 'TechPress',
        totalCopies: 3,
        availableCopies: 1,
      },
    ],
  },
  {
    id: 'B002',
    title: 'Advanced Programming Techniques',
    author: 'Jane Smith',
    publisher: 'CodePub',
    editions: [
      {
        year: 2021,
        publisher: 'CodePub',
        totalCopies: 4,
        availableCopies: 2,
      },
      {
        year: 2022,
        publisher: 'CodePub',
        totalCopies: 6,
        availableCopies: 4,
      },
    ],
  },
  {
    id: 'B003',
    title: 'Data Structures and Algorithms',
    author: 'Michael Brown',
    publisher: 'AlgoBooks',
    editions: [
      {
        year: 2019,
        publisher: 'AlgoBooks',
        totalCopies: 3,
        availableCopies: 0,
      },
      {
        year: 2020,
        publisher: 'AlgoBooks',
        totalCopies: 5,
        availableCopies: 5,
      },
    ],
  },
];

const LibraryMemberManagementScreen = () => {
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isRenewMembership, setIsRenewMembership] = useState(false);

  // Dialog state handlers
  const addMemberDialog = useBoolean();
  const addNewBookDialog = useBoolean();
  const issueBookDialog = useBoolean();
  const returnBookDialog = useBoolean();
  const memberDetailsDialog = useBoolean(); // State for Member Details Dialog

  const openDialog = (dialog: any, entry: any = null, editMode = false, renew = false) => {
    setSelectedEntry(entry);
    setIsEdit(editMode);
    setIsRenewMembership(renew);
    dialog.onTrue();
  };

  const closeDialog = (dialog: any) => {
    setSelectedEntry(null);
    setIsEdit(false);
    setIsRenewMembership(false);
    dialog.onFalse();
  };

  const saveHandler = () => {
    console.log('Saved data:', selectedEntry);
  };

  const renderTableActions = (row: any) => (
    <ThreeDotsActions
      placement="right-top"
      actions={({ popover }: any) => (
        <MenuList>
          <MenuItem
            onClick={() => {
              openDialog(addMemberDialog, row, true);
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
          {row.memberStatus === 'Expired' && (
            <MenuItem
              onClick={() => {
                openDialog(addMemberDialog, row, false, true);
                popover.onClose();
              }}
            >
              <Iconify icon="solar:pen-bold" />
              Renew Membership
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              console.log('Delete:', row);
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
          {/* View Details Menu Item */}
          <MenuItem
            onClick={() => {
              openDialog(memberDetailsDialog, row);
              popover.onClose();
            }}
          >
            <Iconify icon="solar:eye-bold" />
            View Details
          </MenuItem>
        </MenuList>
      )}
    />
  );

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <CustomBreadcrumbs
          heading="Member Management"
          links={[{ name: 'Library' }, { name: 'Member Management' }]}
          sx={{ px: 1, mb: 2 }}
        />
        <CommonCtaComponent
          bookHandler={() => openDialog(addNewBookDialog)}
          issueBookHandler={() => openDialog(issueBookDialog)}
          returnBookHandler={() => openDialog(returnBookDialog)}
          createReservationHandler={() => openDialog(addMemberDialog)}
        />
      </Box>

      <CustomizableTable
        columns={[
          { id: 'memberId', label: 'Member Id' },
          { id: 'role', label: 'Role' },
          { id: 'name', label: 'Name' },
          {
            id: 'currentIssue',
            label: 'Current Issue',
            render(value, row) {
              return (
                <Typography fontSize="12px" textAlign="center">
                  {value}
                </Typography>
              );
            },
          },
          {
            id: 'pendingReturn',
            label: 'Pending Return',
            render(value, row) {
              return (
                <Typography fontSize="12px" textAlign="center">
                  {value}
                </Typography>
              );
            },
          },
          {
            id: 'overdueReturn',
            label: 'Overdue Return',
            render(value, row) {
              return (
                <Typography fontSize="12px" textAlign="center">
                  {value}
                </Typography>
              );
            },
          },
          {
            id: 'memberStatus',
            label: 'Member Status',
            render(value) {
              return (
                <Label variant="soft" color={value === 'Active' ? 'success' : 'error'}>
                  {value}
                </Label>
              );
            },
          },
          { id: 'action', label: 'Action', render: (_, row) => renderTableActions(row) },
        ]}
        data={memberDummyData}
      />

      {addMemberDialog.value && (
        <AddNewMemberDialog
          dialogValue={addMemberDialog.value}
          data={selectedEntry}
          onSave={saveHandler}
          onClose={() => closeDialog(addMemberDialog)}
          isEdit={isEdit}
          isRenewMembership={isRenewMembership}
        />
      )}

      {addNewBookDialog.value && (
        <AddNewBookDialog
          dialogValue={addNewBookDialog.value}
          data={selectedEntry}
          onSave={saveHandler}
          onClose={() => closeDialog(addNewBookDialog)}
          isEdit={isEdit}
        />
      )}

      {issueBookDialog.value && (
        <IssueBookDialog
          dialogValue={issueBookDialog.value}
          bookData={bookData}
          memberData={memberDummyData}
          onSave={saveHandler}
          onClose={() => closeDialog(issueBookDialog)}
        />
      )}

      {returnBookDialog.value && (
        <ReturnBookDialog
          dialogValue={returnBookDialog.value}
          bookData={bookData}
          memberData={memberDummyData}
          onSave={saveHandler}
          onClose={() => closeDialog(returnBookDialog)}
        />
      )}

      {/* Member Details Dialog */}
      {memberDetailsDialog.value && (
        <MemberDetailsDialog
          dialogValue={memberDetailsDialog.value}
          memberData={selectedEntry}
          onClose={() => closeDialog(memberDetailsDialog)}
        />
      )}
    </>
  );
};

export default LibraryMemberManagementScreen;

// 'use client'

// import React, { useState, useEffect } from 'react'

// import { Box, MenuItem, MenuList } from '@mui/material';

// import { useBoolean } from 'src/hooks/use-boolean';

// import { Label } from 'src/components/label';
// import { Iconify } from 'src/components/iconify';
// import ThreeDotsActions from 'src/components/three-dots-actions';
// import CustomizableTable from 'src/components/customizabaleTable';
// import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// import AddNewMemberDialog from './component/add-new-member-dialog';
// import CommonCtaComponent from '../component/common-cta-component';
// import IssueBookDialog from '../book-management/component/issue-book-dialog';
// import ReturnBookDialog from '../book-management/component/return-book-dialog';
// import AddNewBookDialog from '../book-management/component/add-new-book-dialog';

// const memberDummyData = [
//     {
//       memberId: 'A9i878',
//       name: 'Vikas',
//       role: 'Student',
//       memberStatus: 'Active',
//       class: '10th Grade', // For students
//       borrowLimit: 1, // Configured borrowing limit
//       issuedBooks: [
//         {
//           bookId: 'B1',
//           title: 'Introduction to Algorithms',
//           issueDate: '2024-11-01',
//           dueDate: '2024-12-01',
//           issueCount: 2, // Number of times this book has been issued
//         },
//       ],
//       reservedBooks: [
//         {
//           bookId: 'B2',
//           title: 'JavaScript The Good Parts',
//           reservationDate: '2024-11-15',
//         },
//       ],
//     },
//     {
//       memberId: 'A9i879',
//       name: 'Vishal',
//       role: 'Student',
//       memberStatus: 'Expired',
//       class: '9th Grade',
//       borrowLimit: 1,
//       issuedBooks: [],
//       reservedBooks: [],
//     },
//     {
//       memberId: 'A9i880',
//       name: 'Ramesh',
//       role: 'Teacher',
//       memberStatus: 'Active',
//       borrowLimit: 5, // Teachers can borrow more books
//       issuedBooks: [
//         {
//           bookId: 'B3',
//           title: 'Advanced Mathematics',
//           issueDate: '2024-10-20',
//           dueDate: '2024-11-20',
//           issueCount: 1,
//         },
//       ],
//       reservedBooks: [],
//     },
//   ];

// const bookData = [
//     {
//         id: "B001",
//         title: "Introduction to Programming",
//         author: "John Doe",
//         publisher: "TechPress",
//         editions: [
//             {
//                 year: 2020,
//                 publisher: "TechPress",
//                 totalCopies: 5,
//                 availableCopies: 2,
//             },
//             {
//                 year: 2021,
//                 publisher: "TechPress",
//                 totalCopies: 3,
//                 availableCopies: 1,
//             },
//         ],
//     },
//     {
//         id: "B002",
//         title: "Advanced Programming Techniques",
//         author: "Jane Smith",
//         publisher: "CodePub",
//         editions: [
//             {
//                 year: 2021,
//                 publisher: "CodePub",
//                 totalCopies: 4,
//                 availableCopies: 2,
//             },
//             {
//                 year: 2022,
//                 publisher: "CodePub",
//                 totalCopies: 6,
//                 availableCopies: 4,
//             },
//         ],
//     },
//     {
//         id: "B003",
//         title: "Data Structures and Algorithms",
//         author: "Michael Brown",
//         publisher: "AlgoBooks",
//         editions: [
//             {
//                 year: 2019,
//                 publisher: "AlgoBooks",
//                 totalCopies: 3,
//                 availableCopies: 0, // No copies available
//             },
//             {
//                 year: 2020,
//                 publisher: "AlgoBooks",
//                 totalCopies: 5,
//                 availableCopies: 5, // Available for issue
//             },
//         ],
//     },
// ];
// const LibraryMemberManagementScreen = () => {
//     const [selectedEntry, setSelectedEntry] = useState<any>(null);
//     const [isEdit, setIsEdit] = useState(false);
//     const [isRenewMembership, setIsRenewMembership] = useState(false);

//     // Dialog state handlers
//     const addMemberDialog = useBoolean();
//     const addNewBookDialog = useBoolean();
//     const issueBookDialog = useBoolean();
//     const returnBookDialog = useBoolean();
//     const data = [
//         {
//             memberId: 'A9i878',
//             role: 'Student',
//             name: 'Vikas',
//             memberStatus: "Active",
//         },
//         {
//             memberId: 'A9i878',
//             role: 'Student',
//             name: 'Vishal',
//             memberStatus: "Expired",
//         },
//     ];
//     const openDialog = (dialog: any, entry: any = null, editMode = false, renew = false) => {
//         setSelectedEntry(entry);
//         setIsEdit(editMode);
//         setIsRenewMembership(renew)
//         dialog.onTrue();
//     };

//     const closeDialog = (dialog: any) => {
//         setSelectedEntry(null);
//         setIsEdit(false);
//         setIsRenewMembership(false)
//         dialog.onFalse();
//     };
//     const saveHandler = () => {
//         console.log('Saved data:', data);

//     };

//     useEffect(() => { }, [isRenewMembership, isEdit])
//     const renderTableActions = (row: any) => (
//         <ThreeDotsActions
//             placement="right-top"
//             actions={({ popover }: any) => (
//                 <MenuList>
//                     <MenuItem
//                         onClick={() => {
//                             openDialog(addMemberDialog, row, true, false);
//                             popover.onClose()
//                         }}
//                     >
//                         <Iconify icon="solar:pen-bold" />
//                         Edit
//                     </MenuItem>
//                     {row.memberStatus === "Expired" && <MenuItem
//                         onClick={() => {
//                             openDialog(addMemberDialog, row, false, true);
//                             popover.onClose()
//                         }}
//                     >
//                         <Iconify icon="solar:pen-bold" />
//                         Renew Membership
//                     </MenuItem>}
//                     <MenuItem
//                         onClick={() => {
//                             // Add delete logic here
//                             console.log('Delete:', row);
//                         }}
//                     >
//                         <Iconify icon="solar:trash-bin-trash-bold" />
//                         Delete
//                     </MenuItem>
//                 </MenuList>
//             )}
//         />
//     );
//     return (

//         <>
//             <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
//                 <CustomBreadcrumbs
//                     heading="Member Management"
//                     links={[
//                         { name: 'Library' },
//                         { name: 'Member Management' },

//                     ]}
//                     sx={{ px: 1, mb: 2 }}
//                 />
//                 <Box display="flex" alignItems="center">
//                     <CommonCtaComponent
//                         bookHandler={() => openDialog(addNewBookDialog)}
//                         issueBookHandler={() => openDialog(issueBookDialog)}
//                         returnBookHandler={() => openDialog(returnBookDialog)}
//                         addNewMemberHandler={() => openDialog(addMemberDialog)}
//                     />
//                 </Box>
//             </Box>

//             {/* <CommonCtaComponent
//                 bookHandler={() => openDialog(addNewBookDialog)}
//                 issueBookHandler={() => openDialog(issueBookDialog)}
//                 returnBookHandler={() => openDialog(returnBookDialog)}
//                 addNewMemberHandler={() => openDialog(addMemberDialog)}

//             /> */}
//             <CustomizableTable
//                 columns={[
//                     { id: 'memberId', label: 'Member Id' },
//                     { id: 'role', label: 'Role' },
//                     { id: 'name', label: 'Name' },
//                     {
//                         id: 'memberStatus', label: 'Member Status', render(value, row) {
//                             return <Label
//                                 variant="soft"
//                                 color={
//                                     value === "Active"
//                                         ? 'success'
//                                         : 'error'

//                                 }
//                             >
//                                 {value}
//                             </Label>
//                         },
//                     },

//                     { id: 'action', label: 'Action', render: (_, row) => renderTableActions(row) },
//                 ]}
//                 data={data}
//             />
//             {addMemberDialog &&
//                 <AddNewMemberDialog
//                     dialogValue={addMemberDialog.value}
//                     data={selectedEntry}
//                     onSave={saveHandler}
//                     onClose={() => closeDialog(addMemberDialog)}
//                     isEdit={isEdit}
//                     isRenewMembership={isRenewMembership}

//                 />
//             }
//             {/* Add/Edit Book Dialog */}
//             {addNewBookDialog.value && (
//                 <AddNewBookDialog
//                     dialogValue={addNewBookDialog.value}
//                     data={selectedEntry}
//                     onSave={saveHandler}
//                     onClose={() => closeDialog(addNewBookDialog)}
//                     isEdit={isEdit}
//                 />
//             )}

//             {/* Issue Book Dialog */}
//             {issueBookDialog.value && (
//                 <IssueBookDialog
//                     dialogValue={issueBookDialog.value}
//                     bookData={bookData}
//                     memberData={memberData}
//                     onSave={saveHandler}
//                     onClose={() => closeDialog(issueBookDialog)}
//                 />
//             )}

//             {/* Return Book Dialog */}
//             {returnBookDialog.value && (
//                 <ReturnBookDialog
//                     bookData={bookData}
//                     memberData={memberData}
//                     dialogValue={returnBookDialog.value}
//                     onSave={saveHandler}
//                     onClose={() => closeDialog(returnBookDialog)}
//                 />
//             )}
//         </>
//     )
// }

// export default LibraryMemberManagementScreen
