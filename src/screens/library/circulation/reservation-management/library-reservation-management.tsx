import React, { useState } from 'react';

import { Checkbox, MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

const LibraryReservationManagement = () => {
  const dummyData = [
    {
      bookId: 'B101',
      title: 'Introduction to Mathematics',
      memberName: 'John Doe',
      requestedDate: '12-11-23',
      status: 'Collected',
    },
    {
      bookId: 'B102',
      title: 'Physics Fundamentals',
      memberName: 'Jane Smith',
      requestedDate: '14-11-23',
      status: 'Pending',
    },
    {
      bookId: 'B103',
      title: 'Chemistry Basics',
      memberName: 'Sam Wilson',
      requestedDate: '18-11-23',
      status: 'Ready',
    },
    {
      bookId: 'B104',
      title: 'World History Overview',
      memberName: 'Chris Evans',
      requestedDate: '20-11-23',
      status: 'Collected',
    },
    {
      bookId: 'B105',
      title: 'Programming in Python',
      memberName: 'Natasha Romanoff',
      requestedDate: '22-11-23',
      status: 'Pending',
    },
  ];

  const renderTableActions = (row: any) =>
    row.status === 'Ready' && (
      <ThreeDotsActions
        placement="right-top"
        actions={({ popover }: any) => (
          <MenuList>
            {/* <MenuItem
                        onClick={() => {
                            //   openDialog(addNewBookDialog, row, true);
                        }}
                    >
                        <Iconify icon="mdi-light:check" />
                        Mark as Ready
                    </MenuItem> */}
            <MenuItem
              onClick={() => {
                //   openDialog(issueBookDialog, row);
              }}
            >
              <Iconify icon="line-md:bell" />
              Notify Member
            </MenuItem>
          </MenuList>
        )}
      />
    );

  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };
  return (
    <>
      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents.length !== 0}
        tableId="library-reservation-management"
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
                  checked={!!dummyData?.length && selectedStudents?.length === dummyData?.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents(dummyData || []);
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
          { id: 'bookId', label: 'Book Id' },
          { id: 'title', label: 'Title' },
          { id: 'memberName', label: 'Member Name' },
          { id: 'requestedDate', label: 'Requested Date' },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return (
                <Label
                  variant="soft"
                  color={
                    value === 'Collected' ? 'success' : value === 'Ready' ? 'secondary' : 'warning'
                  }
                >
                  {value}
                </Label>
              );
            },
          },
        ]}
        data={dummyData}
      />
      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}
    </>
  );
};

export default LibraryReservationManagement;
