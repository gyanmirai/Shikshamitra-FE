import type { IColumn, IColumnFilterAnchor } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Stack } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { ColumnFilterMenu } from 'src/components/customizabaleTable/components/ColumnFilterMenu';

const columns: IColumn[] = [
  { id: 'leaveDays', label: 'Leave days', filterType: 'number' },
  { id: 'amount', label: 'Amount', filterType: 'number', valueType: 'money' },
  { id: 'count', label: 'Count', filterType: 'number', filterStep: 1 },
];

function Fixture() {
  const [anchor, setAnchor] = useState<IColumnFilterAnchor | null>(null);
  const [applied, setApplied] = useState<unknown>(null);
  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <main>
        <h1>Synthetic numeric filters</h1>
        <p>Isolated shared-component fixture. No authentication or backend requests.</p>
        <Stack direction="row" spacing={1}>
          {columns.map((column) => (
            <Button
              key={column.id}
              onClick={(event) => setAnchor({ element: event.currentTarget, column })}
            >
              Filter {column.label}
            </Button>
          ))}
        </Stack>
        <ColumnFilterMenu
          anchorEl={anchor}
          onClose={() => setAnchor(null)}
          onApplyFilter={(column, operator, value) => setApplied({ column, operator, value })}
        />
        <output data-testid="applied">{applied ? JSON.stringify(applied) : 'Not applied'}</output>
      </main>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(<Fixture />);
