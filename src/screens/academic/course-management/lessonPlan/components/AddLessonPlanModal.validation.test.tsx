import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import {
  progressUrl,
  renderProgressModal,
  prepareProgressNetwork,
} from './lesson-plan-progress-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
beforeEach(async () => {
  await prepareProgressNetwork();
  mswServer.use(
    http.get(progressUrl, () => HttpResponse.json({ minimumCompletionPercentage: 30 }))
  );
});

describe('lesson plan descriptive field limits', () => {
  it.each([
    ['Draft', 'Topic *', 'topic', 256],
    ['Submit', 'Topic *', 'topic', 256],
    ['Draft', 'Learning Objective', 'learningObjective', 1024],
    ['Submit', 'Learning Objective', 'learningObjective', 1024],
    ['Draft', 'Resources Required', 'resourcesRequired', 512],
    ['Submit', 'Resources Required', 'resourcesRequired', 512],
  ] as const)('blocks %s when %s contains oversized data', async (action, label, field, limit) => {
    const onSave = vi.fn();
    renderProgressModal({ onSave });
    await waitFor(() => expect(screen.getByRole('button', { name: action })).toBeEnabled());
    const input = screen.getByRole('textbox', { name: label });
    expect(input).toHaveAttribute('maxlength', String(limit));
    // Programmatic/preloaded values can bypass native maxLength; save validation must still protect the API.
    fireEvent.change(input, { target: { value: 'x'.repeat(limit + 1) } });
    fireEvent.click(screen.getByRole('button', { name: action }));
    expect(onSave).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      expect.stringContaining(`${limit} characters or fewer`)
    );
    expect(input).toHaveFocus();
    expect(input).toHaveValue('x'.repeat(limit + 1));
    fireEvent.change(input, { target: { value: 'x'.repeat(limit) } });
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByText(`${limit}/${limit}`)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: action }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ [field]: 'x'.repeat(limit) }),
      action === 'Submit'
    );
  });

  it('allows both descriptions at their exact limits in the same draft', async () => {
    const onSave = vi.fn();
    renderProgressModal({ onSave });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Draft' })).toBeEnabled());
    fireEvent.change(screen.getByRole('textbox', { name: 'Learning Objective' }), {
      target: { value: 'a'.repeat(1024) },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Resources Required' }), {
      target: { value: 'b'.repeat(512) },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Draft' }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        learningObjective: 'a'.repeat(1024),
        resourcesRequired: 'b'.repeat(512),
      }),
      false
    );
  });
});
