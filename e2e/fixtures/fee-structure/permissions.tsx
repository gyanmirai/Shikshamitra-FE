import type { CataloguePermission } from 'src/screens/security/role/permission-catalogue';

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import financeModule from 'src/constants/finance-menu';
import { Box, Alert, Typography, CssBaseline } from '@mui/material';
import PermissionNode from 'src/screens/security/role/permission-node';
import { defaultSettings } from 'src/components/settings/config-settings';
import { branchPermissions } from 'src/screens/security/role/permission-catalogue';
import {
  setPermissionGrants,
  getChangedPermissionGrants,
} from 'src/screens/security/role/permission-grants';

const findNodes = (nodes: any[]): any[] =>
  nodes.flatMap((node) => [node, ...findNodes(node.children ?? [])]);
const nodes = findNodes(
  Object.values(financeModule).flatMap((groups: any[]) => groups.flatMap((group) => group.items))
).filter((node) =>
  [
    'Fee Structure',
    'Concession Policy',
    'Collection Policy',
    'Refund Policy',
    'Proration Policy',
  ].includes(node.title)
);
const roots = [
  'Finance.Settings.FeeStructure',
  ...['Concession', 'Collection', 'Refund', 'Proration'].map(
    (family) => `Finance.Policies.${family}Policy`
  ),
];
const initial = roots.flatMap((root) =>
  ['View', 'Add', 'Delete'].map((action) => ({ name: `${root}.${action}`, isGranted: true }))
);
const permissionEntry = (
  name: string,
  displayName: string,
  parentName?: string
): CataloguePermission => ({
  name,
  displayName,
  parentName,
  isGranted: false,
  grantedProviders: [],
  allowedProviders: [],
});
const branches = nodes.map((node, index) => ({
  permission: permissionEntry(roots[index], node.title),
  children: ['View', 'Add', 'Delete'].map((action) => ({
    permission: permissionEntry(`${roots[index]}.${action}`, action, roots[index]),
    children: [],
  })),
}));
function Fixture() {
  const [grants, setGrants] = useState(initial);
  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <CssBaseline />
      <Box sx={{ p: 3, bgcolor: 'background.neutral', minHeight: '100vh' }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Synthetic permission fixture. Changes affect this preview only.
        </Alert>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Fee configuration permissions
        </Typography>
        {branches.map((node) => (
          <PermissionNode
            key={node.permission.name}
            node={node}
            provider={{ providerName: 'R', providerKey: 'synthetic' }}
            grants={Object.fromEntries(grants.map((grant) => [grant.name, grant.isGranted]))}
            subtreeEntries={new Map([[node.permission.name, branchPermissions([node])]])}
            onToggle={(name, value) => setGrants((old) => setPermissionGrants(old, [name], value))}
            onBulk={(_, value) =>
              setGrants((old) =>
                setPermissionGrants(
                  old,
                  branchPermissions([node]).map((entry) => entry.name),
                  value
                )
              )
            }
          />
        ))}
        <Typography variant="subtitle2">Changed permission payload</Typography>
        <Box component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(getChangedPermissionGrants(grants, initial), null, 2)}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
