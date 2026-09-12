import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { ChapterCompletionSlider } from './ChapterCompletionSlider';

describe('ChapterCompletionSlider', () => {
  it('keeps an absolute 0-100 scale while enforcing recorded progress', () => {
    const onChange = vi.fn();

    render(
      <ChapterCompletionSlider value={25} minimum={25} onRetry={vi.fn()} onChange={onChange} />
    );

    const slider = screen.getByRole('slider', { name: 'Target Chapter Completion' });
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
    expect(slider).toHaveValue('25');
    expect(slider.parentElement).toHaveStyle({ left: '25%' });
    expect(screen.getByText('0%')).toBeVisible();
    expect(screen.getByText('50%')).toBeVisible();
    expect(screen.getByText('100%')).toBeVisible();

    fireEvent.change(slider, { target: { value: '10' } });

    expect(onChange).toHaveBeenCalledWith(25);
  });
});
