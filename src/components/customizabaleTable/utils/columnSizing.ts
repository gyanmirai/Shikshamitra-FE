import type { IColumn } from '../types';

export const getColumnSizeSx = (column: IColumn, resizedWidth?: number) => {
  const width = resizedWidth ?? column.width;

  return {
    ...(width !== undefined ? { width } : {}),
    ...(column.minWidth !== undefined ? { minWidth: column.minWidth } : {}),
    ...(column.maxWidth !== undefined ? { maxWidth: column.maxWidth } : {}),
  };
};
