import type { IColumn } from 'src/components/customizable-table/types';
import type { IBook, IBookCopyWithBook } from 'src/screens/library/book-management/components/type';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetBookCopyMembersQuery } from 'src/redux/library/book-list/bookList-api';

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

  const displayData = memberData?.length ? memberData : [];

  const columns: IColumn[] = useMemo(
    () => [
      { id: 'memberId', label: 'Member ID', align: 'left', sticky: true, minWidth: 120 },
      { id: 'name', label: 'Member Name', align: 'left', minWidth: 140 },
      { id: 'grNo', label: 'GR No.', align: 'left', minWidth: 100 },
      { id: 'role', label: 'Role', align: 'left', minWidth: 100 },
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
            {value ? dayjs(value).format('DD-MM-YYYY') : '—'}
          </Typography>
        ),
      },
      {
        id: 'daysBorrowed',
        label: 'Days Borrowed',
        align: 'left',
        minWidth: 130,
        render: (_value, row: any) => {
          const issued = dayjs(row.issuedDate);
          const returned = row.returnDate ? dayjs(row.returnDate) : dayjs();
          const days = returned.diff(issued, 'day');
          return (
            <Typography variant="caption" fontSize="13px" fontWeight={600}>
              {days} {days === 1 ? 'day' : 'days'}
            </Typography>
          );
        },
      },
      { id: 'class', label: 'Class', align: 'left', minWidth: 80 },
      { id: 'division', label: 'Division', align: 'left', minWidth: 90 },
      { id: 'rollNo', label: 'Roll No.', align: 'left', minWidth: 90 },
    ],
    []
  );

  return (
    <Box p={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={3}>
        <Grid size={12}>
          {displayData?.length ? (
            <CustomizableTable
              tableId="reserved-members-table"
              noDataText="No Reserved Members Found"
              isLoading={memberLoading}
              columns={columns}
              data={displayData || []}
            />
          ) : (
            <Grid size={{ xs: 12 }}>
              <div
                style={{
                  padding: '12px',
                  borderRadius: '4px',
                  backgroundColor: '#e3f2fd',
                  color: '#2196f3',
                  textAlign: 'center',
                }}
              >
                No reservations yet
              </div>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewBookCopyHistoryTable;
