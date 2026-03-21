import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizable-table/types';

import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomDialog from 'src/components/custom-dialog';
import { useDispatch, useSelector } from 'react-redux';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, MenuItem, MenuList, Typography } from '@mui/material';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import { useGetDriverConductorDataQuery } from 'src/redux/transport/vehicle-management/driver-conductor-api';

import DriverProfile from './DriverProfile';
import AssignRouteForm from './AssignRouteForm';

import type { IDriverConductor, IDriverManagementTableProps } from './type';

const DriverConductorTable: React.FC<IDriverManagementTableProps> = () => {
  const { data: driverConductorData, isLoading: driverConductorLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDriverConductorDataQuery,
  });

  // Get isChanges state from Redux store to track if there are unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Get dispatch function to dispatch Redux actions
  const dispatch = useDispatch();
  const assignRouteDialog = useBoolean();
  const viewProfileDialog = useBoolean();
  const [selectedDriver, setSelectedDriver] = useState<IDriverConductor | null>(null);

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      assignRouteDialog.onFalse();
      setSelectedDriver(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      assignRouteDialog.onFalse();
      setSelectedDriver(null);
    }
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => {
      const driverRow = row as IDriverConductor;
      return (
        <MenuList>
          {driverRow.role === 'Driver' && (
            <MenuItem
              onClick={() => {
                pop.onClose();
                setSelectedDriver(driverRow);
                assignRouteDialog.onTrue();
              }}
            >
              <Iconify icon="mdi:map-marker-path" sx={{ height: '16px', width: '16px' }} />
              Assign Route
            </MenuItem>
          )}
        </MenuList>
      );
    },
    [assignRouteDialog]
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Name',
        align: 'left',
        sticky: true,
        minWidth: 150,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'employeeId',
        label: 'Employee ID',
        align: 'left',
        minWidth: 130,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'role',
        label: 'Role',
        align: 'left',
        minWidth: 100,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },

      {
        id: 'licenceExpiry',
        label: 'Licence Expiry',
        align: 'left',
        filterType: 'date',
        minWidth: 140,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'experience',
        label: 'Experience',
        align: 'left',
        minWidth: 120,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'phoneNo',
        label: 'Phone No.',
        align: 'left',
        minWidth: 140,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'assignedRoute',
        label: 'Assigned Route',
        align: 'left',
        minWidth: 150,
        render: (value, row) => (
          <Typography variant="caption" fontSize="13px">
            {Array.isArray(value) ? value.join(', ') : value || '-'}
          </Typography>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 50,
        align: 'left',
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              actions={(prop) => actions({ ...prop, row })}
              placement="right-top"
              showViewIcon
              handleViewClick={() => {
                setSelectedDriver(row as IDriverConductor);
                viewProfileDialog.onTrue();
              }}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <CustomizableTable
        tableId="driver-conductor-data-table"
        isLoading={driverConductorLoading}
        noDataText={<>Driver/Conductor Data Not Found </>}
        columns={columns}
        data={driverConductorData?.length ? driverConductorData : []}
      />

      {/* Assign Route Dialog */}
      <CustomDialog
        open={assignRouteDialog.value}
        handleClose={() => {
          assignRouteDialog.onFalse();
          setSelectedDriver(null);
        }}
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Assign Route</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal allows assigning a specific route to a particular driver. It includes route selection, schedule details, and confirmation options to finalize the assignment."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AssignRouteForm driverData={selectedDriver} onClose={handleClose} />
      </CustomDialog>

      {/* Driver Profile Dialog */}
      <CustomDialog
        open={viewProfileDialog.value}
        handleClose={() => {
          viewProfileDialog.onFalse();
          setSelectedDriver(null);
        }}
        maxWidth="md"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Driver Profile</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal displays all details of a particular driver, including personal information, license details, assigned vehicle(s), route(s), and contact information for quick reference."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <DriverProfile
          driverData={selectedDriver}
          onClose={() => {
            viewProfileDialog.onFalse();
            setSelectedDriver(null);
          }}
        />
      </CustomDialog>
    </>
  );
};

export default DriverConductorTable;
