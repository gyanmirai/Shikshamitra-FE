import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { FormPrerequisiteState } from './index';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));

describe('FormPrerequisiteState', () => {
  it('shows an accessible message and a setup link without submitting or replacing the current form', () => {
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const refresh = vi.fn();
    render(
      <form onSubmit={submit}>
        <FormPrerequisiteState
          title="Add fee heads to get started"
          description="Create a fee head, then return to this policy."
          actions={[{ label: 'Add fee head', href: '/finance/settings/fee-category' }]}
          onRefresh={refresh}
        />
      </form>
    );
    const link = screen.getByRole('link', { name: 'Add fee head' });
    expect(link).toHaveAttribute('href', '/finance/settings/fee-category');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    fireEvent.click(screen.getByRole('button', { name: 'Refresh options' }));
    expect(refresh).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Add fee heads to get started' })).toBeVisible();
  });

  it('explains how to proceed when the user has no permitted setup action', () => {
    render(
      <FormPrerequisiteState
        title="Fee heads required"
        description="Add a fee head first."
        actions={[]}
      />
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(/Ask your administrator/)).toBeVisible();
  });
});
