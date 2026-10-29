import type { ComponentProps } from 'react';

import React, { StrictMode } from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, afterEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import SalaryTemplateComponentPicker from './salary-template-component-picker';

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (selector: any) => selector({ confirmPopup: { isChanges: true } }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const theme = createTheme(defaultSettings);
const options = [
  { componentId: 'deduction-1', name: 'Loan Recovery', lineKind: 'DEDUCTION' as const },
];
function setup(overrides: Partial<ComponentProps<typeof SalaryTemplateComponentPicker>> = {}) {
  const props: ComponentProps<typeof SalaryTemplateComponentPicker> = {
    kind: 'DEDUCTION',
    options,
    allComponentsAdded: true,
    canCreate: true,
    createHref: '/hr/payroll/setting/deduction-component',
    blocked: false,
    refresh: vi.fn().mockResolvedValue(undefined),
    onSubmit: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  const ui = (values = props) => (
    <ThemeProvider theme={theme}>
      <SalaryTemplateComponentPicker {...values} />
    </ThemeProvider>
  );
  const view = render(ui());
  return {
    props,
    ...view,
    update: (values: Partial<typeof props>) => view.rerender(ui({ ...props, ...values })),
  };
}
async function selectComponent() {
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: 'Payroll component' })).toBeEnabled()
  );
  await userEvent.click(screen.getByRole('combobox', { name: 'Payroll component' }));
  await userEvent.click(screen.getByRole('option', { name: 'Loan Recovery' }));
}
const returnToPicker = () => {
  fireEvent(window, new Event('blur'));
  fireEvent(window, new Event('focus'));
};
afterEach(cleanup);

describe('SalaryTemplateComponentPicker', () => {
  it('refreshes once on open and submits one rule through its own native form', async () => {
    const { props } = setup();
    await selectComponent();
    expect(props.refresh).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Refresh setup' })).toBeNull();
    expect(screen.getByText('Component Details')).toBeVisible();
    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }).closest('form')!);
    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }).closest('form')!);
    await waitFor(() => expect(props.onSubmit).toHaveBeenCalledExactlyOnceWith(options[0]));
  });

  it('shows failed refresh with Retry, retains the selection, and deduplicates return events', async () => {
    const { props } = setup();
    await selectComponent();
    let rejectRefresh: (error: Error) => void = () => {};
    vi.mocked(props.refresh).mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectRefresh = reject;
        })
    );
    returnToPicker();
    returnToPicker();
    expect(props.refresh).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    await act(async () => rejectRefresh(new Error('Unavailable')));
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load payroll components');
    expect(screen.getByRole('combobox')).toHaveTextContent('Loan Recovery');
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    expect(screen.queryByText(/Setup refreshed/)).toBeNull();
  });

  it('queues a return refresh while blocked and runs it once after the preview or save finishes', async () => {
    const { props, update } = setup();
    await selectComponent();
    update({ blocked: true });
    returnToPicker();
    expect(props.refresh).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    update({ blocked: false });
    await waitFor(() => expect(props.refresh).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  });

  it('clears only a selection removed from the refreshed choices', async () => {
    const { update } = setup();
    await selectComponent();
    update({ options: [] });
    await waitFor(() =>
      expect(screen.getByRole('combobox')).not.toHaveTextContent('Loan Recovery')
    );
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('isolates dirty close and keeps editing or discards without changing the template', async () => {
    const { props } = setup();
    await selectComponent();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(props.onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByRole('combobox')).toHaveTextContent('Loan Recovery');
    await userEvent.click(screen.getByRole('button', { name: 'close' }));
    await userEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(props.onClose).toHaveBeenCalledOnce();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('cleans up listeners and ignores a late response after closing', async () => {
    let finish: () => void = () => {};
    const refresh = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const { unmount } = setup({ refresh });
    unmount();
    await act(async () => finish());
    returnToPicker();
    expect(refresh).toHaveBeenCalledOnce();
  });

  it('does not duplicate its initial refresh under StrictMode', async () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    const { unmount, props } = setup();
    unmount();
    render(
      <StrictMode>
        <ThemeProvider theme={theme}>
          <SalaryTemplateComponentPicker {...props} refresh={refresh} />
        </ThemeProvider>
      </StrictMode>
    );
    await waitFor(() => expect(screen.getByRole('combobox')).toBeEnabled());
    expect(refresh).toHaveBeenCalledOnce();
  });
});
