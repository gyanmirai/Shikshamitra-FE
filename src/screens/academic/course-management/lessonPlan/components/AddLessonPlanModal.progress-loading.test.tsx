import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { academicType } from 'src/redux/tagTypes';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, screen, waitFor, fireEvent } from '@testing-library/react';

import {
  progressUrl,
  renderProgressModal,
  prepareProgressNetwork,
} from './lesson-plan-progress-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
beforeEach(prepareProgressNetwork);

describe('recorded chapter progress loading', () => {
  it('blocks both save paths until the recorded progress is available', async () => {
    let release: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    mswServer.use(
      http.get(progressUrl, async () => {
        await pending;
        return HttpResponse.json({ minimumCompletionPercentage: 30 });
      })
    );
    const onSave = vi.fn();
    const { unmount } = renderProgressModal({ onSave });
    expect(
      await screen.findByRole('progressbar', { name: 'Loading recorded chapter progress' })
    ).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Draft' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSave).not.toHaveBeenCalled();
    release();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Draft' })).toBeEnabled());
    expect(screen.getByRole('slider')).toHaveValue('30');
    unmount();
  });

  it('does not use another chapter cached value after a failed lookup and supports retry', async () => {
    let failed = false;
    mswServer.use(
      http.get(progressUrl, ({ request }) => {
        if (new URL(request.url).searchParams.get('chapterId') === 'chapter-one') {
          return HttpResponse.json({ minimumCompletionPercentage: 30 });
        }
        if (!failed) {
          failed = true;
          return HttpResponse.json({ detail: 'Progress lookup unavailable' }, { status: 500 });
        }
        return HttpResponse.json({ minimumCompletionPercentage: 60 });
      })
    );
    const { unmount } = renderProgressModal();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Draft' })).toBeEnabled());
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Chapter *' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Core Maths TWO' }));
    expect(
      await screen.findByText('Unable to load recorded chapter progress. Please retry.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Draft' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Draft' })).toBeEnabled());
    expect(screen.getByRole('slider')).toHaveAttribute('min', '60');
    expect(screen.getByRole('slider')).toHaveValue('60');
    unmount();
  });

  it('raises the target if newly recorded diary progress invalidates the cached minimum', async () => {
    let progress = 30;
    mswServer.use(
      http.get(progressUrl, () => HttpResponse.json({ minimumCompletionPercentage: progress }))
    );
    const onSave = vi.fn();
    const { unmount, store } = renderProgressModal({ onSave });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Draft' })).toBeEnabled());
    fireEvent.change(screen.getByRole('slider'), { target: { value: '40' } });
    progress = 60;
    act(() => {
      store.dispatch(api.util.invalidateTags([academicType.teacherDiary]));
    });
    await waitFor(() => expect(screen.getByRole('slider')).toHaveAttribute('min', '60'));
    fireEvent.click(screen.getByRole('button', { name: 'Draft' }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ plannedCompletionPercentage: 60 }),
      false
    );
    unmount();
  });
});
