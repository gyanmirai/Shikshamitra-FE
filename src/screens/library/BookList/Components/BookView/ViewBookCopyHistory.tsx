import type { IColumn } from 'src/components/customizabaleTable/types';
import type { IBook, IBookCopyWithBook } from 'src/screens/library/BookManagement/Components/type';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetBookCopyMembersQuery } from 'src/redux/library/bookList/bookList-api';

interface ViewBookCopyHistoryTableProps {
  editData: IBookCopyWithBook | null; // book data containing reservationMemberIds
  onDelete: (book: IBook) => void;
}

const ViewBookCopyHistoryTable: React.FC<ViewBookCopyHistoryTableProps> = ({
  editData,
  onDelete,
}) => {
  // Fetch all members
  const { data: memberData, isLoading: memberLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBookCopyMembersQuery,
    params: { bookId: editData?.bookId, accessionNo: editData?.accessionNo },
  });

  const columns: IColumn[] = useMemo(
    () => [
      { id: 'memberId', label: 'Member ID', align: 'left', sticky: true, minWidth: 120 },
      { id: 'name', label: 'Member Name', align: 'left', minWidth: 140 },
      { id: 'role', label: 'Role', align: 'left' },
      { id: 'class', label: 'Class', align: 'left' },
      { id: 'division', label: 'Division', align: 'left' },
      { id: 'rollNo', label: 'Roll No.', align: 'left', minWidth: 90 },
      { id: 'grNo', label: 'GR No.', align: 'left', minWidth: 80 },
      {
        id: 'issuedDate',
        label: 'Issued Date',
        align: 'left',
        minWidth: 120,
        filterType: 'date',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {dayjs(value).format('DD-MM-YYYY')}
          </Typography>
        ),
      },
      {
        id: 'returnDate',
        label: 'Return Date',
        align: 'left',
        minWidth: 120,
        filterType: 'date',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {dayjs(value).format('DD-MM-YYYY')}
          </Typography>
        ),
      },
      {
        id: 'requestedDate',
        label: 'Requested Date',
        minWidth: 150,
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
        minWidth: 160,
        filterType: 'date',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {dayjs(value).format('DD-MM-YYYY')}
          </Typography>
        ),
      },
    ],
    []
  );

  return (
    <Box p={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={3}>
        <Grid size={12}>
          {memberData?.length ? (
            <CustomizableTable
              tableId="reserved-members-table"
              noDataText="No Reserved Members Found"
              isLoading={memberLoading}
              columns={columns}
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
