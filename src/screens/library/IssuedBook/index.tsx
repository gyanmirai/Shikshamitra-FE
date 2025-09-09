'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
// import { useGetIssuedBooksQuery } from 'src/redux/library/issueReturnBook';
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
import { useGetIssueReturnFormsQuery } from 'src/redux/issueRetunApi/issueReturnApi';

import IssueBookForm from './Components/IssueBookForm';
import ReturnBookForm from './Components/IssueReturnForm';
import BookIssueReturnTable from './Components/IssuedBookTable';

import type { ILibraryBookData } from './Components/type';

const IssueReturnBook = () => {
  // State for selected record
  const [selectedRecord, setSelectedRecord] = useState<ILibraryBookData | null>(null);

  // Dialog states
  const addDialog = useBoolean();
  const returnDialog = useBoolean();
  const deleteDialog = useBoolean();

  //   Fetch issued/returned books
  const { data: issuedBooks } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIssueReturnFormsQuery,
  });

  // Redux confirm state
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  /**
   * Handle closing dialog with unsaved changes check
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addDialog.onFalse();
      setSelectedRecord(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addDialog.onFalse();
      setSelectedRecord(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Issue & Return Book"
        description={
          addDialog.value
            ? 'Issue new books to members or update issued book details.'
            : 'Manage book issue and return records for all library members.'
        }
        links={[
          { name: 'Library', href: '/library/dashboard' },
          { name: 'Issue & Return Book', href: '/library/issue-return-book' },
        ]}
        action={
          <Button
            onClick={() => addDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Issue Book
          </Button>
        }
        sx={{ px: 1, mb: 2 }}
      />

      {/* Dialog for Add/Edit */}
      <CustomDialog
        open={addDialog.value}
        handleClose={() => {
          addDialog.onFalse();
          setSelectedRecord(null);
        }}
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedRecord ? 'Update Issue/Return Record' : 'Issue Book'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedRecord
                  ? 'Update the issued/returned book record including return date and status.'
                  : 'Select a member and book to issue with issue date and due date.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <IssueBookForm open={addDialog} onClose={handleClose} editData={null} />
      </CustomDialog>

      {/* Table */}
      <BookIssueReturnTable
        data={issuedBooks}
        addDialog={addDialog}
        onReturnBook={(data) => {
          returnDialog.onTrue();
          setSelectedRecord(data);
        }}
      />

      <CustomDialog
        open={returnDialog.value}
        handleClose={() => {
          returnDialog.onFalse();
          setSelectedRecord(null);
        }}
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Return Book</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Process book return by updating return date and condition. Confirm book return to make it available for other members."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ReturnBookForm open={returnDialog} onClose={handleClose} editData={selectedRecord} />
      </CustomDialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.value}
        icon="warning"
        onClose={() => {
          deleteDialog.onFalse();
          setTimeout(() => {
            setSelectedRecord(null);
          }, 200);
        }}
        title="Delete Record"
        content={
          <>
            Are you sure you want to delete record for <strong>{selectedRecord?.memberName}</strong>{' '}
            - <strong>{selectedRecord?.bookTitle}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              // Handle delete action here
              shikshaMitraToast.success({
                message: (
                  <>
                    Record for <strong>{selectedRecord?.bookTitle}</strong> deleted successfully.
                  </>
                ),
              });
              deleteDialog.onFalse();
              setSelectedRecord(null);
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default IssueReturnBook;
