import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, MenuItem, MenuList, Typography } from '@mui/material';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetRouteManagementDataQuery } from 'src/redux/transport/vehicle-management/route-management-api';

import ChangeStopStatusForm from './ChangeStopStatusForm';

import type { IRoutesData, IStopStatusChange } from './type';

interface IRouteTableProps {
  setOpenDialog?: (value: boolean) => void;
  setEditData?: (value: any) => void;
  onViewDetail?: (data: any) => void;
}

const RouteTable: React.FC<IRouteTableProps> = ({ setOpenDialog, setEditData, onViewDetail }) => {
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const { data: routeDta, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRouteManagementDataQuery,
  });

  const changeStatusDialog = useBoolean();
  const [selectedRoute, setSelectedRoute] = useState<IRoutesData | null>(null);

  const getStatusColor = (status: string): LabelColor => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      changeStatusDialog.onFalse();
      setSelectedRoute(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      changeStatusDialog.onFalse();
      setSelectedRoute(null);
    }
  };

  const handleStatusChange = (statusData: IStopStatusChange) => {
    // Handle status change logic here
    console.log('Status changed:', statusData);
    handleClose(null, true);
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => {
      const routeRow = row as IRoutesData;
      return (
        <MenuList>
          <MenuItem
            onClick={() => {
              pop.onClose();
              setSelectedRoute(routeRow);
              changeStatusDialog.onTrue();
            }}
          >
            <Iconify icon="solar:refresh-bold" sx={{ height: '16px', width: '16px' }} />
            Change Status
          </MenuItem>
        </MenuList>
      );
    },
    [changeStatusDialog]
  );

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <CustomizableTable
          tableId="route-management-table"
          noDataText=" Not Routes Data Found"
          isLoading={isLoading}
          columns={[
            {
              id: 'routeName',
              sticky: true,
              label: 'Route Name',
              align: 'left',
              minWidth: '130px',
            },
            {
              id: 'id',
              label: 'Route ID',
              align: 'left',
              minWidth: '100px',
            },
            {
              id: 'startPoint',
              label: 'Start Point',
              align: 'left',
              minWidth: '120px',
            },
            {
              id: 'endPoint',
              label: 'End Point',
              align: 'left',
              minWidth: '120px',
            },
            {
              id: 'distance',
              label: 'Distance',
              align: 'left',
              minWidth: '100px',
            },
            {
              id: 'stops',
              label: 'Stops',
              align: 'left',
              minWidth: '80px',
            },
            {
              id: 'capacity',
              label: 'Capacity',
              align: 'left',
              minWidth: '100px',
            },
            {
              id: 'students',
              label: 'Students',
              align: 'left',
              minWidth: '100px',
            },
            {
              id: 'status',
              label: 'Status',
              sticky: true,
              align: 'left',
              minWidth: '100px',
              render(value) {
                return (
                  <Label
                    variant="soft"
                    color={getStatusColor(value)}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {value}
                  </Label>
                );
              },
            },
            {
              id: 'action',
              label: 'Actions',
              align: 'left',
              isFilter: false,
              isSort: false,
              sticky: true,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={(prop) => actions({ ...prop, row })}
                    showViewIcon
                    showEditIcon
                    showDeleteIcon={false}
                    handleViewClick={() => {
                      onViewDetail?.(row);
                    }}
                    handleEditClick={() => {
                      setOpenDialog?.(true);
                      setEditData?.(row);
                    }}
                    placement="left-top"
                  />
                );
              },
            },
          ]}
          data={routeDta || []}
        />
      </Box>

      {/* Change Status Dialog */}
      <CustomDialog
        open={changeStatusDialog.value}
        handleClose={() => {
          changeStatusDialog.onFalse();
          setSelectedRoute(null);
        }}
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Change Status</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal allows you to change the status of a particular route. It helps in managing route availability and maintaining accurate transport records."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ChangeStopStatusForm
          isOpen={changeStatusDialog.value}
          onClose={handleClose}
          stopData={selectedRoute}
          onStatusChange={handleStatusChange}
        />
      </CustomDialog>
    </>
  );
};

export default RouteTable;
