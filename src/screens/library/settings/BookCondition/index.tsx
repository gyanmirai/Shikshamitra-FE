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
import { useGetBookConditionOptionsQuery } from 'src/redux/library/setting/bookConditionApi';

import BookConditionForm from './Components/BookCategoryForm';
import BookConditionTable from './Components/BookConditionTable';

import type { IConditionType } from './Components/type';

const BookConditionCreation = () => {
  // Custom hook to fetch book condition data
  const { data: bookConditionData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBookConditionOptionsQuery,
  });

  // Dialog control states
  const deleteBookConditionDialog = useBoolean();
  const addBookConditionDialog = useBoolean();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [open, setOpen] = useState(false);

  // State management
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedBookCondition, setSelectedBookCondition] = useState<IConditionType | null>(null);
  const dispatch = useDispatch();

  // Close handler
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedBookCondition(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addBookConditionDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addBookConditionDialog.onFalse();
      setTimeout(() => {
        setSelectedBookCondition(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Book Condition"
        description="Manage conditions of books such as Low, Medium, High, Damage, Lost, etc. Use actions to edit or delete existing conditions. Click ‘Add Condition’ to create a new one."
        links={[
          { name: 'Library', href: '/library/dashboard' },
          { name: 'Setting', href: '/library/settings/book-category' },
          { name: 'Book Condition ' },
        ]}
        action={
          <Button
            onClick={() => addBookConditionDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Book Condition
          </Button>
        }
      />

      <BookConditionTable
        onDelete={(data) => {
          setSelectedBookCondition(data);
          deleteBookConditionDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedBookCondition(data);
          addBookConditionDialog.onTrue();
        }}
        open={addBookConditionDialog}
        onAddConditionType={addBookConditionDialog}
        setOpenDialog={setOpen}
        setEditData={setSelectedBookCondition}
        data={bookConditionData}
      />

      <CustomDialog
        open={addBookConditionDialog.value}
        handleClose={() => {
          addBookConditionDialog.onFalse();
          setTimeout(() => {
            setSelectedBookCondition(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedBookCondition
                ? 'Update Book Condition Category'
                : 'Add Book Condition Category'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedBookCondition
                  ? 'Update the book condition details including type and code.'
                  : 'Create a new book condition by entering its type and code.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <BookConditionForm
          open={addBookConditionDialog}
          onClose={handleClose}
          editData={selectedBookCondition}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteBookConditionDialog.value}
        onClose={() => {
          setSelectedBookCondition(null);
          deleteBookConditionDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete book condition{' '}
            <strong>{selectedBookCondition?.conditionType}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteBookConditionDialog.onFalse();
              setSelectedBookCondition(null);
              shikshaMitraToast.success({
                message: `Book Condition Category ${selectedBookCondition?.conditionType} deleted successfully`,
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

export default BookConditionCreation;
