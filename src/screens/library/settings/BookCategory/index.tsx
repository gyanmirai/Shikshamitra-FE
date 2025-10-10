'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetBookCategoriesQuery } from 'src/redux/bookCategoryApi/bookCategoryApi';

import BookCategoryForm from './Components/BookCategoryForm';
import BookCategoryTable from './Components/BookCategoryTable';

import type { IBookCategory } from './Components/type';

const BookCategoryCreation = () => {
  // Custom hook to fetch book category data
  const { data: bookCategoryData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBookCategoriesQuery,
  });

  // Dialog control states
  const deleteBookCategoryDialog = useBoolean();
  const addBookCategoryDialog = useBoolean();
  const [open, setOpen] = useState(false);

  // State management
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedBookCategory, setSelectedBookCategory] = useState<IBookCategory | null>(null);
  const dispatch = useDispatch();

  // Close handler
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedBookCategory(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addBookCategoryDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addBookCategoryDialog.onFalse();
      setTimeout(() => {
        setSelectedBookCategory(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Book Categories"
        description="Manage categories of books such as Fiction, Non-fiction, Science, History, etc. Use actions to edit or delete existing categories. Click ‘Add Book Category’ to create a new one."
        links={[
          { name: 'Library', href: '/library/dashboard' },
          { name: 'Setting', href: '/library/settings/book-category' },
          { name: 'Book Categories' },
        ]}
        action={
          <Button
            onClick={() => addBookCategoryDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Book Category
          </Button>
        }
        sx={{ px: 1, mb: 2 }}
      />

      <BookCategoryTable
        onDelete={(data) => {
          setSelectedBookCategory(data);
          deleteBookCategoryDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedBookCategory(data);
          addBookCategoryDialog.onTrue();
        }}
        open={open}
        onAddBookCategory={addBookCategoryDialog}
        setOpenDialog={setOpen}
        // editData={selectedBookCategory}
        setEditData={setSelectedBookCategory}
        data={bookCategoryData}
      />

      <CustomDialog
        open={addBookCategoryDialog.value}
        handleClose={() => {
          addBookCategoryDialog.onFalse();
          setTimeout(() => {
            setSelectedBookCategory(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedBookCategory ? 'Update Book Category' : 'Add Book Category'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedBookCategory
                  ? 'Update the book category details including name and description.'
                  : 'Create a new book category by entering its name and description.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <BookCategoryForm
          open={addBookCategoryDialog}
          onClose={handleClose}
          editData={selectedBookCategory}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteBookCategoryDialog.value}
        onClose={() => {
          setSelectedBookCategory(null);
          deleteBookCategoryDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete book category{' '}
            <strong>{selectedBookCategory?.categoryName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteBookCategoryDialog.onFalse();
              setSelectedBookCategory(null);
              shikshaMitraToast.success({
                message: `Book Category ${selectedBookCategory?.categoryName} deleted successfully`,
              });
              // handle delete API call here
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default BookCategoryCreation;
