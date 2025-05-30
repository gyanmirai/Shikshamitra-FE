import type { SxProps, GridProps } from '@mui/material';

export interface FieldsType {
  type: string;
  label: string;
  name: string;
  placeholder?: string;
  sx?: SxProps;
  otherProps?: Record<string, any> | ((props: any) => Record<string, any>);
  renderComp?: (props: any) => React.ReactNode;
  gridProps?: GridProps;
}
