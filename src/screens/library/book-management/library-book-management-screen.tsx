
'use client';

import React, { useState } from 'react';

import { MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import IssueBookDialog from './component/issue-book-dialog';
import ReturnBookDialog from './component/return-book-dialog';
import AddNewBookDialog from './component/add-new-book-dialog';
import CommonCtaComponent from '../component/common-cta-component';
import AddNewMemberDialog from '../member-management/component/add-new-member-dialog';

const LibraryBookManagementScreen = () => {
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);

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
            }}
          >
            <Iconify icon="mdi:eye" />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              openDialog(issueBookDialog, row);
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

  return (
    <>
      <CommonCtaComponent
        bookHandler={() => openDialog(addNewBookDialog)}
        issueBookHandler={() => openDialog(issueBookDialog)}
        returnBookHandler={() => openDialog(returnBookDialog)}
        addNewMemberHandler={() => openDialog(addMemberDialog)}
      />
      <CustomizableTable
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
      />

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
          data={selectedEntry}
          onSave={saveHandler}
          onClose={() => closeDialog(issueBookDialog)}
        />
      )}

      {/* Return Book Dialog */}
      {returnBookDialog.value && (
        <ReturnBookDialog
          dialogValue={returnBookDialog.value}
          onSave={saveHandler}
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
    </>
  );
};

export default LibraryBookManagementScreen;










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