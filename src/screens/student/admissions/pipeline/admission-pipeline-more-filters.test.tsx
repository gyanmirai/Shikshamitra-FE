import type { ComponentProps } from 'react';

import { addIcon } from '@iconify/react';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AdmissionPipelineMoreFilters } from './admission-pipeline-more-filters';

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

    await user.click(screen.getByRole('combobox', { name: 'Counsellor' }));
    await user.click(screen.getByRole('option', { name: 'Jay Dalia' }));
    await user.click(screen.getByRole('combobox', { name: 'Current step' }));
    await user.click(screen.getByRole('option', { name: 'Entrance assessment' }));
    await user.click(screen.getByRole('combobox', { name: 'Status' }));
    await user.click(screen.getByRole('option', { name: 'Draft' }));

    expect(props.onApply).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply Filters' }));
    expect(props.onApply).toHaveBeenCalledOnce();
    expect(props.onApply).toHaveBeenCalledWith({
      queue: undefined,
      counsellor: 'counsellor-1',
      stage: 'ASSESSMENT',
      status: '0',
    });
  });

  it('keeps an implicit server default queue and prevents a counsellor filter for My cases', async () => {
    const user = userEvent.setup();
    const { props } = renderFilters({ options: { ...options, defaultMyCases: true } });
    await openFilters(user);

    expect(screen.getByRole('combobox', { name: 'Cases' })).toHaveTextContent('My active cases');
    expect(screen.getByRole('combobox', { name: 'Counsellor' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await user.click(screen.getByRole('button', { name: 'Apply Filters' }));
    expect(props.onApply).toHaveBeenCalledWith({
      queue: undefined,
      counsellor: undefined,
      stage: undefined,
      status: undefined,
    });
  });

  it('clears the selected counsellor when switching to My cases', async () => {
    const user = userEvent.setup();
    const { props } = renderFilters({
      values: { myCases: false, assignedCounsellorId: 'counsellor-1' },
    });
    await openFilters(user);

    await user.click(screen.getByRole('combobox', { name: 'Cases' }));
    await user.click(screen.getByRole('option', { name: 'My active cases' }));
    expect(screen.getByRole('combobox', { name: 'Counsellor' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(props.onApply).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply Filters' }));
    expect(props.onApply).toHaveBeenCalledWith({
      queue: 'my',
      counsellor: undefined,
      stage: undefined,
      status: undefined,
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
    expect(within(screen.getByRole('button', { name: /^Filters/ })).getByText('3')).toBeVisible();
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

  it('waits for initial options and adopts their default without creating an explicit queue', async () => {
    const user = userEvent.setup();
    const result = renderFilters({ options: undefined, isLoading: true });
    await openFilters(user);
    expect(screen.getByText('Loading filter options...')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Apply Filters' })).toBeDisabled();
    result.rerenderFilters({ options: { ...options, defaultMyCases: true }, isLoading: false });
    expect(screen.getByRole('combobox', { name: 'Cases' })).toHaveTextContent('My active cases');
    await user.click(screen.getByRole('button', { name: 'Apply Filters' }));
    expect(result.props.onApply).toHaveBeenCalledWith({
      queue: undefined,
      counsellor: undefined,
      stage: undefined,
      status: undefined,
    });
  });

  it('keeps the existing criteria on option errors and offers a guarded retry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const { props } = renderFilters({ isError: true, onRetry, values: { status: 1 } });
    await openFilters(user);
    expect(screen.getByText('Could not load filter options.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Apply Filters' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Submitted');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(props.onApply).not.toHaveBeenCalled();
  });

  it('prevents scope changes if a bulk action starts while Filters is open', async () => {
    const user = userEvent.setup();
    const result = renderFilters();
    await openFilters(user);
    result.rerenderFilters({ disabled: true });

    ['Cases', 'Counsellor', 'Current step', 'Status'].forEach((name) => {
      expect(screen.getByRole('combobox', { name })).toHaveAttribute('aria-disabled', 'true');
    });
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Apply Filters' })).toBeDisabled();
    expect(result.props.onApply).not.toHaveBeenCalled();
  });
});
