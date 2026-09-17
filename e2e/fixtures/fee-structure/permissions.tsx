import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import financeModule from 'src/constants/finance-menu';
import { Box, Alert, Typography, CssBaseline } from '@mui/material';
import PermissionNode from 'src/screens/security/role/permission-node';
import { defaultSettings } from 'src/components/settings/config-settings';
import {
  setPermissionGrants,
  getChangedPermissionGrants,
} from 'src/screens/security/role/permission-grants';
import {
  getNodeActionPermissionNames,
  getAffectedNodePermissionNames,
} from 'src/screens/security/role/account-settings-permissions';

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
        {nodes.map((node) => (
          <PermissionNode
            key={node.title}
            node={node}
            moduleTitle="Finance"
            submoduleTitle="Configuration"
            permissions={grants}
            setPermission={setGrants}
            onToggle={(selected, action, current) =>
              setGrants((old) =>
                setPermissionGrants(
                  old,
                  [...getAffectedNodePermissionNames(selected, action, !current, old)],
                  !current
                )
              )
            }
            onSelectAll={(selected, value) =>
              setGrants((old) =>
                setPermissionGrants(old, getNodeActionPermissionNames(selected, old), value)
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
