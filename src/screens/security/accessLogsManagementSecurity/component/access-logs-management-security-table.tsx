import type { LabelColor } from 'src/components/label/types';

import dayjs from 'dayjs';
import React from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { Button, MenuItem, MenuList } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import data from 'src/json/security/access-logs-security-data.json';
import {
  AccessLogsManagementSecurityStatusType,
  AccessLogsManagementSecurityStatusTypeColor,
  AccessLogsManagementSecurityStatusTypeOptions,
} from 'src/enums/accessLogs-management-security-table-statusType';

import GateAcessDenyDialog from './gate-access-deny-dialog';

import type { IAccessLogsManagementSecurityInterface } from '../access-logs-management-security-interface';

const AccessLogsManagementSecurityTable = () => {
  const approvedDialog = useBoolean();
  const denyDialog = useBoolean();

  const [selectedItem, setSelectedItem] = React.useState<IAccessLogsManagementSecurityInterface>();
  return (
    <>
      <CustomizableTable
        searchFieldProps={{
          placeholder: 'Search by  Name, Role...',
          label: 'Search by  Name, Role...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        tableId="access-logs-management-table"
        noDataText="No Access Logs Found"
        columns={[
          {
            id: 'name',
            label: 'Student Name',
          },
          {
            id: 'role',
            label: 'Role',
          },
          {
            id: 'passType',
            label: 'Pass Type',
          },
          {
            id: 'startTime',
            label: 'Start Time',
            isFilter: false,
            isSort: false,
            render: (value) => (value ? dayjs(value).format('hh:mm A') : null),
          },
          {
            id: 'endTime',
            label: 'End Time',
            isFilter: false,
            isSort: false,
            render: (value) => (value ? dayjs(value).format('hh:mm A') : null),
          },
          {
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            enumOptions: AccessLogsManagementSecurityStatusTypeOptions,
            minWidth: '130px',
            align: 'left',
            render(value, row) {
              const color = AccessLogsManagementSecurityStatusTypeColor[
                value as AccessLogsManagementSecurityStatusType
              ] as LabelColor;

              const val = AccessLogsManagementSecurityStatusType[value];
              return <Label color={color}>{val}</Label>;
            },
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
                        approvedDialog.onTrue();
                      }}
                    >
                      <Iconify icon={GlobalIcons.approvedIcon} />
                      Approved Exit
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setSelectedItem(row as IAccessLogsManagementSecurityInterface);
                        denyDialog.onTrue();
                      }}
                    >
                      <Iconify icon={GlobalIcons.cancel} />
                      Deny Exit
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={data}
      />
      {approvedDialog.value && (
        <ConfirmDialog
          open={approvedDialog.value}
          onClose={() => {
            approvedDialog.onFalse();
          }}
          title="Allowed Exit"
          content="Are You Sure You Want Allow Exit?"
          action={
            <Button variant="contained" onClick={() => {}}>
              Yes
            </Button>
          }
        />
      )}

      {denyDialog.value && selectedItem && (
        <CustomDialog
          maxWidth="md"
          title="Deny Exit"
          open={denyDialog.value}
          handleClose={() => {
            denyDialog.onFalse();
          }}
        >
          <GateAcessDenyDialog
            data={selectedItem}
            onClose={() => {
              denyDialog.onFalse();
            }}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default AccessLogsManagementSecurityTable;
