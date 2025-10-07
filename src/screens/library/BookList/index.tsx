'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import LibrarySearch from './Components/LibrarySearch';
import BookViewDetail from './Components/BookView/BookViewDetail';
import BookFormStepper from '../BookManagement/BookFormComponents/BookForm';

const BookList = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  // State to control book form visibility
  const [open, setOpen] = useState(false);

  // State to store currently selected book for editing
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  console.log('selectedBook----------', selectedBook);
  // Redux selector to track unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Boolean hook to control delete confirmation dialog
  const deleteDialog = useBoolean();
  // Redux dispatch hook for state management
  const dispatch = useDispatch();

  // Boolean hook to control detail view dialog
  const viewDialog = useBoolean();

  /**
   * Handles the deletion of a book entry
   */
  const handleDelete = (id: string | undefined) => {
    deleteDialog.onFalse();
    setSelectedBook(null);
  };

  /**
   * Handles closing the book form with confirmation if there are unsaved changes
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedBook(null);
    } else if (!isChanges) {
      setOpen(false);
      setSelectedBook(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Breadcrumbs */}
      {showBreadCumb && (
        <>
          {open ? (
            <CustomBreadcrumbs
              heading={selectedBook ? 'Update Book' : 'Add Book'}
              description={
                selectedBook
                  ? 'Update existing book details such as title, author, category, and availability.'
                  : 'Add a new book by entering details like title, author, category, and availability.'
              }
              isBack
              onBack={() => handleClose(null, false)}
              links={[
                { name: 'Library', href: '/library/dashboard' },
                {
                  name: 'Book List',
                  href: '/library/book-management',
                  onClick: () => {
                    setOpen(false);
                    setSelectedBook(null);
                  },
                },
                {
                  name: selectedBook ? 'Update Book' : 'Add Book',
                  href: '/library/book-management',
                },
              ]}
              sx={{ px: 1 }}
            />
          ) : viewDialog.value ? (
            <CustomBreadcrumbs
              heading="View Book"
              description="View book details including title, author, category, and availability."
              isBack
              onBack={() => viewDialog.onFalse()}
              links={[
                { name: 'Library', href: '/library/dashboard' },
                {
                  name: 'Book List',
                  href: '/library/book-management',
                  onClick: () => setSelectedBook(null),
                },
                { name: 'View Book', href: '#' },
              ]}
              sx={{ px: 1 }}
            />
          ) : (
            <CustomBreadcrumbs
              heading="Book List"
              description="Manage all books with details—title, author, category, and availability. Add, edit, or delete books as required."
              links={[
                { name: 'Library', href: '/library/dashboard' },
                { name: 'Book List', href: '/library/book-management' },
              ]}
              sx={{ px: 1, mb: 2 }}
              action={
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  size="small"
                  onClick={() => setOpen(true)}
                >
                  Book
                </Button>
              }
            />
          )}
        </>
      )}

      {/* Main Content */}
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)', mt: 2 }}>
          <BookFormStepper onClose={handleClose} editData={selectedBook} />
        </Card>
      ) : viewDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)', mt: 2 }}>
          <BookViewDetail book={selectedBook} />
        </Card>
      ) : (
        <LibrarySearch
          onDelete={(data) => {
            setSelectedBook(data);
            deleteDialog.onTrue();
          }}
          onView={(data) => {
            viewDialog.onTrue();
            setSelectedBook(data);
          }}
          onEdit={(data) => {
            setSelectedBook(data);
            setOpen(true);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          deleteDialog.onFalse();
          setSelectedBook(null);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete book <strong>{selectedBook?.title}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              handleDelete(selectedBook?.id);
              shikshaMitraToast.success({
                message: `Book ${selectedBook?.title} deleted successfully`,
              });
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default BookList;
