import type { ComponentProps } from 'react';

import { vi, it, expect, describe } from 'vitest';
import { Table } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen, fireEvent } from '@testing-library/react';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { TableBody } from './TableBody';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const theme = createTheme(defaultSettings);
const record = { id: 'record-one', name: 'Quarterly term' };

function renderBody(overrides: Partial<ComponentProps<typeof TableBody>> = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <Table>
        <TableBody
          isLoading={false}
          data={[record]}
          columns={[{ id: 'name', label: 'Name' }]}
          columnVisibility={{ name: true, controls: true, actions: true }}
          getStickyStyle={() => ({})}
          dense
          onRowClick={vi.fn()}
          rowProps={() => ({})}
          expandedRows={{}}
          onExpandRow={vi.fn()}
          tableRef={600}
          {...overrides}
        />
      </Table>
    </ThemeProvider>
  );
}

describe('table record row actions', () => {
  it('opens the record by mouse, Enter and Space, with a focusable return target', () => {
    const open = vi.fn();
    renderBody({ getRowAction: (row) => ({ label: `Open ${row.name}`, onClick: open }) });
    const row = screen.getByRole('row', { name: 'Open Quarterly term' });

    expect(row).toHaveAttribute('tabindex', '0');
    fireEvent.click(screen.getByText(record.name));
    expect(row).toHaveFocus();
    fireEvent.keyDown(row, { key: 'Enter' });
    fireEvent.keyDown(row, { key: ' ' });
    expect(open).toHaveBeenCalledTimes(3);
  });

  it('does not open rows without access or with a disabled record action', () => {
    const open = vi.fn();
    const legacyClick = vi.fn();
    renderBody({
      data: [record, { id: 'record-two', name: 'Unavailable term' }],
      getRowAction: (row) =>
        row.id === record.id
          ? undefined
          : { label: 'Unavailable term', onClick: open, disabled: true },
      onRowClick: legacyClick,
    });
    screen.getAllByRole('row').forEach((row) => {
      expect(row).toHaveAttribute('tabindex', '-1');
      fireEvent.click(row);
      fireEvent.keyDown(row, { key: 'Enter' });
    });
    expect(open).not.toHaveBeenCalled();
    expect(legacyClick).not.toHaveBeenCalled();
  });

  it('keeps inline buttons, links and selection checkboxes independent of opening the record', () => {
    const open = vi.fn();
    const edit = vi.fn();
    const select = vi.fn();
    renderBody({
      getRowAction: () => ({ label: 'Open record', onClick: open }),
      columns: [
        { id: 'name', label: 'Name' },
        {
          id: 'controls',
          label: 'Controls',
          render: () => (
            <>
              <button type="button" onClick={edit}>
                Edit record
              </button>
              <input type="checkbox" aria-label="Select record" onChange={select} />
              <a href="#evidence">Evidence</a>
            </>
          ),
        },
      ],
    });
    fireEvent.click(screen.getByRole('button', { name: 'Edit record' }));
    fireEvent.keyDown(screen.getByRole('button', { name: 'Edit record' }), { key: 'Enter' });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select record' }));
    fireEvent.click(screen.getByRole('link', { name: 'Evidence' }));
    expect(edit).toHaveBeenCalledOnce();
    expect(select).toHaveBeenCalledOnce();
    expect(open).not.toHaveBeenCalled();
  });

  it('keeps three remaining actions outside overflow without opening the row from any action', async () => {
    const open = vi.fn();
    const actions = ['Edit', 'Copy', 'History', 'Archive'].map((label) => ({
      id: label.toLowerCase(),
      label,
      icon: 'mdi:circle',
      onClick: vi.fn(),
    }));
    renderBody({
      getRowAction: () => ({ label: 'Open record', onClick: open }),
      columns: [
        { id: 'name', label: 'Name' },
        {
          id: 'actions',
          label: 'Actions',
          render: () => <AdaptiveThreeDotsActions actions={actions} directActionLimit={3} />,
        },
      ],
    });
    expect(screen.queryByRole('button', { name: /^View/ })).not.toBeInTheDocument();
    actions.slice(0, 3).forEach((action) => {
      fireEvent.click(screen.getByRole('button', { name: action.label }));
      expect(action.onClick).toHaveBeenCalledOnce();
    });
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    expect(await screen.findAllByRole('menuitem')).toHaveLength(1);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Archive' }));
    expect(actions[3].onClick).toHaveBeenCalledOnce();
    expect(open).not.toHaveBeenCalled();
  });
});
