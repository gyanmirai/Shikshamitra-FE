import type { Standards } from 'src/types/school';

export interface TableClassDropDownProps {
  allClass: Standards[];
  classes: string;

  onChange: (val: string | string[] | number | number[]) => void;
}
