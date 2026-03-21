import type { TreeNodeData } from './type';

/**
 * Prunes a tree hierarchical structure to only include nodes whose IDs are in the selectedIds set,
 * or nodes that have at least one descendant in the selectedIds set.
 */
export const pruneTreeBySelectedIds = (
  nodes: TreeNodeData[],
  selectedIds: Set<string>
): TreeNodeData[] => {
  const prune = (node: TreeNodeData): TreeNodeData | null => {
    const children = node.children?.map(prune).filter(Boolean) as TreeNodeData[] | undefined;
    const isSelected = selectedIds.has(node.id);
    if (isSelected || (children && children.length)) {
      return { ...node, children };
    }
    return null;
  };

  return nodes.map(prune).filter(Boolean) as TreeNodeData[];
};

/**
 * Recursively flattens a hierarchical tree structure into a flat array of nodes.
 */
export const flattenTree = (nodes: TreeNodeData[]): TreeNodeData[] => {
  let flat: TreeNodeData[] = [];
  nodes.forEach((node) => {
    flat.push(node);
    if (node.children) {
      flat = flat.concat(flattenTree(node.children));
    }
  });
  return flat;
};

/**
 * Extracts a flat Set of all unique IDs from an academic rules object.
 */
export const extractAllRuleIds = (rules: any): Set<string> => {
  const ids = new Set<string>();
  if (!rules) return ids;

  ['boards', 'mediums', 'stages', 'classes', 'divisions'].forEach((key) => {
    if (Array.isArray(rules[key])) {
      rules[key].forEach((id: string) => ids.add(id));
    }
  });

  return ids;
};
