import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Chip, MenuItem, MenuList, Typography } from '@mui/material';
import { useGetDriverConductorDataQuery } from 'src/redux/transport/vehicle-management/driver-conductor-api';

import DriverProfile from './DriverProfile';
import AssignRouteForm from './AssignRouteForm';

import type { IDriverConductor, IDriverManagementTableProps } from './type';

const DriverConductorTable: React.FC<IDriverManagementTableProps> = () => {
  const { data: driverConductorData, isLoading: driverConductorLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDriverConductorDataQuery,
  });

  const [isChanges, setIsChanges] = useState(false);
  const assignRouteDialog = useBoolean();
  const viewProfileDialog = useBoolean();
  const [selectedDriver, setSelectedDriver] = useState<IDriverConductor | null>(null);

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      assignRouteDialog.onFalse();
      setSelectedDriver(null);
      setIsChanges(false);
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

  return (
    <>
      <CustomizableTable
        tableId="driver-conductor-data-table"
        isLoading={driverConductorLoading}
        noDataText={<>Driver/Conductor Data Not Found </>}
        columns={[
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
            id: 'name',
            label: 'Name',
            align: 'left',
            minWidth: 150,
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
            render: (value, row) => {
              const driverRow = row as IDriverConductor;
              if (driverRow.role === 'Driver' && !value) {
                return (
                  <Chip
                    size="small"
                    label="Assign Route"
                    variant="outlined"
                    sx={{
                      fontSize: '11px',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'white',
                      },
                    }}
                    onClick={() => {
                      setSelectedDriver(driverRow);
                      assignRouteDialog.onTrue();
                    }}
                  />
                );
              }
              return (
                <Typography variant="caption" fontSize="13px">
                  {value || '-'}
                </Typography>
              );
            },
          },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            sticky: true,
            minWidth: 120,
            render: (value) => {
              if (value === 'Active') {
                return <Label color="success">{value}</Label>;
              }
              if (value === 'On Leave') {
                return <Label color="error">{value}</Label>;
              }
              return <Label color="default">{value}</Label>;
            },
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
        ]}
        data={driverConductorData || []}
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
