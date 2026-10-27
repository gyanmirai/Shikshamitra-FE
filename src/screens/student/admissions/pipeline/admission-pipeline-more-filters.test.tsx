import type { ComponentProps } from 'react';

import { addIcon } from '@iconify/react';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AdmissionPipelineMoreFilters } from './admission-pipeline-more-filters';

const notices = vi.hoisted(() => ({ error: vi.fn(), dismiss: vi.fn() }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: notices }));

type Props = ComponentProps<typeof AdmissionPipelineMoreFilters>;

['filter-variant', 'filter-off-outline', 'check', 'close'].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});

const options = {
  defaultMyCases: false,
  counsellors: [{ id: 'counsellor-1', name: 'Jay Dalia' }],
  stages: [{ code: 'ASSESSMENT', name: 'Entrance assessment' }],
};

const renderFilters = (overrides: Partial<Props> = {}) => {
  const props: Props = { values: {}, options, onApply: vi.fn(), ...overrides };
  const theme = createTheme(defaultSettings);
  const content = (nextProps: Props) => (
    <ThemeProvider theme={theme}>
      <AdmissionPipelineMoreFilters {...nextProps} />
    </ThemeProvider>
  );
  const result = render(content(props));
  return {
    ...result,
    props,
    rerenderFilters: (changes: Partial<Props>) =>
      result.rerender(content({ ...props, ...changes })),
  };
};

const openFilters = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /^Filters/ }));
  return screen.getByRole('dialog', { name: 'Pipeline filters' });
};

describe('Pipeline operational filters', () => {
  it('stages selections and applies one URL patch without academic or search changes', async () => {
    const user = userEvent.setup();
    const { props } = renderFilters();
    await openFilters(user);

    expect(screen.queryByRole('combobox', { name: 'Counsellor' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Cases' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Current step' }));
    await user.click(screen.getByRole('option', { name: 'Entrance assessment' }));
    await user.click(screen.getByRole('combobox', { name: 'Status' }));
    await user.click(screen.getByRole('option', { name: 'Draft' }));

    expect(props.onApply).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply Filters' }));
    expect(props.onApply).toHaveBeenCalledOnce();
    expect(props.onApply).toHaveBeenCalledWith({
      queue: undefined,
      counsellor: undefined,
      stage: 'ASSESSMENT',
      status: '0',
    });
  });

  it('discards un-applied edits on Close and restores URL values when reopened', async () => {
    const user = userEvent.setup();
    const { props } = renderFilters();
    await openFilters(user);
    await user.click(screen.getByRole('combobox', { name: 'Status' }));
    await user.click(screen.getByRole('option', { name: 'Submitted' }));
    await user.click(screen.getByRole('button', { name: 'Close filters' }));
    await openFilters(user);

    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent(
      'All active statuses'
    );
    expect(props.onApply).not.toHaveBeenCalled();
  });

  it('clears only operational criteria and excludes the default queue from the active count', async () => {
    const user = userEvent.setup();
    const { props } = renderFilters({
      values: {
        myCases: false,
        assignedCounsellorId: 'counsellor-1',
        currentStageCode: 'ASSESSMENT',
        status: 0,
      },
    });
    expect(within(screen.getByRole('button', { name: /^Filters/ })).getByText('2')).toBeVisible();
    await openFilters(user);
    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(props.onApply).toHaveBeenCalledOnce();
    expect(props.onApply).toHaveBeenCalledWith({
      queue: undefined,
      counsellor: undefined,
      stage: undefined,
      status: undefined,
    });
  });

  it('keeps existing criteria on option errors and uses toast feedback without an inline retry row', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const { props } = renderFilters({ isError: true, onRetry, values: { status: 1 } });
    await openFilters(user);
    expect(notices.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Could not load filter options.' })
    );
    expect(screen.queryByText('Could not load filter options.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply Filters' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Submitted');
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(onRetry).not.toHaveBeenCalled();
    expect(props.onApply).not.toHaveBeenCalled();
  });

  it('prevents scope changes if a bulk action starts while Filters is open', async () => {
    const user = userEvent.setup();
    const result = renderFilters();
    await openFilters(user);
    result.rerenderFilters({ disabled: true });

    ['Current step', 'Status'].forEach((name) => {
      expect(screen.getByRole('combobox', { name })).toHaveAttribute('aria-disabled', 'true');
    });
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Apply Filters' })).toBeDisabled();
    expect(result.props.onApply).not.toHaveBeenCalled();
  });
});
