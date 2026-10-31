import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { InquirySourcePicker } from './inquiry-source-picker';

const context = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
vi.mock('../hooks/use-form-inheritance', () => ({ useFormInheritance: () => context.value }));

beforeEach(() => {
  context.value = {
    formik: { values: { inheritance: { sources: [] } }, isSubmitting: false },
    sourceId: null,
    selectSource: vi.fn(),
    canViewSources: true,
    connected: [],
    fetchSources: async () => ({ data: [], hasMore: false }),
  };
});

function setup() {
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <InquirySourcePicker />
    </ThemeProvider>
  );
  return screen.getByRole('combobox', { name: 'Preview using Inquiry form' });
}

describe('Inquiry source picker', () => {
  it('shows loading before the controller is initialized without consuming its placeholder loader', async () => {
    const fetchSources = vi.fn();
    context.value = { ...context.value, initializingSources: true, fetchSources };
    const view = render(<InquirySourcePicker />);
    expect(screen.getByLabelText('Preview using Inquiry form')).toBeDisabled();
    expect(screen.getByRole('progressbar', { name: 'Loading Inquiry forms' })).toBeVisible();
    expect(fetchSources).not.toHaveBeenCalled();
    context.value = {
      ...context.value,
      initializingSources: false,
      fetchSources: vi.fn(async () => ({ data: [], hasMore: false })),
    };
    view.rerender(<InquirySourcePicker />);
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Preview using Inquiry form' }));
    expect(await screen.findByText('No matching Inquiry forms found')).toBeVisible();
    expect(context.value.fetchSources).toHaveBeenCalledWith('', 1);
  });

  it('removes loaded catalogue metadata immediately if View is revoked while the picker stays mounted', async () => {
    context.value = {
      ...context.value,
      formik: {
        values: { inheritance: { sources: [{ inquiryFormDefinitionId: 'saved' }] } },
        isSubmitting: false,
      },
      fetchSources: async () => ({
        data: [{ id: 'protected', name: 'Protected catalogue', version: 1 }],
        hasMore: false,
      }),
    };
    const view = render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <InquirySourcePicker />
      </ThemeProvider>
    );
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Preview using Inquiry form' }));
    await screen.findByRole('option', { name: 'Protected catalogue · v1' });
    context.value = { ...context.value, canViewSources: false };
    view.rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <InquirySourcePicker />
      </ThemeProvider>
    );
    expect(
      screen.queryByRole('option', { name: 'Protected catalogue · v1' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Saved Inquiry 1' })).toBeVisible();
  });
  it('selects saved exact IDs without reading or revealing protected source metadata without View', async () => {
    const fetchSources = vi.fn();
    const selectSource = vi.fn();
    context.value = {
      ...context.value,
      formik: {
        values: {
          inheritance: {
            sources: [
              { inquiryFormDefinitionId: 'saved-archived-a' },
              { inquiryFormDefinitionId: 'saved-archived-b' },
            ],
          },
        },
        isSubmitting: false,
      },
      canViewSources: false,
      source: { id: 'saved-archived-a', name: 'Protected Inquiry', version: 9 },
      connected: [
        {
          inquiryFormDefinitionId: 'protected-connection',
          name: 'Protected connection',
          version: 2,
        },
      ],
      fetchSources,
      selectSource,
    };
    fireEvent.mouseDown(setup());
    fireEvent.click(await screen.findByRole('option', { name: 'Saved Inquiry 2' }));
    expect(selectSource).toHaveBeenCalledWith('saved-archived-b');
    expect(fetchSources).not.toHaveBeenCalled();
    expect(screen.queryByText(/Protected/)).not.toBeInTheDocument();
  });

  it('keeps retained versions while loading later published pages through the same picker', async () => {
    const fetchSources = vi.fn(async (_query: string, page: number) => ({
      data:
        page === 1
          ? Array.from({ length: 25 }, (_, index) => ({
              id: `published-${index}`,
              name: `Published ${index}`,
              version: 1,
            }))
          : [{ id: 'published-last', name: 'Later published form', version: 3 }],
      hasMore: page === 1,
    }));
    const selectSource = vi.fn();
    context.value = {
      ...context.value,
      connected: [
        {
          inquiryFormDefinitionId: 'archived-exact-version',
          name: 'Retained archived form',
          version: 2,
        },
      ],
      fetchSources,
      selectSource,
    };
    fireEvent.mouseDown(setup());
    await screen.findByRole('option', { name: 'Published 24 · v1' });
    fireEvent.scroll(screen.getByRole('listbox'));
    await screen.findByRole('option', { name: 'Later published form · v3' });
    expect(fetchSources).toHaveBeenLastCalledWith('', 2);
    expect(screen.getByRole('option', { name: 'Retained archived form · v2' })).toBeVisible();
    fireEvent.click(screen.getByRole('option', { name: 'Later published form · v3' }));
    expect(selectSource).toHaveBeenCalledWith('published-last');
  });

  it('retains archived choices during a published-search failure and retries without replacing them', async () => {
    const fetchSources = vi
      .fn()
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValue({
        data: [{ id: 'published', name: 'Published form', version: 1 }],
        hasMore: false,
      });
    context.value = {
      ...context.value,
      connected: [{ inquiryFormDefinitionId: 'archived', name: 'Retained Inquiry', version: 7 }],
      fetchSources,
    };
    fireEvent.mouseDown(setup());
    await screen.findByText('Failed to load results');
    expect(screen.getByRole('option', { name: 'Retained Inquiry · v7' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Retry results' }));
    await screen.findByRole('option', { name: 'Published form · v1' });
    expect(screen.getByRole('option', { name: 'Retained Inquiry · v7' })).toBeVisible();
    await waitFor(() =>
      expect(screen.queryByText('Failed to load results')).not.toBeInTheDocument()
    );
  });
});
