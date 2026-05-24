import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { useGetEmployeeProfessionalReviewHistoryQuery } from 'src/redux/hr/professional-management-api';

const reviewStatus = ['Draft', 'Submitted'];

const ReviewHistory = () => {
  const employee = useSelector((state: RootState) => state.auth.employee);
  const employeeId = employee?.id;
  const { data, isLoading } = useGetEmployeeProfessionalReviewHistoryQuery(employeeId, {
    skip: !employeeId,
  });

  if (!employeeId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">
          No employee profile is linked to the current user.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <CustomizableTable
        tableId="review-history"
        isLoading={isLoading}
        columns={[
          { id: 'cycleName', label: 'Cycle' },
          {
            id: 'submittedAt',
            label: 'Submitted At',
            render: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
          },
          { id: 'communicationScore', label: 'Communication' },
          { id: 'problemSolvingScore', label: 'Problem Solving' },
          {
            id: 'status',
            label: 'Status',
            render: (value) => reviewStatus[value] || 'Draft',
          },
        ]}
        data={data?.items || []}
        noDataText="No review history found."
      />
    </Box>
  );
};

export default ReviewHistory;
