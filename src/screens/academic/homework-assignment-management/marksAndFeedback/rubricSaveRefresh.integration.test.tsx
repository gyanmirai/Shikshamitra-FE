import { vi, it, expect, describe } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { setupRubricScoringTest } from './rubricScoringTestFixture';

vi.hoisted(() => vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4194'));
vi.mock('src/components/iconify', async (importOriginal) => ({
  ...await importOriginal<typeof import('src/components/iconify')>(), Iconify: () => null,
}));

describe.each(['homework', 'assignment'] as const)('%s rubric save refresh', mode => {
  it.each([false, true])('refreshes once after the save chain, including partial failure=%s', async failSubmit => {
    const { writes, evaluationReads } = setupRubricScoringTest(mode, RubricScoringModel.PointsBased, failSubmit);
    const fields = await screen.findAllByRole('spinbutton', { name: /Points earned/ });
    fireEvent.change(fields[0], { target: { value: '8' } });
    fireEvent.change(fields[1], { target: { value: '10' } });
    await waitFor(() => expect(evaluationReads).toHaveLength(1));
    fireEvent.click(screen.getByRole('button', { name: 'Save evaluation' }));
    await screen.findByText(failSubmit ? 'Rejected' : 'Saved');
    await waitFor(() => expect(evaluationReads.length).toBeGreaterThan(1));
    expect(writes).toHaveLength(1);
    expect(evaluationReads).toHaveLength(2);
    if (!failSubmit) expect(screen.getAllByRole('spinbutton')[0]).toBeDisabled();
  });
});
