// MUI Components (alphabetical)
/* eslint-disable import/order */ // Disabled due to conflicting auto-sort expectations; functional logic prioritized.

// MUI Material components
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import { GlobalIcons } from 'src/utils/icons';
import React, { useMemo, useState } from 'react';
// Internal utilities/components
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// MUI Icons
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { flattenTree, pruneTreeBySelectedIds } from './academicTreeUtils';

import type { TreeNodeData } from './type';

// Icons (moved to ordered block above)

// ---- Types ----

interface TreeNodeProps {
  node: TreeNodeData;
  level?: number;
  searchTerm: string;
  /** Aggregate set of all selected node IDs */
  selectedNodes: Set<string>;
  /** Determine if the entire subtree (this + descendants) is selected */
  isSubtreeFullySelected: (node: TreeNodeData) => boolean;
  /** Toggle selection of the whole subtree (node + descendants) */
  toggleSubtree: (node: TreeNodeData) => void;
}

const TreeNode = React.memo<TreeNodeProps>(
  ({ node, level = 0, searchTerm, selectedNodes, isSubtreeFullySelected, toggleSubtree }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = !!(node.children && node.children.length > 0);

    // Removed Tailwind color helper functions; styling handled inline via sx.

    const paddingLeft = level * 32;

    const highlightText = (text: string) => {
      if (!searchTerm) return text;
      const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
      return parts.map((part, i) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <span key={i} className="bg-yellow-200">
            {part}
          </span>
        ) : (
          part
        )
      );
    };

    const matchesSearch = !searchTerm || node.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch && !hasChildren) return null;

    // A node is considered fully selected only if all nodes in its subtree are selected.
    const subtreeSelected = isSubtreeFullySelected(node);
    // Indeterminate when some but not all descendants are selected.
    const isIndeterminate =
      hasChildren &&
      !subtreeSelected &&
      (node.children?.some((child) => selectedNodes.has(child.id)) ?? false);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      toggleSubtree(node);
    };

    return (
      <Box sx={{ userSelect: 'none' }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            p: 0.8,
            borderRadius: 1,
            ml: `${paddingLeft}px`,
            alignItems: 'center',
            transition: 'background-color 0.15s',
            cursor: 'default',
            [`&:hover`]: {
              backgroundColor: (theme) => {
                switch (node.type) {
                  case 'boards':
                    return 'rgba(107,33,168,0.08)';
                  case 'mediums':
                    return 'rgba(29,78,216,0.08)';
                  case 'organizations':
                    return 'rgba(16,185,129,0.08)';
                  case 'standards':
                    return 'rgba(245,158,11,0.15)';
                  case 'divisions':
                    return 'rgba(79,70,229,0.08)';
                  default:
                    return 'rgba(107,114,128,0.08)';
                }
              },
            },
          }}
        >
          <IconButton
            size="small"
            aria-label={isExpanded ? 'Collapse node' : 'Expand node'}
            onClick={() => hasChildren && setIsExpanded(!isExpanded)}
            disabled={!hasChildren}
            sx={{ width: 24, height: 24 }}
          >
            {hasChildren &&
              (isExpanded ? (
                <ExpandMoreIcon fontSize="inherit" sx={{ color: 'grey.500' }} />
              ) : (
                <ChevronRightIcon fontSize="inherit" sx={{ color: 'grey.500' }} />
              ))}
          </IconButton>

          <Checkbox
            size="small"
            checked={subtreeSelected}
            indeterminate={isIndeterminate}
            onChange={handleCheckboxChange}
            sx={{ p: 0.5 }}
          />

          <Box
            onClick={() => hasChildren && setIsExpanded(!isExpanded)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flex: 1,
              minWidth: 0,
              cursor: hasChildren ? 'pointer' : 'default',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: (theme) => {
                  switch (node.type) {
                    case 'boards':
                      return '#6D28D9'; // purple-700
                    case 'mediums':
                      return theme.palette.primary.main;
                    case 'organizations':
                      return theme.palette.success.dark;
                    case 'standards':
                      return theme.palette.warning.dark;
                    case 'divisions':
                      return '#4F46E5'; // indigo-600
                    default:
                      return theme.palette.text.primary;
                  }
                },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {highlightText(node.name)}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {node.type}
            </Typography>
          </Box>

          {hasChildren && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {node.children?.length ?? 0}
            </Typography>
          )}
        </Stack>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit={false} appear={false}>
            <Box sx={{ mt: 0.5, position: 'relative' }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: paddingLeft + 12,
                  width: 2,
                  bgcolor: 'grey.300',
                }}
              />
              {node.children?.map((child) => (
                <Box key={child.id} sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      left: paddingLeft + 12,
                      top: 16,
                      width: 16,
                      height: 2,
                      bgcolor: 'grey.300',
                    }}
                  />
                  <TreeNode
                    node={child}
                    level={level + 1}
                    searchTerm={searchTerm}
                    selectedNodes={selectedNodes}
                    isSubtreeFullySelected={isSubtreeFullySelected}
                    toggleSubtree={toggleSubtree}
                  />
                </Box>
              ))}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  }
);

