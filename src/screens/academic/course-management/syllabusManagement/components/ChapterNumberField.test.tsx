import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ChapterNumberField } from './ChapterNumberField';
import { CHAPTER_NUMBER_RANGE_MESSAGE } from '../chapterNumber';

describe('ChapterNumberField', () => {
  it('exposes the chapter number bounds to the browser', () => {
    render(<ChapterNumberField value="" onChange={vi.fn()} onBlur={vi.fn()} />);

    const input = screen.getByRole('spinbutton', { name: /Chapter Number/ });
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('max', '1000');
    expect(input).toHaveAttribute('step', '1');
  });

  it('renders a targeted inline validation error', () => {
    render(
      <ChapterNumberField
        value="111111"
        error={CHAPTER_NUMBER_RANGE_MESSAGE}
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />
    );

    expect(screen.getByText(CHAPTER_NUMBER_RANGE_MESSAGE)).toBeVisible();
  });
});
