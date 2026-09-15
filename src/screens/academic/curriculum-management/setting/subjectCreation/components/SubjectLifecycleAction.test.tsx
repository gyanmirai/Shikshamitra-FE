import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { SubjectLifecycleAction } from './SubjectLifecycleAction';

import type { ISubject } from '../type';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const subject: ISubject = {
  id: 'subject-id',
  name: 'Science',
  color: '#3366ff',
};

describe('SubjectLifecycleAction', () => {
  it('offers restore, not archive, when the backend status is Archived (2)', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onArchive = vi.fn();
    const onRestore = vi.fn().mockResolvedValue(true);

    render(
      <SubjectLifecycleAction
        canManage
        isRestoring={false}
        selectedSubject={{ ...subject, status: 2 }}
        onArchive={onArchive}
        onRestore={onRestore}
        onClose={onClose}
      />
    );

    expect(screen.queryByRole('button', { name: 'Archive Subject' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Restore Subject' }));

    await waitFor(() =>
      expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: 'subject-id' }))
    );
    expect(onArchive).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('offers archive for an active subject', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onArchive = vi.fn();

    render(
      <SubjectLifecycleAction
        canManage
        isRestoring={false}
        selectedSubject={{ ...subject, status: 0 }}
        onArchive={onArchive}
        onClose={onClose}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Archive Subject' }));

    expect(onArchive).toHaveBeenCalledWith(expect.objectContaining({ id: 'subject-id' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('keeps the drawer open when restore fails', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onRestore = vi.fn().mockResolvedValue(false);

    render(
      <SubjectLifecycleAction
        canManage
        isRestoring={false}
        selectedSubject={{ ...subject, status: 2 }}
        onRestore={onRestore}
        onClose={onClose}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Restore Subject' }));

    await waitFor(() => expect(onRestore).toHaveBeenCalledOnce());
    expect(onClose).not.toHaveBeenCalled();
  });
});
