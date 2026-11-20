'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Card, Button, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { useBookDeletion } from './useBookDeletion';
import { BookDeleteDialog } from './BookDeleteDialog';
import LibraryMainScreen from './Components/LIbraryMainScreen';
import BookViewDetail from './Components/BookView/BookViewDetail';
import { CirculationDialogs } from '../circulation/CirculationDialogs';
import { useReservationAccess } from '../reservations/useReservationAccess';
import BookFormStepper from '../BookManagement/BookFormComponents/BookForm';
import ReservationBookModal from './Components/BookView/BookReservationForm';
import ChangeBookStatusForm from './Components/BookView/BookStatusChangeForm';
import ViewReservedMembersTable from './Components/BookView/BookReservedLIst';
import ViewBookCopyHistoryTable from './Components/BookView/ViewBookCopyHistory';

import type { IBook, IBookPayload, IBookCopyWithBook } from '../BookManagement/Components/type';

const BookList = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  // State to control book form visibility
  const [open, setOpen] = useState(false);
  const [bookFormBusy, setBookFormBusy] = useState(false);
  const router = useRouter();
  const { canWrite: canReserve } = useReservationAccess();
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canView = hasGrantedPermission(permissions, 'Library.AllBooks.View');
  const canAdd = canView && hasGrantedPermission(permissions, 'Library.AllBooks.Add');
  const canEdit = canView && hasGrantedPermission(permissions, 'Library.AllBooks.Update');
  const canDelete = canView && hasGrantedPermission(permissions, 'Library.AllBooks.Delete');
  const deletion = useBookDeletion(canDelete);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // State to store currently selected book for editing
  const [selectedBook, setSelectedBook] = useState<IBook | null>(null);
  // Redux selector to track unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedCopy, setSelectedCopy] = useState<IBookCopyWithBook | null>(null);

  const reserveDialog = useBoolean();
  const viewAllReservationDialog = useBoolean();
  const bookHistoryDialog = useBoolean();
  // Redux dispatch hook for state management
  const dispatch = useDispatch();

  // Boolean hook to control detail view dialog
  const viewDialog = useBoolean();

  const issueDialog = useBoolean();
  const returnDialog = useBoolean();
  const changeStatusDialog = useBoolean();

  const clearCatalogTask = () => {
    changeStatusDialog.onFalse();
    viewAllReservationDialog.onFalse();
    reserveDialog.onFalse();
    setSelectedCopy(null);
    setOpen(false);
    setSelectedBook(null);
    dispatch(setIsChanges(false));
  };
  const clearReturnTask = () => {
    returnDialog.onFalse();
    issueDialog.onFalse();
    bookHistoryDialog.onFalse();
    setSelectedCopy(null);
    dispatch(setIsChanges(false));
  };
  const clearSession = () => {
    deletion.close();
    clearCatalogTask();
    clearReturnTask();
    viewDialog.onFalse();
  };
  const closeGuard = useUnsavedNavigation(
    isChanges && (open || issueDialog.value || returnDialog.value || changeStatusDialog.value),
    {
      blockNavigation: bookFormBusy || deletion.busy,
      guardContextChanges: true,
      onNavigationApproved: () => dispatch(setIsChanges(false)),
      onBeforeTraversal: clearSession,
      push: (href) => {
        clearSession();
        router.push(href);
      },
    }
  );
  const handleClose = (_event: unknown, submitted = false) => {
    if (submitted) clearCatalogTask();
    else closeGuard.requestNavigation(clearCatalogTask);
  };
  const handleCloseReturn = (_event: unknown, submitted = false) => {
    if (submitted) clearReturnTask();
    else closeGuard.requestNavigation(clearReturnTask);
  };
  const handleCloseStatus = (submitted = false) => {
    const close = () => {
      changeStatusDialog.onFalse();
      setSelectedCopy(null);
      dispatch(setIsChanges(false));
    };
    if (submitted) close();
    else closeGuard.requestNavigation(close);
  };

  return (
    <Box
      data-testid="library-books-page"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
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
              backDisabled={bookFormBusy}
              onBack={() => handleClose(null, false)}
              links={[
                { name: 'Library', href: '/library/dashboard' },
                {
                  name: 'All Books',
                  href: '/library/book-list',
                  onClick: () => {
                    handleClose(null, false);
                  },
                },
                {
                  name: selectedBook ? 'Update Book' : 'Add Book',
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
              action={
                canAdd ? (
                  <Button
                    startIcon={<Add />}
                    variant="contained"
                    size="small"
                    onClick={() => setOpen(true)}
                    sx={{ px: '32px' }}
                  >
                    Book
                  </Button>
                ) : undefined
              }
            />
          )}
        </>
      )}

      {/* Main Content */}
      {open ? (
        <Card
          sx={{
            flexGrow: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadows-4)',
            mt: 2,
          }}
        >
          <BookFormStepper
            key={`${selectedBook?.id || 'new'}-${(currentYear as { id?: string })?.id || ''}`}
            onClose={handleClose}
            onBusyChange={setBookFormBusy}
            editData={selectedBook as IBookPayload | null}
          />
        </Card>
      ) : viewDialog.value ? (
        <Card
          sx={{
            flexGrow: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadows-4)',
            mt: 2,
          }}
        >
          <BookViewDetail
            book={selectedBook}
            handleChangeStatus={(copy) => {
              changeStatusDialog.onTrue();
              setSelectedCopy(copy);
            }}
            handleIssueBook={(copy) => {
              issueDialog.onTrue();
              setSelectedCopy(copy);
            }}
            handleReturnBook={(copy) => {
              returnDialog.onTrue();
              setSelectedCopy(copy);
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
        //
        //     reserveDialog.onTrue();
        //   }}
        //   onViewAllReservationBook={(data) => {
        //     viewAllReservationDialog.onTrue();
        //     setSelectedBook(data);
        //   }}
        // />
        <LibraryMainScreen
          onDelete={canDelete ? deletion.open : undefined}
          onView={(data) => {
            viewDialog.onTrue();
            setSelectedBook(data);
          }}
          onEdit={
            canEdit
              ? (data) => {
                  setSelectedBook(data);
                  setOpen(true);
                }
              : undefined
          }
          onReserveBook={
            canReserve
              ? (data) => {
                  setSelectedBook(data);
                  reserveDialog.onTrue();
                }
              : undefined
          }
          onViewAllReservationBook={(data) => {
            viewAllReservationDialog.onTrue();
            setSelectedBook(data);
          }}
        />
      )}

      <CirculationDialogs
        dialog={
          issueDialog.value
            ? { kind: 'issue', accessionNo: selectedCopy?.accessionNo || '' }
            : returnDialog.value
              ? { kind: 'return', accessionNo: selectedCopy?.accessionNo || '' }
              : null
        }
        copy={selectedCopy}
        busy={bookFormBusy}
        onBusyChange={setBookFormBusy}
        onClose={handleCloseReturn}
      />
      {reserveDialog.value && (
        <ReservationBookModal
          onClose={handleClose}
          editData={selectedBook}
          onBusyChange={setBookFormBusy}
        />
      )}

      {viewAllReservationDialog.value && (
        <ViewReservedMembersTable
          editData={selectedBook}
          onClose={() => {
            viewAllReservationDialog.onFalse();
            setSelectedBook(null);
          }}
        />
      )}

      <CustomDialog
        open={changeStatusDialog.value}
        hasForm={false}
        guardUnsavedChanges={false}
        disableClose={bookFormBusy}
        disableEscapeKeyDown={bookFormBusy}
        handleClose={() => handleCloseStatus(false)}
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
          onBusyChange={setBookFormBusy}
          onClose={(_event, submitted) => handleCloseStatus(submitted)}
        />
      </CustomDialog>
      {closeGuard.confirmation}
      <BookDeleteDialog deletion={deletion} />

      <CustomDialog
        open={bookHistoryDialog.value}
        hasForm={false}
        guardUnsavedChanges={false}
        handleClose={() => {
          bookHistoryDialog.onFalse();
          setSelectedCopy(null);
        }}
        maxWidth="lg"
        title={`${selectedCopy?.book?.title || 'Book Copy'} (${selectedCopy?.accessionNo || 'Unavailable'}) History`}
        titleInfo="Review this saved copy's borrowing records across authorized recorded years. School-date evidence and overdue classification remain distinct from original timestamps."
      >
        <ViewBookCopyHistoryTable
          editData={selectedCopy}
          onClose={() => {
            bookHistoryDialog.onFalse();
            setSelectedCopy(null);
          }}
        />
      </CustomDialog>
    </Box>
  );
};

export default BookList;
