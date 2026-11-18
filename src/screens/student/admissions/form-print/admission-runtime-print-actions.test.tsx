import type { AdmissionApplicationForm } from 'src/redux/student/admissions/admission-applications-api';

import { it, vi, expect, describe } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import {
  AdmissionRuntimePrintActions,
  hasUnsavedAdmissionPrintValues,
} from './admission-runtime-print-actions';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./admission-application-print-dialog', () => ({
  AdmissionApplicationPrintDialog: ({
    applicationId,
    initialMode,
    currentStepId,
    onClose,
  }: {
    applicationId: string;
    initialMode: string;
    currentStepId?: string;
    onClose: () => void;
  }) => (
    <div role="dialog" aria-label="Saved print preview">
      {applicationId} {initialMode} {currentStepId}
      <button type="button" onClick={onClose}>
        Close preview
      </button>
    </div>
  ),
}));

const form = {
  values: [
    { fieldCode: 'NAME', valueJson: '"Saved name"' },
    { fieldCode: 'CHOICES', valueJson: '["a","b"]' },
  ],
} as AdmissionApplicationForm;

describe('runtime Registration print save boundary', () => {
  it('compares serialized saved answers using runtime values', () => {
    expect(
      hasUnsavedAdmissionPrintValues(form, { NAME: 'Saved name', CHOICES: 'a,b', EMPTY: '' })
    ).toBe(false);
    expect(hasUnsavedAdmissionPrintValues(form, { NAME: 'Edited name' })).toBe(true);
  });

  it('opens the saved filled preview without saving unchanged answers', () => {
    const onSave = vi.fn();
    render(
      <AdmissionRuntimePrintActions
        applicationId="app-1"
        form={form}
        values={{ NAME: 'Saved name' }}
        busy={false}
        currentStepId="family"
        onSave={onSave}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    expect(screen.getByRole('dialog', { name: 'Saved print preview' })).toHaveTextContent(
      'app-1 filled family'
    );
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Close preview' }));
    expect(screen.queryByRole('dialog', { name: 'Saved print preview' })).not.toBeInTheDocument();
  });

  it('requires an explicit decision for dirty answers and prints saved details without saving', async () => {
    const onSave = vi.fn();
    render(
      <AdmissionRuntimePrintActions
        applicationId="app-2"
        form={form}
        values={{ NAME: 'Edited name' }}
        busy={false}
        onSave={onSave}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    expect(screen.getByRole('dialog', { name: 'Print Saved Details?' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Saved print preview' })).not.toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Use saved details' }));
    expect(await screen.findByRole('dialog', { name: 'Saved print preview' })).toHaveTextContent(
      'app-2 filled'
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it('waits for confirmed save success and locks all conflicting actions and Escape', async () => {
    let finishSave!: (value: boolean) => void;
    const onSave = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          finishSave = resolve;
        })
    );
    render(
      <AdmissionRuntimePrintActions
        applicationId="app-3"
        form={form}
        values={{ NAME: 'Edited name' }}
        busy={false}
        onSave={onSave}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save and preview' }));
    expect(onSave).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Save and preview' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Use saved details' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Save and preview' }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    expect(screen.getByRole('dialog', { name: 'Print Saved Details?' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Saved print preview' })).not.toBeInTheDocument();
    expect(onSave).toHaveBeenCalledOnce();
    await act(async () => finishSave(true));
    expect(await screen.findByRole('dialog', { name: 'Saved print preview' })).toHaveTextContent(
      'app-3 filled'
    );
  });

  it.each(['false', 'rejection'])(
    'retains the draft decision after a save %s and permits saved-details fallback',
    async (failure) => {
      const onSave =
        failure === 'false'
          ? vi.fn().mockResolvedValue(false)
          : vi.fn().mockRejectedValue(new Error('Save unavailable'));
      render(
        <AdmissionRuntimePrintActions
          applicationId="app-4"
          form={form}
          values={{ NAME: 'Edited name' }}
          busy={false}
          onSave={onSave}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Print' }));
      fireEvent.click(screen.getByRole('button', { name: 'Save and preview' }));
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('Changes could not be saved')
      );
      expect(screen.getByRole('dialog', { name: 'Print Saved Details?' })).toBeInTheDocument();
      expect(screen.queryByRole('dialog', { name: 'Saved print preview' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save and preview' })).toBeEnabled();
      fireEvent.click(screen.getByRole('button', { name: 'Use saved details' }));
      expect(
        await screen.findByRole('dialog', { name: 'Saved print preview' })
      ).toBeInTheDocument();
      expect(onSave).toHaveBeenCalledOnce();
    }
  );

  it('disables print while the owning runtime is busy', () => {
    render(
      <AdmissionRuntimePrintActions
        applicationId="app-5"
        form={form}
        values={{ NAME: 'Edited name' }}
        busy
        onSave={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Print' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('offers only saved details when the user cannot save Registration changes', async () => {
    const onSave = vi.fn();
    render(
      <AdmissionRuntimePrintActions
        applicationId="app-readonly"
        form={form}
        values={{ NAME: 'Edited name' }}
        busy={false}
        canSave={false}
        onSave={onSave}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    expect(screen.getByRole('dialog', { name: 'Print Saved Details?' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save and preview' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Use saved details' }));
    expect(await screen.findByRole('dialog', { name: 'Saved print preview' })).toHaveTextContent(
      'app-readonly filled'
    );
    expect(onSave).not.toHaveBeenCalled();
  });
});
