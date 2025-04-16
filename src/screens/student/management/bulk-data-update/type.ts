import type { SxProps, GridProps } from '@mui/material';

export interface SubCategoryType {
  id: string;
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  sx?: SxProps;
  otherProps?: Record<string, any> | ((props: any) => Record<string, any>);
  renderComp?: (props: any) => React.ReactNode;
  gridProps?: GridProps;
}

export interface FieldsType {
  type: string;
  id: string;
  subCategory: SubCategoryType[];
}
