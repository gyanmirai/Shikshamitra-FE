// Improved version of LibraryBookManagementScreen

'use client';

import React, { useState } from 'react';

import { Box, TextField, InputAdornment } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import IssueBookDialog from './component/issue-book-dialog';
import { bookData, booksData, memberData } from './data/data';
import ReturnBookDialog from './component/return-book-dialog';
import AddNewBookDialog from './component/add-new-book-dialog';
import CommonCtaComponent from '../component/common-cta-component';
import AddNewMemberDialog from '../member-management/component/add-new-member-dialog';

interface Book {
  bookId: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  year: string;
  availability: string;
}

interface DialogProps {
  onTrue: () => void;
  onFalse: () => void;
}

const LibraryBookManagementScreen = () => {
  // State to store and manage the search query input value
  const [searchQuery, setSearchQuery] = useState('');
  // State to store the currently selected entry (book) for editing or other operations
  const [selectedEntry, setSelectedEntry] = useState<Book | null>(null);
  // State to store the book selected for viewing details
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  // Boolean state to track whether we're in edit mode
  const [isEdit, setIsEdit] = useState(false);

  // Dialog states to manage visibility of different dialogs/modals
  // using useBoolean hook which provides toggle functionality
  const dialogStates = {
    addMember: useBoolean(), // Controls Add Member dialog visibility
    addNewBook: useBoolean(), // Controls Add New Book dialog visibility
    issueBook: useBoolean(), // Controls Issue Book dialog visibility
    returnBook: useBoolean(), // Controls Return Book dialog visibility
  };

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleViewDetails = (book: Book) => setSelectedBook(book);

  const openDialog = (dialog: DialogProps, entry: Book | null = null, editMode = false) => {
    setSelectedEntry(entry);
    setIsEdit(editMode);
    dialog.onTrue();
  };

  const closeDialog = (dialog: DialogProps) => {
    setSelectedEntry(null);
    setIsEdit(false);
    dialog.onFalse();
  };

  const handleSave = () => {
    // Implement actual save logic here
  };

  // Process raw book data to calculate and format book statistics
  // Takes an array of books and returns transformed data with counts of borrowed, reserved, and overdue books
  const processBookData = (books: typeof booksData) => {
    // Get current date for overdue calculations
    const currentDate = new Date();

    return books.map((book) => {
      // Get all editions of the book, default to empty array if none exist
      const allEditions = book.editions || [];

      // Reduce all editions to get aggregate counts
      // For each edition, count:
      // - number of current borrowers
      // - number of reservations
      // - number of overdue books (where due date is less than current date)
      const counts = allEditions.reduce(
        (acc, edition) => ({
          borrowed: acc.borrowed + (edition.currentIssuers?.length || 0),
          reserved: acc.reserved + (edition.reservedList?.length || 0),
          overdue:
            acc.overdue +
            (edition.currentIssuers?.filter((issuer) => new Date(issuer.dueDate) < currentDate)
              .length || 0),
        }),
        { borrowed: 0, reserved: 0, overdue: 0 }
      );

      // Return transformed book data with counts
      return {
        name: book.title,
        isbn: book.id,
        ...counts,
      };
    });
  };

  const tableColumns = [
    { id: 'isbn', label: 'ISBN' },
    { id: 'name', label: 'Name' },
    { id: 'borrowed', label: 'Borrowed' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'reserved', label: 'Reserved' },
    {
      id: 'action',
      label: 'Action',
      render: (value: any, row: any) => (
        <ThreeDotsActions
          showThreeDots={false}
          showViewIcon
          showDeleteIcon
          handleViewClick={() => handleViewDetails(row as Book)}
        />
      ),
    },
  ];

  const renderDialogs = () => (
    <>
      {dialogStates.issueBook.value && (
        <IssueBookDialog
          dialogValue={dialogStates.issueBook.value}
          bookData={bookData}
          memberData={memberData}
          onSave={handleSave}
          onClose={() => closeDialog(dialogStates.issueBook)}
        />
      )}
      {dialogStates.returnBook.value && (
        <ReturnBookDialog
          dialogValue={dialogStates.returnBook.value}
          onSave={handleSave}
          bookData={bookData}
          memberData={memberData}
          onClose={() => closeDialog(dialogStates.returnBook)}
        />
      )}
      {dialogStates.addMember.value && (
        <AddNewMemberDialog
          dialogValue={dialogStates.addMember.value}
          data={selectedEntry}
          onSave={handleSave}
          onClose={() => closeDialog(dialogStates.addMember)}
          isEdit={isEdit}
          isRenewMembership={false}
        />
      )}

      {dialogStates.addNewBook.value && (
        <AddNewBookDialog
          dialogValue={dialogStates.addNewBook.value}
          data={selectedEntry}
          onSave={handleSave}
          onClose={() => closeDialog(dialogStates.addNewBook)}
          isEdit={isEdit}
        />
      )}
    </>
  );

  return (
    <>
      <>
        <Box
          pb="20px"
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <CustomBreadcrumbs
            heading="Book Management"
            links={[{ name: 'Library' }, { name: 'Book Management' }]}
            sx={{ px: 1, mb: 2 }}
          />
          <CommonCtaComponent
            bookHandler={() => openDialog(dialogStates.addNewBook)}
            issueBookHandler={() => openDialog(dialogStates.issueBook)}
            returnBookHandler={() => openDialog(dialogStates.returnBook)}
            createReservationHandler={() => openDialog(dialogStates.addMember)}
          />
        </Box>

        <Box pb="20px">
          <TextField
            placeholder="Search by book name, category, status"
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
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ '& input': { fontSize: '12px' }, width: '400px' }}
          />
        </Box>

        <CustomizableTable
          tableId="book-management-table"
          columns={tableColumns}
          data={processBookData(booksData)}
        />
      </>

      {renderDialogs()}
    </>
  );
};

export default LibraryBookManagementScreen;
