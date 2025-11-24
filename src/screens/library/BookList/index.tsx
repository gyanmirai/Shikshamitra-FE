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
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import LibraryMainScreen from './Components/LIbraryMainScreen';
import IssueBookModal from './Components/BookView/BookIssueForm';
import BookViewDetail from './Components/BookView/BookViewDetail';
import ReturnBookModal from './Components/BookView/BookReturnForm';
import BookFormStepper from '../BookManagement/BookFormComponents/BookForm';
import ReservationBookModal from './Components/BookView/BookReservationForm';
import ChangeBookStatusForm from './Components/BookView/BookStatusChangeForm';
import ViewReservedMembersTable from './Components/BookView/BookReservedLIst';
import ViewBookCopyHistoryTable from './Components/BookView/ViewBookCopyHistory';

import type { IBook, IBookPayload, IBookCopyWithBook } from '../BookManagement/Components/type';

const BookList = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  // State to control book form visibility
  const [open, setOpen] = useState(false);

  // State to store currently selected book for editing
  const [selectedBook, setSelectedBook] = useState<IBook | null>(null);
  const [, setSelectedReservation] = useState<any>(null);
  // Redux selector to track unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedCopy, setSelectedCopy] = useState<IBookCopyWithBook | null>(null);
  // Boolean hook to control delete confirmation dialog
  const deleteDialog = useBoolean();
  const reservationDeleteDialog = useBoolean();

  const reserveDialog = useBoolean();
  const viewAllReservationDialog = useBoolean();
  const bookHistoryDialog = useBoolean();
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

  const issueDialog = useBoolean();
  const returnDialog = useBoolean();
  const changeStatusDialog = useBoolean();

  /**
   * Handles closing the book form with confirmation if there are unsaved changes
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      changeStatusDialog.onFalse();
      viewAllReservationDialog.onFalse();
      reserveDialog.onFalse();
      setSelectedReservation(null);
      setSelectedCopy(null);
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedBook(null);
    } else if (!isChanges) {
      viewAllReservationDialog.onFalse();
      reserveDialog.onFalse();
      setSelectedReservation(null);
      setSelectedCopy(null);
      setOpen(false);
      setSelectedBook(null);
    }
  };

  const handleCloseReturn = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      returnDialog.onFalse();
      issueDialog.onFalse();
      bookHistoryDialog.onFalse();
      setSelectedCopy(null);
    } else if (!isChanges) {
      returnDialog.onFalse();
      issueDialog.onFalse();
      bookHistoryDialog.onFalse();
      setSelectedCopy(null);
    }
  };

  console.log('setSelectedBook---', setSelectedBook);

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
                  name: 'All Books',
                  href: '/library/book-list',
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
              onBack={() => {
                viewDialog.onFalse();
                setSelectedBook(null);
              }}
              links={[
                { name: 'Library', href: '/library/dashboard' },
                {
                  name: 'All Books',
                  href: '/library/book-list',
                  onClick: () => {
                    viewDialog.onFalse();
                    setSelectedBook(null);
                  },
                },
                { name: 'View Book', href: '#' },
              ]}
              sx={{ px: 1 }}
            />
          ) : (
            <CustomBreadcrumbs
              heading="All Books"
              description="Manage all books with details—title, author, category, and availability. Add, edit, or delete books as required."
              links={[
                { name: 'Library', href: '/library/dashboard' },
                {
                  name: 'All Books',
                  href: '/library/book-list',
                  onClick: () => {
                    setOpen(false);
                    setSelectedBook(null);
                  },
                },
              ]}
              sx={{ mb: 2 }}
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
          <BookFormStepper onClose={handleClose} editData={selectedBook as IBookPayload | null} />
        </Card>
      ) : viewDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)', mt: 2 }}>
          <BookViewDetail
            book={selectedBook}
            handleChangeStatus={(copy) => {
              changeStatusDialog.onTrue();
              setSelectedCopy(copy);
              /* TODO: implement handleChangeStatus */
            }}
            handleIssueBook={(copy) => {
              issueDialog.onTrue();
              setSelectedCopy(copy);
              /* TODO: implement handleIssueBook */
            }}
            handleReturnBook={(copy) => {
              returnDialog.onTrue();
              setSelectedCopy(copy);
              /* TODO: implement handleReturnBook */
            }}
            handleBookHistory={(copy) => {
              bookHistoryDialog.onTrue();
              setSelectedCopy(copy);
            }}
          />
        </Card>
      ) : (
        // <LibrarySearch
        //   onDelete={(data) => {
        //     setSelectedBook(data);
        //     deleteDialog.onTrue();
        //   }}
        //   onView={(data) => {
        //     viewDialog.onTrue();
        //     setSelectedBook(data);
        //   }}
        //   onEdit={(data) => {
        //     setSelectedBook(data);
        //     setOpen(true);
        //   }}
        //   onReserveBook={(data) => {
        //     setSelectedBook(data);
        //     console.log('reserve data', data);
        //     reserveDialog.onTrue();
        //   }}
        //   onViewAllReservationBook={(data) => {
        //     viewAllReservationDialog.onTrue();
        //     setSelectedBook(data);
        //   }}
        // />
        <LibraryMainScreen
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
          onReserveBook={(data) => {
            setSelectedBook(data);
            console.log('reserve data', data);
            reserveDialog.onTrue();
          }}
          onViewAllReservationBook={(data) => {
            viewAllReservationDialog.onTrue();
            setSelectedBook(data);
          }}
        />
      )}

      <CustomDialog
        open={issueDialog.value}
        handleClose={() => {
          issueDialog.onFalse();
          setSelectedCopy(null);
        }}
        maxWidth="md"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Iconify icon="octicon:issue-closed-16" />
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
        <IssueBookModal onClose={handleCloseReturn} editData={selectedCopy} />
      </CustomDialog>
      <CustomDialog
        open={reserveDialog.value}
        handleClose={() => {
          reserveDialog.onFalse();
          setSelectedBook(null);
        }}
        maxWidth="md"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Reserve Book {selectedBook?.title}</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Select a member to reserve the book and set reservation details."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ReservationBookModal onClose={handleClose} editData={selectedBook} />
      </CustomDialog>

      <CustomDialog
        open={returnDialog.value}
        handleClose={() => {
          returnDialog.onFalse();
          setSelectedCopy(null);
        }}
        maxWidth="md"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Iconify icon="mdi:arrow-u-left-top" />
            <Typography variant="h5">Return Book</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Select the issued book record to mark it as returned with return date and remarks if any."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ReturnBookModal onClose={handleCloseReturn} accessionNo={selectedCopy?.accessionNo} />
      </CustomDialog>

      <CustomDialog
        open={viewAllReservationDialog.value}
        handleClose={() => {
          viewAllReservationDialog.onFalse();
          setSelectedBook(null);
        }}
        maxWidth="md"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">All Reservations for {selectedBook?.title}</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View all reservations for the selected book."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ViewReservedMembersTable
          editData={selectedBook}
          onDelete={(row) => {
            reservationDeleteDialog.onTrue();
            setSelectedReservation(row);
          }}
        />
      </CustomDialog>

      <CustomDialog
        open={changeStatusDialog.value}
        handleClose={() => {
          changeStatusDialog.onFalse();
          setSelectedCopy(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Change Book Status</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="You can update the status of the selected book, e.g., Removed, Lost, or Under Maintenance."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ChangeBookStatusForm
          editData={selectedCopy}
          onClose={(e, isSubmit) => {
            changeStatusDialog.onFalse(); // close dialog
            setSelectedCopy(null);
          }}
        />
      </CustomDialog>
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

      <ConfirmDialog
        open={reservationDeleteDialog.value}
        onClose={() => {
          reservationDeleteDialog.onFalse();
          setTimeout(() => {
            setSelectedReservation(null);
          }, 200);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete reservation for <strong>{selectedBook?.title}</strong>?
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
                    Reservation for <strong>{selectedBook?.title}</strong> deleted successfully
                  </>
                ),
              });
              reservationDeleteDialog.onFalse();
              setSelectedReservation(null);
            }}
          >
            Yes
          </Button>
        }
      />

      <CustomDialog
        open={bookHistoryDialog.value}
        handleClose={() => {
          bookHistoryDialog.onFalse();
          setSelectedCopy(null);
        }}
        maxWidth="lg"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedCopy?.book?.title} ({selectedCopy?.accessionNo}) History
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View all reservations for the selected book."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ViewBookCopyHistoryTable
          editData={selectedCopy}
          onDelete={(row) => {
            bookHistoryDialog.onTrue();
            setSelectedReservation(row);
          }}
        />
      </CustomDialog>
    </Box>
  );
};

export default BookList;
