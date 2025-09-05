'use client';

import type { IColumn } from 'src/components/customizabaleTable/type';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Box, Checkbox } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import CommonCtaComponent from '../../component/common-cta-component';
import IssueBookDialog from '../../book-management/component/issue-book-dialog';
import ReturnBookDialog from '../../book-management/component/return-book-dialog';
import AddNewBookDialog from '../../book-management/component/add-new-book-dialog';
import {
  bookDataCirculation,
  dummyReservationData,
  memberDataCirculation,
} from '../data/dummy-data';

import type { IReservationData } from '../data/dummy-data-interface';

const LibraryReservationManagement = () => {
  // State to keep track of selected students in the table
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);

  // Object containing boolean states for different dialogs using custom useBoolean hook
  const dialogStates = {
    sendNotification: useBoolean(),
    addMember: useBoolean(),
    addNewBook: useBoolean(),
    issueBook: useBoolean(),
    returnBook: useBoolean(),
  };

  // Helper function to open a specific dialog
  const handleDialogOpen = (dialog: keyof typeof dialogStates) => {
    dialogStates[dialog].onTrue();
  };

  // Helper function to close a specific dialog
  const handleDialogClose = (dialog: keyof typeof dialogStates) => {
    dialogStates[dialog].onFalse();
  };
  const tableColumns = [
    {
      id: 'checkBox',
      align: 'left',
      minWidth: '60px',
      isSort: false,
      isFilter: false,
      label: '',
      renderColumn: () => (
        <Checkbox
          checked={
            !!dummyReservationData?.length &&
            selectedStudents?.length === dummyReservationData?.length
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedStudents((dummyReservationData as IReservationData[]) || []);
            } else {
              setSelectedStudents([]);
            }
          }}
        />
      ),
      render: (value: any, row: any) => (
        <Checkbox
          checked={
            Array.isArray(selectedStudents) && selectedStudents.some((i) => i.bookId === row.bookId)
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedStudents([...selectedStudents, row]);
            } else {
              setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
            }
          }}
        />
      ),
    },
    { id: 'bookId', label: 'Book Id' },
    { id: 'title', label: 'Title' },
    { id: 'memberName', label: 'Member Name' },
    { id: 'requestedDate', label: 'Requested Date' },
    {
      id: 'status',
      label: 'Status',
      render: (value: string) => (
        <Label
          variant="soft"
          color={value === 'Collected' ? 'success' : value === 'Ready' ? 'secondary' : 'warning'}
        >
          {value}
        </Label>
      ),
    },
  ];

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        gap={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <CustomBreadcrumbs
          heading="Reservation Management"
          links={[
            { name: 'Library', href: '/library/dashboard' },
            { name: 'Circulation' },
            { name: 'Reservation Management' },
          ]}
          sx={{ px: 1, mb: 2 }}
        />
        <CommonCtaComponent
          bookHandler={() => handleDialogOpen('addNewBook')}
          issueBookHandler={() => handleDialogOpen('issueBook')}
          returnBookHandler={() => handleDialogOpen('returnBook')}
          createReservationHandler={() => handleDialogOpen('addMember')}
        />
      </Box>

      <CustomizableTable
        onSendNotification={() => handleDialogOpen('sendNotification')}
        showCheckbox={selectedStudents.length !== 0}
        tableId="library-reservation-management"
        columns={tableColumns as IColumn[]}
        data={dummyReservationData}
      />

      {dialogStates.sendNotification.value && (
        <SendInstantNotificationDialog
          open={dialogStates.sendNotification.value}
          onClose={() => handleDialogClose('sendNotification')}
          data={[]}
          userList={selectedStudents}
        />
      )}

      {dialogStates.issueBook.value && (
        <IssueBookDialog
          dialogValue={dialogStates.issueBook.value}
          bookData={bookDataCirculation}
          memberData={memberDataCirculation}
          onSave={() => {}}
          onClose={() => handleDialogClose('issueBook')}
        />
      )}

      {dialogStates.returnBook.value && (
        <ReturnBookDialog
          dialogValue={dialogStates.returnBook.value}
          onSave={() => {}}
          bookData={bookDataCirculation}
          memberData={memberDataCirculation}
          onClose={() => handleDialogClose('returnBook')}
        />
      )}

      {dialogStates.addNewBook.value && (
        <AddNewBookDialog
          dialogValue={dialogStates.addNewBook.value}
          data={[]}
          onSave={() => {}}
          onClose={() => handleDialogClose('addNewBook')}
          isEdit={false}
        />
      )}
    </>
  );
};

export default LibraryReservationManagement;
