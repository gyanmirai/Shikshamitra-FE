import React from 'react';

import { Box, Chip } from '@mui/material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFinesChargesQuery } from 'src/redux/memberManagement/memberManagementApi';
import {
  FinesChargesStatusTypeColors,
  FinesChargesStatusTypeOptions,
} from 'src/enums/library-status-types';

import CustomizableTable from 'src/components/customizabaleTable';

import type { IMember } from '../type';

interface FinesChargesProps {
  member: IMember | null;
}

const FinesCharges: React.FC<FinesChargesProps> = ({ member }) => {
  const { data: mockFinesCharges, isLoading: mockFinesChargesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFinesChargesQuery,
  });

  return mockFinesChargesLoading ? (
    'Loading...'
  ) : (
    <Box>
      <CustomizableTable
        tableId="fines-charges-table"
        noDataText="No Fines or Charges Found"
        columns={[
          { id: 'bookTitle', label: 'Book Title', align: 'left' },
          { id: 'amount', label: 'Amount', align: 'left' },
          { id: 'dateIssued', label: 'Date', align: 'left' },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            render(value) {
              // Find the status type based on the label from enum options
              const statusType = FinesChargesStatusTypeOptions.find(
                (option) => option.label === value
              )?.value;

              // Get corresponding color from enum colors mapping
              const color =
                statusType !== undefined ? FinesChargesStatusTypeColors[statusType] : 'default';

              return <Chip label={value} color={color as any} size="small" variant="soft" />;
            },
          },
        ]}
        data={mockFinesCharges}
      />
    </Box>
  );
};

export default FinesCharges;
