import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/type';
import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Grid, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetReservationTableViewQuery } from 'src/redux/library/bookList/bookList-api';

interface ViewReservedMembersTableProps {
  editData: IBook | null; // book data containing reservationMemberIds
  onDelete: (book: IBook) => void;
}

const ViewReservedMembersTable: React.FC<ViewReservedMembersTableProps> = ({
  editData,
  onDelete,
}) => {
  const { currentAcademicYear } = useSelector((state: RootState) => state.globalState);
  // Fetch all members
  const { data: reservationData, isLoading: reservationLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReservationTableViewQuery,
    params: { bookId: editData?.id, academicYearId: currentAcademicYear },
  });

  // Match reserved member IDs with member details
  const reservedList = reservationData?.filter((member: any) =>
    editData?.reservationMemberIds?.includes(member.memberId)
  );

  const columns: IColumn[] = useMemo(
    () => [
      { id: 'memberId', label: 'Member ID', align: 'left', sticky: true, minWidth: 120 },
      { id: 'name', label: 'Member Name', align: 'left', minWidth: 140 },
      { id: 'role', label: 'Role', align: 'left' },
      { id: 'class', label: 'Class', align: 'left' },
      { id: 'division', label: 'Division', align: 'left' },
      { id: 'rollNo', label: 'Roll No.', align: 'left', minWidth: 90 },
      { id: 'grNo', label: 'GR No.', align: 'left', minWidth: 90 },
      {
        id: 'accessionNo',
        label: 'Accession No.',
        align: 'left',
        minWidth: 140,
      },
      {
        id: 'reservedBook',
        label: 'Reserved Book',
        minWidth: 140,
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {typeof value === 'object' ? value?.title || '-' : value || '-'}
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
        minWidth: 160,
        align: 'left',
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
    <Box p={2}>
      <Grid container spacing={3}>
        <Grid size={12}>
          {reservedList?.length ? (
            <CustomizableTable
              tableId="reserved-members-table"
              noDataText="No Reserved Members Found"
              isLoading={reservationLoading}
              columns={columns}
              data={reservedList || []}
            />
          ) : (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                textAlign: 'center',
                bgcolor: (theme) =>
                  theme.palette.mode === 'light' ? '#e3f2fd' : 'rgba(144, 202, 249, 0.08)',
                color: (theme) => (theme.palette.mode === 'light' ? '#0d47a1' : '#90caf9'),
                border: 1,
                borderColor: (theme) =>
                  theme.palette.mode === 'light' ? '#2196f3' : 'rgba(144, 202, 249, 0.24)',
              }}
            >
              No reservations yet
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewReservedMembersTable;
