import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { progressUrl, renderProgressModal } from './lesson-plan-progress-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

beforeEach(() => {
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/academic/curriculum/chapters', () =>
      HttpResponse.json([{ id: 'chapter-one', chapterName: 'Core Maths ONE' }])
    ),
    http.get(progressUrl, () => HttpResponse.json({ minimumCompletionPercentage: 0 }))
  );
});

describe('add lesson plan presentation', () => {
  it('removes quick templates and renders the complete timetable context as information', async () => {
    renderProgressModal();

    await waitFor(() => expect(screen.getByRole('button', { name: 'Draft' })).toBeEnabled());
    expect(screen.queryByText('Quick Template')).not.toBeInTheDocument();

    const context = screen.getByLabelText('Selected schedule context');
    expect(within(context).getAllByText('Teacher')).toHaveLength(2);
    expect(within(context).getByText('09 Sep 2026')).toBeVisible();
    expect(within(context).getByText('Period 4')).toBeVisible();
    expect(within(context).getByText('Class 12')).toBeVisible();
    expect(within(context).getByText('B')).toBeVisible();
    expect(within(context).getByText('Core Mathematics')).toBeVisible();
    expect(screen.queryByRole('combobox', { name: 'Teacher *' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Period / Time *' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Class *' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Division *' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Subject *' })).not.toBeInTheDocument();
  });

  it('removes teaching method while preserving the compatible saved value', async () => {
    const onSave = vi.fn();
    renderProgressModal({ onSave });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Draft' })).toBeEnabled());
    expect(screen.queryByRole('combobox', { name: 'Teaching Methods' })).not.toBeInTheDocument();
    expect(screen.queryByText('Teaching Method')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Draft' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        teachingMethod: 'ExplanationBoardWork',
      }),
      false
    );
  });

  it.each([
    ['Draft', 'Submit'],
    ['Submit', 'Draft'],
  ])('shows progress only on the selected %s action', async (activeLabel, siblingLabel) => {
    let finishSave: () => void = () => {};
    const onSave = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishSave = resolve;
        })
    );
    renderProgressModal({ onSave });

    const activeButton = await screen.findByRole('button', { name: activeLabel });
    const siblingButton = screen.getByRole('button', { name: siblingLabel });
    await waitFor(() => expect(activeButton).toBeEnabled());

    fireEvent.click(activeButton);

    await waitFor(() => expect(within(activeButton).getByRole('progressbar')).toBeVisible());
    expect(within(siblingButton).queryByRole('progressbar')).not.toBeInTheDocument();
    expect(siblingButton).toBeDisabled();

    await act(async () => finishSave());
  });
});
