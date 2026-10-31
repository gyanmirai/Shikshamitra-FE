import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import ConcessionTypeDrawer from './ConcessionTypeDrawer';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./ConcessionTypeForm', () => ({
  default: ({ onBusyChange }: { onBusyChange: (busy: boolean) => void }) => (
    <button type="button" onClick={() => onBusyChange(true)}>
      Simulate saving
    </button>
  ),
}));

const open = {
  value: true,
  onTrue: vi.fn(),
  onFalse: vi.fn(),
  onToggle: vi.fn(),
  setValue: vi.fn(),
};

describe('Concession Type drawer sessions', () => {
  it('routes the create header close through the owning guarded close callback', () => {
    const onClose = vi.fn();
    render(<ConcessionTypeDrawer open={open} editData={null} onClose={onClose} />);
    expect(screen.getByRole('dialog', { name: 'Add Concession Type' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close Add Concession Type' }));
    expect(onClose).toHaveBeenCalledWith(null, false);
  });

  it('locks dismissal during saving and starts the next create session unlocked', () => {
    const onClose = vi.fn();
    const onBusyChange = vi.fn();
    const view = render(
      <ConcessionTypeDrawer
        open={open}
        editData={{ id: 'saved', name: 'Sibling' }}
        onClose={onClose}
        onBusyChange={onBusyChange}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Simulate saving' }));
    expect(onBusyChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole('button', { name: 'Close Edit Concession Type' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    view.rerender(
      <ConcessionTypeDrawer open={{ ...open, value: false }} editData={null} onClose={onClose} />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    view.rerender(<ConcessionTypeDrawer open={open} editData={null} onClose={onClose} />);
    expect(screen.getByRole('button', { name: 'Close Add Concession Type' })).toBeEnabled();
  });
});
