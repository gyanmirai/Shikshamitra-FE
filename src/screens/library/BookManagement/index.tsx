'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Button, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetBooksQuery } from 'src/redux/bookManagement/bookManagementApi';

import BookDetails from './Components/BookDetails';
import BookFormStepper from './BookFormComponents/BookForm';
import BookManagementTable from './Components/BookManagementTable';

const BookManagement = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  // State to control book form visibility
  const [open, setOpen] = useState(false);
  const { data: bookData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBooksQuery,
  });

  // State to store currently selected book for editing
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

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
      {showBreadCumb &&
        (open ? (
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
            sx={{ px: 1, mb: 2 }}
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
        ))}
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)', mt: 2 }}>
          <BookFormStepper onClose={handleClose} editData={selectedBook} />
        </Card>
      ) : (
        <BookManagementTable
          onDelete={(data) => {
            setSelectedBook(data);
            deleteDialog.onTrue();
          }}
          data={bookData}
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

      {/* View Details */}
      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Book Details</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal displays complete details of a particular book, including its information, availability status."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={viewDialog.value}
        handleClose={() => {
          viewDialog.onFalse();
          setSelectedBook(null);
        }}
        maxWidth="md"
      >
        <BookDetails book={selectedBook} />
      </CustomDialog>
    </Box>
  );
};

export default BookManagement;
