import type { Standards } from 'src/types/school';

export interface ITableClassDropDownProps {
  allClass: Standards[];
  classes: string;

  onChange: (val: string | string[] | number | number[]) => void;
}
