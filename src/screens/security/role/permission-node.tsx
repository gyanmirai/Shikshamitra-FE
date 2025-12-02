import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { motion, AnimatePresence } from 'framer-motion';

import { getNodeKey, PERMISSIONS } from './utils';

import type { PermissionType, PermissionsMap } from './utils';

interface PermissionNodeProps {
  node: any;
  moduleTitle: string;
  submoduleTitle: string;
  permissions: PermissionsMap;
  onToggle: (key: string, type: PermissionType) => void;
  onSelectAll: (node: any, value: boolean) => void;
  depth?: number;
}

export default function PermissionNode({
  node,
  moduleTitle,
  submoduleTitle,
  permissions,
  onToggle,
  onSelectAll,
  depth = 0,
}: PermissionNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const nodeKey = getNodeKey(moduleTitle, submoduleTitle, node.title);
  const nodePerms = permissions[nodeKey] || { View: false, 'Add/Edit': false, Delete: false };
  const hasChildren = node.children && node.children.length > 0;

  // Check if all permissions for this node are active
  const isNodeFullySelected = Object.values(nodePerms).every(Boolean);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Box sx={{ pl: depth * 3, mb: 1 }}>
      <Card
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 1.5,
          borderColor: isNodeFullySelected ? 'primary.main' : 'divider',
          bgcolor: isNodeFullySelected
            ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04)
            : 'background.paper',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: (theme) => theme.customShadows.z1,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasChildren && (
              <IconButton size="small" onClick={handleToggleExpand}>
                <Iconify
                  icon={expanded ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
                  width={16}
                />
              </IconButton>
            )}
            <Typography variant="subtitle2" sx={{ fontWeight: isNodeFullySelected ? 700 : 600 }}>
              {node.title}
            </Typography>
          </Box>
          <Button
            size="small"
            color={isNodeFullySelected ? 'error' : 'primary'}
            onClick={() => onSelectAll(node, !isNodeFullySelected)}
          >
            {isNodeFullySelected ? 'Unselect All' : 'Select All'}
          </Button>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          {PERMISSIONS.map((perm) => {
            const isChecked = !!nodePerms[perm];
            return (
              <motion.div key={perm} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Box
                  onClick={() => onToggle(nodeKey, perm)}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isChecked ? 'primary.main' : 'divider',
                    bgcolor: isChecked
                      ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08)
                      : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: isChecked ? 600 : 400,
                      color: isChecked ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {perm}
                  </Typography>
                  <Switch size="small" checked={isChecked} inputProps={{ 'aria-label': perm }} />
                </Box>
              </motion.div>
            );
          })}
        </Box>
      </Card>

      <AnimatePresence>
        {hasChildren && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ mt: 1, position: 'relative' }}>
              {/* Connector Line */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  bottom: 20,
                  left: depth * 3 + 12, // Adjust based on padding
                  width: 2,
                  bgcolor: 'divider',
                  zIndex: 0,
                }}
              />
              {node.children.map((child: any) => (
                <PermissionNode
                  key={child.title}
                  node={child}
                  moduleTitle={moduleTitle}
                  submoduleTitle={submoduleTitle}
                  permissions={permissions}
                  onToggle={onToggle}
                  onSelectAll={onSelectAll}
                  depth={depth + 1}
                />
              ))}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
