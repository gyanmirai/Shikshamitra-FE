import type { Division } from 'src/types/school';

export interface TableDivisionDropDownProps {
  allDivision: Division[];
  division: string;
  currentDivision: string;
  onChange: (val: string | string[] | number | number[]) => void;
}
