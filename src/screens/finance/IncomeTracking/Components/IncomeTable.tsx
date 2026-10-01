import React from 'react';
import { Box } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { useIncomeTableColumns } from '../hooks/useIncomeTableColumns';

import type { IIncomeRecord } from '../types';

interface IIncomeTableProps {
  data: IIncomeRecord[];
  addIncome: { onTrue: () => void };
  canAdd?: boolean;
  isLoading: true;
  setEditData: (data: IIncomeRecord | null) => void;
  onEdit?: (row: IIncomeRecord) => void;
  onDelete?: (row: IIncomeRecord) => void;
  onView?: (row: IIncomeRecord) => void;
}

const IncomeTable: React.FC<IIncomeTableProps> = ({
  data,
  addIncome,
  canAdd = false,
  isLoading,
  setEditData,
  onEdit,
  onDelete,
  onView,
}) => {
  const columns = useIncomeTableColumns({
    onView,
    onEdit,
    onDelete,
  });

  return (
    <CustomizableTable
      tableId="income-table"
      isLoading={isLoading}
      noDataText={
        <>
          No Income data found
          {canAdd && <Box
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
          </Box>}
        </>
      }
      columns={columns}
      data={data || []}
    />
  );
};

/**
 * Memoization Justification:
 * React.memo is used here to prevent the table from re-rendering
 * if the `data` prop or handlers haven't changed.
 * This is crucial for performance when the parent component updates
 * for reasons unrelated to the table data.
 */
export default React.memo(IncomeTable);
