// @ts-nocheck
import dynamic from 'next/dynamic';
import React, { cloneElement } from 'react';

import { Box, useTheme } from '@mui/material';

import { flattenArray } from 'src/utils/helper';

import { navData } from 'src/layouts/config-nav-dashboard';

import ZoomAndDrag from 'src/components/zoom-drag';
import { ComponentBlock } from 'src/components/component-block';

import ModuleNode from './module-node';

import type { OrgChartSubListProps } from './page';

const Tree = dynamic(() => import('react-organizational-chart').then((mod) => mod.Tree), {
  ssr: false,
});

const TreeNode = dynamic(() => import('react-organizational-chart').then((mod) => mod.TreeNode), {
  ssr: false,
});

// navData
const Modules = () => {
  const theme = useTheme();

  const data = navData.flatMap((list) => list.items);
  console.log('🚀 ~ file: modules.tsx:26 ~ Modules ~ data:', data);

  return (
    <Box sx={{ height: '100%', p: 2 }}>
      <ComponentBlock title="Role Assignments" sx={{ height: '100%' }}>
        <ZoomAndDrag>
          <Box
            sx={{
              display: 'flex',
              justifyContent: ' flex-start',
              flexDirection: 'column',
              transform: 'rotate(90deg)',
              '& > *': {
                transform: 'rotate(-90deg)',
              },
            }}
          >
            <Tree
              lineWidth="1.5px"
              nodePadding="4px"
              lineBorderRadius="24px"
              lineColor={theme.vars.palette.divider}
              label={<></>}
            >
              {data.map((list, index) => (
                <TreeList key={index} depth={1} data={list} nodeItem={ModuleNode} />
              ))}
            </Tree>
          </Box>
        </ZoomAndDrag>
      </ComponentBlock>
    </Box>
  );
};

export default Modules;

export type OrgChartListProps<T> = {
  data: any;
  depth: number;
  nodeItem: (props: T) => React.ReactElement;
};

export function TreeList<T>({ data, depth, nodeItem }: OrgChartListProps<T>) {
  const childs = (data as any)?.submodule || data?.children || data?.items || [];

  const cloneNode = (props: T) => cloneElement(nodeItem(props));

  const totalChildren = childs ? flattenArray(childs)?.length : 0;

  const label = cloneNode({ ...data, depth, totalChildren } as T);

  return (
    <TreeNode label={label}>
      {childs && <TreeSubList data={childs} depth={depth} nodeItem={nodeItem} />}
    </TreeNode>
  );
}

function TreeSubList<T>({ data, depth, nodeItem }: OrgChartSubListProps<T>) {
  return (
    <>
      {data.map((list: any, index: number) => (
        <TreeList key={index} data={list} depth={depth + 1} nodeItem={nodeItem} />
      ))}
    </>
  );
}
