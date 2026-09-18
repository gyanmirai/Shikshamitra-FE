import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { WorkflowBuilderPageState } from './components/workflow-builder-page-state';

describe('WorkflowBuilderPageState', () => {
  it('keeps the workflow context visible while the builder loads', () => {
    render(<WorkflowBuilderPageState state="loading" />);

    expect(screen.getByRole('heading', { name: 'Workflow Builder' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading workflow builder' })).toBeInTheDocument();
  });

  it('keeps the workflow context and offers retry after a load failure', () => {
    const onRetry = vi.fn();
    render(<WorkflowBuilderPageState state="error" onRetry={onRetry} />);

    expect(screen.getByRole('heading', { name: 'Workflow Builder' })).toBeInTheDocument();
    expect(screen.getByText('Unable to load this enrollment data.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
