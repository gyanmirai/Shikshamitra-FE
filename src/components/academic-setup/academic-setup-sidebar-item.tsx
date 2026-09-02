import { Box, List } from '@mui/material';

import { AcademicSetupSidebarRow } from './academic-setup-sidebar-row';

import type { AcademicSetupNode } from './academic-setup-model';

type AcademicSetupSidebarItemProps = {
  node: AcademicSetupNode;
  depth: number;
  selectedNodeId?: string;
  expandedNodes: Record<string, boolean>;
  onSelect: (node: AcademicSetupNode) => void;
  onToggleExpand: (nodeId: string) => void;
};

export const AcademicSetupSidebarItem = ({
  node,
  depth,
  selectedNodeId,
  expandedNodes,
  onSelect,
  onToggleExpand,
}: AcademicSetupSidebarItemProps) => {
  const isExpanded = Boolean(expandedNodes[node.id]);
  const children = node.children ?? [];
  const hasChildren = children.length > 0;

  const handleClick = () => {
    onSelect(node);
    if (hasChildren) onToggleExpand(node.id);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        '&::before':
          depth > 0
            ? {
                content: '""',
                position: 'absolute',
                top: 24,
                left: -4,
                width: 8,
                borderTop: '1px solid',
                borderColor: 'divider',
              }
            : undefined,
      }}
    >
      <AcademicSetupSidebarRow
        node={node}
        depth={depth}
        isSelected={selectedNodeId === node.id}
        isExpanded={isExpanded}
        onClick={handleClick}
      />

      {hasChildren && isExpanded ? (
        <List
          component="div"
          role="group"
          aria-label={`${node.name} children`}
          disablePadding
          sx={{
            ml: 1,
            pl: 0.5,
            height: 'auto',
            maxHeight: 'none',
            overflow: 'visible',
            borderLeft: '1px solid',
            borderColor: 'divider',
          }}
        >
          {children.map((child) => (
            <AcademicSetupSidebarItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedNodeId={selectedNodeId}
              expandedNodes={expandedNodes}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </List>
      ) : null}
    </Box>
  );
};
