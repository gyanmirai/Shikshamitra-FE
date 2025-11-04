import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
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
import { RouteStatusType, RouteStatusOptions, RouteStatusTypeColor } from 'src/enums/route-enum';
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
          <MenuItem
            onClick={() => {
              pop.onClose();
              setSelectedRoute(routeRow);
            }}
          >
            <Iconify icon={GlobalIcons.eye} sx={{ height: '16px', width: '16px' }} />
            Visualize Route
          </MenuItem>
        </MenuList>
      );
    },
    [changeStatusDialog]
  );

  return (
    <>
      <Box>
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
              minWidth: 200,
            },
            {
              id: 'id',
              label: 'Route Code',
              align: 'left',
              minWidth: 130,
            },
            {
              id: 'startPoint',
              label: 'Start Point',
              align: 'left',
              minWidth: 120,
            },
            {
              id: 'endPoint',
              label: 'End Point',
              align: 'left',
              minWidth: 120,
            },
            {
              id: 'distance',
              label: 'Distance',
              align: 'left',
              minWidth: 100,
            },
            {
              id: 'stops',
              label: 'Stops',
              align: 'left',
              filterType: 'number',
              minWidth: 80,
            },
            {
              id: 'capacity',
              label: 'Capacity',
              align: 'left',
              filterType: 'number',
              minWidth: 100,
            },
            {
              id: 'students',
              label: 'Members',
              align: 'left',
              filterType: 'number',
              minWidth: 100,
            },
            {
              id: 'status',
              label: 'Status',
              align: 'left',
              sticky: true,
              minWidth: 80,
              filterType: 'enum',
              enumOptions: RouteStatusOptions,
              render: (value) => {
                const color = RouteStatusTypeColor[value as RouteStatusType] as LabelColor;
                return <Label color={color}>{RouteStatusType[value]}</Label>;
              },
            },
            {
              id: 'action',
              label: 'Actions',
              align: 'left',
              isFilter: false,
              isSort: false,
              sticky: true,
              minWidth: 60,
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
                    placement="right-center"
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
          routeData={selectedRoute}
          onStatusChange={handleStatusChange}
        />
      </CustomDialog>
    </>
  );
};

export default RouteTable;
