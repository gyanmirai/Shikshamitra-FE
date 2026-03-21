import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/custom-dialog';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, MenuItem, MenuList, Typography } from '@mui/material';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import { useGetStopsQuery } from 'src/redux/transport/vehicle-management/stop-management-api';

import ChangeStopStatusForm from './ChangeStopStatusForm';
import {
  StopStatusType,
  type IStopData,
  StopStatusOptions,
  StopStatusTypeColor,
  type IStopStatusChange,
} from './type';

interface StopManagementTableProps {
  addStop: any;
  setEditData: (data: IStopData) => void;
  onEdit: (data: IStopData) => void;
}

const StopManagementTable: React.FC<StopManagementTableProps> = ({
  addStop,
  setEditData,
  onEdit,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: stopManagementData, isLoading: stopManagementLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStopsQuery,
  });
  const dispatch = useDispatch();

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const changeStatusDialog = useBoolean();
  const viewDetailsDialog = useBoolean();
  const [selectedStop, setSelectedStop] = useState<IStopData | null>(null);

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      changeStatusDialog.onFalse();
      viewDetailsDialog.onFalse();
      setSelectedStop(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      changeStatusDialog.onFalse();
      viewDetailsDialog.onFalse();
      setSelectedStop(null);
    }
  };

  const handleStatusChange = (statusData: IStopStatusChange) => {
    // Handle status change logic here
    handleClose(null, true);
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => {
      const stopRow = row as IStopData;
      return (
        <MenuList>
          <MenuItem
            onClick={() => {
              pop.onClose();
              setSelectedStop(stopRow);
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
      <CustomizableTable
        tableId="stop-management-data-table"
        noDataText={<>Stop Management Data Not Found </>}
        isLoading={stopManagementLoading}
        columns={[
          {
            id: 'stopName',
            label: 'Stop Name',
            align: 'left',
            sticky: true,
            minWidth: 200,
            render: (value) => (
              <Typography variant="caption" fontSize="13px">
                {value}
              </Typography>
            ),
          },
          {
            id: 'landmark',
            label: 'Landmark',
            align: 'left',
            minWidth: 200,
            render: (value) => (
              <Typography variant="caption" fontSize="13px">
                {value}
              </Typography>
            ),
          },
          {
            id: 'zone',
            label: 'Zone',
            align: 'left',
            minWidth: 160,
            render: (value) => (
              <Typography variant="caption" fontSize="13px">
                {value}
              </Typography>
            ),
          },
          {
            id: 'assignedStudents',
            label: 'Assigned Students',
            align: 'left',
            minWidth: 170,
            filterType: 'number',
            render: (value) => (
              <Typography variant="caption" fontSize="13px">
                {value}
              </Typography>
            ),
          },
          {
            id: 'amount',
            label: 'Amount',
            align: 'left',
            minWidth: 100,
            filterType: 'number',
            render: (value) => `₹ ${value?.toLocaleString()}`,
          },
          {
            id: 'approxKmFromSchool',
            label: 'Approx KM',
            align: 'left',
            filterType: 'number',
            minWidth: 120,
            render: (value) => (
              <Typography variant="caption" fontSize="13px">
                {value}
              </Typography>
            ),
          },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            sticky: true,
            minWidth: 80,
            filterType: 'enum',
            enumOptions: StopStatusOptions,
            render: (value) => {
              const color = StopStatusTypeColor[value as StopStatusType] as LabelColor;
              return <Label color={color}>{StopStatusType[value]}</Label>;
            },
          },
          {
            id: 'action',
            label: 'Actions',
            minWidth: 40,
            align: 'left',
            isSort: false,
            sticky: true,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                  showEditIcon
                  handleEditClick={() => {
                    const stopData = row as IStopData;
                    setEditData(stopData);
                    onEdit(stopData);
                  }}
                />
              );
            },
          },
        ]}
        data={[]}
      />

      {/* Change Status Dialog */}
      <CustomDialog
        open={changeStatusDialog.value}
        handleClose={() => {
          changeStatusDialog.onFalse();
          setSelectedStop(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Change Status</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal allows you to change the status of a particular stop. It helps in managing stop availability and maintaining accurate transport records."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ChangeStopStatusForm
          isOpen={changeStatusDialog.value}
          onClose={handleClose}
          stopData={selectedStop}
          onStatusChange={handleStatusChange}
        />
      </CustomDialog>
    </>
  );
};

export default StopManagementTable;
