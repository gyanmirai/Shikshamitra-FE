import React from 'react';
import { Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IChargeType, IChargeTypeTableProps } from './type';

const ChargeTypeTable: React.FC<IChargeTypeTableProps> = ({
  data,
  onAddChargeType,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
  open,
}) => (
  <CustomizableTable
    tableId="charge-type-data-table"
    noDataText={
      <>
        Charge Category Data Not Found{' '}
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
            onAddChargeType.onTrue();
            setOpenDialog(true);
            setEditData(null);
          }}
        >
          Add Charge Category
        </Typography>
      </>
    }
    columns={[
      {
        id: 'chargeType',
        label: 'Name',
        align: 'left',
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
        filterType: 'number',
        render(value) {
          // If value is falsy (null, undefined, 0, false), print '-'
          if (!value) return '-';
          return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
          }).format(value);
        },
      },
      {
        id: 'isFixed',
        label: 'Fixed Amount',
        align: 'left',
        render(value) {
          return value ? 'Yes' : 'No';
        },
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',
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
                onDelete(row as IChargeType);
              }}
              handleEditClick={() => {
                onEdit(row as IChargeType);
              }}
            />
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default ChargeTypeTable;
