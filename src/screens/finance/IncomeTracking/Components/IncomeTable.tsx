import React from 'react';
import { Box } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IIncomeFormValues } from './type';

interface IIncomeTableProps {
  data: IIncomeFormValues[];
  addIncome: { onTrue: () => void };
  setEditData: (data: IIncomeFormValues | null) => void;
  onEdit?: (row: IIncomeFormValues) => void;
  onDelete?: (row: IIncomeFormValues) => void;
  onView?: (row: IIncomeFormValues) => void;
}

const IncomeTable: React.FC<IIncomeTableProps> = ({
  data,
  addIncome,
  setEditData,
  onEdit,
  onDelete,
  onView,
}) => (
  <CustomizableTable
    tableId="income-table"
    noDataText={
      <>
        No Income data found
        <Box
          onClick={() => {
            addIncome.onTrue();
            setEditData(null);
          }}
          color="primary.main"
          fontWeight={600}
          sx={{
            '&:hover': {
              cursor: 'pointer',
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
        >
          Add Income
        </Box>
      </>
    }
    columns={[
      {
        id: 'incomeCategory',
        label: 'Income Category',
        align: 'left',
        minWidth: '160px',
      },
      {
        id: 'budget',
        label: 'Budget',
        align: 'left',
      },
      {
        id: 'incomeName',
        label: 'Income Name',
        align: 'left',
        minWidth: '160px',
      },
      {
        id: 'amount',
        label: 'Amount',
        align: 'left',
        filterType: 'number',
        render: (value) => `₹ ${value?.toLocaleString()}`,
      },
      {
        id: 'paymentMethod',
        label: 'Payment Method',
        align: 'left',
        minWidth: '160px',
      },
      {
        id: 'date',
        label: 'Date',
        align: 'left',
        filterType: 'date',
      },
      {
        id: 'notes',
        label: 'Notes',
        align: 'left',
        minWidth: '150px',
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'left',
        isSort: false,
        isFilter: false,
        sticky: true,
        minWidth: 50,
        render: (value, row) => (
          <ThreeDotsActions
            showThreeDots={false}
            showEditIcon
            showDeleteIcon
            showViewIcon
            handleViewClick={() => {
              onView?.(row as IIncomeFormValues);
            }}
            handleEditClick={() => onEdit?.(row as IIncomeFormValues)}
            handleDeleteClick={() => onDelete?.(row as IIncomeFormValues)}
          />
        ),
      },
    ]}
    data={data || []}
  />
);

export default IncomeTable;
