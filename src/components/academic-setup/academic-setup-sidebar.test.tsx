import { useState } from 'react';
import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { AcademicSetupSidebar } from './academic-setup-sidebar';

import type { AcademicSetupNode, AcademicYearRecord } from './academic-setup-model';

vi.mock('src/components/iconify', () => ({
  Iconify: () => <span aria-hidden="true" />,
}));

const year: AcademicYearRecord = { id: 'year-1', name: '2026-2027' };
const makeNode = (
  id: string,
  name: string,
  type: AcademicSetupNode['type'],
  children: AcademicSetupNode[] = []
): AcademicSetupNode => ({ id, name, type, data: year, parentsData: { year }, children });

const tree = [
  makeNode('board-1', 'CBSE', 'Education Board', [
    makeNode('medium-1', 'English', 'Medium', [
      makeNode('stage-1', 'Primary', 'Organization', [
        makeNode('standard-1', 'Standard 1', 'Standard', [makeNode('division-1', 'A', 'Division')]),
      ]),
    ]),
  ]),
];

const SidebarHarness = () => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string>();

  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AcademicSetupSidebar
        nodes={tree}
        selectedNodeId={selected}
        expandedNodes={expanded}
        isLoading={false}
        hasAcademicYear
        onSelect={(node) => setSelected(node.id)}
        onToggleExpand={(id) => setExpanded((current) => ({ ...current, [id]: !current[id] }))}
        onCollapseAll={() => setExpanded({})}
        onAddBoard={() => undefined}
        onCreateYear={() => undefined}
      />
    </ThemeProvider>
  );
};

describe('AcademicSetupSidebar', () => {
  it('expands a complete five-level branch and collapses it from one action', async () => {
    render(<SidebarHarness />);

    const scrollRegion = screen.getByRole('region', { name: 'Academic hierarchy items' });
    expect(scrollRegion).toHaveAttribute('tabindex', '0');
    const scrollTo = vi.fn();
    Object.defineProperties(scrollRegion, {
      clientHeight: { value: 200 },
      scrollHeight: { value: 600 },
      scrollTo: { value: scrollTo },
    });
    fireEvent.keyDown(scrollRegion, { key: 'End' });
    expect(scrollTo).toHaveBeenCalledWith({ top: 600 });

    ['Board CBSE', 'Medium English', 'Stage Primary', 'Standard Standard 1'].forEach((label) => {
      fireEvent.click(screen.getByRole('button', { name: `View ${label}` }));
    });

    expect(screen.getByRole('button', { name: 'View Division A' })).toBeVisible();
    expect(screen.getByText('Level 5 · Division')).toBeVisible();
    expect(screen.getAllByRole('group')).toHaveLength(4);

    fireEvent.click(screen.getByRole('button', { name: 'Collapse' }));
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'View Medium English' })).not.toBeInTheDocument();
    });
  });
});
