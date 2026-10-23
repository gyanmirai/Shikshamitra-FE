import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/use-tabs';
import { Box, Tab, Card } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { motion, AnimatePresence } from 'framer-motion';
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

interface EmployeeLibraryProps {
  employee?: any;
}

const TABS = [
  {
    value: 'borrowed-books',
    label: 'Borrowed Books',
    icon: 'solar:book-bookmark-linear',
  },
  {
    value: 'reserved-books',
    label: 'Reserved Books',
    icon: 'solar:bookmark-linear',
  },
  {
    value: 'charges',
    label: 'Charges',
    icon: 'solar:wallet-linear',
  },
  {
    value: 'borrow-history',
    label: 'Borrow History',
    icon: 'solar:history-linear',
  },
];

const EmployeeLibrary = ({ employee }: EmployeeLibraryProps) => {
  const tabs = useTabs('borrowed-books');

  const {
    data: borrowedBooks,
    isLoading: borrowedLoading,
    error: borrowedError,
    refetch: borrowedRetry,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIssuedBooksQuery,
  });

  const {
    data: reservedBooks,
    isLoading: reservedLoading,
    error: reservedError,
    refetch: reservedRetry,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReservedBooksQuery,
  });

  const {
    data: finesCharges,
    isLoading: finesChargesLoading,
    error: chargesError,
    refetch: chargesRetry,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFinesChargesQuery,
  });

  const {
    data: borrowHistoryBooks,
    isLoading: borrowHistoryLoading,
    error: historyError,
    refetch: historyRetry,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIssuedBooksQuery,
  });

  const renderTabContent = () => {
    switch (tabs.value) {
      case 'borrowed-books':
        return (
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <CustomizableTable
              variant="embedded"
              showColumns
              showExport
              showFullScreen
              exportScope="all"
              tableId="employee-borrowed-books-table"
              tableTitle="Borrowed books"
              noDataText="No Borrowed Books Data Found"
              isLoading={borrowedLoading}
              error={borrowedError}
              onRetry={borrowedRetry}
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
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <CustomizableTable
              variant="embedded"
              showColumns
              showExport
              showFullScreen
              exportScope="all"
              tableId="employee-reserved-books-table"
              tableTitle="Reserved books"
              noDataText="No Reserved Books Data Found"
              isLoading={reservedLoading}
              error={reservedError}
              onRetry={reservedRetry}
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
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <CustomizableTable
              variant="embedded"
              showColumns
              showExport
              showFullScreen
              exportScope="all"
              tableId="employee-fines-charges-table"
              tableTitle="Library charges"
              noDataText="No Fines or Charges Data Found"
              isLoading={finesChargesLoading}
              error={chargesError}
              onRetry={chargesRetry}
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
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(Math.ceil(value));
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
                  stickyPosition: 'right' as const,
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
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <CustomizableTable
              variant="embedded"
              showColumns
              showExport
              showFullScreen
              exportScope="all"
              tableId="employee-issued-books-table"
              tableTitle="Borrowing history"
              noDataText="No Borrowed History Data Found"
              isLoading={borrowHistoryLoading}
              error={historyError}
              onRetry={historyRetry}
              columns={[
                { id: 'bookTitle', label: 'Book Title', align: 'left' },
                { id: 'bookId', label: 'Book Category', align: 'left' },
                { id: 'accessionNo', label: 'Accession No.', align: 'left' },
                { id: 'issueDate', label: 'Issued on', align: 'left' },
                { id: 'dueDate', label: 'Due on', align: 'left' },
              ]}
              data={borrowHistoryBooks || []}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 280px)',
        minHeight: 0,
        gap: 1,
      }}
    >
      {/* Tabs */}
      <Card
        sx={{
          flexShrink: 0,
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={tabs.value}
          onChange={tabs.onChange}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={<Iconify icon={tab.icon} width={20} />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          ))}
        </CustomTabs>
      </Card>

      {/* Tab Content */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tabs.value}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default EmployeeLibrary;
