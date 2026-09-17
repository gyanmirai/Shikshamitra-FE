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
  isStatutorySchemePermission,
  isFinanceConfigurationPermission,
  getNodeRevocationPermissionNames,
  getNodeActionPermissionNamesForAction,
} from './account-settings-permissions';

import type { PermissionType } from './utils';

interface PermissionNodeProps {
  node: any;
  moduleTitle: string;
  submoduleTitle: string;
  permissions: { name: string; isGranted: boolean }[];
  onToggle: (node: any, action: PermissionType, currentValue: boolean) => void;
  onSelectAll: (node: any, value: boolean, hasChildren: boolean) => void;
  depth?: number;
  disabled?: boolean;
  inherited?: Map<string, string[]>;
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
  disabled = false,
  inherited = new Map<string, string[]>(),
}: PermissionNodeProps) {
  const permissionBase = getActionPermissionBase(node.permissionName);
  const isStatutoryScheme = isStatutorySchemePermission(permissionBase);
  const [expanded, setExpanded] = useState(
    !!permissions.find((p) => p.name === node.permissionName)?.isGranted
  );
  const actions = getNodePermissionActions(node.permissionName, permissions);
  const availablePermissionNames = actions.flatMap((action) =>
    getNodeActionPermissionNamesForAction(node.permissionName, action, permissions)
  );
  const incompletePermissions =
    availablePermissionNames.length === 0 ||
    (isAccountSettingPermission(permissionBase) &&
      actions.length < ACCOUNT_SETTING_ACTIONS.length) ||
    (isFinanceConfigurationPermission(permissionBase) && actions.length < 3);
  const children = node.permissionChildren ?? node.children ?? [];
  const hasChildren = children.length > 0;

  // Disabled action placeholders are not grants and must not block Revoke All.
  const isNodeFullySelected =
    availablePermissionNames.length > 0 &&
    availablePermissionNames.every(
      (name) => !!permissions.find((permission) => permission.name === name)?.isGranted
    );
  const revocationNames = isStatutoryScheme ? getNodeRevocationPermissionNames(node, permissions) : [];
  const canRevokeAll = isNodeFullySelected || (isStatutoryScheme &&
    revocationNames.some((name) => permissions.some((permission) => permission.name === name && permission.isGranted)));

  // Expanding a group is presentation state, never a permission write.
  const handleToggleExpand = () => setExpanded(!expanded);

  return (
    <Box sx={{ pl: depth * 3, mb: 1 }}>
      <Card
        data-testid={`permission-${node.title}`}
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
                  onClick={handleToggleExpand}
                >
                  <IconButton size="small" aria-label={`${expanded ? 'Collapse' : 'Expand'} ${node.title}`} aria-expanded={expanded}>
                    <Iconify
                      icon={expanded ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
                      width={16}
                    />
                  </IconButton>
                  <Checkbox checked={expanded} slotProps={{ input: { 'aria-label': `Expand ${node.title}` } }} />
                </Box>
              )}
              <Typography variant="subtitle2" sx={{ fontWeight: isNodeFullySelected ? 700 : 600 }}>
                {node.title}
              </Typography>
              {!hasChildren && incompletePermissions && (
                <Typography variant="caption" color="error">
                  Some permissions are missing from the server. Update the backend permission
                  definitions.
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                gap: 2,
              }}
            >
              {!hasChildren &&
                actions.map((perm) => {
                  const permissionNames = getNodeActionPermissionNamesForAction(
                    node.permissionName,
                    perm,
                    permissions
                  );
                  const isChecked =
                    permissionNames.length > 0 &&
                    permissionNames.every(
                      (permissionName) =>
                        !!permissions.find((p) => p.name === permissionName)?.isGranted
                    );
                  return (
                    <motion.div key={perm} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Box
                        title={isStatutoryScheme && perm === 'Delete' && permissionNames.length === 0
                          ? 'Deletion is not supported for Statutory Schemes.'
                          : undefined}
                        onClick={() =>
                          !disabled && permissionNames.length > 0 && onToggle(node, perm, isChecked)
                        }
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          cursor: permissionNames.length > 0 ? 'pointer' : 'not-allowed',
                          opacity: permissionNames.length > 0 ? 1 : 0.5,
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
                          title={[
                            isStatutoryScheme && perm === 'Edit'
                              ? 'Edit settings, activate the scheme, manage enrollment and approve overrides.' : '',
                            permissionNames.some((name) => inherited.get(name)?.length)
                              ? `Direct grant. Inherited access from ${[...new Set(permissionNames.flatMap((name) => inherited.get(name) ?? []))].join(', ')} remains effective.` : '',
                          ].filter(Boolean).join(' ') || undefined}
                          checked={isChecked}
                          disabled={disabled || permissionNames.length === 0}
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
              disabled={disabled || (!canRevokeAll && availablePermissionNames.length === 0)}
              color={canRevokeAll ? 'error' : 'primary'}
              onClick={() => onSelectAll(node, !canRevokeAll, hasChildren)}
            >
              {canRevokeAll ? 'Revoke All' : 'Grant All'}
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
              {children.map((child: any) => (
                <PermissionNode
                  key={child.title}
                  node={child}
                  disabled={disabled}
                  inherited={inherited}
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
