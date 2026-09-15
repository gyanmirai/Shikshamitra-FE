import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from 'src/test/test-utils';

import { AiReportClarification } from './AiReportClarification';

const questions = [
  {
    id: 'format',
    question: 'Which output format should be used?',
    options: ['PDF', 'Excel'],
    recommendedOption: 'Excel',
  },
];

describe('AiReportClarification', () => {
  it('offers quick choices and submits the selected answer', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<AiReportClarification questions={questions} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'PDF' }));
    await user.click(screen.getByRole('button', { name: 'Continue planning' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith([
        { question: 'Which output format should be used?', answer: 'PDF' },
      ]);
    });
  });

  it('uses the recommended option when the user accepts the default', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<AiReportClarification questions={questions} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Continue planning' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith([
        { question: 'Which output format should be used?', answer: 'Excel' },
      ]);
    });
  });
});
