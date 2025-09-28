import React from 'react';
import { Box, Chip } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFinesChargesQuery } from 'src/redux/memberManagement/memberManagementApi';
import {
  FinesChargesStatusTypeColors,
  FinesChargesStatusTypeOptions,
} from 'src/enums/library-status-types';

import type { IMember } from '../type';

interface FinesChargesProps {
  member: IMember | null;
}

const FinesCharges: React.FC<FinesChargesProps> = ({ member }) => {
  const { data: mockFinesCharges, isLoading: mockFinesChargesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFinesChargesQuery,
  });

  return (
    <Box>
      <CustomizableTable
        tableId="fines-charges-table"
        noDataText="No Fines or Charges Data Found"
        isLoading={mockFinesChargesLoading}
        columns={[
          { id: 'bookTitle', label: 'Book Title', align: 'left' },
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
        data={mockFinesCharges || []}
      />
    </Box>
  );
};

export default FinesCharges;
