'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { ArrowBack } from '@mui/icons-material';
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

import BookIssueReturnTable from './Components/IssuedBookTable';
import IssueBookModal from '../BookList/Components/BookView/BookIssueForm';
import ReturnBookModal from '../BookList/Components/BookView/BookReturnForm';

import type { ILibraryBookData } from './Components/type';

const IssueReturnBook = () => {
  // State for selected record
  const [selectedRecord, setSelectedRecord] = useState<ILibraryBookData | null>(null);
  const [reservedRecordToDelete, setReservedRecordToDelete] = useState<any>(null);

  // Dialog states
  const issueDialog = useBoolean();
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
      issueDialog.onFalse();
      setSelectedRecord(null);
      returnDialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      issueDialog.onFalse();
      returnDialog.onFalse();
      setSelectedRecord(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Issue & Return"
        description={
          issueDialog.value
            ? 'Issue new books to members or update issued book details.'
            : 'Manage book issue and return records for all library members.'
        }
        links={[
          { name: 'Library', href: '/library/dashboard' },
          { name: 'Issue & Return', href: '/library/issue-return-book' },
        ]}
        action={
          <Box display="flex" gap={1}>
            <Button
              onClick={() => issueDialog.onTrue()}
              size="small"
              startIcon={<Iconify icon="cib:stackoverflow" />}
              variant="contained"
              color="success"
            >
              Issue Book
            </Button>
            <Button
              onClick={() => returnDialog.onTrue()}
              size="small"
              startIcon={<ArrowBack />}
              variant="contained"
              color="warning"
            >
              Return Book
            </Button>
          </Box>
        }
        sx={{ px: 1, mb: 1 }}
      />

      {/* Dialog for Add/Edit */}
      {/* <CustomDialog
        open={addDialog.value}
        handleClose={() => {
          addDialog.onFalse();
          setSelectedRecord(null);
        }}
        maxWidth="md"
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
      </CustomDialog> */}

      <CustomDialog
        open={issueDialog.value}
        handleClose={() => {
          issueDialog.onFalse();
        }}
        maxWidth="md"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Issue Book</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Select a member and book to issue with issue date and due date."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <IssueBookModal onClose={handleClose} editData={null} />
      </CustomDialog>

      {/* Table */}
      <BookIssueReturnTable
        data={issuedBooks}
        addDialog={issueDialog}
        onReturnBook={(data) => {
          returnDialog.onTrue();
          setSelectedRecord(data);
        }}
      />

      <CustomDialog
        open={returnDialog.value}
        handleClose={() => {
          returnDialog.onFalse();
          // setSelectedCopy(null);
        }}
        maxWidth="md"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Return Book</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Choose the issued book record you want to mark as returned, then enter the return date and any remarks if applicable."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ReturnBookModal onClose={handleClose} accessionNo="" />
      </CustomDialog>

      {/* Delete Confirmation for Reserved Record */}
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          deleteDialog.onFalse();
          setTimeout(() => {
            setReservedRecordToDelete(null);
          }, 200);
        }}
        title="Delete Reservation"
        content={
          <>
            Are you sure you want to delete reservation for{' '}
            <strong>{reservedRecordToDelete?.memberName}</strong> -{' '}
            <strong>{reservedRecordToDelete?.bookTitle}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              // TODO: Handle delete API call here
              shikshaMitraToast.success({
                message: (
                  <>
                    Reservation<strong>{reservedRecordToDelete?.bookTitle}</strong> deleted
                    successfully
                  </>
                ),
              });
              deleteDialog.onFalse();
              setReservedRecordToDelete(null);
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
