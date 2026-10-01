import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { PaymentMethodLabels } from 'src/enums/finance-payment-method';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import type { IIncomeRecord } from '../types';

interface UseIncomeTableColumnsProps {
  onView?: (row: IIncomeRecord) => void;
  onEdit?: (row: IIncomeRecord) => void;
  onDelete?: (row: IIncomeRecord) => void;
}

export const useIncomeTableColumns = ({
  onEdit,
  onDelete,
}: UseIncomeTableColumnsProps): IColumn[] =>
  useMemo(
    () => [
      {
        id: 'categoryName',
        label: 'Income Category',
        align: 'left',
        minWidth: '160px',
        sticky: true,
      },
      {
        id: 'name',
        label: 'Income Name',
        align: 'left',
        minWidth: '160px',
      },
      {
        id: 'categoryTags',
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
        render: (value) => PaymentMethodLabels[value as keyof typeof PaymentMethodLabels] || value,
      },
      {
        id: 'paymentDate',
        label: 'Date',
        align: 'left',
        filterType: 'date',
        render: (value) => dayjs(value).format('DD/MM/YYYY'),
      },
      {
        id: 'notes',
        label: 'Notes',
        align: 'left',
        minWidth: '150px',
      },
      ...(onEdit || onDelete ? [{
        id: 'actions',
        label: 'Actions',
        align: 'left',
        isSort: false,
        isFilter: false,
        sticky: true,
        minWidth: 50,
        render: (_value: unknown, row: unknown) => (
          <AdaptiveThreeDotsActions
            actions={[
              ...(onEdit ? [{
                id: 'edit',
                label: 'Edit',
                icon: 'solar:pen-bold',
                onClick: () => onEdit(row as IIncomeRecord),
              }] : []),
              ...(onDelete ? [{
                id: 'delete',
                label: 'Delete',
                icon: 'solar:trash-bin-trash-bold',
                onClick: () => onDelete(row as IIncomeRecord),
                color: 'error.main',
              }] : []),
            ]}
          />
        ),
      } as IColumn] : []),
      /**
       * Memoization Justification:
       * Columns configuration is stable unless handlers change.
       * Preventing re-creation of columns array on every render avoids
       * unnecessary table re-renders.
       */
    ],
    [onEdit, onDelete]
  );
