import { addIcon } from '@iconify/react';
import { GlobalIcons } from 'src/utils/icons';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import CustomUpload from './index';

[...Object.values(GlobalIcons), 'eva:cloud-upload-fill'].forEach((icon) => {
  addIcon(icon, { body: '<path />' });
});

const file = new File(['Subject Name'], 'subjects.csv', { type: 'text/csv' });
const message = 'Missing required columns: Category.';
const theme = createTheme(defaultSettings);
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('document upload error feedback', () => {
  it.each([undefined, file])('shows one accessible error with selected value %s', (value) => {
    const { rerender, container } = render(
      <CustomUpload<false>
        multiple={false}
        value={value}
        onChange={vi.fn()}
        error={message}
        dragProps={{ 'aria-describedby': 'upload-guidance' }}
      />,
      { wrapper }
    );
    const error = screen.getByRole('alert');
    expect(error).toBeVisible();
    expect(error).toHaveTextContent(message);
    expect(screen.getAllByText(message)).toHaveLength(1);
    const dropzone = screen.getByRole('button', { name: 'Upload Files' });
    expect(container.querySelector('input[type="file"]')).toHaveAttribute('aria-invalid', 'true');
    expect(dropzone).toHaveAttribute('aria-describedby', `upload-guidance ${error.id}`);
    if (value) expect(screen.getByText(file.name)).toBeVisible();

    rerender(<CustomUpload<false> multiple={false} value={file} onChange={vi.fn()} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByText(file.name)).toBeVisible();
  });

  it('keeps errors visible for a nonempty multiple-file list with a hidden dropzone', () => {
    render(<CustomUpload value={[file]} hideDropzone onChange={vi.fn()} error={message} />, {
      wrapper,
    });
    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.getByText(file.name)).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Upload Files' })).not.toBeInTheDocument();
  });
});

describe('document upload size limits', () => {
  it.each([false, true] as const)('uses a supplied size limit in multiple=%s mode', (multiple) => {
    const onChange = vi.fn();
    const onReject = vi.fn();
    render(
      <CustomUpload
        multiple={multiple}
        maxFileSizeMb={10}
        onChange={onChange}
        onReject={onReject}
      />,
      { wrapper }
    );
    const accepted = new File([new Uint8Array(10 * 1024 * 1024)], 'accepted.pdf', {
      type: 'application/pdf',
    });
    const oversized = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'oversized.pdf', {
      type: 'application/pdf',
    });
    const dropzone = screen.getByRole('button', { name: 'Upload Files' });
    fireEvent.drop(dropzone, { dataTransfer: { files: [accepted] } });
    const selection = onChange.mock.calls.at(-1)?.[0];
    expect((multiple ? selection?.[0] : selection) === accepted).toBe(true);
    onChange.mockClear();
    fireEvent.drop(dropzone, { dataTransfer: { files: [oversized] } });
    expect(onReject).toHaveBeenCalledWith('File exceeds the 10 MB size limit.');
    if (multiple) expect(onChange).toHaveBeenLastCalledWith([]);
    else expect(onChange).not.toHaveBeenCalled();
  });

  it('retains the default 5 MB cap when no override is supplied', () => {
    const onChange = vi.fn();
    const onReject = vi.fn();
    render(<CustomUpload<false> multiple={false} onChange={onChange} onReject={onReject} />, {
      wrapper,
    });
    fireEvent.drop(screen.getByRole('button', { name: 'Upload Files' }), {
      dataTransfer: {
        files: [new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.pdf')],
      },
    });
    expect(onReject).toHaveBeenCalledWith('File exceeds the 5 MB size limit.');
    expect(onChange).not.toHaveBeenCalled();
  });
});
