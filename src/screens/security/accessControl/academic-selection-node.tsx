import { Box } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';

import { AcademicSelectionRow } from './academic-selection-row';

import type { SelectionStatus, AcademicSelectionNode } from './academic-selection-model';

export function AcademicSelectionTreeNode({
  node,
  statuses,
  onToggle,
}: {
  node: AcademicSelectionNode;
  statuses: Map<string, SelectionStatus>;
  onToggle: (node: AcademicSelectionNode) => void;
}) {
  const expanded = useBoolean(true);
  const hasChildren = Boolean(node.children?.length);
  return (
    <Box sx={{ position: 'relative', pl: { xs: 1, sm: 3 } }}>
      {hasChildren && expanded.value && (
        <Box
          sx={{
            position: 'absolute',
            top: 28,
            left: 35,
            bottom: 0,
            width: '1px',
            borderLeft: (theme) => `1px dashed ${theme.palette.divider}`,
            zIndex: 0,
          }}
        />
      )}
      <AcademicSelectionRow
        node={node}
        status={statuses.get(node.id) ?? 'none'}
        expanded={expanded.value}
        onExpand={expanded.onToggle}
        onToggle={onToggle}
      />
      {hasChildren && expanded.value && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {node.children?.map((child) => (
            <AcademicSelectionTreeNode
              key={child.id}
              node={child}
              statuses={statuses}
              onToggle={onToggle}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
