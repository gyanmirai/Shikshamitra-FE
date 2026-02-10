import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/use-tabs';
import { Box, Tab, Card } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  FinesChargesStatusType,
  FinesChargesStatusTypeColors,
  FinesChargesStatusTypeOptions,
} from 'src/enums/library-status-types';
import {
  useGetIssuedBooksQuery,
  useGetFinesChargesQuery,
  useGetReservedBooksQuery,
} from 'src/redux/memberManagement/memberManagementApi';

import type { StudentTabsComponentType } from '.';

const TABS = [
  {
    value: 'borrowed-books',
    label: 'Borrowed Books',
  },
  {
    value: 'reserved-books',
    label: 'Reserved Books',
  },
  {
    value: 'charges',
    label: 'Charges',
  },
  {
    value: 'borrow-history',
    label: 'Borrow History',
  },
];

const Libraray = (props: StudentTabsComponentType) => {
  const tabs = useTabs('borrowed-books');

  const { data: borrowedBooks, isLoading: borrowedLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIssuedBooksQuery,
  });

  const { data: reservedBooks, isLoading: reservedLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReservedBooksQuery,
  });

  const { data: finesCharges, isLoading: finesChargesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFinesChargesQuery,
  });

  const { data: mockIssuedBooks, isLoading: mockIssuedLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIssuedBooksQuery,
  });

  const renderTabContent = () => {
    switch (tabs.value) {
      case 'borrowed-books':
        return (
          <Box>
            <CustomizableTable
              tableId="borrowed-books-table"
              noDataText="No Borrowed Books Data Found"
              isLoading={borrowedLoading}
              columns={[
                { id: 'bookTitle', label: 'Book Title', align: 'left' },
                { id: 'bookId', label: 'Book Category', align: 'left' },
                { id: 'accessionNo', label: 'Accession No.', align: 'left' },
                { id: 'issueDate', label: 'Issued on', align: 'left' },
                { id: 'dueDate', label: 'Due on', align: 'left' },
              ]}
              data={borrowedBooks || []}
            />
          </Box>
        );
      case 'reserved-books':
        return (
          <Box>
            <CustomizableTable
              tableId="reserved-books-table"
              noDataText="No Reserved Books Data Found"
              isLoading={reservedLoading}
              columns={[
                { id: 'bookTitle', label: 'Book Title', align: 'left' },
                { id: 'bookCategory', label: 'Book Category', align: 'left' },
                { id: 'reservationDate', label: 'Reserved on', align: 'left' },
                { id: 'author', label: 'Author', align: 'left' },
              ]}
              data={reservedBooks || []}
            />
          </Box>
        );
      case 'charges':
        return (
          <Box>
            <CustomizableTable
              tableId="fines-charges-table"
              noDataText="No Fines or Charges Data Found"
              isLoading={finesChargesLoading}
              columns={[
                {
                  id: 'bookTitle',
                  sticky: true,
                  minWidth: '150px',
                  label: 'Book Title',
                  align: 'left',
                },
                { id: 'bookCategory', minWidth: '150px', label: 'Book Category', align: 'left' },
                { id: 'accessionNo', minWidth: '180px', label: 'Accession No.', align: 'left' },
                {
                  id: 'amount',
                  label: 'Amount',
                  align: 'left',
                  filterType: 'number',
                  render(value) {
                    return new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      minimumFractionDigits: 2,
                    }).format(value);
                  },
                },
                { id: 'dateIssued', label: 'Date', align: 'left' },
                { id: 'chargeType', minWidth: '180px', label: 'Charge Type', align: 'left' },
                { id: 'reason', minWidth: '300px', label: 'Reason', align: 'left' },
                {
                  id: 'status',
                  label: 'Status',
                  align: 'left',
                  sticky: true,
                  filterType: 'enum',
                  enumOptions: FinesChargesStatusTypeOptions,
                  render(value) {
                    const color =
                      FinesChargesStatusTypeColors[value as FinesChargesStatusType] || 'default';
                    return (
                      <Label color={color as LabelColor}>{FinesChargesStatusType[value]}</Label>
                    );
                  },
                },
              ]}
              data={finesCharges || []}
            />
          </Box>
        );
      case 'borrow-history':
        return (
          <Box>
            <CustomizableTable
              tableId="issued-books-table"
              noDataText="No Borrowed History Data Found"
              isLoading={mockIssuedLoading}
              columns={[
                { id: 'bookTitle', label: 'Book Title', align: 'left' },
                { id: 'bookId', label: 'Book Category', align: 'left' },
                { id: 'accessionNo', label: 'Accession No.', align: 'left' },
                { id: 'issueDate', label: 'Issued on', align: 'left' },
                { id: 'dueDate', label: 'Due on', align: 'left' },
              ]}
              data={mockIssuedBooks || []}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Card sx={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 280px)' }}>
      <CustomTabs
        value={tabs.value}
        onChange={tabs.onChange}
        orientation="vertical"
        sx={{ width: 220, borderRight: 1, borderColor: 'divider' }}
        slotProps={{ tab: { px: 2, justifyContent: 'flex-start' } }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </CustomTabs>

      <Scrollbar sx={{ flexGrow: 1, height: '100%' }}>
        <Box sx={{ p: 3, gap: 1, minWidth: 360, display: 'flex', flexDirection: 'column' }}>
          {renderTabContent()}
        </Box>
      </Scrollbar>
    </Card>
  );
};

export default Libraray;
