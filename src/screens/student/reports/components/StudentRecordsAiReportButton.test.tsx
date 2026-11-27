import fs from 'node:fs';
import path from 'node:path';
import { vi, it, expect, describe } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { StudentRecordsAiReportButton } from './StudentRecordsAiReportButton';

const auth = vi.hoisted(() => ({ permissions: [] as { name: string; isGranted: boolean }[] }));
const resetWorkflow = vi.hoisted(() => vi.fn());

vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      auth,
      globalState: {
        currentYear: { id: 'year' },
        currentBoard: { id: 'board' },
        currentMedium: { id: 'medium' },
      },
    }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/screens/academic/curriculum-management/reports/hooks/useAiCurriculumReport', () => ({
  useAiCurriculumReport: () => ({
    stage: 'idle',
    questions: [],
    reset: resetWorkflow,
    planReport: vi.fn(),
  }),
}));

const source = fs.readFileSync(path.join(__dirname, 'StudentRecordsAiReportButton.tsx'), 'utf8');
const screenSource = fs.readFileSync(path.resolve(__dirname, '../index.tsx'), 'utf8');

describe('StudentRecordsAiReportButton', () => {
  it('mounts the shared workspace in Student Records mode', () => {
    expect(source).toContain('module="Student Records"');
    expect(source).toContain('open={workspace.value && canGenerate}');
    expect(source).toContain('onClick={workspace.onTrue}');
    expect(screenSource).toContain('<StudentRecordsAiReportButton />');
  });

  it('preserves a typed prompt until explicit discard', async () => {
    resetWorkflow.mockClear();
    auth.permissions = [{ name: 'Students.Records.Reports.Add', isGranted: true }];
    render(<StudentRecordsAiReportButton />);

    fireEvent.click(screen.getByRole('button', { name: 'Generate with AI' }));
    await act(async () => {
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'Class 8 student records' },
      });
    });
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByRole('textbox')).toHaveValue('Class 8 student records');

    const prompt = screen.getByRole('textbox');
    fireEvent.keyDown(prompt, { key: 'Escape' });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    });
    expect(prompt).toHaveValue('Class 8 student records');
    expect(resetWorkflow).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Generate with AI' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(resetWorkflow).toHaveBeenCalledOnce();
  });

  it('clears a discarded request once when the drawer reopens during exit', async () => {
    resetWorkflow.mockClear();
    auth.permissions = [{ name: 'Students.Records.Reports.Add', isGranted: true }];
    render(<StudentRecordsAiReportButton />);
    const opener = screen.getByRole('button', { name: 'Generate with AI' });

    fireEvent.click(opener);
    await act(async () => {
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Previous student report' } });
    });
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(resetWorkflow).not.toHaveBeenCalled();

    fireEvent.click(opener);
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(resetWorkflow).toHaveBeenCalledOnce();
  });

  it('keeps generation disabled with a View-only grant', () => {
    auth.permissions = [{ name: 'Students.Records.Reports.View', isGranted: true }];
    render(<StudentRecordsAiReportButton />);

    expect(screen.getByRole('button', { name: 'Generate with AI' })).toBeDisabled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
