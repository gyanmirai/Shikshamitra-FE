import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import { InstallmentTemplateDialog } from './InstallmentTemplateDialog';

const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('src/redux/finance/paymentTerm', () => ({
  usePreviewPaymentTermTemplateMutation: () => [request, { isLoading: false }],
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, children }: any) => (open ? <div>{children}</div> : null),
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data }: any) => <div data-testid="preview">{JSON.stringify(data)}</div>,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ label, value, onChange }: any) => (
    <input
      aria-label={label}
      value={value?.format('YYYY-MM-DD') ?? ''}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));
const installments = [
  {
    sequence: 1,
    name: 'First',
    coverageStartDate: '2026-06-01',
    coverageEndDate: '2026-08-31',
    dueDate: '2026-06-14',
    demandDate: '2026-06-01',
    allocationPercentage: 50,
    demandEnabled: true,
    reminderEnabled: false,
  },
  {
    sequence: 2,
    name: 'Second',
    coverageStartDate: '2026-09-01',
    coverageEndDate: '2026-11-30',
    dueDate: '2026-09-11',
    demandDate: '2026-09-01',
    allocationPercentage: 50,
    demandEnabled: true,
    reminderEnabled: false,
  },
];
const geometry = { installmentCount: 2, installments };
const props = {
  open: true,
  boardId: 'board',
  existingInstallmentCount: 1,
  demandGenerationRule: 'OnInstallmentStartDate' as const,
  demandOffsetDays: null,
  onClose: vi.fn(),
  onApply: vi.fn(),
};
async function choose(label: string, option: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: new RegExp(`^${label}`) }));
  fireEvent.click(await screen.findByRole('option', { name: option }));
}
async function ready() {
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Generate Preview' })).toBeEnabled()
  );
}
beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  request.mockImplementation(() => ({ unwrap: () => Promise.resolve(geometry) }));
});
describe('complete payment term template schedule', () => {
  it('closes an untouched schedule without a discard prompt', async () => {
    render(<InstallmentTemplateDialog {...props} />);
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(props.onClose).toHaveBeenCalledOnce();
    expect(screen.queryByText('Discard Unsaved Changes?')).not.toBeInTheDocument();
  });

  it('keeps edited rules until the user explicitly discards them', async () => {
    const { rerender } = render(<InstallmentTemplateDialog {...props} />);
    await ready();
    await choose('Invoice date rule', 'On due date');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(props.onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Keep Editing' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('combobox', { name: /^Invoice date rule/ })).toHaveTextContent(
      'On due date'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Discard Changes' }));
    expect(props.onClose).toHaveBeenCalledOnce();
    expect(props.onApply).not.toHaveBeenCalled();
    rerender(<InstallmentTemplateDialog {...props} open={false} />);
    rerender(<InstallmentTemplateDialog {...props} />);
    await ready();
    expect(screen.getByRole('combobox', { name: /^Invoice date rule/ })).toHaveTextContent(
      'On installment start date'
    );
  });

  it('allows clearing a custom count and blocks preview until a valid count is entered', async () => {
    render(<InstallmentTemplateDialog {...props} />);
    await ready();
    await choose('Schedule template', 'Custom installment count');
    await ready();
    const count = screen.getByRole('textbox', { name: /^Number of installments/ });
    fireEvent.change(count, { target: { value: '' } });
    expect(count).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Generate Preview' })).toBeDisabled();
    fireEvent.change(count, { target: { value: '3' } });
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Generate Preview' }));
    await screen.findByRole('button', { name: 'Replace Installments' });
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({ customInstallmentCount: 3 })
    );
  });

  it('restricts the day count to whole days before requesting a preview', async () => {
    render(<InstallmentTemplateDialog {...props} />);
    await ready();
    await choose('Invoice date rule', 'X days before due date');
    const days = screen.getByRole('textbox', { name: /^Days before due/ });
    fireEvent.change(days, { target: { value: '1.5' } });
    expect(days).toHaveValue('1');
    fireEvent.click(screen.getByRole('button', { name: 'Generate Preview' }));
    await screen.findByRole('button', { name: 'Replace Installments' });
    expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ demandOffsetDays: 1 }));
  });

  it('explains a zero start-to-due gap instead of allowing a positive offset', async () => {
    request.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          ...geometry,
          installments: installments.map((item) => ({ ...item, dueDate: item.coverageStartDate })),
        }),
    }));
    render(<InstallmentTemplateDialog {...props} />);
    await ready();
    await choose('Invoice date rule', 'X days before due date');
    expect(screen.getByText(/No days before due are available/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate Preview' })).toBeDisabled();
  });
  it('ignores a pending final preview after the source invoice rule changes', async () => {
    const { rerender } = render(<InstallmentTemplateDialog {...props} />);
    await ready();
    let resolve: (value: typeof geometry) => void = () => {};
    request.mockImplementationOnce(() => ({
      unwrap: () =>
        new Promise<typeof geometry>((finish) => {
          resolve = finish;
        }),
    }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate Preview' }));
    rerender(<InstallmentTemplateDialog {...props} demandGenerationRule="OnDueDate" />);
    await act(async () => {
      resolve(geometry);
    });
    expect(screen.queryByRole('button', { name: 'Replace Installments' })).not.toBeInTheDocument();
    expect(props.onApply).not.toHaveBeenCalled();
  });
  it('uses the smallest server start-to-due gap and blocks excessive, zero and empty offsets', async () => {
    render(<InstallmentTemplateDialog {...props} />);
    await ready();
    await choose('Invoice date rule', 'X days before due date');
    const input = screen.getByRole('textbox', { name: /^Days before due/ });
    for (const value of ['11', '0', '']) {
      fireEvent.change(input, { target: { value } });
      expect(screen.getByRole('button', { name: 'Generate Preview' })).toBeDisabled();
    }
    fireEvent.change(input, { target: { value: '11' } });
    expect(screen.getByText(/Maximum 10 days/)).toBeInTheDocument();
    fireEvent.change(input, { target: { value: '10' } });
    expect(screen.getByRole('button', { name: 'Generate Preview' })).toBeEnabled();
  });
  it('applies the preview installments and selected rule together; changing the rule removes stale Apply', async () => {
    render(<InstallmentTemplateDialog {...props} />);
    await ready();
    await choose('Invoice date rule', 'X days before due date');
    fireEvent.change(screen.getByRole('textbox', { name: /^Days before due/ }), {
      target: { value: '10' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Generate Preview' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Replace Installments' }));
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({ demandGenerationRule: 'XDaysBeforeDue', demandOffsetDays: 10 })
    );
    expect(props.onApply).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ startDate: '2026-06-01', demandDate: '2026-06-01' }),
      ]),
      'XDaysBeforeDue',
      10
    );
    await choose('Invoice date rule', 'On installment start date');
    expect(screen.queryByRole('button', { name: 'Replace Installments' })).not.toBeInTheDocument();
  });
  it('requires valid per-installment specific dates and sends them to the server before Apply', async () => {
    render(<InstallmentTemplateDialog {...props} />);
    await ready();
    await choose('Invoice date rule', 'On a specific date');
    const first = screen.getByLabelText('Invoice date — First');
    fireEvent.change(first, { target: { value: '2026-05-31' } });
    expect(screen.getByRole('button', { name: 'Generate Preview' })).toBeDisabled();
    fireEvent.change(first, { target: { value: '2026-06-15' } });
    expect(screen.getByRole('button', { name: 'Generate Preview' })).toBeDisabled();
    fireEvent.change(first, { target: { value: '2026-06-10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate Preview' }));
    await screen.findByRole('button', { name: 'Replace Installments' });
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({
        demandGenerationRule: 'SpecificDate',
        specificDemandDates: ['2026-06-10', '2026-09-01'],
      })
    );
    fireEvent.change(first, { target: { value: '2026-06-11' } });
    expect(screen.queryByRole('button', { name: 'Replace Installments' })).not.toBeInTheDocument();
  });
  it('preserves the legacy On due date rule', async () => {
    render(<InstallmentTemplateDialog {...props} demandGenerationRule="OnDueDate" />);
    await ready();
    expect(screen.getByRole('combobox', { name: /^Invoice date rule/ })).toHaveTextContent(
      'On due date'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Generate Preview' }));
    await screen.findByRole('button', { name: 'Replace Installments' });
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({ demandGenerationRule: 'OnDueDate', demandOffsetDays: null })
    );
  });
});
