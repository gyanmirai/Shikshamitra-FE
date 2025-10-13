import type { LabelColor } from 'src/components/label';

import { Box } from '@mui/system';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Avatar, MenuItem, MenuList, Typography } from '@mui/material';
import { useGetVehicleManagementDataQuery } from 'src/redux/transport/vehicle-management/vehicle-management-api';

import AddMaintenanceForm from './AddMaintenanceForm';
import { VehicleStatusOptions, VehicleStatusTypeColors } from './type';

import type { IVehicleData, VehicleStatusType } from './type';

interface VehicleTableViewProps {
  onEdit: (row: IVehicleData) => void;
  onView: (row: IVehicleData) => void;
}

const VehicleTableView = ({ onEdit, onView }: VehicleTableViewProps) => {
  const { data } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetVehicleManagementDataQuery,
  });

  const [isChanges, setIsChanges] = useState(false);
  const maintainDialog = useBoolean();
  const [, setSelectedVehicle] = useState<IVehicleData | null>(null);

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      maintainDialog.onFalse();
      setSelectedVehicle(null);
      setIsChanges(false);
    } else if (!isChanges) {
      maintainDialog.onFalse();
      setSelectedVehicle(null);
    }
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            pop.onClose();
            setSelectedVehicle(row);
            maintainDialog.onTrue();
          }}
        >
          <Iconify icon="mdi:wrench" sx={{ height: '16px', width: '16px' }} />
          Maintain
        </MenuItem>
        <MenuItem
          onClick={() => {
            pop.onClose();
          }}
        >
          <Iconify icon="solar:refresh-bold" sx={{ height: '16px', width: '16px' }} />
          Change Status
        </MenuItem>
      </MenuList>
    ),
    [maintainDialog]
  );

  return (
    <>
      <CustomizableTable
        tableId="vehicle-management-table"
        noDataText="No Vehicle Records Found"
        columns={[
          {
            id: 'regNo',
            label: 'Reg No.',
            align: 'left',
            minWidth: '170px',
            render: (value, row) => (
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  src={row.imageUrl || '/static/vehicle/bus-1.png'}
                  sx={{ width: 32, height: 32 }}
                  variant="rounded"
                />
                {value}
              </Box>
            ),
          },
          { id: 'vehicleType', label: 'Vehicle Type', align: 'left', minWidth: '140px' },
          { id: 'capacity', label: 'Capacity', align: 'left', minWidth: '100px' },
          { id: 'route', label: 'Route', align: 'left', minWidth: '120px' },
          { id: 'driver', label: 'Driver', align: 'left', minWidth: '150px' },
          { id: 'insuranceExpiry', label: 'Insurance Expiry', align: 'left', minWidth: '160px' },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            filterType: 'enum',
            enumOptions: VehicleStatusOptions,
            sticky: true,
            render(value, row) {
              const color = VehicleStatusTypeColors[value as VehicleStatusType] as LabelColor;
              return (
                <Label
                  color={
                    color as 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
                  }
                >
                  {value}
                </Label>
              );
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            align: 'left',
            isSort: false,
            isFilter: false,
            minWidth: 80,
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                  showEditIcon
                  handleEditClick={() => {
                    onEdit(row as IVehicleData);
                  }}
                  showViewIcon
                  handleViewClick={() => {
                    onView(row as IVehicleData);
                  }}
                />
              );
            },
          },
        ]}
        data={data || []}
      />

      <CustomDialog
        open={maintainDialog.value}
        handleClose={() => {
          maintainDialog.onFalse();
          setSelectedVehicle(null);
        }}
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Add Maintenance Record</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal allows users to add maintenance logs for a particular vehicle by recording necessary details. It helps in tracking service history and ensuring vehicle safety and reliability."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AddMaintenanceForm open={maintainDialog.value} onClose={handleClose} />
      </CustomDialog>
    </>
  );
};

export default VehicleTableView;
