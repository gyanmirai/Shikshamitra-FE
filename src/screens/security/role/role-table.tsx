import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import { Box, Stack, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

import RoleRowActions from './role-row-actions';
import { getRoleColor } from './role-form-values';

import type { RoleRecord } from './role-form-values';
import type { RoleActionHandler } from './role-row-actions';

export default function RoleTable({
  canCreate,
  onCreate,
  onAction,
}: {
  canCreate: boolean;
  onCreate: () => void;
  onAction: RoleActionHandler;
}) {
  const { data, isLoading, error, refetch } = useGetRolesQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
  });

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <CustomizableTable
        tableId="role-table"
        tableTitle="Role Management"
        wrapperProps={{ sx: { height: 1, flex: 1, minHeight: 0 } }}
        tableContainerProps={{ sx: { height: 1 } }}
        searchFieldProps={{
          placeholder: 'Search roles...',
          label: 'Search Role',
          inputProps: { 'aria-label': 'Search roles by name' },
        }}
        searchableFields={['name']}
        noDataText={
          <Stack spacing={1} alignItems="center">
            <Typography variant="body2">No roles have been added yet.</Typography>
            {canCreate && (
              <Button
                type="button"
                size="small"
                color="inherit"
                variant="outlined"
                startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                onClick={onCreate}
              >
                Add Role
              </Button>
            )}
          </Stack>
        }
        columns={[
          {
            id: 'name',
            label: 'Role',
            align: 'left',
            isFilter: true,
            filterType: 'string',
            render: (value, row) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <SubjectColorIndicator color={getRoleColor(row as RoleRecord)} />
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {value}
                </Typography>
              </Box>
            ),
          },
          {
            id: 'action',
            label: 'Actions',
            align: 'left',
            isSort: false,
            isFilter: false,
            excludeFromExport: true,
            sticky: true,
            stickyPosition: 'right',
            width: 144,
            render: (_value, row) => (
              <RoleRowActions role={row as RoleRecord} onAction={onAction} />
            ),
          },
        ]}
        data={data?.items ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={() => {
          refetch();
        }}
      />
    </Box>
  );
}
