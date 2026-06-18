import type { IColumn } from 'src/components/customizabaleTable/types';
import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetReservationTableViewQuery } from 'src/redux/library/bookList/bookList-api';

interface ViewReservedMembersTableProps {
  editData: IBook | null; // book data containing reservationMemberIds
  onDelete: (reservation: any) => void;
}

const ViewReservedMembersTable: React.FC<ViewReservedMembersTableProps> = ({
  editData,
  onDelete,
}) => {
  // Fetch all members
  const { data: reservationData, isLoading: reservationLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReservationTableViewQuery,
    params: { bookId: editData?.id, page: 1, pageSize: 100 },
    options: { skip: !editData?.id },
  });

  const reservedList = Array.isArray(reservationData)
    ? reservationData
    : reservationData?.items || [];

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
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 80,
        align: 'center',
        isSort: false,
        isFilter: false,
        sticky: true,
        render: (_value, row) => (
          <ThreeDotsActions
            showThreeDots={false}
            showDeleteIcon
            deleteLabel="Cancel reservation"
            handleDeleteClick={() => onDelete(row)}
          />
        ),
      },
    ],
    [onDelete]
  );

  return (
    <Box p={2}>
      <Grid container spacing={3}>
        <Grid size={12}>
          {reservationLoading || reservedList?.length ? (
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
