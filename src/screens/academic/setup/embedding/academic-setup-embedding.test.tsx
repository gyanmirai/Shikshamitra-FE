// @vitest-environment jsdom

import { useState } from 'react';
import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubjectPageHeader } from 'src/screens/academic/curriculum-management/setting/subjectCreation/components/SubjectPageHeader';

import {
  useAcademicSetupStandard,
  useAcademicSetupFormState,
  useAcademicSetupEmbedding,
  AcademicSetupManagerHeader,
  AcademicSetupEmbeddingProvider,
} from './index';

function ClassScope({ standardId }: { standardId?: string }) {
  useAcademicSetupStandard(standardId);
  return null;
}

function FormState() {
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const { embedded } = useAcademicSetupEmbedding();
  useAcademicSetupFormState({ dirty, busy });
  return (
    <>
      <button type="button" onClick={() => setDirty(true)}>
        {embedded ? 'Embedded form' : 'Standalone form'}
      </button>
      <button type="button" onClick={() => setBusy(true)}>
        Save form
      </button>
    </>
  );
}

describe('Academic setup embedding', () => {
  it('reports selected timetable classes and keeps the last class when leaving the form', () => {
    const report = vi.fn();
    const view = render(
      <AcademicSetupEmbeddingProvider onFormStateChange={vi.fn()} onStandardChange={report}>
        <ClassScope standardId="class-one" />
      </AcademicSetupEmbeddingProvider>
    );
    expect(report).toHaveBeenLastCalledWith('class-one');
    view.rerender(
      <AcademicSetupEmbeddingProvider onFormStateChange={vi.fn()} onStandardChange={report}>
        <ClassScope standardId="class-two" />
      </AcademicSetupEmbeddingProvider>
    );
    expect(report).toHaveBeenLastCalledWith('class-two');
    view.rerender(
      <AcademicSetupEmbeddingProvider onFormStateChange={vi.fn()} onStandardChange={report}>
        <ClassScope />
      </AcademicSetupEmbeddingProvider>
    );
    expect(report).toHaveBeenCalledTimes(2);
    view.unmount();
    expect(report).toHaveBeenCalledTimes(2);
  });
  it('retains real subject actions without repeating the standalone breadcrumbs', () => {
    const add = vi.fn();
    const bulkAdd = vi.fn();
    const insights = vi.fn();
    render(
      <AcademicSetupEmbeddingProvider onFormStateChange={vi.fn()}>
        <SubjectPageHeader canAdd canView onAdd={add} onBulkAdd={bulkAdd} onInsights={insights} />
      </AcademicSetupEmbeddingProvider>
    );
    expect(screen.queryAllByText('Subject Creation')).toHaveLength(0);
    expect(screen.queryByText('Academics')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add subject' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bulk Add' }));
    fireEvent.click(screen.getByRole('button', { name: 'View full insights' }));
    expect(add).toHaveBeenCalledOnce();
    expect(bulkAdd).toHaveBeenCalledOnce();
    expect(insights).toHaveBeenCalledOnce();
  });

  it('keeps the standalone screen header outside the provider', () => {
    render(
      <SubjectPageHeader
        canAdd={false}
        canView={false}
        onAdd={vi.fn()}
        onBulkAdd={vi.fn()}
        onInsights={vi.fn()}
      />
    );
    expect(screen.getAllByText('Subject Creation')).toHaveLength(2);
    expect(screen.getByText('Academics')).toBeVisible();
  });

  it('retains the owning inline form close action', () => {
    const close = vi.fn();
    render(
      <AcademicSetupEmbeddingProvider onFormStateChange={vi.fn()}>
        <AcademicSetupManagerHeader
          heading="Create Rubric Template"
          links={[]}
          isBack
          onBack={close}
        />
      </AcademicSetupEmbeddingProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Back to settings' }));
    expect(close).toHaveBeenCalledOnce();
    expect(screen.getByText('Create Rubric Template')).toBeVisible();
  });

  it('reports actual form changes and clears the blocking state when the form unmounts', () => {
    const report = vi.fn();
    const view = render(
      <AcademicSetupEmbeddingProvider onFormStateChange={report}>
        <FormState />
      </AcademicSetupEmbeddingProvider>
    );
    expect(report).toHaveBeenLastCalledWith({ dirty: false, busy: false });
    fireEvent.click(screen.getByRole('button', { name: 'Embedded form' }));
    expect(report).toHaveBeenLastCalledWith({ dirty: true, busy: false });
    fireEvent.click(screen.getByRole('button', { name: 'Save form' }));
    expect(report).toHaveBeenLastCalledWith({ dirty: true, busy: true });
    view.rerender(
      <AcademicSetupEmbeddingProvider onFormStateChange={report}>
        <span>Closed</span>
      </AcademicSetupEmbeddingProvider>
    );
    expect(report).toHaveBeenLastCalledWith({ dirty: false, busy: false });
  });

  it('preserves permission-filtered actions in the embedded toolbar', () => {
    render(
      <AcademicSetupEmbeddingProvider onFormStateChange={vi.fn()}>
        <SubjectPageHeader
          canAdd={false}
          canView
          onAdd={vi.fn()}
          onBulkAdd={vi.fn()}
          onInsights={vi.fn()}
        />
      </AcademicSetupEmbeddingProvider>
    );
    expect(screen.queryByRole('button', { name: 'Add subject' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Bulk Add' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View full insights' })).toBeVisible();
  });
});
