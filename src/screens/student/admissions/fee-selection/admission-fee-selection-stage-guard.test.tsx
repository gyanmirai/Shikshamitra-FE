import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { ApplicationPaymentStage } from '../payment/application-payment-stage';

vi.mock('./admission-fee-selection-panel', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./admission-fee-selection-panel')>();
  return {
    ...actual,
    default: ({
      canContinue,
      continuing,
      onContinue,
      onEditorStateChange,
    }: {
      canContinue: boolean;
      continuing: boolean;
      onContinue: () => void;
      onEditorStateChange: (state: { dirty: boolean; busy: boolean }) => void;
    }) => (
      <div>
        <button type="button" onClick={() => onEditorStateChange({ dirty: true, busy: false })}>
          Edit selection
        </button>
        <button type="button" onClick={() => onEditorStateChange({ dirty: false, busy: true })}>
          Saving selection
        </button>
        <button type="button" onClick={() => onEditorStateChange({ dirty: false, busy: false })}>
          Selection saved
        </button>
        <button type="button" disabled={!canContinue || continuing} onClick={onContinue}>
          Continue
        </button>
      </div>
    ),
  };
});

it('blocks Payment progression while the fee editor is dirty or saving and reports that state to the workspace', () => {
  const onComplete = vi.fn();
  const onStateChange = vi.fn();
  render(
    <ApplicationPaymentStage
      applicationId="application-1"
      stage={{ id: 'payment' } as AdmissionApplicationStage}
      canAdvance
      advancing={false}
      onComplete={onComplete}
      onFeeSelectionStateChange={onStateChange}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Edit selection' }));
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  expect(onStateChange).toHaveBeenLastCalledWith({ dirty: true, busy: false });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(onComplete).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Saving selection' }));
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Selection saved' }));
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(onComplete).toHaveBeenCalledOnce();
  expect(screen.queryByRole('button', { name: 'Record payment' })).not.toBeInTheDocument();
});
