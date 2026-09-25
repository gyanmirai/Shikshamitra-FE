import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import ChapterImportPreview from './ChapterImportPreview';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('ChapterImportPreview', () => {
  it('shows uploaded rows and their validation results', () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ChapterImportPreview
          fileName="chapters.xlsx"
          rows={[
            {
              rowNumber: 2,
              chapterNo: '1',
              chapterName: 'Numbers',
              startDate: '2026-09-23',
              endDate: '2026-09-30',
              description: 'Counting basics',
              errors: [],
            },
            {
              rowNumber: 3,
              chapterNo: '1',
              chapterName: 'Shapes',
              startDate: 'invalid',
              endDate: '2026-10-08',
              description: '',
              errors: [
                'Chapter Number 1 is duplicated in this file',
                'Start Date must use YYYY-MM-DD',
              ],
            },
          ]}
        />
      </ThemeProvider>
    );

    expect(
      screen.getByRole('table', { name: 'Chapter import preview for chapters.xlsx' })
    ).toBeVisible();
    expect(screen.getByText('1 ready')).toBeVisible();
    expect(screen.getByText('1 need correction')).toBeVisible();
    expect(screen.getByText('Numbers')).toBeVisible();
    expect(screen.getByText(/duplicated in this file/)).toBeVisible();
    expect(screen.getByText(/upload the file again/i)).toBeVisible();

    const dataRows = screen.getAllByRole('row').slice(1);
    expect(within(dataRows[0]).getAllByRole('cell')[0]).toHaveTextContent('1');
    expect(within(dataRows[1]).getAllByRole('cell')[0]).toHaveTextContent('2');
  });
});
