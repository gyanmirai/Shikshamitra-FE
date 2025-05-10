import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';

import { MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import data from 'src/json/ResourceManagement/orderManagement/approved-order-management-data.json';
import {
  ResourceOrderStatusType,
  ResourceOrderStatusTypeColors,
  ResourceOrderStatusTypeOptions,
} from 'src/enums/resource-order-statusType';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import ResourceRequestOrderDialog from './resource-request-order-dialog';

import type { IResourceRequestOrder } from '../order-management-interface';

const ResourceRequestOrderTable = () => {
  const resourceRequestOrderDialog = useBoolean();

  const [selectedRow, setSelectedRow] = React.useState<IResourceRequestOrder | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string>('');

  const getActionMenuItems = (row: IResourceRequestOrder) => {
    const status = row.orderStatus;

    if (status === 0) {
      return [
        <MenuItem
          key="wantToOrder"
          onClick={() => {
            setOrderStatus('wantToOrder');
            setIsEdit(false);
            setSelectedRow(row);
            resourceRequestOrderDialog.onTrue();
          }}
        >
          <Iconify icon="pepicons-pencil:raise-hand" sx={{ height: '16px', width: '16px' }} />
          Want to Order
        </MenuItem>,
      ];
    }
    if (status === 1) {
      return [
        <MenuItem
          key="cancelOrder"
          onClick={() => {
            setOrderStatus('cancelOrder');
            setIsEdit(false);
            setSelectedRow(row);
            resourceRequestOrderDialog.onTrue();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon={GlobalIcons.cancel} sx={{ height: '16px', width: '16px' }} />
          Cancel Order
        </MenuItem>,
        <MenuItem
          key="deliverOrder"
          onClick={() => {
            setOrderStatus('deliverOrder');
            setIsEdit(false);
            setSelectedRow(row);
            resourceRequestOrderDialog.onTrue();
          }}
        >
          <Iconify icon={GlobalIcons.approvedIcon} sx={{ height: '16px', width: '16px' }} />
          Mark as Delivered
        </MenuItem>,
        <MenuItem
          key="returnOrder"
          onClick={() => {
            setOrderStatus('returnOrder');
            setIsEdit(false);
            setSelectedRow(row);
            resourceRequestOrderDialog.onTrue();
          }}
        >
          <Iconify icon={GlobalIcons.retrunIcon} sx={{ height: '16px', width: '16px' }} />
          Return Order
        </MenuItem>,
      ];
    }
    return [];
  };

  return (
    <>
      <CustomizableTable
        tableId="my-resources-request-apporved-table"
        searchFieldProps={{
          placeholder: 'Search by Name, Category...',
          label: 'Search by Name, Category...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        noDataText={<>No Resources Request Found.</>}
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
            id: 'orderStatus',
            minWidth: '100px',
            filterType: 'enum',
            enumOptions: ResourceOrderStatusTypeOptions,
            render(value, row) {
              const color = ResourceOrderStatusTypeColors[
                value as ResourceOrderStatusType
              ] as LabelColor;

              return <Label color={color}>{ResourceOrderStatusType[value]}</Label>;
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
                    <MenuList>{getActionMenuItems(row as IResourceRequestOrder)}</MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={data}
      />
      {resourceRequestOrderDialog.value && selectedRow && (
        <CustomDialog
          maxWidth="md"
          open={resourceRequestOrderDialog.value}
          handleClose={() => {
            resourceRequestOrderDialog.onFalse();
          }}
          title="Order Management"
        >
          <ResourceRequestOrderDialog
            data={selectedRow}
            onClose={() => {
              resourceRequestOrderDialog.onFalse();
            }}
            isEdit={isEdit}
            requestStatusType={selectedRow?.requestStatusType}
            orderStatus={orderStatus}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default ResourceRequestOrderTable;
