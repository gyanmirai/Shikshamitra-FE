import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import React from 'react';
import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, MenuList, MenuItem, Typography } from '@mui/material';
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
  const { data: memberData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllMembersQuery,
  });

  // Match reserved member IDs with member details
  const reservedList = editData?.reservationMemberIds?.map((memberId: string) =>
    memberData?.find((m: any) => m.memberId === memberId)
  );

  return (
    <Box p={2}>
      <Grid container spacing={3}>
        <Grid size={12}>
          {reservedList?.length ? (
            <CustomizableTable
              tableId="reserved-members-table"
              noDataText="No Reserved Members Found"
              columns={[
                { id: 'memberId', label: 'Member ID', align: 'left' },
                { id: 'name', label: 'Member Name', align: 'left' },
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
                {
                  id: 'action',
                  label: 'Action',
                  align: 'left',
                  isSort: false,
                  isFilter: false,
                  sticky: true,
                  render: (row: any) => (
                    <ThreeDotsActions
                      placement="right-top"
                      actions={() => (
                        <MenuList>
                          <MenuItem>
                            <Iconify icon="mingcute:notification-fill" />
                            Send Notification
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              onDelete?.(row as IBook);
                            }}
                          >
                            <Iconify
                              icon="solar:trash-bin-trash-bold"
                              sx={{ color: 'error.main' }}
                            />
                            Remove
                          </MenuItem>
                        </MenuList>
                      )}
                    />
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
