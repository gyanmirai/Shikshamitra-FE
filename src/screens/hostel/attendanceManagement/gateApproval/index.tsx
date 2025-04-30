'use client';

import type { LabelColor } from 'src/components/label';

import React, { useState, useCallback } from 'react';

import { Box, Button, MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import hostelGateVerificationData from 'src/json/hostel/hostelGateVerification/hostelGateVerificationData.json';
import {
  HostelGateVerificationStatusType,
  HostelGateVerificationStatusColor,
  HostelGateVerificationStatusOptions,
} from 'src/enums/gateapproval-hostel';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import type { IHostelGateVerification } from './type';

const GateApproval = () => {
  // Dialog state for marking student as outbound
  const markOutboundDialog = useBoolean();
  // Dialog state for marking student as returned
  const markReturnDialog = useBoolean();

  // State to store and manage hostel gate verification data for students
  const [studentsData, setStudentsData] = useState<IHostelGateVerification[]>(
    hostelGateVerificationData
  );
  // Actions to be displayed in the three-dot menu
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {row.status === 0 && (
            <MenuItem
              onClick={() => {
                markOutboundDialog.onTrue();
                pop.onClose();
              }}
            >
              <Iconify icon="mdi:arrow-right-bold" sx={{ mr: 1 }} />
              Exit Confirm
            </MenuItem>
          )}
          {row.status === 1 && (
            <MenuItem
              onClick={() => {
                markReturnDialog.onTrue();
                pop.onClose();
              }}
            >
              <Iconify icon="mdi:arrow-left-bold" sx={{ mr: 1 }} />
              Return
            </MenuItem>
          )}
          {/* )} */}
        </MenuList>
      </>
    ),
    [markOutboundDialog, markReturnDialog]
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Gate Verification"
        description="Gate pass verification for all students"
        links={[
          { name: 'Hostel Management', href: '/hostel/dashboard' },
          { name: 'Attendance And Leave Management', href: '' },
          { name: 'Gate Verification', href: '' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <CustomizableTable
        tableId="gate-verification-management"
        searchFieldProps={{
          placeholder: 'Search Room No, Student Name...',
          label: 'Search Room No, Student Name...',
        }}
        noDataText="Attendance Data Not Found"
        columns={[
          {
            id: 'roomNumber',
            label: 'Room Number',
            filterType: 'number',
            align: 'left',
            minWidth: 150,
          },
          { id: 'studentName', label: 'Student Name', align: 'left', minWidth: 150 },
          { id: 'hostelName', label: 'Hostel Name', align: 'left', minWidth: 150 },
          { id: 'outTime', label: 'Out Time', filterType: 'date', align: 'left', minWidth: 150 },
          {
            id: 'returnETA',
            label: 'Return Time',
            filterType: 'date',
            align: 'left',
            minWidth: 150,
          },
          {
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            enumOptions: HostelGateVerificationStatusOptions,
            render(value, row) {
              const color = HostelGateVerificationStatusColor[
                value as HostelGateVerificationStatusType
              ] as LabelColor;

              return <Label color={color}>{HostelGateVerificationStatusType[value]}</Label>;
            },
          },
          {
            id: 'action',
            label: 'Action',
            sticky: true,
            isSort: false,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={studentsData}
      />

      <ConfirmDialog
        open={markOutboundDialog.value}
        onClose={() => {
          markOutboundDialog.onFalse();
        }}
        title="Exit Confirmation"
        content="Are you sure want to Confirm Exit ?"
        action={
          <Button variant="contained" onClick={() => {}}>
            Confirm
          </Button>
        }
      />

      <ConfirmDialog
        open={markReturnDialog.value}
        onClose={() => {
          markReturnDialog.onFalse();
        }}
        title="Return Confirmation"
        content="Are you sure want to Returned ?"
        action={
          <Button variant="contained" onClick={() => {}}>
            Confirm
          </Button>
        }
      />
    </Box>
  );
};

export default GateApproval;
