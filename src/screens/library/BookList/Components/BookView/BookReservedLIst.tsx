import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import React from 'react';
import dayjs from 'dayjs';
import { Box, Grid, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetAllMembersQuery } from 'src/redux/library/bookList/memberApi';

interface ViewReservedMembersTableProps {
  editData: IBook | null; // book data containing reservationMemberIds
  onDelete: (book: IBook) => void;
}

const ViewReservedMembersTable: React.FC<ViewReservedMembersTableProps> = ({
  editData,
  onDelete,
}) => {
  // Fetch all members
  const { data: memberData, isLoading: memberLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllMembersQuery,
  });

  // Match reserved member IDs with member details
  const reservedList = memberData?.filter((member: any) =>
    editData?.reservationMemberIds?.includes(member.memberId)
  );

  return (
    <Box p={2}>
      <Grid container spacing={3}>
        <Grid size={12}>
          {reservedList?.length ? (
            <CustomizableTable
              tableId="reserved-members-table"
              noDataText="No Reserved Members Found"
              isLoading={memberLoading}
              columns={[
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
              ]}
              data={reservedList || []}
            />
          ) : (
            <Typography>No reservations yet</Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewReservedMembersTable;