TreeNode.displayName = 'TreeNode';

interface AcademicTreeViewProps {
  /**
   * Callback with selected node IDs (legacy first argument) and optional rich payload (second arg).
   * Note: For backward compatibility we keep the original signature of first param as string[] of IDs.
   */
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
    hierarchicalSelectedTree?: TreeNodeData[]
  ) => void;
  applyLabel?: string;
  /** Disable the Apply button (e.g., while submitting) */
  applying?: boolean;
  onClose?: () => void;
  initialSelectedNodes?: TreeNodeData[];
  academicRules: {
    boards: string[];
    mediums: string[];
    stages: string[];
    classes: string[];
    divisions: string[];
  } | null;
  transformedData?: TreeNodeData[];
}

const AcademicTreeView: React.FC<AcademicTreeViewProps> = ({
  onApply,
  applyLabel = 'Apply',
  applying = false,
  onClose = () => {},
  initialSelectedNodes = [],
  academicRules,
  transformedData: propsTransformedData = [],
}) => {
  // Use props data
  const transformedData = useMemo(() => propsTransformedData, [propsTransformedData]);

  // searchTerm reserved for future filtering UI; currently static
  const [searchTerm] = useState<string>('');
  /**
   * Maintain separate selection maps per node type storing FULL node objects.
   * This enables downstream consumers to have all metadata without re-fetching.
   * Keys are node IDs for O(1) lookup; values are the corresponding TreeNodeData objects.
   */
  const [selectedByType, setSelectedByType] = useState<{
    boards: Map<string, TreeNodeData>;
    mediums: Map<string, TreeNodeData>;
    organizations: Map<string, TreeNodeData>;
    standards: Map<string, TreeNodeData>;
    divisions: Map<string, TreeNodeData>;
  }>({
    boards: new Map(),
    mediums: new Map(),
    organizations: new Map(),
    standards: new Map(),
    divisions: new Map(),
  });

  const typeKeys = ['boards', 'mediums', 'organizations', 'standards', 'divisions'] as const;

  /**
   * Aggregated selected structures
   * - aggregatedSelectedIds: quick lookup for selection state.
   * - aggregatedSelectedNodes: array of node objects for output.
   */
  const { aggregatedSelectedIds, aggregatedSelectedNodes } = useMemo(() => {
    const allNodes: TreeNodeData[] = [];
    const pushValues = (m: Map<string, TreeNodeData>) => m.forEach((v) => allNodes.push(v));
    pushValues(selectedByType.boards);
    pushValues(selectedByType.mediums);
    pushValues(selectedByType.organizations);
    pushValues(selectedByType.standards);
    pushValues(selectedByType.divisions);
    const idSet = new Set(allNodes.map((n) => n.id));
    return { aggregatedSelectedIds: idSet, aggregatedSelectedNodes: allNodes };
  }, [selectedByType]);

  const idToNode = useMemo(() => {
    const map = new Map<string, TreeNodeData>();
    const walk = (nodes: TreeNodeData[]) => {
      nodes.forEach((n) => {
        map.set(n.id, n);
        if (n.children?.length) walk(n.children);
      });
    };
    walk(transformedData);
    return map;
  }, [transformedData]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getAllNodeIds = (nodes: TreeNodeData[]): string[] => {
    let ids: string[] = [];
    nodes.forEach((node) => {
      ids.push(node.id);
      if (node.children) {
        ids = ids.concat(getAllNodeIds(node.children));
      }
    });
    return ids;
  };

  // flattenHierarchy removed as we use flattenTree from utils

  /** Type guard mapping for dynamic extension types (fallback ignored). */
  const ensureKnownType = (t: string): keyof typeof selectedByType | undefined => {
    if (typeKeys.includes(t as any)) return t as keyof typeof selectedByType;
    return undefined; // Unknown types are skipped in typed buckets but still tracked in aggregated
  };

  // Populate initial selection if provided
  React.useEffect(() => {
    if (initialSelectedNodes && initialSelectedNodes.length > 0) {
      // Flatten the hierarchical tree to get all selected nodes
      const allSelectedNodes = flattenTree(initialSelectedNodes);

      const newSelection = {
        boards: new Map<string, TreeNodeData>(),
        mediums: new Map<string, TreeNodeData>(),
        organizations: new Map<string, TreeNodeData>(),
        standards: new Map<string, TreeNodeData>(),
        divisions: new Map<string, TreeNodeData>(),
      };

      allSelectedNodes.forEach((node) => {
        const key = ensureKnownType(node.type);
        if (key) {
          // We prefer the node from transformedData if available to ensure we have complete children
          // structure for future toggles, but fallback to initialized node
          newSelection[key].set(node.id, node);
        }
      });

      setSelectedByType(newSelection);
    } else if (academicRules && transformedData.length > 0) {
      // Map academicRules to selectedByType by finding nodes in transformedData
      const newSelection = {
        boards: new Map<string, TreeNodeData>(),
        mediums: new Map<string, TreeNodeData>(),
        organizations: new Map<string, TreeNodeData>(),
        standards: new Map<string, TreeNodeData>(),
        divisions: new Map<string, TreeNodeData>(),
      };

      academicRules.boards?.forEach((id) => {
        const node = idToNode.get(id);
        if (node) newSelection.boards.set(id, node);
      });
      academicRules.mediums?.forEach((id) => {
        const node = idToNode.get(id);
        if (node) newSelection.mediums.set(id, node);
      });
      academicRules.stages?.forEach((id) => {
        const node = idToNode.get(id);
        if (node) newSelection.organizations.set(id, node);
      });
      academicRules.classes?.forEach((id) => {
        const node = idToNode.get(id);
        if (node) newSelection.standards.set(id, node);
      });
      academicRules.divisions?.forEach((id) => {
        const node = idToNode.get(id);
        if (node) newSelection.divisions.set(id, node);
      });

      setSelectedByType(newSelection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectedNodes, academicRules, transformedData.length, idToNode]); // Added dependencies to handle async data

  const getAllChildIds = (node: TreeNodeData): string[] => {
    let ids: string[] = [node.id];
    if (node.children) {
      node.children.forEach((child) => {
        ids = ids.concat(getAllChildIds(child));
      });
    }
    return ids;
  };

  /** Gather full subtree nodes (including the root node). */
  const collectSubtreeNodes = (node: TreeNodeData): TreeNodeData[] => {
    const acc: TreeNodeData[] = [node];
    if (node.children?.length) {
      node.children.forEach((child) => {
        acc.push(...collectSubtreeNodes(child));
      });
    }
    return acc;
  };

  /** Determine if every node in subtree is selected. */
  const isSubtreeFullySelected = (node: TreeNodeData): boolean => {
    const subtreeIds = getAllChildIds(node); // includes node itself
    return subtreeIds.every((id) => aggregatedSelectedIds.has(id));
  };

  /** Toggle entire subtree selection (add or remove node + descendants) */
  const toggleSubtree = (node: TreeNodeData) => {
    const subtree = collectSubtreeNodes(node);
    const fullySelected = subtree.every((n) => aggregatedSelectedIds.has(n.id));
    // Build a lookup map for parent traversal (using the memoized idToNode)

    // Helper to collect ancestors (excluding root null parent) upward chain
    const collectAncestors = (n: TreeNodeData): TreeNodeData[] => {
      const ancestors: TreeNodeData[] = [];
      let current: TreeNodeData | undefined = n;
      while (current?.parentId) {
        const parent = idToNode.get(current.parentId);
        if (!parent) break;
        ancestors.push(parent);
        current = parent;
      }
      return ancestors;
    };

    setSelectedByType((prev) => {
      const next = {
        boards: new Map(prev.boards),
        mediums: new Map(prev.mediums),
        organizations: new Map(prev.organizations),
        standards: new Map(prev.standards),
        divisions: new Map(prev.divisions),
      };

      if (fullySelected) {
        // Deselect subtree
        subtree.forEach((n) => {
          const key = ensureKnownType(n.type);
          if (key) next[key].delete(n.id);
        });
        // After removal, ensure ancestors without any selected descendants are also removed
        subtree.forEach((n) => {
          collectAncestors(n).forEach((ancestor) => {
            const ancestorDescIds = getAllChildIds(ancestor);
            const anySelectedDesc = ancestorDescIds.some(
              (id) => id !== ancestor.id && aggregatedSelectedIds.has(id)
            );
            const ancestorKey = ensureKnownType(ancestor.type);
            if (ancestorKey && !anySelectedDesc) {
              next[ancestorKey].delete(ancestor.id);
            }
          });
        });
      } else {
        // Select subtree
        subtree.forEach((n) => {
          const key = ensureKnownType(n.type);
          if (key) next[key].set(n.id, n);
        });
        // Select ancestors as well
        collectAncestors(node).forEach((ancestor) => {
          const key = ensureKnownType(ancestor.type);
          if (key) next[key].set(ancestor.id, ancestor);
        });
      }

      return next;
    });
  };

  /**
   * Build a hierarchical tree of ONLY selected nodes, preserving ancestor chain.
   * A node is included if it itself is selected OR it has at least one selected descendant.
   * Children array is pruned recursively.
   */
  const buildSelectedHierarchy = (nodes: TreeNodeData[]): TreeNodeData[] =>
    pruneTreeBySelectedIds(nodes, aggregatedSelectedIds);

  const handleClearAll = () => {
    setSelectedByType({
      boards: new Map(),
      mediums: new Map(),
      organizations: new Map(),
      standards: new Map(),
      divisions: new Map(),
    });
  };

  const handleSelectAll = () => {
    const buckets = {
      boards: new Map<string, TreeNodeData>(),
      mediums: new Map<string, TreeNodeData>(),
      organizations: new Map<string, TreeNodeData>(),
      standards: new Map<string, TreeNodeData>(),
      divisions: new Map<string, TreeNodeData>(),
    };
    const traverse = (nodes: TreeNodeData[]) => {
      nodes.forEach((n) => {
        const key = ensureKnownType(n.type);
        if (key) buckets[key].set(n.id, n);
        if (n.children?.length) traverse(n.children);
      });
    };
    traverse(transformedData);
    setSelectedByType(buckets);
  };

  const handleApply = () => {
    if (onApply) {
      const breakdownIds = {
        boards: Array.from(selectedByType.boards.keys()),
        mediums: Array.from(selectedByType.mediums.keys()),
        organizations: Array.from(selectedByType.organizations.keys()),
        standards: Array.from(selectedByType.standards.keys()),
        divisions: Array.from(selectedByType.divisions.keys()),
      };
      const breakdownNodes = {
        boards: Array.from(selectedByType.boards.values()),
        mediums: Array.from(selectedByType.mediums.values()),
        organizations: Array.from(selectedByType.organizations.values()),
        standards: Array.from(selectedByType.standards.values()),
        divisions: Array.from(selectedByType.divisions.values()),
      };
      const hierarchicalSelectedTree = buildSelectedHierarchy(transformedData);

      onApply(
        Array.from(aggregatedSelectedIds),
        breakdownIds,
        aggregatedSelectedNodes,
        breakdownNodes,
        hierarchicalSelectedTree
      );
    }
    onClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{
          mb: 2,
          bgcolor: (theme) => theme.vars.palette.background.paper,
          p: 2,
          boxShadow: 'var(--shadows-2)',
        }}
      >
        <Box>
          {/* <Typography variant="h5" fontWeight={700} color="text.primary">
                Educational Hierarchy
              </Typography> */}
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Selected:{' '}
            <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {aggregatedSelectedIds.size}
            </Box>{' '}
            {/* nodes */}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" size="small" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button variant="outlined" size="small" onClick={handleClearAll}>
            Clear All
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          p: 2,
          flex: 1,
          overflow: 'auto',
          bgcolor: (theme) => theme.vars.palette.background.paper,
        }}
      >
        {transformedData.length === 0 ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
          >
            <Typography variant="body2" color="text.secondary">
              No academic data available.
            </Typography>
          </Box>
        ) : (
          transformedData.map((node) => (
            <Box key={node.id} sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'grey.300' }}>
              <TreeNode
                node={node}
                searchTerm={searchTerm}
                selectedNodes={aggregatedSelectedIds}
                isSubtreeFullySelected={isSubtreeFullySelected}
                toggleSubtree={toggleSubtree}
              />
            </Box>
          ))
        )}
      </Box>
      {/* Sticky bottom action bar */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          mt: 1.5,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          px: 2,
          py: 1.5,
          boxShadow: '0 -2px 4px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
        }}
      >
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          size="small"
          onClick={onClose}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          size="small"
          disabled={applying}
          onClick={handleApply}
        >
          {applying ? 'Applying...' : applyLabel}
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default React.memo(AcademicTreeView);
