// DeliveryChannelTable.tsx
import React from 'react';
import dayjs from 'dayjs';
import { Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IDeliveryChannel, IDeliveryChannelTableProps } from '../type';

const DeliveryChannelTable: React.FC<IDeliveryChannelTableProps> = ({
  data,
  onAddDeliveryChannel,
  setEditData,
  onDelete,
  onEdit,
}) => (
  <CustomizableTable
    tableId="delivery-channel-data-table"
    noDataText={
      <>
        Delivery Channel Data Not Found{' '}
        <Typography
          component="span"
          color="primary.main"
          fontWeight={600}
          sx={{
            '&:hover': {
              cursor: 'pointer',
              textDecoration: 'underline',
            },
          }}
          onClick={() => {
            onAddDeliveryChannel.onTrue();
            setEditData(null);
          }}
        >
          Add Delivery Channel
        </Typography>
      </>
    }
    columns={[
      {
        id: 'deliveryChannel',
        label: 'Channel Name',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value || '--'}
          </Typography>
        ),
      },
      {
        id: 'createdBy',
        label: 'Created By',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'createdDate',
        label: 'Created Date',
        align: 'left',
        filterType: 'date',
        render: (value) => (
          <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY')}</Typography>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 60,
        align: 'left',
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showDeleteIcon
              showEditIcon
              handleDeleteClick={() => {
                onDelete(row as IDeliveryChannel);
              }}
              handleEditClick={() => {
                onEdit(row as IDeliveryChannel);
              }}
            />
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default DeliveryChannelTable;
