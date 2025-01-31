'use client';

import React, { useMemo, useState } from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import CommonCtaComponent from '../component/common-cta-component';
import IssueBookDialog from '../book-management/component/issue-book-dialog';
import ReturnBookDialog from '../book-management/component/return-book-dialog';
import LibraryFineManagement from './fines-management/library-fines-management';
import AddNewBookDialog from '../book-management/component/add-new-book-dialog';
import AddNewMemberDialog from '../member-management/component/add-new-member-dialog';
import LibraryReservationManagement from './reservation-management/library-reservation-management';

const TABS = [
  {
    value: 'reservations-Management',
    label: 'Reservations Management',
    icon: <Iconify icon="stash:feed-duotone" width={20} />,
    component: () => <LibraryReservationManagement />,
  },
  {
    value: 'fines-Management',
    label: 'Fines Management',
    icon: <Iconify icon="fluent-mdl2:account-management" width={20} />,
    component: () => <LibraryFineManagement />,
  },
];

const memberData = [
  {
    id: 'S001',
    name: 'Alice',
    role: 'Student',
  },
  {
    id: 'S002',
    name: 'Bob',
    role: 'Student',
  },
  {
    id: 'T001',
    name: 'Charlie',
    role: 'Teacher',
  },
  {
    id: 'T002',
    name: 'Dana',
    role: 'Teacher',
  },
  {
    id: 'S003',
    name: 'Eve',
    role: 'Student',
  },
];

const books = [
  {
    id: 'B001',
    title: 'Introduction to Programming',
    author: 'John Doe',
    publisher: 'TechPress',
    editions: [
      {
        year: 2020,
        totalCopies: 5,
        availableCopies: 2,
        currentIssuers: [
          {
            userId: 'S005',
            name: 'Alice',
            role: 'Student',
            issueDate: '2024-11-10',
            dueDate: '2024-12-01',
          },
          {
            userId: 'S006',
            name: 'Bob',
            role: 'Student',
            issueDate: '2024-11-12',
            dueDate: '2024-12-02',
          },
        ],
        reservedList: [
          { userId: 'S007', name: 'Charlie', role: 'Teacher', reservationDate: '2024-11-15' },
        ],
      },
      {
        year: 2021,
        totalCopies: 3,
        availableCopies: 1,
        currentIssuers: [
          {
            userId: 'S008',
            name: 'Dana',
            role: 'Student',
            issueDate: '2024-11-15',
            dueDate: '2024-12-05',
          },
        ],
        reservedList: [],
      },
    ],
  },
  {
    id: 'B002',
    title: 'Data Structures and Algorithms',
    author: 'Jane Smith',
    publisher: 'CodeWorks',
    editions: [
      {
        year: 2019,
        totalCopies: 6,
        availableCopies: 0,
        currentIssuers: [
          {
            userId: 'S009',
            name: 'Eve',
            role: 'Teacher',
            issueDate: '2024-11-01',
            dueDate: '2024-11-20',
          },
          {
            userId: 'S010',
            name: 'Frank',
            role: 'Student',
            issueDate: '2024-11-05',
            dueDate: '2024-11-25',
          },
          {
            userId: 'S011',
            name: 'Grace',
            role: 'Student',
            issueDate: '2024-11-08',
            dueDate: '2024-11-28',
          },
        ],
        reservedList: [
          { userId: 'S012', name: 'Hannah', role: 'Teacher', reservationDate: '2024-11-18' },
          { userId: 'S013', name: 'Ivy', role: 'Student', reservationDate: '2024-11-20' },
        ],
      },
      {
        year: 2020,
        totalCopies: 4,
        availableCopies: 1,
        currentIssuers: [
          {
            userId: 'S014',
            name: 'Jack',
            role: 'Student',
            issueDate: '2024-11-12',
            dueDate: '2024-12-01',
          },
        ],
        reservedList: [],
      },
    ],
  },
  {
    id: 'B003',
    title: 'Modern Physics',
    author: 'Albert Newton',
    publisher: 'SciPub',
    editions: [
      {
        year: 2018,
        totalCopies: 2,
        availableCopies: 0,
        currentIssuers: [
          {
            userId: 'S015',
            name: 'Kim',
            role: 'Student',
            issueDate: '2024-11-05',
            dueDate: '2024-11-25',
          },
          {
            userId: 'S016',
            name: 'Liam',
            role: 'Teacher',
            issueDate: '2024-11-07',
            dueDate: '2024-11-27',
          },
        ],
        reservedList: [
          { userId: 'S017', name: 'Mia', role: 'Student', reservationDate: '2024-11-20' },
        ],
      },
    ],
  },
  {
    id: 'B004',
    title: 'History of Civilizations',
    author: 'Diana Prince',
    publisher: 'HeritagePress',
    editions: [
      {
        year: 2017,
        totalCopies: 8,
        availableCopies: 5,
        currentIssuers: [
          {
            userId: 'S018',
            name: 'Noah',
            role: 'Teacher',
            issueDate: '2024-11-15',
            dueDate: '2024-12-05',
          },
          {
            userId: 'S019',
            name: 'Olivia',
            role: 'Student',
            issueDate: '2024-11-16',
            dueDate: '2024-12-06',
          },
        ],
        reservedList: [],
      },
    ],
  },
  {
    id: 'B005',
    title: 'Artificial Intelligence: Basics',
    author: 'Sophia Robotics',
    publisher: 'FutureTech',
    editions: [
      {
        year: 2023,
        totalCopies: 10,
        availableCopies: 10,
        currentIssuers: [],
        reservedList: [],
      },
    ],
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
        availableCopies: 0, // No copies available
      },
      {
        year: 2020,
        publisher: 'AlgoBooks',
        totalCopies: 5,
        availableCopies: 5, // Available for issue
      },
    ],
  },
];

const LibraryCirculationScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'reservations-Management' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  // Dialog state handlers
  const addMemberDialog = useBoolean();
  const addNewBookDialog = useBoolean();
  const issueBookDialog = useBoolean();
  const returnBookDialog = useBoolean();

  const openDialog = (dialog: any, entry: any = null, editMode = false, renew = false) => {
    dialog.onTrue();
  };

  const closeDialog = (dialog: any) => {
    dialog.onFalse();
  };
  const saveHandler = () => {};

  const [open, setOpen] = useState(false);

  const closeHandler = () => {
    // setIsEdit(false);
    setOpen(false);
  };

  return (
    <>
      {open ? (
        <AddNewBookDialog
          dialogValue={addNewBookDialog.value}
          data={[]}
          onSave={saveHandler}
          onClose={closeHandler}
          isEdit={false}
        />
      ) : (
        <>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <CustomBreadcrumbs
              heading="Circulation"
              links={[
                { name: 'Library' },
                { name: 'Circulation' },
                // Uncomment below if conditional breadcrumb is needed
                // {
                //   name:
                //     searchParams.tab === 'reservations-Management'
                //       ? 'Reservations Management'
                //       : 'Fines Management',
                // },
              ]}
              sx={{ px: 1, mb: 2 }}
            />
            <Box display="flex" alignItems="center">
              <CommonCtaComponent
                bookHandler={() => setOpen(true)}
                issueBookHandler={() => openDialog(issueBookDialog)}
                returnBookHandler={() => openDialog(returnBookDialog)}
                createReservationHandler={() => openDialog(addMemberDialog)}
              />
            </Box>
          </Box>

          <Box pb="20px" />

          <Card>
            <CustomTabs
              value={searchParams.tab}
              onChange={(e, value) => setSearchParams({ tab: value })}
              sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
              role="tablist"
            >
              {TABS.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  icon={tab.icon}
                  sx={{ fontSize: '12px' }}
                />
              ))}
            </CustomTabs>
          </Card>

          <Box px={1} pt={2}>
            {currentActiveComponent?.component && <currentActiveComponent.component />}
          </Box>
        </>
      )}

      {/* Add Member Dialog */}
      {addMemberDialog && (
        <AddNewMemberDialog
          dialogValue={addMemberDialog.value}
          data={[]}
          onSave={saveHandler}
          onClose={() => closeDialog(addMemberDialog)}
          isEdit={false}
          isRenewMembership={false}
        />
      )}

      {/* Issue Book Dialog */}
      {issueBookDialog.value && (
        <IssueBookDialog
          dialogValue={issueBookDialog.value}
          bookData={bookData}
          memberData={memberData}
          onSave={saveHandler}
          onClose={() => closeDialog(issueBookDialog)}
        />
      )}

      {/* Return Book Dialog */}
      {returnBookDialog.value && (
        <ReturnBookDialog
          bookData={bookData}
          memberData={memberData}
          dialogValue={returnBookDialog.value}
          onSave={saveHandler}
          onClose={() => closeDialog(returnBookDialog)}
        />
      )}
    </>
  );
};

export default LibraryCirculationScreen;
