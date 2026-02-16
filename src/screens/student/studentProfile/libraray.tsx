import type { LabelColor } from 'src/components/label';

import React from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Grid, Button } from '@mui/material';
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
    icon: <Iconify icon="solar:book-outline" width={20} />,
  },
  {
    value: 'reserved-books',
    label: 'Reserved Books',
    icon: <Iconify icon="solar:bookmark-outline" width={20} />,
  },
  {
    value: 'charges',
    label: 'Charges',
    icon: <Iconify icon="solar:bill-list-outline" width={20} />,
  },
  {
    value: 'borrow-history',
    label: 'Borrow History',
    icon: <Iconify icon="solar:history-outline" width={20} />,
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
    <Grid
      container
      spacing={1}
      sx={{
        mt: 0,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 280px)',
        minHeight: '0',
      }}
    >
      {/* Left Section - Navigation List */}
      <Grid size={{ xs: 12, md: 4, lg: 2.3 }} sx={{ height: '100%' }}>
        <Card sx={{ height: '100%', p: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {TABS.map((tab) => {
              const isSelected = tabs.value === tab.value;
              return (
                <Button
                  key={tab.value}
                  onClick={(e) => tabs.onChange(e, tab.value)}
                  variant="text"
                  color="inherit"
                  startIcon={tab.icon}
                  sx={{
                    position: 'relative',
                    justifyContent: 'flex-start',
                    px: 2,
                    py: 1.5,
                    textAlign: 'left',
                    backgroundColor: (theme) =>
                      isSelected ? theme.palette.action.hover : 'transparent',
                    color: isSelected ? 'inherit' : 'text.secondary',
                    ...(isSelected
                      ? {
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: '2px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '4px',
                            height: '80%',
                            borderLeft: (theme) =>
                              isSelected ? `4px solid ${theme.palette.primary.main}` : 'none',
                          },
                        }
                      : {}),
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Box>
        </Card>
      </Grid>

      {/* Right Section - Content */}
      <Grid size={{ xs: 12, md: 8, lg: 9.7 }} sx={{ height: '100%' }}>
        <Box
          sx={{
            gap: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '0',
          }}
        >
          <Card sx={{ p: 1, flexGrow: 1, height: '100%', overflow: 'hidden' }}>
            <Scrollbar sx={{ height: '100%' }}>
              <Box sx={{ p: 1, gap: 1, minWidth: 360, display: 'flex', flexDirection: 'column' }}>
                {renderTabContent()}
              </Box>
            </Scrollbar>
          </Card>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Libraray;
