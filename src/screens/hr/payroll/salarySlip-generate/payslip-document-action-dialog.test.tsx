import type { PayslipDocument } from 'src/redux/hr/payslip-api';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import PayslipDocumentActionDialog from './payslip-document-action-dialog';

const { payment, replace } = vi.hoisted(() => ({ payment: vi.fn(), replace: vi.fn() }));
vi.mock('src/redux/hr/payslip-api', () => ({
  useRecordPayslipPaymentMutation: () => [payment], useReplacePayslipFactsMutation: () => [replace],
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ title, children }: { title: string; children: React.ReactNode }) => <div role="dialog" aria-label={title}>{children}</div>,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@mui/icons-material', () => ({ Close: () => null, DeleteOutline: () => null }));
vi.mock('@mui/material', () => ({
  Stack: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogActions: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Typography: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  Alert: ({ children }: { children: React.ReactNode }) => <div role="alert">{children}</div>,
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: string; variant?: string }) =>
    <button type="button" {...props}>{children}</button>,
  TextField: ({ label, name, value, onChange, onBlur, disabled, type }: {
    label: string; name: string; value: string; disabled: boolean; type?: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>; onBlur: React.FocusEventHandler<HTMLInputElement>;
  }) => <><label htmlFor={name}>{label}</label><input id={name} aria-label={label} name={name} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} type={type} /></>,
}));
const document = { id: 'issued-document', revision: 1 } as PayslipDocument;

describe('payslip document mutations', () => {
  beforeEach(() => { payment.mockReset(); replace.mockReset(); });

  it('preserves the reason after failure and reuses the request key on retry', async () => {
    const onClose = vi.fn();
    replace.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('Write failed')) })
      .mockReturnValue({ unwrap: () => Promise.resolve({ id: 'replacement' }) });
    render(<PayslipDocumentActionDialog document={document} mode="replace" onClose={onClose} />);
    fireEvent.change(screen.getByLabelText('Correction reason'), { target: { value: 'Correct recorded bank details' } });
    fireEvent.click(screen.getByRole('button', { name: 'Issue replacement' }));
    await waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
    await screen.findByRole('alert');
    expect(screen.getByLabelText('Correction reason')).toHaveValue('Correct recorded bank details');
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Issue replacement' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(replace.mock.calls[1][0]).toEqual(replace.mock.calls[0][0]);
    expect(replace.mock.calls[0][0]).not.toHaveProperty('amount');
  });

  it('asks before discarding a reason and lets HR keep editing', async () => {
    const onClose = vi.fn();
    render(<PayslipDocumentActionDialog document={document} mode="replace" onClose={onClose} />);
    fireEvent.change(screen.getByLabelText('Correction reason'), { target: { value: 'Unsaved correction' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await screen.findByRole('button', { name: 'Keep editing' });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByLabelText('Correction reason')).toHaveValue('Unsaved correction');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Discard changes' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('records payment evidence without changing document money', async () => {
    const onClose = vi.fn();
    payment.mockReturnValue({ unwrap: () => Promise.resolve() });
    render(<PayslipDocumentActionDialog document={document} mode="payment" onClose={onClose} />);
    fireEvent.change(screen.getByLabelText('Payment reference'), { target: { value: 'Synthetic bank transfer' } });
    fireEvent.change(screen.getByLabelText('Payment date and time'), { target: { value: '2026-01-01T10:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Record payment' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(payment.mock.calls[0][0]).toMatchObject({ documentId: document.id, reference: 'Synthetic bank transfer' });
    expect(payment.mock.calls[0][0]).not.toHaveProperty('amount');
    expect(replace).not.toHaveBeenCalled();
  });
});
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
