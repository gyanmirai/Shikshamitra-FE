import { it, expect, describe } from 'vitest';
import { render } from '@testing-library/react';

import UploadButton from './index';

describe('UploadButton', () => {
  it('passes file constraints to the hidden file input', () => {
    const { container } = render(<UploadButton accept=".csv">Import</UploadButton>);

    const input = container.querySelector('input[type="file"]');

    expect(input).not.toBeNull();
    expect(input).toHaveAttribute('accept', '.csv');
  });
});
