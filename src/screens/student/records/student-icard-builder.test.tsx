import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { expect, it, vi } from 'vitest';

import StudentICardBuilder from './student-icard-builder';

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  toast: vi.fn(),
  template: {
    // Older template responses can omit name even though the current API type requires it.
    presetKey: 'formal-student', orientation: 'Horizontal', schoolName: 'School', schoolAddress: '',
    headerText: 'Student Identity Card', footerText: '', primaryColor: '#00897B',
    backgroundColor: '#FFFFFF', cardsPerPage: 8, showQrCode: false, showPhoto: true,
    fields: ['StudentName'],
  },
}));

vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: mocks.toast } }));
vi.mock('src/components/custom-stepper', () => ({ default: () => <div /> }));
vi.mock('src/components/custom-select', () => ({ default: () => <div /> }));
vi.mock('src/components/customizabaleTable', () => ({ default: () => <div /> }));
vi.mock('src/redux/student/records/student-records-api', () => ({
  useGetStudentRecordsDirectoryOptionsQuery: () => ({ currentData: {}, isFetching: false }),
  useGetStudentRecordsDirectoryQuery: () => ({ currentData: { items: [], totalCount: 0 }, isFetching: false }),
}));
vi.mock('src/redux/student/records/student-record-documents-api', () => ({
  useGetRecordIdTemplateQuery: () => ({
    currentData: mocks.template,
    isError: false,
  }),
  useSaveRecordIdTemplateMutation: () => [mocks.save, { isLoading: false }],
  usePreviewRecordIdsMutation: () => [vi.fn(), { isLoading: false }],
  useExportRecordIdsMutation: () => [vi.fn(), { isLoading: false }],
  useIssueRecordIdsMutation: () => [vi.fn(), { isLoading: false }],
}));

it('shows a required field error instead of crashing when a template has no name', async () => {
  render(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder onClose={vi.fn()} /></ThemeProvider>);

  expect(await screen.findByRole('textbox', { name: /Template name/ })).toHaveValue('');
  expect(screen.getByText('Name this design so you can find and reuse it.')).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: 'Next' }));

  expect(screen.getByText('Template name is required.')).toBeVisible();
  expect(mocks.save).not.toHaveBeenCalled();
});

it('retains the entered name when the save response omits it', async () => {
  mocks.save.mockReturnValue({ unwrap: async () => mocks.template });
  render(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder onClose={vi.fn()} /></ThemeProvider>);

  fireEvent.change(await screen.findByRole('textbox', { name: /Template name/ }), {
    target: { value: 'QA Student I-Card' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByRole('textbox', { name: 'School name' })).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: 'Save template' }));
  await waitFor(() => expect(mocks.toast).toHaveBeenCalled());
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));

  expect(await screen.findByRole('textbox', { name: /Template name/ })).toHaveValue('QA Student I-Card');
});
