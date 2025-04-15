export type IRoleData = {
  name: string;
  count: number;
  employee?: any[];
  children?: IRoleData[];
};

export type IOrgChartListProps<T extends IRoleData> = {
  data: T;
  depth: number;
  nodeItem: (props: T) => React.ReactElement<any>;
};

export type IOrgChartSubListProps<T extends IRoleData> = {
  data: T[];
  depth: number;
  nodeItem: (props: T) => React.ReactElement<any>;
};
