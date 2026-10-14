import type { AdmissionPipelineItem } from 'src/redux/student/admissions/admission-pipeline-api';

import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { buildAdmissionPipelineColumns } from './admission-pipeline-columns';

import type { PipelineRowSelection } from './admission-pipeline-columns';

const row = { id: 'app-1', applicantName: 'Kabir Shah', applicationNumber: 'APP-1' };
const selection = (changes: Partial<PipelineRowSelection> = {}): PipelineRowSelection => ({
  selectedIds: [],
  eligibleIds: ['app-1', 'app-2'],
  disabled: false,
  onToggle: vi.fn(),
  onToggleAll: vi.fn(),
  ...changes,
});
const selectionColumn = (state: PipelineRowSelection) =>
  buildAdmissionPipelineColumns((id) => `/application/${id}`, vi.fn(), state)[0];

describe('Pipeline page selection', () => {
  it('does not add selection without the assignment capability', () => {
    const columns = buildAdmissionPipelineColumns((id) => `/application/${id}`);
    expect(columns.some((column) => column.id === 'pipeline-selection')).toBe(false);
  });

  it('selects only eligible current-page rows and marks a partial selection', () => {
    const state = selection({ selectedIds: ['app-1'] });
    const column = selectionColumn(state);
    render(<>{column.renderColumn!(column)}</>);
    const checkbox = screen.getByRole('checkbox', {
      name: 'Select all eligible applications on this page',
    });
    expect(checkbox).toHaveAttribute('data-indeterminate', 'true');
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    fireEvent.click(checkbox);
    expect(state.onToggleAll).toHaveBeenCalledWith(true);
  });

  it('does not open the application when its checkbox is clicked or space is pressed', () => {
    const state = selection();
    const column = selectionColumn(state);
    const onOpen = vi.fn();
    render(
      <div role="row" tabIndex={0} onClick={onOpen} onKeyDown={onOpen}>
        {column.render!('', row)}
      </div>
    );
    const checkbox = screen.getByRole('checkbox', {
      name: 'Select Kabir Shah for counsellor assignment',
    });
    fireEvent.click(checkbox);
    fireEvent.keyDown(checkbox, { key: ' ' });
    expect(state.onToggle).toHaveBeenCalledWith(row as AdmissionPipelineItem, true);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('blocks checkbox changes during refresh or assignment and for ineligible rows', () => {
    const state = selection({ disabled: true });
    const column = selectionColumn(state);
    const rendered = render(<>{column.render!('', row)}</>);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    fireEvent.click(checkbox);
    expect(state.onToggle).not.toHaveBeenCalled();
    const ineligible = selectionColumn(selection({ eligibleIds: [] }));
    rendered.rerender(<>{ineligible.render!('', row)}</>);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('keeps selection out of exports and reserves mobile width for identity and Continue', () => {
    const columns = buildAdmissionPipelineColumns(
      (id) => `/application/${id}`,
      undefined,
      selection()
    );
    expect(columns[0].excludeFromExport).toBe(true);
    expect(columns.find((column) => column.id === 'status')?.stickyOnMobile).toBe(false);
    const actions = columns.find((column) => column.id === 'actions')!;
    render(<>{actions.render!('', row)}</>);
    expect(screen.getByRole('link', { name: 'Continue APP-1' })).toHaveAttribute(
      'href',
      '/application/app-1'
    );
  });
});
