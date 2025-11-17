'use client';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Checkbox, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DeleteConfirmationDialog } from 'src/components/delete-confirmation';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import AddNewMemberDialog from './component/add-new-member-dialog';
import CommonCtaComponent from '../component/common-cta-component';
import MemberDetailsDialog from './component/member-details-dialog';
import IssueBookDialog from '../book-management/component/issue-book-dialog';
import ReturnBookDialog from '../book-management/component/return-book-dialog';
import AddNewBookDialog from '../book-management/component/add-new-book-dialog';

const memberDummyData = [
  {
    memberId: 'A9i878',
    name: 'Vikas',
    role: 'Student',
    memberStatus: 'Active',
    class: '10',
    borrowLimit: 1,
    currentIssue: 5,
    pendingReturn: 3,
    overdueReturn: 3,
    issuedBooks: [
      {
        bookId: 'B1',
        title: 'Introduction to Algorithms',
        issueDate: '2024-11-01',
        dueDate: '2024-12-01',
        issueCount: 2,
      },
    ],
    reservedBooks: [
      {
        bookId: 'B2',
        title: 'JavaScript The Good Parts',
        reservationDate: '2024-11-15',
      },
    ],
  },
  {
    memberId: 'A9i879',
    name: 'Vishal',
    role: 'Student',
    memberStatus: 'Active',
    class: '9',
    borrowLimit: 1,
    currentIssue: 0,
    pendingReturn: 0,
    overdueReturn: 0,
    issuedBooks: [],
    reservedBooks: [],
  },
  {
    memberId: 'A9i880',
    name: 'Ramesh',
    role: 'Teacher',
    memberStatus: 'Active',
    borrowLimit: 5,
    currentIssue: 5,
    pendingReturn: 3,
    overdueReturn: 3,
    issuedBooks: [
      {
        bookId: 'B3',
        title: 'Advanced Mathematics',
        issueDate: '2024-10-20',
        dueDate: '2024-11-20',
        issueCount: 1,
      },
    ],
    reservedBooks: [],
  },
];

const bookData = [
  {
    id: 'B001',
    title: 'Introduction to Programming',
    author: 'John Doe',
    publisher: 'TechPress',
    editions: [
      {
        year: 2020,
        publisher: 'TechPress',
        totalCopies: 5,
        availableCopies: 2,
      },
      {
        year: 2021,
        publisher: 'TechPress',
        totalCopies: 3,
        availableCopies: 1,
      },
    ],
  },
  {
    id: 'B002',
    title: 'Advanced Programming Techniques',
    author: 'Jane Smith',
    publisher: 'CodePub',
    editions: [
      {
        year: 2021,
        publisher: 'CodePub',
        totalCopies: 4,
        availableCopies: 2,
      },
      {
        year: 2022,
        publisher: 'CodePub',
        totalCopies: 6,
        availableCopies: 4,
      },
    ],
  },
  {
    id: 'B003',
    title: 'Data Structures and Algorithms',
    author: 'Michael Brown',
    publisher: 'AlgoBooks',
    editions: [
      {
        year: 2019,
        publisher: 'AlgoBooks',
        totalCopies: 3,
        availableCopies: 0,
      },
      {
        year: 2020,
        publisher: 'AlgoBooks',
        totalCopies: 5,
        availableCopies: 5,
      },
    ],
  },
];

