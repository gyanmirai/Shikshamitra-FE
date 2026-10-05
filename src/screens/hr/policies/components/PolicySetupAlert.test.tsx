import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PolicySetupAlert } from './PolicySetupAlert';

describe('policy setup recovery', () => {
  it.each(['unknown', 'ready'] as const)('does not warn for %s', (state) => {
    const { container } = render(<PolicySetupAlert policy="leave" state={state} />);
    expect(container).toBeEmptyDOMElement();
  });
  it('keeps recovery hidden without destination permission', () => {
    render(
      <PolicySetupAlert policy="leave" state="missing" href="/hr/leave-policies" canOpen={false} />
    );
    expect(screen.getByText('Default leave policy missing')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
  it('opens the permitted recovery flow and keeps secondary details', () => {
    const onOpen = vi.fn();
    render(<PolicySetupAlert policy="leave" state="multiple" canOpen onOpen={onOpen} />);
    expect(screen.getByText('Multiple default leave policies')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open Leave Policies' }));
    expect(onOpen).toHaveBeenCalledOnce();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });
});
