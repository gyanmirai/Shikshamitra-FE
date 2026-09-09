import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import {
  prefill,
  progressUrl,
  progressContext,
  renderProgressModal,
  prepareProgressNetwork,
} from './lesson-plan-progress-test-fixture';

import type { LessonPlanRow } from '../lessonPlanData';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
beforeEach(prepareProgressNetwork);

describe('lesson-plan completion minimum', () => {
  it.each(['Draft', 'Submit'])(
    'prevents regression and saves the visible minimum via %s',
    async (action) => {
      mswServer.use(
        http.get(progressUrl, ({ request }) => {
          expect(Object.fromEntries(new URL(request.url).searchParams)).toEqual(progressContext);
          return HttpResponse.json({ minimumCompletionPercentage: 30 });
        })
      );
      const onSave = vi.fn();
      const { unmount } = renderProgressModal({ onSave });
      await waitFor(() => expect(screen.getByRole('button', { name: action })).toBeEnabled());
      const slider = screen.getByRole('slider', { name: 'Target Chapter Completion' });
      expect(slider).toHaveAttribute('min', '30');
      expect(slider).toHaveValue('30');
      fireEvent.change(slider, { target: { value: '20' } });
      expect(slider).toHaveValue('30');
      fireEvent.click(screen.getByRole('button', { name: action }));
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ plannedCompletionPercentage: 30 }),
        action === 'Submit'
      );
      unmount();
    }
  );

  it('keeps a higher target when the topic changes and refreshes the minimum on chapter changes', async () => {
    mswServer.use(
      http.get(progressUrl, ({ request }) =>
        HttpResponse.json({
          minimumCompletionPercentage:
            new URL(request.url).searchParams.get('chapterId') === 'chapter-one' ? 30 : 0,
        })
      )
    );
    const { unmount } = renderProgressModal();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Draft' })).toBeEnabled());
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '40' } });
    fireEvent.change(screen.getByLabelText('Topic *'), { target: { value: 'A different topic' } });
    fireEvent.blur(screen.getByLabelText('Topic *'));
    expect(slider).toHaveValue('40');
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Chapter *' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Core Maths TWO' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Draft' })).toBeEnabled());
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveValue('0');
    unmount();
  });

  it('raises an existing draft target to a non-step-aligned recorded minimum', async () => {
    mswServer.use(
      http.get(progressUrl, () => HttpResponse.json({ minimumCompletionPercentage: 33 }))
    );
    const onSave = vi.fn();
    const { unmount } = renderProgressModal({
      onSave,
      editData: {
        ...prefill,
        id: 'existing-plan',
        plannedDate: '2026-09-09',
        plannedCompletionPercentage: 20,
      } as unknown as LessonPlanRow,
    });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Draft' })).toBeEnabled());
    expect(screen.getByRole('slider')).toHaveAttribute('min', '33');
    fireEvent.click(screen.getByRole('button', { name: 'Draft' }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ plannedCompletionPercentage: 33 }),
      false
    );
    unmount();
  });

  it('keeps a fully completed chapter fixed at 100%', async () => {
    mswServer.use(
      http.get(progressUrl, () => HttpResponse.json({ minimumCompletionPercentage: 100 }))
    );
    const onSave = vi.fn();
    const { unmount } = renderProgressModal({ onSave });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Chapter completed' })).toHaveAttribute(
      'aria-valuenow',
      '100'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ plannedCompletionPercentage: 100 }),
      true
    );
    unmount();
  });
});
