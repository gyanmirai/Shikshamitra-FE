import React from 'react';
import { Box, Chip } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetReservedBooksQuery } from 'src/redux/memberManagement/memberManagementApi';
import {
  BookReservationStatusTypeColors,
  BookReservationStatusTypeOptions,
} from 'src/enums/library-status-types';

import type { IMember } from '../type';

interface ReservedBooksProps {
  member: IMember | null;
}

const ReservedBooks: React.FC<ReservedBooksProps> = ({ member }) => {
  const { data: mockReservedBooks, isLoading: memberLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReservedBooksQuery,
  });

  return (
    <Box>
      <CustomizableTable
        tableId="reserved-books-table"
        noDataText="No Reserved Books Data Found"
        isLoading={memberLoading}
        columns={[
          { id: 'bookTitle', label: 'Book Title', align: 'left' },
          { id: 'reservationDate', label: 'Reserved on', align: 'left' },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            render(value) {
              // Find the status type based on the label from enum options
              const statusType = BookReservationStatusTypeOptions.find(
                (option) => option.label === value
              )?.value;

              // Get corresponding color from enum colors mapping
              const color =
                statusType !== undefined ? BookReservationStatusTypeColors[statusType] : 'default';

              return <Chip label={value} color={color as any} size="small" variant="soft" />;
            },
          },
        ]}
        data={mockReservedBooks || []}
      />
    </Box>
  );
};

export default ReservedBooks;
