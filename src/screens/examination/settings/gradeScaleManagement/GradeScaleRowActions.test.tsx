import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { loadIcons, _api as iconifyApi } from '@iconify/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table, TableRow, TableBody, TableCell } from '@mui/material';
import { defaultSettings } from 'src/components/settings/config-settings';

import { GradeScaleRowActions } from './GradeScaleRowActions';

import type { IGrade } from './type';

const scale: IGrade = {
  id: 'scale-one',
  name: 'MAIN GRADE SCALE',
  status: 1,
  totalMarks: 100,
  usageCount: 0,
  gradingScale: [],
};

beforeEach(async () => {
  iconifyApi.setFetch((...args) => fetch(...args));
  mswServer.use(
    http.get('https://api.iconify.design/:collection', ({ request, params }) =>
      HttpResponse.json({
        prefix: String(params.collection).replace('.json', ''),
        icons: {},
        not_found: new URL(request.url).searchParams.get('icons')?.split(',') ?? [],
      })
    )
  );
  await new Promise<void>((resolve) => {
    loadIcons(
      [
        'solar:pen-bold',
        'solar:trash-bin-trash-bold',
        'solar:archive-bold',
        'solar:restart-bold',
      ],
      (_loaded, _missing, pending) => {
        if (!pending.length) resolve();
      }
    );
  });
});

function renderActions(overrides = {}) {
  const onRowClick = vi.fn();
  const callbacks = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onArchive: vi.fn(),
    onRestore: vi.fn(),
  };
  const view = render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Table>
        <TableBody>
          <TableRow onClick={onRowClick}>
            <TableCell>
              <GradeScaleRowActions
                scale={scale}
                canAdd
                canDelete
                isArchiveLoading={false}
                isRestoreLoading={false}
                {...callbacks}
                {...overrides}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ThemeProvider>
  );
  return { ...view, callbacks, onRowClick };
}

describe('grade scale row actions', () => {
  it.each([
    ['Edit MAIN GRADE SCALE', 'onEdit', 'button'],
    ['Delete MAIN GRADE SCALE', 'onDelete', 'button'],
    ['Archive', 'onArchive', 'menuitem'],
  ] as const)('routes %s to its handler without selecting the row', (name, handler, role) => {
    const { callbacks, onRowClick } = renderActions();
    if (role === 'menuitem') {
      fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    }
    fireEvent.click(screen.getByRole(role, { name }));
    expect(callbacks[handler]).toHaveBeenCalledOnce();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('shows edit and delete directly with archive in the more-actions menu', () => {
    renderActions();
    expect(screen.getAllByRole('button')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument();
  });

  it('offers restore for archived scales', () => {
    const { callbacks } = renderActions({ scale: { ...scale, status: 'Archived' } });
    expect(screen.getAllByRole('button')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Restore grade scale MAIN GRADE SCALE' }));
    expect(callbacks.onRestore).toHaveBeenCalledOnce();
  });

  it('preserves permission restrictions', () => {
    renderActions({ canAdd: false, canDelete: false });
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Archive' })).toBeDisabled();
  });

  it('prevents deleting a scale used by exams', () => {
    const { callbacks } = renderActions({ scale: { ...scale, usageCount: 2 } });
    const button = screen.getByRole('button', { name: 'Delete MAIN GRADE SCALE' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(callbacks.onDelete).not.toHaveBeenCalled();
  });
});
