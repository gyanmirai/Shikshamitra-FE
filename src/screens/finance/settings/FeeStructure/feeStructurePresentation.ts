import { formatNumber } from 'src/utils/formate_number';

export const structureMoney = (value: number | null) =>
  value == null ? 'Calculated during assignment' : formatNumber(value, 'INR');
