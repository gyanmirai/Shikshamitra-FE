'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetBooksQuery } from 'src/redux/bookManagement/bookManagementApi';
import { Box, Button, TextField, Typography, Autocomplete } from '@mui/material';
import { useGetReservationsQuery } from 'src/redux/reservationDataApi/reservationDataApi';
import { useGetBookCategoryOptionsQuery } from 'src/redux/bookCategoryOptionsApi/bookCategoryOptionApi';

import ReservationForm from './Components/ReservationForm';
import ReservedBookTable from './Components/ReservationTable';
import ReservationIssueBookForm from './Components/ReservationIssueForm';

import type { IReservedBookData } from './Components/type';
import type { ITitle } from '../IssuedBook/Components/type';

const ReservationManagement = () => {
  // State for selected record
  const [selectedRecord, setSelectedRecord] = useState<IReservedBookData | null>(null);
  const [selectedBook, setSelectedBook] = useState('');
  // Dialog states
  const addDialog = useBoolean();
  const issueDialog = useBoolean();
  const deleteDialog = useBoolean();
  const { data: bookData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBooksQuery,
  });

  const { data: bookCategoryOptions } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBookCategoryOptionsQuery,
  });

  //   Fetch reservations
  const { data: reservations } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReservationsQuery,
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
      issueDialog.onFalse();
      setSelectedRecord(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addDialog.onFalse();
      issueDialog.onFalse();
      setSelectedRecord(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Reservation Management"
        description={
          addDialog.value
            ? 'Make new reservations for books by selecting members and book details.'
            : 'Manage all reservations for different books and members.'
        }
        links={[
          { name: 'Library', href: '/library/dashboard' },
          { name: 'Reservation Management', href: '/library/reservation' },
        ]}
        action={
          <Button
            onClick={() => addDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Make Reservation
          </Button>
        }
        sx={{ px: 1, mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 2, ml: 1 }}>
        {/* Book Title Autocomplete */}
        <CustomTooltip
          placement="top"
          title={
            selectedBook
              ? bookData?.find((item: ITitle) => item.id === selectedBook)?.title || ''
              : undefined
          }
        >
          <Box sx={{ width: '100%' }}>
            <Autocomplete
              options={
                bookData?.map((item: ITitle) => ({
                  id: item.id,
                  label: item.title,
                  value: item.id,
                })) ?? []
              }
              getOptionLabel={(option) => option.label}
              value={
                selectedBook
                  ? bookData
                      ?.map((item: ITitle) => ({
                        id: item.id,
                        label: item.title,
                        value: item.id,
                      }))
                      .find((option: { value: string }) => option.value === selectedBook) || null
                  : null
              }
              onChange={(_, value) => {
                setSelectedBook(value?.value ?? '');
              }}
              renderInput={(params) => (
                <TextField {...params} label="Book Title *" size="small" fullWidth />
              )}
              isOptionEqualToValue={(option, value) => option.value === value?.value}
              sx={{ width: '100%' }}
            />
          </Box>
        </CustomTooltip>
      </Box>

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
              {selectedRecord ? 'Update Reservation' : 'Make Reservation'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedRecord
                  ? 'Update the reserved book details including reservation date and member info.'
                  : 'This modal allows the librarian to select the required fields (such as member, book, and reservation date) to successfully make a reservation for a book.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ReservationForm open={addDialog} onClose={handleClose} editData={selectedRecord} />
      </CustomDialog>

      <CustomDialog
        open={issueDialog.value}
        handleClose={() => {
          issueDialog.onFalse();
          setSelectedRecord(null);
        }}
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Issue Book</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Issue book to member"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ReservationIssueBookForm
          open={issueDialog}
          onClose={handleClose}
          editData={selectedRecord}
        />
      </CustomDialog>

      {/* Table */}
      <ReservedBookTable
        data={reservations}
        addDialog={addDialog}
        onEdit={(data) => {
          setSelectedRecord(data);
          addDialog.onTrue();
        }}
        onIssueBook={(data) => {
          setSelectedRecord(data);
          issueDialog.onTrue();
        }}
        onDelete={(data) => {
          deleteDialog.onTrue();
          setSelectedRecord(data);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          deleteDialog.onFalse();
          setTimeout(() => {
            setSelectedRecord(null);
          }, 200);
        }}
        title="Remove Reservation"
        content={
          <>
            Are you sure you want to remove reservation for{' '}
            <strong>{selectedRecord?.memberName}</strong> -{' '}
            <strong>{selectedRecord?.bookTitle}</strong>?
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
                    Reservation for <strong>{selectedRecord?.bookTitle}</strong> removed
                    successfully.
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

export default ReservationManagement;
