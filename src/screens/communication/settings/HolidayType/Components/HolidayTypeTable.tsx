import React from 'react';
import { Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IHolidayType, IHolidayTypeTableProps } from '../type';

const HolidayTypeTable: React.FC<IHolidayTypeTableProps> = ({
  data,
  onAddHolidayType,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => (
  <CustomizableTable
    tableId="holiday-type-data-table"
    noDataText={
      <>
        Holiday Data Not Found{' '}
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
            onAddHolidayType.onTrue();
            setOpenDialog(true);
            setEditData(null);
          }}
        >
          Add Holiday
        </Typography>
      </>
    }
    columns={[
      {
        id: 'holidayType',
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
          <Typography variant="caption" fontSize="13px" sx={{ color: 'text.secondary' }}>
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
          <Typography variant="caption" fontSize="13px">
            {value}
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
                onDelete(row as IHolidayType);
              }}
              handleEditClick={() => {
                onEdit(row as IHolidayType);
              }}
            />
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default HolidayTypeTable;
