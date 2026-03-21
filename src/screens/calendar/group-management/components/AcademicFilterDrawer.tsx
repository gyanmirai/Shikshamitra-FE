import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Drawer, Divider, IconButton, Typography } from '@mui/material';

import AcademicTreeView from './AcademicTreeView';

import type { TreeNodeData } from './type';

export interface AcademicFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApply?: (
    selectedIds: string[],
    breakdown?: {
      boards: string[];
      mediums: string[];
      organizations: string[];
      standards: string[];
      divisions: string[];
    },
    /** Full list of selected nodes (flattened, unique) */
    selectedNodes?: TreeNodeData[],
    /** Full breakdown with node objects instead of just IDs */
    breakdownNodes?: {
      boards: TreeNodeData[];
      mediums: TreeNodeData[];
      organizations: TreeNodeData[];
      standards: TreeNodeData[];
      divisions: TreeNodeData[];
    },
    /**
     * Hierarchical selected data preserving parent->child structure, pruned to only selected nodes.
     * Shape mirrors initial data array (root level boards) but only includes nodes that are selected.
     */
    hierarchicalSelectedTree?: TreeNodeData[],
    currentFilterName?: string
  ) => void;
  currentFilterName?: string;
  initialSelectedNodes?: TreeNodeData[];
  academicRules: {
    boards: string[];
    mediums: string[];
    stages: string[];
    classes: string[];
    divisions: string[];
  } | null;
  fullAcademicTree?: TreeNodeData[];
}

// Drawer that covers 40% of viewport width
// Uses Scrollbar for internal scrolling content
const AcademicFilterDrawer: React.FC<AcademicFilterDrawerProps> = ({
  open,
  onClose,
  onApply,
  currentFilterName = '',
  initialSelectedNodes = [],
  academicRules,
  fullAcademicTree = [],
}) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        width: { xs: '100%', sm: '80vw' },
        maxWidth: 640,
        display: 'flex',
        flexDirection: 'column',
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
      <Typography variant="h6" flexGrow={1}>
        Academic Filters
      </Typography>
      <IconButton onClick={onClose} aria-label="close-academic-filters" size="small">
        <Iconify icon="carbon:close" />
      </IconButton>
    </Box>
    <Divider />
    <Scrollbar
      sx={{
        px: 2,
        py: 2,
        flexGrow: 1,
        '& .simplebar-content': {
          height: '100%',
        },
      }}
    >
      <AcademicTreeView
        onClose={onClose}
        onApply={(...rest) => onApply?.(...rest, currentFilterName)}
        initialSelectedNodes={initialSelectedNodes}
        academicRules={academicRules}
        transformedData={fullAcademicTree}
      />
    </Scrollbar>
  </Drawer>
);

export default AcademicFilterDrawer;