const LibraryMemberManagementScreen = () => {
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isRenewMembership, setIsRenewMembership] = useState(false);

  // Dialog state handlers
  const addMemberDialog = useBoolean();
  const addNewBookDialog = useBoolean();
  const issueBookDialog = useBoolean();
  const returnBookDialog = useBoolean();
  const memberDetailsDialog = useBoolean(); // State for Member Details Dialog
  const dialogForDeleteConfirmation = useBoolean();

  const openDialog = (dialog: any, entry: any = null, editMode = false, renew = false) => {
    setSelectedEntry(entry);
    setIsEdit(editMode);
    setIsRenewMembership(renew);
    dialog.onTrue();
  };

  const closeDialog = (dialog: any) => {
    setSelectedEntry(null);
    setIsEdit(false);
    setIsRenewMembership(false);
    dialog.onFalse();
  };

  const saveHandler = () => {
    console.log('Saved data:', selectedEntry);
  };

  const renderTableActions = (row: any) => (
    <ThreeDotsActions
      showThreeDots={false}
      placement="right-top"
      showDeleteIcon
      showEditIcon
      showViewIcon
      handleDeleteClick={() => {
        dialogForDeleteConfirmation.onTrue();
      }}
      handleEditClick={() => {
        openDialog(addMemberDialog, row, true);
      }}
      handleViewClick={() => {
        openDialog(memberDetailsDialog, row);
      }}
    />
  );
  const [open, setOpen] = useState(false);

  const closeHandler = () => {
    setIsEdit(false);
    setOpen(false);
  };

  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };
  return (
    <>
      {open ? (
        <AddNewBookDialog
          dialogValue={addNewBookDialog.value}
          data={selectedEntry}
          onSave={saveHandler}
          onClose={closeHandler}
          isEdit={isEdit}
        />
      ) : (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <CustomBreadcrumbs
              heading="Member Management"
              links={[{ name: 'Library' }, { name: 'Member Management' }]}
              sx={{ mb: 2 }}
            />
            <CommonCtaComponent
              bookHandler={() => setOpen(true)}
              issueBookHandler={() => openDialog(issueBookDialog)}
              returnBookHandler={() => openDialog(returnBookDialog)}
              createReservationHandler={() => openDialog(addMemberDialog)}
            />
          </Box>

          <CustomizableTable
            onSendNotification={handlerSendNotification}
            showCheckbox={selectedStudents.length !== 0}
            tableId="member-management"
            columns={[
              {
                id: 'checkBox',
                align: 'left',
                minWidth: '60px',
                isSort: false,
                isFilter: false,
                label: '',
                renderColumn() {
                  return (
                    <Checkbox
                      checked={
                        !!memberDummyData?.length &&
                        selectedStudents?.length === memberDummyData?.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(memberDummyData || []);
                        } else {
                          setSelectedStudents([]);
                        }
                      }}
                    />
                  );
                },
                render(value, row) {
                  return (
                    <Checkbox
                      checked={!!selectedStudents.some((i: any) => i.id === row.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, row]);
                        } else {
                          setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
                        }
                      }}
                    />
                  );
                },
              },
              { id: 'memberId', label: 'Member Id' },
              { id: 'role', label: 'Role' },
              { id: 'name', label: 'Name' },
              {
                id: 'currentIssue',
                label: 'Current Issue',
                render(value, row) {
                  return (
                    <Typography fontSize="12px" textAlign="left" pl="30px">
                      {value}
                    </Typography>
                  );
                },
              },
              {
                id: 'pendingReturn',
                label: 'Pending Return',
                render(value, row) {
                  return (
                    <Typography fontSize="12px" textAlign="left" pl="30px">
                      {value}
                    </Typography>
                  );
                },
              },
              {
                id: 'overdueReturn',
                label: 'Overdue Return',
                render(value, row) {
                  return (
                    <Typography fontSize="12px" textAlign="left" pl="30px">
                      {value}
                    </Typography>
                  );
                },
              },
              {
                id: 'memberStatus',
                label: 'Member Status',
                render(value) {
                  return (
                    <Label
                      textAlign="left"
                      pl="30px"
                      variant="soft"
                      color={value === 'Active' ? 'success' : 'error'}
                    >
                      {value}
                    </Label>
                  );
                },
              },
              { id: 'action', label: 'Action', render: (_, row) => renderTableActions(row) },
            ]}
            data={memberDummyData}
          />
        </>
      )}

      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}

      {dialogForDeleteConfirmation.value && (
        <DeleteConfirmationDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          onConfirm={() => {}}
          title="Delete Item"
          description="Are you sure you want to delete this item? This action cannot be undone."
        />
      )}
      {addMemberDialog.value && (
        <AddNewMemberDialog
          dialogValue={addMemberDialog.value}
          data={selectedEntry}
          onSave={saveHandler}
          onClose={() => closeDialog(addMemberDialog)}
          isEdit={isEdit}
          isRenewMembership={isRenewMembership}
        />
      )}

      {issueBookDialog.value && (
        <IssueBookDialog
          dialogValue={issueBookDialog.value}
          bookData={bookData}
          memberData={memberDummyData}
          onSave={saveHandler}
          onClose={() => closeDialog(issueBookDialog)}
        />
      )}

      {returnBookDialog.value && (
        <ReturnBookDialog
          dialogValue={returnBookDialog.value}
          bookData={bookData}
          memberData={memberDummyData}
          onSave={saveHandler}
          onClose={() => closeDialog(returnBookDialog)}
        />
      )}

      {/* Member Details Dialog */}
      {memberDetailsDialog.value && (
        <MemberDetailsDialog
          dialogValue={memberDetailsDialog.value}
          memberData={selectedEntry}
          onClose={() => closeDialog(memberDetailsDialog)}
        />
      )}
    </>
  );
};

export default LibraryMemberManagementScreen;
