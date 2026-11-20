import { it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { PolicyRowActions } from './PolicyRowActions';
import { manualPolicy, manualPolicyWrapper } from './manual-policy.fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
it.each([0, 1] as const)(
  'uses mode%s to distinguish manual publishing from automatic calendar readiness',
  (mode) => {
    const onLifecycle = vi.fn();
    const item = { ...manualPolicy, terms: { ...manualPolicy.terms, dueDateMode: mode } };
    render(
      <PolicyRowActions
        item={item}
        canEdit
        canPublish={false}
        canManage={() => true}
        onOpen={vi.fn()}
        onLifecycle={onLifecycle}
      />,
      { wrapper: manualPolicyWrapper() }
    );
    fireEvent.click(
      screen.getByRole('button', { name: `More actions for ${item.name} version 1` })
    );
    const publish = screen.getByRole('menuitem', { name: `Publish ${item.name} version 1` });
    if (mode === 0) {
      expect(publish).not.toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(publish);
      expect(onLifecycle).toHaveBeenCalledWith(item, 'publish');
    } else {
      expect(publish).toHaveAttribute('aria-disabled', 'true');
      expect(onLifecycle).not.toHaveBeenCalled();
    }
  }
);
