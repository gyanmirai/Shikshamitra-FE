import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';

import { Box, Tab, Tabs } from '@mui/material';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';

import type { StudentTabsComponentType } from '.';

const libraryData = [
  {
    memberId: 'A9i878',
    name: 'Vikas',
    role: 'Student',
    memberStatus: 'Active',
    class: '10',
    borrowLimit: 5,
    currentIssue: 3,
    remainingLimit: 2,
    pendingReturn: 3,
    overdueReturn: 3,
    currentBorrowerBook: [
      {
        bookName: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        publisher: 'J.B. Lippincott & Co.',
        year: 1960,
        issueDate: '2024-12-01',
        dueDate: '2024-12-15',
        daysOverdue: 0,
      },
      {
        bookName: '1984',
        author: 'George Orwell',
        publisher: 'Secker & Warburg',
        year: 1949,
        issueDate: '2024-11-25',
        dueDate: '2024-12-09',
        daysOverdue: 10,
      },
    ],
    reservedBooks: [
      {
        bookName: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publisher: "Charles Scribner's Sons",
        year: 1925,
        reservationStatus: 'Active',
        positionInQueue: 2,
        reservationExpiryDate: '2024-12-20',
      },
      {
        bookName: 'Pride and Prejudice',
        author: 'Jane Austen',
        publisher: 'T. Egerton',
        year: 1813,
        reservationStatus: 'Completed',
        positionInQueue: '-',
        reservationExpiryDate: null,
      },
    ],
    fineHistory: [
      {
        amountPaid: 20.0,
        paymentDate: '2024-12-05',
        paymentMode: 'Cash',
        reason: 'Overdue Book',
      },
      {
        amountPaid: 30.0,
        paymentDate: '2024-11-20',
        paymentMode: 'UPI',
        reason: 'Lost Book',
      },
    ],

    pastBorrowedBooks: [
      {
        bookName: 'Moby Dick',
        author: 'Herman Melville',
        issueDate: '2024-10-01',
        returnDate: '2024-10-15',
      },
      {
        bookName: 'War and Peace',
        author: 'Leo Tolstoy',
        issueDate: '2024-09-10',
        returnDate: '2024-09-24',
      },
    ],

    issuedBooks: [
      {
        bookId: 'B1',
        title: 'Introduction to Algorithms',
        issueDate: '11-01-2024',
        dueDate: '12-01-204',
        issueCount: 2,
        status: 'issued',
      },
    ],
  },
];

const Libraray = (props: StudentTabsComponentType) => {
  const [activeTab, setActiveTab] = useState('currentIssue');

  const cardStyles = (tab: string) => ({
    py: 2,
    textAlign: 'center',
    typography: 'h4',
    maxWidth: '250px',
    width: '100%',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
    cursor: 'pointer',
    transform: activeTab === tab ? 'scale(1.025)' : 'scale(1)',
    boxShadow: activeTab === tab ? 6 : 3,
    border: activeTab === tab ? '2px solidrgb(0, 0, 0)' : '2px solid transparent',
    backgroundColor: activeTab === tab ? 'rgba(25, 118, 210, 0.1)' : 'white',
    '&:hover': {
      transform: 'scale(1.025)',
      boxShadow: 6,
    },
  });

  const [searchParams, setSearchParams] = useState({ tab: 'borrowingHistory' });
  const TABS = [
    {
      value: 'borrowingHistory',
      label: 'Borrowing History',
      icon: <Iconify icon="stash:feed-duotone" width={20} />,
      color: 'default',
      count: 100,
      //   component: () => <FinanceFeeStructureOverview />,
    },
    {
      value: 'currentIssue',
      label: 'Current Issue',
      icon: <Iconify icon="fluent-mdl2:account-management" width={20} />,
      color: 'success',
      count: 20,
      //   component: () => <FinanceStudentStructureOverview />,
    },
    {
      value: 'reservation',
      label: 'Reservation',
      icon: <Iconify icon="fluent-mdl2:account-management" width={20} />,
      color: 'warning',
      count: 20,
      //   component: () => <FinanceStudentStructureOverview />,
    },
  ];
  return (
    <Box>
      <Tabs
        value={searchParams.tab}
        onChange={(e, value) => setSearchParams({ tab: value })}
        sx={{
          mb: 2,
          '& .MuiTabs-flexContainer': { gap: 2 },
          flexGrow: 1,
        }}
      >
        {TABS.map((tab) => (
          <Tab
            sx={{ fontSize: '12px' }}
            key={tab.value}
            label={
              <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                {tab.label}{' '}
                <Label
                  variant="soft"
                  //   variant={tab.value === EmployeeAttendanceStatus.All ? 'filled' : 'soft'}
                  color={(tab?.color as LabelColor) || 'default'}
                >
                  {' '}
                  {tab.count}
                </Label>
              </Box>
            }
            // icon={tab.icon}
            value={tab.value}
          />
        ))}
      </Tabs>

      {searchParams.tab === 'currentIssue' && (
        <CustomizableTable
          tableId="currentIssue"
          isShowedDense={false}
          data={libraryData[0].currentBorrowerBook}
          columns={[
            { id: 'bookId', label: 'Book Id' },
            { id: 'bookName', label: 'Title' },
            { id: 'issueDate', label: 'Issue Date', filterType: 'date' },
            { id: 'dueDate', label: 'Due Date', filterType: 'date' },
            { id: 'daysOverdue', label: 'Days Overdue' },
          ]}
        />
      )}

      {searchParams.tab === 'borrowingHistory' && (
        <CustomizableTable
          tableId="borrowingHistory"
          data={libraryData[0].pastBorrowedBooks}
          columns={[
            { id: 'bookId', label: 'Book Id' },
            { id: 'bookName', label: 'Title' },
            { id: 'issueDate', label: 'Issue Date', filterType: 'date' },
            { id: 'returnDate', label: 'Return Date', filterType: 'date' },
          ]}
        />
      )}

      {searchParams.tab === 'reservation' && (
        <CustomizableTable
          tableId="reservation"
          data={libraryData[0].reservedBooks}
          columns={[
            { id: 'bookId', label: 'Book Id' },
            { id: 'bookName', label: 'Title' },
            { id: 'reservationStatus', label: 'Reservation Status' },
            { id: 'positionInQueue', label: 'Position In Queue' },
            // { id: "reservationExpiryDate", label: "Return Date" },
          ]}
        />
      )}
    </Box>
  );
};

export default Libraray;
