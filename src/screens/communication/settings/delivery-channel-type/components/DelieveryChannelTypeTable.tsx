// DeliveryChannelTable.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

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
        No delivery channel type data found.{' '}
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
        label: 'Name',
        align: 'left',
        render: (value, row) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SubjectColorIndicator color={row.color} />
            <Typography variant="caption" fontSize="13px">
              {value}
            </Typography>
          </Box>
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
