import { vi, it, expect, describe } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { setupRubricScoringTest } from './rubricScoringTestFixture';

vi.hoisted(() => vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4194'));
vi.mock('src/components/iconify', async (importOriginal) => ({
  ...await importOriginal<typeof import('src/components/iconify')>(), Iconify: () => null,
}));

describe.each(['homework', 'assignment'] as const)('%s rubric scoring through RTK', (mode) => {
  it('saves earned points and restores the same total', async () => {
    const { writes, reload } = setupRubricScoringTest(mode, RubricScoringModel.PointsBased);
    const fields = await screen.findAllByRole('spinbutton', { name: /Points earned/ });
    fireEvent.change(fields[0], { target: { value: '8' } });
    fireEvent.change(fields[1], { target: { value: '10' } });
    expect(fields[0]).toHaveValue(8);
    expect(fields[1]).toHaveValue(10);
    fireEvent.click(screen.getByRole('button', { name: 'Save evaluation' }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0].totalMarks).toBe(18);
    reload();
    await waitFor(() => expect(screen.getByText('18')).toBeInTheDocument());
    expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(8);
  });

  it('converts achievement percentages into weighted contributions', async () => {
    const { writes, reload } = setupRubricScoringTest(mode, RubricScoringModel.WeightedPercentage);
    const fields = await screen.findAllByRole('spinbutton', { name: /Achievement %/ });
    fireEvent.change(fields[0], { target: { value: '80' } });
    fireEvent.change(fields[1], { target: { value: '85' } });
    expect(fields[0]).toHaveValue(80);
    expect(fields[1]).toHaveValue(85);
    fireEvent.click(screen.getByRole('button', { name: 'Save evaluation' }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0].scores.map(score => score.marks)).toEqual([40, 42.5]);
    reload();
    await waitFor(() => expect(screen.getByText('82.5')).toBeInTheDocument());
    expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(80);
  });

  it('rounds contributions before adding them, matching storage after reload', async () => {
    const { writes, reload } = setupRubricScoringTest(mode, RubricScoringModel.WeightedPercentage);
    const fields = await screen.findAllByRole('spinbutton', { name: /Achievement %/ });
    fields.forEach(field => fireEvent.change(field, { target: { value: '2.01' } }));
    fields.forEach(field => expect(field).toHaveValue(2.01));
    fireEvent.click(screen.getByRole('button', { name: 'Save evaluation' }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0].scores.map(score => score.marks)).toEqual([1.01, 1.01]);
    reload();
    await waitFor(() => expect(screen.getByText('2.02')).toBeInTheDocument());
  });

  it('requires explicit checklist decisions and stores checked and unchecked as 1 and 0', async () => {
    const { writes, reload } = setupRubricScoringTest(mode, RubricScoringModel.Checklist);
    const first = await screen.findByRole('checkbox', { name: 'Criterion 1: Met' });
    fireEvent.click(first);
    fireEvent.click(screen.getByRole('button', { name: 'Save evaluation' }));
    await screen.findByText('Rejected');
    expect(writes).toHaveLength(0);
    const second = screen.getByRole('checkbox', { name: 'Criterion 2: Met' });
    fireEvent.click(second); fireEvent.click(second);
    fireEvent.click(screen.getByRole('button', { name: 'Save evaluation' }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0].scores.map(score => score.marks)).toEqual([1, 0]);
    reload();
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Criterion 1: Met' })).toBeChecked());
    expect(screen.getByRole('checkbox', { name: 'Criterion 2: Met' })).not.toBeChecked();
  });


  it.each([RubricScoringModel.PerformanceLevels, RubricScoringModel.RatingScale])('saves and restores configured levels for model %s', async model => {
    const { writes, reload } = setupRubricScoringTest(mode, model);
    const unit = model === RubricScoringModel.RatingScale ? 'rating' : 'points';
    fireEvent.click(await screen.findByRole('button', { name: `Criterion 1: Excellent, 4 ${unit}` }));
    fireEvent.click(screen.getByRole('button', { name: `Criterion 2: Good, 3 ${unit}` }));
    expect(screen.getByRole('button', { name: `Criterion 1: Excellent, 4 ${unit}` })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: `Criterion 2: Good, 3 ${unit}` })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Save evaluation' }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0].scores.map(score => score.marks)).toEqual([4, 3]);
    reload();
    await waitFor(() => expect(screen.getByRole('button', { name: `Criterion 1: Excellent, 4 ${unit}` })).toHaveAttribute('aria-pressed', 'true'));
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it.each(['-1', '11', ''])('blocks invalid earned points %s before saving', async value => {
    const { writes } = setupRubricScoringTest(mode, RubricScoringModel.PointsBased);
    const fields = await screen.findAllByRole('spinbutton', { name: /Points earned/ });
    fireEvent.change(fields[0], { target: { value } });
    fireEvent.change(fields[1], { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save evaluation' }));
    await screen.findByText('Rejected');
    expect(writes).toHaveLength(0);
  });

  it.each(['-1', '101', '100.00001', ''])('blocks invalid achievement %s before saving', async value => {
    const { writes } = setupRubricScoringTest(mode, RubricScoringModel.WeightedPercentage);
    const fields = await screen.findAllByRole('spinbutton', { name: /Achievement %/ });
    fireEvent.change(fields[0], { target: { value } });
    fireEvent.change(fields[1], { target: { value: '85' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save evaluation' }));
    await screen.findByText('Rejected');
    expect(writes).toHaveLength(0);
  });
});
