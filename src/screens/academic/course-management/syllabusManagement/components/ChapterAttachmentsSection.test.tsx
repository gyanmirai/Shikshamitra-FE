import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { ChapterAttachmentsSection } from './ChapterAttachmentsSection';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

describe('ChapterAttachmentsSection', () => {
  const theme = createTheme(defaultSettings);
  const renderSection = (component: React.ReactNode) =>
    render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);

  it('separates upload and view areas when there are no attachments', () => {
    renderSection(
      <ChapterAttachmentsSection documents={[]} onChange={vi.fn()} onPreview={vi.fn()} />
    );

    expect(screen.getByRole('heading', { name: 'Attachments' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Attachments information' })).toBeInTheDocument();
    expect(
      screen.queryByText('Add supporting files and review everything attached to this chapter.')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Upload files' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'View attachments' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Drop files here or browse' })).toBeInTheDocument();
    expect(screen.getByText('No files attached yet')).toBeInTheDocument();
  });

  it('shows attachment actions in the view area', () => {
    const onChange = vi.fn();
    const onPreview = vi.fn();
    const document = {
      name: 'chapter-notes.pdf',
      filePath: 'data:application/pdf;base64,example',
      url: 'data:application/pdf;base64,example',
      type: 'application/pdf',
      size: 1024,
    };

    renderSection(
      <ChapterAttachmentsSection documents={[document]} onChange={onChange} onPreview={onPreview} />
    );

    expect(screen.getByText('1 file attached')).toBeInTheDocument();
    expect(screen.getByText('chapter-notes.pdf')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Preview chapter-notes.pdf' }));
    expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({ name: 'chapter-notes.pdf' }));

    fireEvent.click(screen.getByRole('button', { name: 'Remove chapter-notes.pdf' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
