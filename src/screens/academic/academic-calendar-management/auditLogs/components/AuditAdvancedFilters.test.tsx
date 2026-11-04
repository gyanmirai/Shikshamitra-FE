import { vi, it, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';

import AuditAdvancedFilters from './AuditAdvancedFilters';
import { EMPTY_FILTERS } from '../constants/auditLogs.constants';

describe('advanced audit filter drafts', () => {
  it('does not apply changes when Cancel is selected', () => {
    const apply = vi.fn();
    const close = vi.fn();
    renderWithProviders(
      <AuditAdvancedFilters filters={EMPTY_FILTERS} onApply={apply} onClose={close} />
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Entity ID' }), {
      target: { value: 'record-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^Cancel$/ }));
    expect(close).toHaveBeenCalledOnce();
    expect(apply).not.toHaveBeenCalled();
  });
  it('applies the complete draft only after Apply filters', () => {
    const apply = vi.fn();
    renderWithProviders(
      <AuditAdvancedFilters filters={EMPTY_FILTERS} onApply={apply} onClose={() => {}} />
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Entity ID' }), {
      target: { value: 'record-1' },
    });
    expect(apply).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(apply).toHaveBeenCalledWith({ ...EMPTY_FILTERS, entityId: 'record-1' });
  });
});
