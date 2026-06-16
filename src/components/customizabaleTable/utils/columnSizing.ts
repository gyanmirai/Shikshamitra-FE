import type { IColumn } from '../types';

export const getColumnSizeSx = (column: IColumn) => {
  const { width } = column;

  return {
    ...(width !== undefined ? { width } : {}),
    ...(column.minWidth !== undefined ? { minWidth: column.minWidth } : {}),
    ...(column.maxWidth !== undefined ? { maxWidth: column.maxWidth } : {}),
  };
};
