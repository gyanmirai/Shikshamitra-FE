import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import GradeScaleDetailsDrawer from './gradeScaleDetailsDrawer';

import type { IGrade } from './type';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const scale: IGrade = {
  id: 'scale-one',
  name: 'Saved grade scale',
  totalMarks: 100,
  passMarks: 33,
  status: 0,
  isDefault: false,
  usageCount: 9,
  gradingScale: [
    { minMarks: 0, maxMarks: 32, grade: 'F', gradePoint: 0, resultStatus: 1 },
    { minMarks: 33, maxMarks: 40, grade: 'D', gradePoint: 4, resultStatus: 0 },
    { minMarks: 71, maxMarks: 80, grade: 'B+', gradePoint: 8, resultStatus: 0 },
    { minMarks: 91, maxMarks: 100, grade: 'A+', gradePoint: 10, resultStatus: 0 },
  ],
};

function renderDrawer(canEdit = true) {
  const onClose = vi.fn();
  const onEdit = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <GradeScaleDetailsDrawer
        open
        gradeScale={scale}
        canEdit={canEdit}
        onClose={onClose}
        onEdit={onEdit}
      />
    </ThemeProvider>
  );
  return { onClose, onEdit };
}

describe('grade scale details', () => {
  it('keeps the quick scores and zero-point failing grade connected to the saved ranges', () => {
    renderDrawer();
    const simulator = screen
      .getByRole('heading', { name: 'Grade Scaling Simulator' })
      .closest('section');
    expect(simulator).not.toBeNull();
    const result = within(simulator!);

    fireEvent.click(result.getByRole('button', { name: 'Min (0)' }));
    expect(result.getByText('F')).toBeInTheDocument();
    expect(result.getByText('Fail')).toBeInTheDocument();
    expect(result.getByText('0')).toBeInTheDocument();
    expect(result.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');

    fireEvent.click(result.getByRole('button', { name: 'Pass (33)' }));
    expect(result.getByText('D')).toBeInTheDocument();
    expect(result.getByText('Pass')).toBeInTheDocument();

    fireEvent.click(result.getByRole('button', { name: '75% (75)' }));
    expect(result.getByText('B+')).toBeInTheDocument();

    fireEvent.click(result.getByRole('button', { name: 'Max (100)' }));
    expect(result.getByText('A+')).toBeInTheDocument();
    expect(result.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('retains one permitted edit action and sends both close controls through the existing callback', () => {
    const { onClose, onEdit } = renderDrawer();
    expect(screen.getByRole('dialog', { name: scale.name })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close grade scale details' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('does not expose editing without permission', () => {
    renderDrawer(false);
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });
});
