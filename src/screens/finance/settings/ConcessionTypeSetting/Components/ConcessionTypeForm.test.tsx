import type { ReactNode } from 'react';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import ConcessionTypeForm from './ConcessionTypeForm';

const detailQuery = vi.hoisted(() => ({
  currentData: undefined as { data: Record<string, unknown> } | undefined,
  isLoading: true,
  isFetching: true,
  refetch: vi.fn(),
}));
const mutations = vi.hoisted(() => ({
  save: vi.fn(),
  creating: false,
}));

vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ globalState: { currentYear: { id: 'year-2026' } } }),
}));
vi.mock('src/redux/finance/concessionType', () => ({
  useGetConcessionTypeByIdQuery: () => detailQuery,
  useGetConcessionTypesQuery: () => ({ data: { data: { items: [] } } }),
  usePutConcessionTypeMutation: () => [mutations.save, { isLoading: false }],
  usePostConcessionTypeMutation: () => [mutations.save, { isLoading: mutations.creating }],
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: { currentQueryAndMutation: () => unknown }) =>
    currentQueryAndMutation(),
}));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('src/components/customDialog', () => ({
  DialogScrollContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/components/shaking-text-field', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/screens/finance/settings/components/DownstreamUsageWarning', () => ({
  DownstreamUsageWarning: () => null,
}));

const onClose = vi.fn();
const props = {
  open: { value: true, onTrue: vi.fn(), onFalse: vi.fn(), onToggle: vi.fn(), setValue: vi.fn() },
  onClose,
  editData: { id: 'type-1', name: 'Sibling Discount', documents: [] },
};

beforeEach(() => {
  vi.clearAllMocks();
  detailQuery.currentData = undefined;
  detailQuery.isLoading = true;
  detailQuery.isFetching = true;
  mutations.creating = false;
  mutations.save.mockReturnValue({ unwrap: () => Promise.resolve({}) });
});

describe('Concession Type update loading', () => {
  it('filters type and document names while retaining description punctuation', async () => {
    render(<ConcessionTypeForm {...props} editData={null} />);
    const name = screen.getByRole('textbox', { name: 'Concession Type Name *' });
    fireEvent.change(name, { target: { value: 'Sibling @Discount_% 2' } });
    await waitFor(() => expect(name).toHaveValue('Sibling Discount 2'));
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'For siblings (2026): 50% concession.' },
    });
    expect(screen.getByLabelText('Description')).toHaveValue(
      'For siblings (2026): 50% concession.'
    );
    fireEvent.click(screen.getByRole('button', { name: /Add document/i }));
    const documentName = await screen.findByRole('textbox', { name: 'Document Name *' });
    fireEvent.change(documentName, { target: { value: 'आय प्रमाणपत्र २@#' } });
    await waitFor(() => expect(documentName).toHaveValue('आय प्रमाणपत्र २'));
    fireEvent.change(name, { target: { value: '@#$' } });
    fireEvent.blur(name);
    expect(await screen.findByText('Concession Type Name is required')).toBeVisible();
    expect(mutations.save).not.toHaveBeenCalled();
  });

  it('keeps the footer visible with Submit disabled until details replace the skeleton', async () => {
    const view = render(<ConcessionTypeForm {...props} />);
    expect(screen.getByRole('status', { name: 'Loading concession type details' })).toHaveAttribute(
      'aria-busy',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    detailQuery.currentData = {
      data: {
        id: 'type-1',
        name: 'Saved Sibling Discount',
        documents: [],
        description: 'Saved description',
      },
    };
    detailQuery.isLoading = false;
    detailQuery.isFetching = false;
    view.rerender(<ConcessionTypeForm {...props} />);
    await waitFor(() =>
      expect(screen.getByLabelText('Concession Type Name *')).toHaveValue('Saved Sibling Discount')
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
    expect(screen.getByLabelText('Description')).toHaveValue('Saved description');
  });

  it('offers Retry after a failed load and prevents updating empty defaults', () => {
    detailQuery.isLoading = false;
    detailQuery.isFetching = false;
    render(<ConcessionTypeForm {...props} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load concession type details.');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(detailQuery.refetch).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledWith(null, false);
  });

  it('keeps the create form ready without a details request', () => {
    detailQuery.isLoading = false;
    detailQuery.isFetching = false;
    render(<ConcessionTypeForm {...props} editData={null} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Concession Type Name *' })).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
    expect(screen.getByText('General Information')).toBeInTheDocument();
    expect(screen.getByText('Document Requirements')).toBeInTheDocument();
  });

  it('retains document validation and converts decimal MB to bytes at save', async () => {
    render(<ConcessionTypeForm {...props} editData={null} />);
    fireEvent.change(screen.getByLabelText('Concession Type Name *'), {
      target: { value: 'Sibling' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add document' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByText('Document Name is required')).toBeInTheDocument());
    expect(mutations.save).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Document Name *'), {
      target: { value: 'Certificate' },
    });
    fireEvent.change(screen.getByLabelText('Maximum File Size (MB) *'), {
      target: { value: '2.5' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(mutations.save).toHaveBeenCalledOnce());
    expect(mutations.save.mock.calls[0][0].body.documents[0]).toMatchObject({
      documentName: 'Certificate',
      maxFileSizeBytes: 2621440,
      acceptedFormats: [4, 0, 1, 2],
      isRequired: true,
    });
    expect(onClose).toHaveBeenCalledWith(null, true);
  });

  it('locks fields and cancellation during save and reports the busy state to the drawer', () => {
    mutations.creating = true;
    const onBusyChange = vi.fn();
    render(<ConcessionTypeForm {...props} editData={null} onBusyChange={onBusyChange} />);
    expect(onBusyChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByLabelText('Concession Type Name *')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });
});
