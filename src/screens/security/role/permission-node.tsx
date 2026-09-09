import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { Checkbox, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import {
  ACCOUNT_SETTING_ACTIONS,
  getActionPermissionBase,
  getNodePermissionActions,
  isAccountSettingPermission,
} from './account-settings-permissions';

import type { PermissionType } from './utils';

interface PermissionNodeProps {
  node: any;
  moduleTitle: string;
  submoduleTitle: string;
  permissions: { name: string; isGranted: boolean }[];
  onToggle: (key: string, type: PermissionType, currentValue: boolean) => void;
  onSelectAll: (node: any, value: boolean, hasChildren: boolean) => void;
  depth?: number;
  setPermission: (data: any) => void;
}

export default function PermissionNode({
  node,
  moduleTitle,
  submoduleTitle,
  permissions,
  onToggle,
  onSelectAll,
  depth = 0,
  setPermission,
}: PermissionNodeProps) {
  const [expanded, setExpanded] = useState(
    !!permissions.find((p) => p.name === node.permissionName)?.isGranted
  );
  const nodeKey = getActionPermissionBase(node.permissionName);
  const actions = getNodePermissionActions(node.permissionName, permissions);
  const incompleteAccountPermissions =
    isAccountSettingPermission(node.permissionName) &&
    actions.length < ACCOUNT_SETTING_ACTIONS.length;
  const hasChildren = node.children && node.children.length > 0;

  // Check if all permissions for this node are active
  const isNodeFullySelected =
    actions.length > 0 &&
    actions.every((perm) => !!permissions.find((p) => p.name === `${nodeKey}.${perm}`)?.isGranted);

  const handleToggleExpand = (n: any) => {
    setPermission(
      permissions.map((per) =>
        per.name === n.permissionName ? { ...per, isGranted: !expanded } : per
      )
    );
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
            // mb: 2,
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexGrow: 1,
                // justifyContent: 'space-between',
              }}
            >
              {hasChildren && (
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                  onClick={() => handleToggleExpand(node)}
                >
                  <IconButton size="small">
                    <Iconify
                      icon={expanded ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
                      width={16}
                    />
                  </IconButton>
                  <Checkbox checked={expanded} />
                </Box>
              )}
              <Typography variant="subtitle2" sx={{ fontWeight: isNodeFullySelected ? 700 : 600 }}>
                {node.title}
              </Typography>
              {incompleteAccountPermissions && (
                <Typography variant="caption" color="error">
                  Some permissions are missing from the server. Update the backend permission
                  definitions.
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.max(actions.length, 1)}, 1fr)`,
                gap: 2,
              }}
            >
              {!hasChildren &&
                actions.map((perm) => {
                  const isChecked = !!permissions.find((p) => p.name === `${nodeKey}.${perm}`)
                    ?.isGranted;
                  return (
                    <motion.div key={perm} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Box
                        onClick={() => onToggle(nodeKey, perm, isChecked)}
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
                          {perm === 'ChangeStatus' ? 'Change Status' : perm}
                        </Typography>
                        <Switch
                          size="small"
                          checked={isChecked}
                          slotProps={{ input: { 'aria-label': perm } }}
                        />
                      </Box>
                    </motion.div>
                  );
                })}
            </Box>
          </Box>
          {!hasChildren && (
            <Button
              size="small"
              disabled={actions.length === 0}
              color={isNodeFullySelected ? 'error' : 'primary'}
              onClick={() => onSelectAll(node, !isNodeFullySelected, hasChildren)}
            >
              {isNodeFullySelected ? 'Revoke All' : 'Grant All'}
            </Button>
          )}
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
                  setPermission={setPermission}
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
