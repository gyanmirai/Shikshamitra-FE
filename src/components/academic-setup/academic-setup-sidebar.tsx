import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { Box, List, Paper, Button, Skeleton } from '@mui/material';

import { handleHierarchyScrollKeyDown } from './academic-setup-scroll';
import { AcademicSetupSidebarItem } from './academic-setup-sidebar-item';
import { AcademicSetupSidebarHeader } from './academic-setup-sidebar-header';

import type { AcademicSetupNode } from './academic-setup-model';

type AcademicSetupSidebarProps = {
  nodes: AcademicSetupNode[];
  selectedNodeId?: string;
  expandedNodes: Record<string, boolean>;
  isLoading: boolean;
  hasAcademicYear: boolean;
  onSelect: (node: AcademicSetupNode) => void;
  onToggleExpand: (nodeId: string) => void;
  onCollapseAll: () => void;
  onAddBoard: () => void;
  onCreateYear: () => void;
};

export const AcademicSetupSidebar = ({
  nodes,
  selectedNodeId,
  expandedNodes,
  isLoading,
  hasAcademicYear,
  onSelect,
  onToggleExpand,
  onCollapseAll,
  onAddBoard,
  onCreateYear,
}: AcademicSetupSidebarProps) => (
  <Paper
    component="aside"
    aria-label="Academic hierarchy explorer"
    variant="outlined"
    sx={{
      height: { xs: 'auto', md: '100%' },
      minHeight: 0,
      borderRadius: 2,
      bgcolor: 'background.paper',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}
  >
    <Box
      role="region"
      aria-label="Academic hierarchy items"
      tabIndex={0}
      data-testid="academic-hierarchy-scroll-region"
      onKeyDown={handleHierarchyScrollKeyDown}
      sx={{
        flex: { xs: '0 0 auto', md: '1 1 0' },
        height: { xs: 440, md: 'auto' },
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
        WebkitOverflowScrolling: 'touch',
        scrollbarGutter: 'stable',
        scrollbarWidth: 'thin',
        scrollbarColor: (theme) => `${theme.palette.action.disabled} transparent`,
        '&::-webkit-scrollbar': { width: 8 },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: 'action.disabled',
          borderRadius: 1,
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: -2,
        },
      }}
    >
      <AcademicSetupSidebarHeader
        hasExpandedNodes={Object.values(expandedNodes).some(Boolean)}
        onCollapseAll={onCollapseAll}
      />

      {isLoading ? (
        <Box sx={{ px: 1.5, py: 1 }}>
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} height={52} sx={{ mb: 0.5 }} />
          ))}
        </Box>
      ) : nodes.length > 0 ? (
        <List
          component="nav"
          aria-label="Academic hierarchy"
          disablePadding
          sx={{ py: 1, height: 'auto', maxHeight: 'none', overflow: 'visible' }}
        >
          {nodes.map((node) => (
            <AcademicSetupSidebarItem
              key={node.id}
              node={node}
              depth={0}
              selectedNodeId={selectedNodeId}
              expandedNodes={expandedNodes}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </List>
      ) : (
        <EmptyContent
          title={hasAcademicYear ? 'No boards yet' : 'No academic year yet'}
          description={
            hasAcademicYear
              ? 'Add the first education board to begin building this hierarchy.'
              : 'Create an academic year before adding boards and classes.'
          }
          action={
            <Button
              type="button"
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" aria-hidden />}
              onClick={hasAcademicYear ? onAddBoard : onCreateYear}
              sx={{ mt: 2, minHeight: 36 }}
            >
              {hasAcademicYear ? 'Add first board' : 'Create academic year'}
            </Button>
          }
        />
      )}
    </Box>
  </Paper>
);
