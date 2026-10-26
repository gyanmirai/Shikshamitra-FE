import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Chip, Button, Stack, TableRow, TableCell, CssBaseline } from '@mui/material';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { SectionTable } from 'src/screens/hr/policies/components/HRPolicySharedUI';
import { EditableGrids } from './editable-grids';
import { ServerTable } from './server-table';

function ThemeSwitch() {
  const { mode, setMode } = useColorScheme();
  return <Button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>Toggle theme</Button>;
}

function Fixture() {
  const [state, setState] = useState('populated');
  return (
    <ThemeProvider theme={createTheme(defaultSettings)} defaultMode="light">
      <CssBaseline />
      <Box
        component="main"
        sx={{
          height: '100dvh',
          boxSizing: 'border-box',
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <h1 style={{ fontSize: 18 }}>Synthetic HR policy preview</h1>
        <p>Synthetic staff only. Local fixture endpoints and shared policy tables.</p>
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
          {['populated', 'loading', 'empty', 'error', 'server'].map((value) => (
            <Button key={value} onClick={() => setState(value)}>
              {value}
            </Button>
          ))}
          <ThemeSwitch />
          <EditableGrids />
        </Stack>
        {state === 'server' ? (
          <ServerTable />
        ) : (
          <SectionTable
            tableId="synthetic-policy-preview"
            tableTitle="Synthetic policy preview"
            columns={['Staff', 'Priority', 'Actions']}
            columnDefinitions={[{}, { filterType: 'number' }, {}]}
            isPagination
            isSearch
            isLoading={state === 'loading'}
            errorContent={
              state === 'error' ? (
                <div role="alert">
                  Policy preview could not be loaded.
                  <Button onClick={() => setState('populated')}>Retry</Button>
                </div>
              ) : undefined
            }
            noDataText="No policy preview records."
            wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
          >
            {state === 'empty'
              ? null
              : [
                  { name: 'Zulu synthetic', priority: 10 },
                  { name: 'Alpha synthetic', priority: 2 },
                  { name: 'Beta synthetic', priority: 0.5 },
                ].map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>
                      <Chip label={row.name} />
                    </TableCell>
                    <TableCell>{row.priority}</TableCell>
                    <TableCell>
                      <Button>View {row.name}</Button>
                    </TableCell>
                  </TableRow>
                ))}
          </SectionTable>
        )}
      </Box>
    </ThemeProvider>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
