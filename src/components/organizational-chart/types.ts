import type { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { TreeProps } from 'react-organizational-chart';

// ----------------------------------------------------------------------
export type NodeProps = OrgChartBaseNode & {
  id?: string;
  name: string;
  group?: string;
  role?: string;
  avatarUrl?: string;
  children?: any;
  color?: string;
  sx?: SxProps<Theme>;
  type?: 'class' | 'subject';
};

export type OrgChartProps<T> = Omit<TreeProps, 'label' | 'children'> & {
  data: {
    name: string;
    children: T[];
  };
  nodeItem: (props: T) => React.ReactElement;
};

export type OrgChartListProps<T> = {
  data: T;
  depth: number;
  nodeItem: (props: T) => React.ReactElement;
};

export type OrgChartSubListProps<T> = {
  data: T[];
  depth: number;
  nodeItem: (props: T) => React.ReactElement;
};

export type OrgChartBaseNode = {
  depth?: number;
  totalChildren?: number;
};
