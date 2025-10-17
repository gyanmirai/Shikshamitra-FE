import React from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

import type { IEventType, IEventTypeTableProps } from '../type';

const EventTypeTable: React.FC<IEventTypeTableProps> = ({
  data,
  onAddEventType,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => (
  <CustomizableTable
    tableId="event-type-data-table"
    noDataText={
      <>
        No event type data found.{' '}
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
            onAddEventType.onTrue();
            setOpenDialog(true);
            setEditData(null);
          }}
        >
          Add Event
        </Typography>
      </>
    }
    columns={[
      {
        id: 'eventType',
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
                onDelete(row as IEventType);
              }}
              handleEditClick={() => {
                onEdit(row as IEventType);
              }}
            />
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default EventTypeTable;
