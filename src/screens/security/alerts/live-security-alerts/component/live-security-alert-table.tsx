import dayjs from 'dayjs';
import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Button, MenuItem, MenuList } from '@mui/material';
import data from 'src/json/security/live-security-data.json';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const LiveSecurityAlertTable = () => {
  const acknowledgeDialog = useBoolean();
  const reslovedDialog = useBoolean();
  return (
    <>
      <CustomizableTable
        searchFieldProps={{
          placeholder: 'Search by  Name, location...',
          label: 'Search by  Name, location...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        tableId="access-logs-management-table"
        noDataText="No Alerts Found"
        columns={[
          {
            id: 'studentName',
            label: 'Student Name',
          },
          {
            id: 'location',
            label: 'Location',
          },
          {
            id: 'time',
            label: 'Time',
            filterType: 'string' as const,
            isFilter: true,
            isSort: false,
            render: (value) => (value ? dayjs(value).format('hh:mm A') : null),
          },
          {
            id: 'action',
            label: 'Action',
            isFilter: false,
            isSort: false,
            sticky: true,
            minWidth: 100,
            align: 'center',
            render: (value, row) => (
              <ThreeDotsActions
                placement="right-top"
                actions={() => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        acknowledgeDialog.onTrue();
                      }}
                    >
                      <Iconify icon="mingcute:arrow-down-line" />
                      Acknowledge
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        reslovedDialog.onTrue();
                      }}
                    >
                      <Iconify icon={GlobalIcons.approvedIcon} />
                      Resolve
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={data}
      />
      {acknowledgeDialog.value && (
        <ConfirmDialog
          open={acknowledgeDialog.value}
          onClose={() => {
            acknowledgeDialog.onFalse();
          }}
          title="Acknowledge"
          content="Are You Sure You Want To Take Ownership Of This Alert?"
          action={
            <Button variant="contained" onClick={() => {}}>
              Yes
            </Button>
          }
        />
      )}

      {reslovedDialog.value && (
        <ConfirmDialog
          open={reslovedDialog.value}
          onClose={() => {
            reslovedDialog.onFalse();
          }}
          title="Resolved"
          content="Are You Sure This Alert Is Resolved?"
          action={
            <Button variant="contained" onClick={() => {}}>
              Yes
            </Button>
          }
        />
      )}
    </>
  );
};

export default LiveSecurityAlertTable;
