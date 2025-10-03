import React from 'react';
import { Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IConditionType, IConditionTypeTableProps } from './type';

const ConditionTypeTable: React.FC<IConditionTypeTableProps> = ({
  data,
  onAddConditionType,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => (
  <CustomizableTable
    tableId="condition-type-data-table"
    noDataText={
      <>
        Condition Data Not Found{' '}
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
            onAddConditionType.onTrue();
            setOpenDialog(true);
            setEditData(null);
          }}
        >
          Add Condition
        </Typography>
      </>
    }
    columns={[
      {
        id: 'conditionType',
        label: 'Name',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      { id: 'description', label: 'Description', align: 'left' },
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
                onDelete(row as IConditionType);
              }}
              handleEditClick={() => {
                onEdit(row as IConditionType);
              }}
            />
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default ConditionTypeTable;
