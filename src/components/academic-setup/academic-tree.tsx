import React, { useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Box, List, Button, ListItem, Collapse, IconButton, Typography } from '@mui/material';

import { Iconify } from '../iconify';

// Type definitions for the tree structure
export type NodeType = 'year' | 'board' | 'medium' | 'stage' | 'standard' | 'division';

export interface TreeNodeData {
  id: string;
  label: string;
  type: NodeType;
  children?: TreeNodeData[];
  data: any; // The original data object
  isCompleted?: boolean; // For status icon
}

interface AcademicTreeProps {
  data: TreeNodeData[];
  selectedNodeId?: string;
  onNodeSelect: (node: TreeNodeData) => void;
  onAddChild: (node: TreeNodeData) => void;
  onEditNode: (node: TreeNodeData) => void;
  onDeleteNode: (node: TreeNodeData) => void;
}

export const AcademicTree: React.FC<AcademicTreeProps> = ({
  data,
  selectedNodeId,
  onNodeSelect,
  onAddChild,
  onEditNode,
  onDeleteNode,
}) => (
  <List component="nav" sx={{ p: 0 }}>
    {data.map((node) => (
      <TreeNode
        key={node.id}
        node={node}
        selectedNodeId={selectedNodeId}
        onNodeSelect={onNodeSelect}
        onAddChild={onAddChild}
        onEditNode={onEditNode}
        onDeleteNode={onDeleteNode}
        depth={0}
      />
    ))}
  </List>
);

interface TreeNodeProps {
  node: TreeNodeData;
  selectedNodeId?: string;
  onNodeSelect: (node: TreeNodeData) => void;
  onAddChild: (node: TreeNodeData) => void;
  onEditNode: (node: TreeNodeData) => void;
  onDeleteNode: (node: TreeNodeData) => void;
  depth: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  selectedNodeId,
  onNodeSelect,
  onAddChild,
  onEditNode,
  onDeleteNode,
  depth,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(true); // Default open for better visibility
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isSelected = selectedNodeId === node.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };

  const handleSelect = () => {
    onNodeSelect(node);
  };

  const handleMenuOpen = (event: React.MouseEvent) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const hasChildren = node.children && node.children.length > 0;
  // Increase indentation for better hierarchy visualization
  const paddingLeft = depth * 20 + 12;

  // Icon Mapping for distinct levels
  const getNodeIcon = () => {
    switch (node.type) {
      case 'year':
        return { icon: 'solar:calendar-bold-duotone', color: 'primary' };
      case 'board':
        return { icon: 'solar:city-bold-duotone', color: 'info' };
      case 'medium': // using global/earth icon for medium (language)
        return { icon: 'solar:global-bold-duotone', color: 'success' };
      case 'stage': // Organization/Subject layer
        return { icon: 'solar:book-bookmark-bold-duotone', color: 'secondary' };
      case 'standard': // Class
        return { icon: 'solar:mortarboard-bold-duotone', color: 'warning' };
      case 'division':
        return { icon: 'solar:widget-bold-duotone', color: 'error' };
      default:
        return { icon: 'solar:folder-bold-duotone', color: 'text.secondary' };
    }
  };

  const { icon, color } = getNodeIcon();

  return (
    <>
      <ListItem
        component={Button}
        onClick={handleSelect}
        sx={{
          pl: `${paddingLeft}px`,
          pr: 1,
          py: 0.8,
          mb: 0.5,
          mx: 1,
          width: 'auto',
          justifyContent: 'flex-start',
          borderRadius: 2,
          border: '1px solid transparent',
          backgroundColor: isSelected
            ? varAlpha(theme.palette.primary.mainChannel, 0.08)
            : 'transparent',
          color: isSelected ? 'primary.main' : 'text.primary',
          '&:hover': {
            backgroundColor: varAlpha(theme.palette.primary.mainChannel, 0.06),
            borderColor: varAlpha(theme.palette.primary.mainChannel, 0.2),
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {/* Toggle Arrow */}
        <Box
          onClick={handleToggle}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            mr: 0.5,
            width: 20,
            height: 20,
            borderRadius: '50%',
            '&:hover': { bg: 'action.hover' },
            visibility: hasChildren ? 'visible' : 'hidden',
          }}
        >
          <Iconify
            icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
            width={16}
            color="text.secondary"
          />
        </Box>

        {/* Node Icon */}
        <Box
          sx={{
            mr: 1.5,
            display: 'flex',
            alignItems: 'center',
            color: isSelected ? 'primary.main' : `${color}.main`,
          }}
        >
          <Iconify icon={icon} width={22} />
        </Box>

        {/* Node Label */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant={isSelected ? 'subtitle2' : 'body2'}
            noWrap
            sx={{
              fontWeight: isSelected ? 700 : 500,
              fontSize: '0.9rem',
              color: isSelected ? 'text.primary' : 'text.secondary',
            }}
          >
            {node.label}
          </Typography>
        </Box>

        {/* Active/Status Chip or Indicator */}
        {node.type !== 'division' && (
          <Box sx={{ ml: 1 }}>
            {/* If we want to show active status or count */}
            {/* For now, just a simplified status dot if active/completed */}
            {node.isCompleted ? (
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
            ) : (
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'divider' }} />
            )}
          </Box>
        )}

        {/* Actions Button */}
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          sx={{
            ml: 1,
            opacity: 0,
            transition: '0.2s',
            '.MuiListItem-root:hover &': { opacity: 1 },
          }}
        >
          <Iconify icon="eva:more-vertical-fill" width={16} />
        </IconButton>
      </ListItem>

      {/* Recursive Children */}
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedNodeId={selectedNodeId}
              onNodeSelect={onNodeSelect}
              onAddChild={onAddChild}
              onEditNode={onEditNode}
              onDeleteNode={onDeleteNode}
              depth={depth + 1}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
};
