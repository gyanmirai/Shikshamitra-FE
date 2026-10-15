import { useState } from 'react';
import { addIcon } from '@iconify/react';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { BannerUpload as CustomUpload } from './banner-upload';

addIcon('mdi:image-plus-outline', { body: '<path />' });

const image = new File(['banner'], 'school-banner.png', { type: 'image/png' });

function ControlledUpload({ disabled = false }: { disabled?: boolean }) {
  const [value, setValue] = useState<(File | string)[]>([]);
  return <CustomUpload variant="banner" value={value} onChange={setValue} disabled={disabled} />;
}

describe('banner upload', () => {
  it('selects, replaces and removes an image through the controlled value', async () => {
    const user = userEvent.setup();
    render(<ControlledUpload />);
    await user.upload(screen.getByLabelText('Choose banner image'), image);
    expect(await screen.findByAltText('Selected banner preview')).toHaveAttribute(
      'src',
      'data:image/png;base64,YmFubmVy'
    );
    expect(screen.getByText('school-banner.png')).toBeVisible();
    await user.upload(
      screen.getByLabelText('Choose banner image'),
      new File(['replacement'], 'replacement.jpg', { type: 'image/jpeg' })
    );
    expect(await screen.findByText('replacement.jpg')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Remove Banner' }));
    expect(screen.queryByAltText('Selected banner preview')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload Banner' })).toBeVisible();
  });

  it('rejects unsupported and oversized files while preserving an existing banner', async () => {
    const onChange = vi.fn();
    render(
      <CustomUpload
        variant="banner"
        value={['data:image/png;base64,YmFubmVy']}
        onChange={onChange}
      />
    );
    const input = screen.getByLabelText('Choose banner image');
    fireEvent.change(input, {
      target: { files: [new File(['pdf'], 'report.pdf', { type: 'application/pdf' })] },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Choose a JPG, PNG, or GIF image.');
    const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', {
      type: 'image/png',
    });
    fireEvent.change(input, { target: { files: [oversized] } });
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('smaller than 5 MB'));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByAltText('Selected banner preview')).toBeVisible();
  });

  it('reports multiple-file drops instead of replacing the current image', async () => {
    const onChange = vi.fn();
    render(<CustomUpload variant="banner" onChange={onChange} />);
    fireEvent.drop(screen.getByRole('presentation'), {
      dataTransfer: {
        files: [image, image],
        types: ['Files'],
        items: [image, image].map((file) => ({
          kind: 'file',
          type: file.type,
          getAsFile: () => file,
        })),
      },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('one banner image at a time');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('locks selection while reading and when disabled', async () => {
    const onBusyChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<CustomUpload variant="banner" onBusyChange={onBusyChange} />);
    await user.upload(screen.getByLabelText('Choose banner image'), image);
    await waitFor(() => expect(onBusyChange).toHaveBeenLastCalledWith(false));
    expect(onBusyChange).toHaveBeenCalledWith(true);
    rerender(<CustomUpload variant="banner" disabled value={['data:image/png;base64,YmFubmVy']} />);
    expect(screen.getByRole('button', { name: 'Replace Banner' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove Banner' })).toBeDisabled();
    expect(screen.getByLabelText('Choose banner image')).toBeDisabled();
  });

  it('shows a read error, keeps the current banner and allows retry', async () => {
    const onChange = vi.fn();
    const reader = vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function fail(
      this: FileReader
    ) {
      queueMicrotask(() => this.dispatchEvent(new ProgressEvent('error')));
    });
    render(
      <CustomUpload
        variant="banner"
        value={['data:image/png;base64,YmFubmVy']}
        onChange={onChange}
      />
    );
    const user = userEvent.setup();
    try {
      await user.upload(screen.getByLabelText('Choose banner image'), image);
      expect(await screen.findByRole('alert')).toHaveTextContent('Unable to read this image');
      expect(screen.getByAltText('Selected banner preview')).toHaveAttribute(
        'src',
        'data:image/png;base64,YmFubmVy'
      );
      expect(onChange).not.toHaveBeenCalled();
    } finally {
      reader.mockRestore();
    }
    await user.upload(
      screen.getByLabelText('Choose banner image'),
      new File(['retry'], 'retry.png', { type: 'image/png' })
    );
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['data:image/png;base64,cmV0cnk=']));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
