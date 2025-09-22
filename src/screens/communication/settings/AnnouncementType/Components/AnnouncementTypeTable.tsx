import React from 'react';
import dayjs from 'dayjs';
import { Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IAnnouncementType, IAnnouncementTypeTableProps } from './type';

const AnnouncementTypeTable: React.FC<IAnnouncementTypeTableProps> = ({
  data,
  onAddAnnouncementType,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => (
  <CustomizableTable
    tableId="announcement-type-data-table"
    noDataText={
      <>
        Announcement Data Not Found{' '}
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
            onAddAnnouncementType.onTrue();
            setOpenDialog(true);
            setEditData(null);
          }}
        >
          Add Announcement
        </Typography>
      </>
    }
    columns={[
      {
        id: 'announcementType',
        label: 'Type Name',
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
                onDelete(row as IAnnouncementType);
              }}
              handleEditClick={() => {
                onEdit(row as IAnnouncementType);
              }}
            />
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default AnnouncementTypeTable;
