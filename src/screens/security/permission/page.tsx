'use client';

import dynamic from 'next/dynamic';
import React, { cloneElement } from 'react';

import { Box, useTheme } from '@mui/material';

import { flattenArray } from 'src/utils/helper';

import ZoomAndDrag from 'src/components/zoom-drag';
import { ComponentBlock } from 'src/components/component-block';

import StandardNode from './standard-node';

const Tree = dynamic(() => import('react-organizational-chart').then((mod) => mod.Tree), {
  ssr: false,
});

const TreeNode = dynamic(() => import('react-organizational-chart').then((mod) => mod.TreeNode), {
  ssr: false,
});

type RoleData = {
  name: string;
  count: number;
  employee?: any[];
  children?: RoleData[];
};

const roleData: RoleData = {
  name: 'Admin',
  count: 2,
  children: [
    {
      name: 'Principle',
      count: 2,
      employee: [],
      children: [
        {
          name: 'Teacher',
          count: 20,
        },
        {
          name: 'Clerk',
          count: 5,
          children: [
            {
              name: 'Accountant',
              count: 2,
            },
          ],
        },
      ],
    },
    {
      name: 'Peon',
      count: 7,
    },
  ],
};

type OrgChartListProps<T extends RoleData> = {
  data: T;
  depth: number;
  nodeItem: (props: T) => React.ReactElement;
};

type OrgChartSubListProps<T extends RoleData> = {
  data: T[];
  depth: number;
  nodeItem: (props: T) => React.ReactElement;
};

export function TreeList<T extends RoleData>({ data, depth, nodeItem }: OrgChartListProps<T>) {
  const childs = data.children;

  const cloneNode = (props: RoleData) => cloneElement(nodeItem(props as T));

  const totalChildren = childs ? flattenArray(childs).length : 0;

  const label = cloneNode({ ...data, depth, totalChildren });

  return (
    <TreeNode label={label}>
      {childs && <TreeSubList data={childs as T[]} depth={depth} nodeItem={nodeItem} />}
    </TreeNode>
  );
}
function TreeSubList<T extends RoleData>({ data, depth, nodeItem }: OrgChartSubListProps<T>) {
  return (
    <>
      {data.map((list, index) => (
        <TreeList key={index} data={list} depth={depth + 1} nodeItem={nodeItem} />
      ))}
    </>
  );
}

const RoleAssignments = () => {
  const theme = useTheme();
  return (
    <Box sx={{ height: '100%' }}>
      <ComponentBlock title="Role Assignments" sx={{ height: '100%' }}>
        <ZoomAndDrag>
          <Box>
            <Tree
              lineWidth="1.5px"
              nodePadding="4px"
              lineBorderRadius="24px"
              lineColor={theme.vars.palette.divider}
              label={<StandardNode name={roleData.name} count={roleData.count} />}
            >
              {roleData.children?.map((list, index) => (
                <TreeList key={index} depth={1} data={list} nodeItem={StandardNode} />
              ))}
            </Tree>
          </Box>
        </ZoomAndDrag>
      </ComponentBlock>
    </Box>
  );
};

export default RoleAssignments;
