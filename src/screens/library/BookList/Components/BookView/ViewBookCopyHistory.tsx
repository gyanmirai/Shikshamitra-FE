import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import React from 'react';
import dayjs from 'dayjs';
import { Box, Grid, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetAllMembersQuery } from 'src/redux/library/bookList/memberApi';

interface ViewBookCopyHistoryTableProps {
  editData: IBook | null; // book data containing reservationMemberIds
  onDelete: (book: IBook) => void;
}

const ViewBookCopyHistoryTable: React.FC<ViewBookCopyHistoryTableProps> = ({
  editData,
  onDelete,
}) => {
  // Fetch all members
  const { data: memberData, isLoading: memberLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllMembersQuery,
  });

  return (
    <Box p={2}>
      <Grid container spacing={3}>
        <Grid size={12}>
          {memberData?.length ? (
            <CustomizableTable
              tableId="reserved-members-table"
              noDataText="No Reserved Members Found"
              isLoading={memberLoading}
              columns={[
                { id: 'memberId', label: 'Member ID', align: 'left', sticky: true },
                { id: 'name', label: 'Member Name', align: 'left' },
                { id: 'role', label: 'Role', align: 'left' },
                { id: 'class', label: 'Class', align: 'left' },
                { id: 'division', label: 'Division', align: 'left' },
                { id: 'rollNo', label: 'Roll No', align: 'left' },
                { id: 'grNo', label: 'GR No', align: 'left' },
                {
                  id: 'requestedDate',
                  label: 'Requested Date',
                  align: 'left',
                  filterType: 'date',
                  render: (value) => (
                    <Typography variant="caption" fontSize="13px">
                      {dayjs(value).format('DD-MM-YYYY')}
                    </Typography>
                  ),
                },
                {
                  id: 'reserveDueDate',
                  label: 'Reserve Due Date',
                  align: 'left',
                  filterType: 'date',
                  render: (value) => (
                    <Typography variant="caption" fontSize="13px">
                      {dayjs(value).format('DD-MM-YYYY')}
                    </Typography>
                  ),
                },
              ]}
              data={memberData || []}
            />
          ) : (
            <Typography>No reservations yet</Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewBookCopyHistoryTable;
