// @vitest-environment jsdom
import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { useStudentSetupFormState, StudentSetupManagerHeader, StudentSetupEmbeddingProvider } from './index';

function Reporter({ dirty = false, busy = false }: { dirty?: boolean; busy?: boolean }) {
  useStudentSetupFormState({ dirty, busy });
  return null;
}

describe('Student setup embedding', () => {
  it('preserves standalone breadcrumbs and actions', () => {
    render(<StudentSetupManagerHeader heading="Admission Periods" links={[{ name: 'Student' }]} action={<button type="button">Add period</button>} />);
    expect(screen.getByText('Student')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add period' })).toBeVisible();
  });

  it('keeps Academic-style actions and editor back behavior without duplicate breadcrumbs', () => {
    const close = vi.fn();
    render(<StudentSetupEmbeddingProvider onFormStateChange={vi.fn()}>
      <StudentSetupManagerHeader heading="Edit Period" links={[{ name: 'Student' }]} isBack onBack={close} action={<button type="button">Save period</button>} />
    </StudentSetupEmbeddingProvider>);
    expect(screen.queryByText('Student')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back to settings' }));
    expect(close).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Save period' })).toBeVisible();
  });

  it('blocks navigation for an untouched open editor and releases the lock on close', () => {
    const report = vi.fn();
    const view = render(<StudentSetupEmbeddingProvider onFormStateChange={report}>
      <StudentSetupManagerHeader links={[]} editorOpen />
    </StudentSetupEmbeddingProvider>);
    expect(report).toHaveBeenLastCalledWith({ dirty: true, busy: false });
    view.rerender(<StudentSetupEmbeddingProvider onFormStateChange={report}><span>Closed</span></StudentSetupEmbeddingProvider>);
    expect(report).toHaveBeenLastCalledWith({ dirty: false, busy: false });
  });

  it('aggregates reporters so one clean or unmounted form cannot unlock another editor', () => {
    const report = vi.fn();
    const view = render(<StudentSetupEmbeddingProvider onFormStateChange={report}>
      <Reporter dirty /><Reporter busy />
    </StudentSetupEmbeddingProvider>);
    expect(report).toHaveBeenLastCalledWith({ dirty: true, busy: true });
    view.rerender(<StudentSetupEmbeddingProvider onFormStateChange={report}><Reporter dirty /></StudentSetupEmbeddingProvider>);
    expect(report).toHaveBeenLastCalledWith({ dirty: true, busy: false });
    view.unmount();
    expect(report).toHaveBeenLastCalledWith({ dirty: false, busy: false });
  });
});
