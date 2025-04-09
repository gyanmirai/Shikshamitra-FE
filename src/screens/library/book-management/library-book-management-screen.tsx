'use client';

import React, { useState } from 'react';

import { Box, MenuItem, MenuList, useTheme, TextField, InputAdornment } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { bookData, memberData } from './data/data';
import IssueBookDialog from './component/issue-book-dialog';
import ReturnBookDialog from './component/return-book-dialog';
import AddNewBookDialog from './component/add-new-book-dialog';
import CommonCtaComponent from '../component/common-cta-component';
import AddNewMemberDialog from '../member-management/component/add-new-member-dialog';

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
              popover.onClose();
            }}
          >
            <Iconify icon="mdi:eye" />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              openDialog(issueBookDialog, row);
              popover.onClose();
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

  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const closeHandler = () => {
    setIsEdit(false);
    setOpen(false);
  };
  return (
    <>
      {open ? (
        <AddNewBookDialog
          dialogValue={addNewBookDialog.value}
          data={selectedEntry}
          onSave={saveHandler}
          onClose={closeHandler}
          isEdit={isEdit}
        />
      ) : (
        <>
          <CustomBreadcrumbs
            heading="Book Management"
            links={[{ name: 'Library' }, { name: 'Book Management' }]}
            sx={{ px: 1, mb: 2 }}
          />
          <Box
            pb="20px"
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
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
              value=""
              onChange={() => {}}
              sx={{ '& input': { fontSize: '12px' }, width: '400px' }}
            />
            <CommonCtaComponent
              bookHandler={() => setOpen(true)}
              issueBookHandler={() => openDialog(issueBookDialog)}
              returnBookHandler={() => openDialog(returnBookDialog)}
              createReservationHandler={() => openDialog(addMemberDialog)}
            />
          </Box>
        </>
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
      {addMemberDialog && (
        <AddNewMemberDialog
          dialogValue={addMemberDialog.value}
          data={selectedEntry}
          onSave={saveHandler}
          onClose={() => closeDialog(addMemberDialog)}
          isEdit={isEdit}
          isRenewMembership={false}
        />
      )}
    </>
  );
};

export default LibraryBookManagementScreen;
