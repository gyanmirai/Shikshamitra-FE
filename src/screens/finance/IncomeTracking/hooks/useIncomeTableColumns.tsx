import type { IColumn } from 'src/components/customizabaleTable/types';

import { useMemo } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';

import type { IIncomeFormValues } from '../types';

interface UseIncomeTableColumnsProps {
  onView?: (row: IIncomeFormValues) => void;
  onEdit?: (row: IIncomeFormValues) => void;
  onDelete?: (row: IIncomeFormValues) => void;
}

export const useIncomeTableColumns = ({
  onView,
  onEdit,
  onDelete,
}: UseIncomeTableColumnsProps): IColumn[] =>
  useMemo(
    () => [
      {
        id: 'incomeCategory',
        label: 'Income Category',
        align: 'left',
        minWidth: '160px',
        sticky: true,
      },
      {
        id: 'incomeName',
        label: 'Income Name',
        align: 'left',
        minWidth: '160px',
      },
      {
        id: 'incomeCategoryTags',
        label: 'Income Category Tags',
        minWidth: 200,
        align: 'left',
        render(value) {
          return Array.isArray(value) ? value.join(', ') : '-';
        },
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
        render: (_value, row) => (
          <ThreeDotsActions
            showThreeDots={false}
            showEditIcon
            showDeleteIcon
            showViewIcon
            handleViewClick={() => onView?.(row as IIncomeFormValues)}
            handleEditClick={() => onEdit?.(row as IIncomeFormValues)}
            handleDeleteClick={() => onDelete?.(row as IIncomeFormValues)}
          />
        ),
      },
      /**
       * Memoization Justification:
       * Columns configuration is stable unless handlers change.
       * Preventing re-creation of columns array on every render avoids
       * unnecessary table re-renders.
       */
    ],
    [onView, onEdit, onDelete]
  );
