import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, MenuItem, MenuList, Typography } from '@mui/material';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetStopManagementDataQuery } from 'src/redux/transport/vehicle-management/stop-management-api';

import ChangeStopStatusForm from './ChangeStopStatusForm';
import { StopStatusOptions, StopStatusTypeColors } from './type';

import type { IStopData, StopStatusType, IStopStatusChange } from './type';

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
  const { data: stopManagementData, isLoading: stopManagementLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStopManagementDataQuery,
  });

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const changeStatusDialog = useBoolean();
  const viewDetailsDialog = useBoolean();
  const [selectedStop, setSelectedStop] = useState<IStopData | null>(null);

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      changeStatusDialog.onFalse();
      viewDetailsDialog.onFalse();
      setSelectedStop(null);
      setIsChanges(false);
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
            minWidth: 180,
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
            minWidth: 50,
            filterType: 'enum',
            enumOptions: StopStatusOptions,
            render: (value) => {
              const color = StopStatusTypeColors[value as StopStatusType];
              return <Label color={color}>{value}</Label>;
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
        data={stopManagementData || []}
      />

      {/* Change Status Dialog */}
      <CustomDialog
        open={changeStatusDialog.value}
        handleClose={() => {
          changeStatusDialog.onFalse();
          setSelectedStop(null);
        }}
        maxWidth="sm"
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
