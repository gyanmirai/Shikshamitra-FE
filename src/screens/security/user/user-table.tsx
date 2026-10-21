import { useGetUsersQuery } from 'src/redux/user/userApi';
import { convertBase64Format } from 'src/utils/base64Formate';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Avatar, Typography, LinearProgress } from '@mui/material';

import UserRowActions from './user-row-actions';
import { getUserDisplayName } from './user-record';

import type { UserRecord, UserActionHandler } from './user-record';

export default function UserTable({ onAction }: { onAction: UserActionHandler }) {
  const { data, isLoading, isFetching, error, refetch } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetUsersQuery,
    popupConfig: { error: false },
  });
  const users: UserRecord[] = data?.items ?? [];
  const tableData = users.map((user) => ({ ...user, userName: getUserDisplayName(user) }));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {isFetching && !isLoading && data && (
        <LinearProgress aria-label="Refreshing users" sx={{ flexShrink: 0 }} />
      )}
      <CustomizableTable
        tableId="user-management-table"
        tableTitle="User Management"
        wrapperProps={{ sx: { height: 1, flex: 1, minHeight: 0, minWidth: 0 } }}
        tableContainerProps={{ sx: { height: 1 } }}
        data={tableData}
        isLoading={isLoading || (isFetching && !data)}
        error={isFetching ? undefined : error}
        onRetry={() => {
          refetch();
        }}
        noDataText="No users are available."
        searchFieldProps={{
          placeholder: 'Search users...',
          label: 'Search Users',
          inputProps: { 'aria-label': 'Search users by name, email, or mobile number' },
        }}
        searchableFields={['userName', 'email', 'phoneNumber']}
        columns={[
          {
            id: 'userName',
            label: 'Full Name',
            align: 'left',
            isFilter: true,
            filterType: 'string',
            minWidth: 220,
            render: (value, row) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <Avatar
                  alt=""
                  src={row.profilePicture ? convertBase64Format(row.profilePicture) : ''}
                  sx={{ height: 32, width: 32, flexShrink: 0 }}
                />
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {value}
                </Typography>
              </Box>
            ),
          },
          {
            id: 'email',
            label: 'Email',
            align: 'left',
            isFilter: true,
            filterType: 'string',
            minWidth: 220,
            render: (value) => (
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                {value || 'Not provided'}
              </Typography>
            ),
          },
          {
            id: 'phoneNumber',
            label: 'Mobile No.',
            align: 'left',
            isFilter: true,
            filterType: 'string',
            minWidth: 160,
            render: (value) => value || 'Not provided',
          },
          {
            id: 'action',
            label: 'Actions',
            align: 'left',
            width: 144,
            isSort: false,
            isFilter: false,
            excludeFromExport: true,
            sticky: true,
            stickyPosition: 'right',
            render: (_value, row) => (
              <UserRowActions user={row as UserRecord} onAction={onAction} />
            ),
          },
        ]}
      />
    </Box>
  );
}
