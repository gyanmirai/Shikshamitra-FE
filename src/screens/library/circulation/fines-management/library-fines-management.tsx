'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatNumber } from 'src/utils/formate_number';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Checkbox, MenuItem, MenuList, Typography } from '@mui/material';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import CollectFinesDialog from './component/collect-fines-dialog';
import CommonCtaComponent from '../../component/common-cta-component';
import IssueBookDialog from '../../book-management/component/issue-book-dialog';
import ReturnBookDialog from '../../book-management/component/return-book-dialog';
import AddNewBookDialog from '../../book-management/component/add-new-book-dialog';
import {
  bookDataCirculation,
  memberDataCirculation,
  dummyDataForFineCirculation,
} from '../data/dummy-data';

import type { IFineCirculation } from '../data/dummy-data-interface';

const LibraryFineManagement = () => {
  // State to store selected member details
  const [selectedMember, setSelectedMember] = useState(null);
  // State to store array of selected students for fine collection
  const [selectedStudents, setSelectedStudents] = useState<IFineCirculation[]>([]);

  // Boolean hook to control collect fine dialog visibility
  const {
    value: collectFineDialogOpen,
    onTrue: openCollectFineDialog,
    onFalse: closeCollectFineDialog,
  } = useBoolean();

  // Boolean hook to control notification dialog visibility
  const {
    value: notificationDialogOpen,
    onTrue: openNotificationDialog,
    onFalse: closeNotificationDialog,
  } = useBoolean();

  // Boolean hook to control add new book dialog visibility
  const {
    value: addBookDialogOpen,
    onTrue: openAddBookDialog,
    onFalse: closeAddBookDialog,
  } = useBoolean();

  // Boolean hook to control issue book dialog visibility
  const {
    value: issueBookDialogOpen,
    onTrue: openIssueBookDialog,
    onFalse: closeIssueBookDialog,
  } = useBoolean();

  // Boolean hook to control return book dialog visibility
  const {
    value: returnBookDialogOpen,
    onTrue: openReturnBookDialog,
    onFalse: closeReturnBookDialog,
  } = useBoolean();

  // Handler function to process fine collection
  const handleCollectFine = (values: any) => {
    closeCollectFineDialog();
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
            !!dummyDataForFineCirculation?.length &&
            selectedStudents?.length === dummyDataForFineCirculation?.length
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedStudents((dummyDataForFineCirculation as IFineCirculation[]) || []);
            } else {
              setSelectedStudents([]);
            }
          }}
        />
      ),
      render: (value: any, row: any) => (
        <Checkbox
          checked={
            Array.isArray(selectedStudents) &&
            selectedStudents.some((i) => i.memberId === row.memberId)
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
    { id: 'memberId', label: 'Gr No' },
    { id: 'memberName', label: 'Name' },
    { id: 'role', label: 'Role' },
    {
      id: 'totalFineAmount',
      label: 'Total Fine Amount',
      render: (value: any) => <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>,
    },
    {
      id: 'status',
      label: 'Status',
      render: (value: any) => (
        <Label
          variant="soft"
          color={value === 'Paid' ? 'success' : value === 'Pending' ? 'warning' : 'error'}
        >
          {value}
        </Label>
      ),
    },
    {
      id: 'action',
      label: 'Action',
      render: (_: any, row: any) => (
        <ThreeDotsActions
          placement="right-top"
          actions={({ popover }) => (
            <MenuList>
              <MenuItem
                onClick={() => {
                  setSelectedMember(row);
                  openCollectFineDialog();
                }}
              >
                <Iconify icon="mingcute:pig-money-line" />
                Collect Fine
              </MenuItem>
            </MenuList>
          )}
        />
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
          heading="Fine Management"
          links={[
            { name: 'Library', href: '/library/dashboard' },
            { name: 'Circulation' },
            { name: 'Fine Management' },
          ]}
        />
        <CommonCtaComponent
          bookHandler={openAddBookDialog}
          issueBookHandler={openIssueBookDialog}
          returnBookHandler={openReturnBookDialog}
          createReservationHandler={() => {}}
        />
      </Box>

      <CustomizableTable
        onSendNotification={openNotificationDialog}
        showCheckbox={selectedStudents.length !== 0}
        tableId="library-fine-management"
        columns={tableColumns as IColumn[]}
        data={dummyDataForFineCirculation}
      />

      {notificationDialogOpen && (
        <SendInstantNotificationDialog
          open={notificationDialogOpen}
          onClose={closeNotificationDialog}
          data={[]}
          userList={selectedStudents}
        />
      )}

      {collectFineDialogOpen && (
        <CollectFinesDialog
          dialogValue={collectFineDialogOpen}
          data={selectedMember}
          onSave={handleCollectFine}
          onClose={closeCollectFineDialog}
        />
      )}

      {issueBookDialogOpen && (
        <IssueBookDialog
          dialogValue={issueBookDialogOpen}
          bookData={bookDataCirculation}
          memberData={memberDataCirculation}
          onSave={() => {}}
          onClose={closeIssueBookDialog}
        />
      )}

      {returnBookDialogOpen && (
        <ReturnBookDialog
          dialogValue={returnBookDialogOpen}
          onSave={() => {}}
          bookData={bookDataCirculation}
          memberData={memberDataCirculation}
          onClose={closeReturnBookDialog}
        />
      )}

      {addBookDialogOpen && (
        <AddNewBookDialog
          dialogValue={addBookDialogOpen}
          data={[]}
          onSave={() => {}}
          onClose={closeAddBookDialog}
          isEdit={false}
        />
      )}
    </>
  );
};

export default LibraryFineManagement;
