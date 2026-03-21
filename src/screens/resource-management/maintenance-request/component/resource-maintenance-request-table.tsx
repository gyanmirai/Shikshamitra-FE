import type { LabelColor } from 'src/components/label/types';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { MenuItem, MenuList } from '@mui/material';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomDialog from 'src/components/custom-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import data from 'src/json/resource-management/resource-maintenance/resource-maintenance-request-data.json';
import {
  ResourceMaintenanceRequestStatusType,
  ResourceMaintenanceRequestStatusTypeColors,
  ResourceMaintenanceRequestStatusTypeOptions,
} from 'src/enums/resource-maintenance-statusType';

import ResourceRequestMaintenaceDialog from './resource-maintenance-request-dialog';

import type { IResourceRequestMaintenance } from '../resource-maintenance-request-interface';

const ResourceMaintenanceRequestTable = () => {
  const ResourceRequestMaintenanceDialog = useBoolean();

  const [selectedRow, setSelectedRow] = React.useState<IResourceRequestMaintenance | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [maintenanceStatus, setMaintenanceStatus] = useState<string>('');

  const getActionMenuItems = (row: IResourceRequestMaintenance) => {
    const status = row.maintenanceStatus;

    if (status === 0) {
      return [
        <MenuItem
          key="Assign Technician"
          onClick={() => {
            setMaintenanceStatus('pending');
            setIsEdit(false);
            setSelectedRow(row);
            ResourceRequestMaintenanceDialog.onTrue();
          }}
        >
          <Iconify icon="ic:outline-engineering" sx={{ height: '16px', width: '16px' }} />
          Assign Technician
        </MenuItem>,
      ];
    }

    if (status === 1) {
      return [
        <MenuItem
          key="Repair Completed"
          onClick={() => {
            setMaintenanceStatus('Repair Completed');
            setIsEdit(false);
            setSelectedRow(row);
            ResourceRequestMaintenanceDialog.onTrue();
          }}
        >
          <Iconify icon={GlobalIcons.approvedIcon} sx={{ height: '16px', width: '16px' }} />
          Mark As Repaired
        </MenuItem>,
        <MenuItem
          key="Not Repaired"
          onClick={() => {
            setMaintenanceStatus('Not Repaired');
            setIsEdit(false);
            setSelectedRow(row);
            ResourceRequestMaintenanceDialog.onTrue();
          }}
        >
          <Iconify icon={GlobalIcons.cancel} sx={{ height: '16px', width: '16px' }} />
          Not Repairable
        </MenuItem>,
      ];
    }

    if (status === 3) {
      return [
        <MenuItem
          key="dispose"
          onClick={() => {
            setMaintenanceStatus('dispose');
            setIsEdit(false);
            setSelectedRow(row);
            ResourceRequestMaintenanceDialog.onTrue();
          }}
        >
          <Iconify icon="fluent-mdl2:empty-recycle-bin" sx={{ height: '16px', width: '16px' }} />
          Dispose
        </MenuItem>,
      ];
    }
    return [];
  };

  return (
    <>
      <CustomizableTable
        tableId="my-resources-maintenance-request-table"
        searchFieldProps={{
          placeholder: 'Search by Name, Category...',
          label: 'Search by Name, Category...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        noDataText={<>No Maintenance Request Found.</>}
        columns={[
          {
            label: 'Name',
            id: 'name',
          },
          {
            label: 'Category',
            id: 'category',
          },

          {
            label: 'Status',
            id: 'maintenanceStatus',
            minWidth: '100px',
            filterType: 'enum',
            enumOptions: ResourceMaintenanceRequestStatusTypeOptions,
            render(value, row) {
              const color = ResourceMaintenanceRequestStatusTypeColors[
                value as ResourceMaintenanceRequestStatusType
              ] as LabelColor;

              return <Label color={color}>{ResourceMaintenanceRequestStatusType[value]}</Label>;
            },
          },

          {
            id: 'action',
            label: 'Actions',
            align: 'left',
            minWidth: 100,
            sticky: true,
            isFilter: false,
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  actions={({ popover }) => (
                    <MenuList>{getActionMenuItems(row as IResourceRequestMaintenance)}</MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={data}
      />
      {ResourceRequestMaintenanceDialog.value && selectedRow && (
        <CustomDialog
          maxWidth="md"
          open={ResourceRequestMaintenanceDialog.value}
          handleClose={() => {
            ResourceRequestMaintenanceDialog.onFalse();
          }}
          title="Maintenance Request"
        >
          <ResourceRequestMaintenaceDialog
            data={selectedRow}
            onClose={() => {
              ResourceRequestMaintenanceDialog.onFalse();
            }}
            isEdit={isEdit}
            maintenanceStatus={maintenanceStatus}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default ResourceMaintenanceRequestTable;
