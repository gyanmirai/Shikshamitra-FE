import React from 'react';
import { Box, Chip } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetIssuedBooksQuery } from 'src/redux/memberManagement/memberManagementApi';
import {
  BookIssueStatusTypeColors,
  BookIssueStatusTypeOptions,
} from 'src/enums/library-status-types';

import type { IMember } from '../type';

interface IssuedBooksProps {
  member: IMember | null;
}

const IssuedBooks: React.FC<IssuedBooksProps> = ({ member }) => {
  const { data: mockIssuedBooks, isLoading: mockIssuedLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIssuedBooksQuery,
  });

  return (
    <Box>
      <CustomizableTable
        tableId="issued-books-table"
        noDataText="No Issued Books Data Found"
        isLoading={mockIssuedLoading}
        columns={[
          { id: 'bookId', label: 'Book Name', align: 'left' },
          { id: 'bookTitle', label: 'Book Category', align: 'left' },
          { id: 'issueDate', label: 'Issued on', align: 'left' },
          { id: 'dueDate', label: 'Due on', align: 'left' },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            render(value) {
              // Find the status type based on the label from enum options
              const statusType = BookIssueStatusTypeOptions.find(
                (option) => option.label === value
              )?.value;

              // Get corresponding color from enum colors mapping
              const color =
                statusType !== undefined ? BookIssueStatusTypeColors[statusType] : 'default';

              return <Chip label={value} color={color as any} size="small" variant="soft" />;
            },
          },
        ]}
        data={mockIssuedBooks || []}
      />
    </Box>
  );
};

export default IssuedBooks;
