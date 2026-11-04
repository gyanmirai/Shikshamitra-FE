import { vi, it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';
import { expectStudentErrorToast } from 'src/test/student-toast-test-fixture';

import { WorkflowBuilderPageState } from './components/workflow-builder-page-state';

// Decorative icons must not download assets during request-state tests.
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

describe('WorkflowBuilderPageState', () => {
  it('keeps the workflow context visible while the builder loads', () => {
    render(<WorkflowBuilderPageState state="loading" />);

    expect(screen.getByRole('heading', { name: 'Admission Stage' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading Workflow Builder' })).toBeInTheDocument();
  });

  it('keeps workflow context and announces a load failure through toast', async () => {
    const onRetry = vi.fn();
    render(<WorkflowBuilderPageState state="error" onRetry={onRetry} />);

    expect(screen.getByRole('heading', { name: 'Admission Stage' })).toBeInTheDocument();
    await expectStudentErrorToast('Unable to load this enrollment data.');
    expect(screen.queryByText('Unable to load this enrollment data.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(onRetry).not.toHaveBeenCalled();
  });
});
