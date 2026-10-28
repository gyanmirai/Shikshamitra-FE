import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { SetupFlowShell } from './index';

vi.mock('src/components/logo', () => ({ Logo: () => <span>School logo</span> }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

const steps = [
  { key: 'welcome', title: 'Welcome' },
  { key: 'curriculum', title: 'Curriculum' },
  { key: 'timetable', title: 'Timetable' },
  { key: 'review', title: 'Review' },
] as const;
const defaults = {
  steps,
  activeStep: 1,
  furthestStep: 2,
  disabled: false,
  onStep: vi.fn(),
  schoolCode: 'SCHOOL_01',
  sidebarTitle: 'ACADEMIC SETUP',
  headerLabel: 'Academic setup',
  children: <input aria-label="Step draft" defaultValue="Saved draft" />,
  footer: <button type="button">Continue setup</button>,
};

describe('SetupFlowShell', () => {
  it('renders workflow labels, supplied content, footer and current progress', () => {
    render(<SetupFlowShell {...defaults} contextLabel="Year 2026-2027" />);
    expect(screen.getByText('ACADEMIC SETUP')).toBeInTheDocument();
    expect(screen.getByText('Academic setup')).toBeInTheDocument();
    expect(screen.getByText('SCHOOL_01')).toBeInTheDocument();
    expect(screen.getByText('Year 2026-2027')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Setup progress' })).toHaveAttribute(
      'aria-valuenow',
      '50'
    );
    expect(screen.getByRole('main', { name: 'Setup content' })).toContainElement(
      screen.getByLabelText('Step draft')
    );
    expect(screen.getByRole('contentinfo')).toContainElement(
      screen.getByRole('button', { name: 'Continue setup' })
    );
  });

  it('keeps completed and active steps reachable while future steps stay locked', () => {
    const onStep = vi.fn();
    render(<SetupFlowShell {...defaults} onStep={onStep} navigationLabel="Academic setup steps" />);
    const nav = screen.getByRole('navigation', { name: 'Academic setup steps', hidden: true });
    expect(nav).toBeInTheDocument();
    const welcome = screen.getByRole('button', { name: 'Welcome, completed', hidden: true });
    const current = screen.getByRole('button', { name: 'Curriculum, completed', hidden: true });
    expect(current).toHaveAttribute('aria-current', 'step');
    fireEvent.click(welcome);
    expect(onStep).toHaveBeenCalledWith(0);
    const review = screen.getByRole('button', { name: 'Review', hidden: true });
    expect(review).toBeDisabled();
    fireEvent.click(review);
    expect(onStep).toHaveBeenCalledTimes(1);
  });

  it('uses explicit saved states without marking earlier visited steps complete', () => {
    render(
      <SetupFlowShell
        {...defaults}
        furthestStep={3}
        stepStates={{ welcome: 'complete', curriculum: 'pending', timetable: 'deferred' }}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Welcome, completed', hidden: true })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Curriculum, changes need saving', hidden: true })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Timetable, deferred', hidden: true })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review', hidden: true })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Timetable, completed', hidden: true })
    ).not.toBeInTheDocument();
  });

  it('locks all step navigation during a blocking operation', () => {
    const onStep = vi.fn();
    render(<SetupFlowShell {...defaults} disabled onStep={onStep} />);
    const welcome = screen.getByRole('button', { name: 'Welcome, completed', hidden: true });
    expect(welcome).toBeDisabled();
    fireEvent.click(welcome);
    expect(onStep).not.toHaveBeenCalled();
  });

  it('does not infer completion for omitted earlier steps in an explicit map', () => {
    render(<SetupFlowShell {...defaults} furthestStep={3} stepStates={{}} />);
    expect(screen.getByRole('button', { name: 'Welcome', hidden: true })).toBeEnabled();
    expect(
      screen.queryByRole('button', { name: 'Welcome, completed', hidden: true })
    ).not.toBeInTheDocument();
  });

  it('resets the content scroll only when the active step changes', () => {
    const { rerender } = render(<SetupFlowShell {...defaults} />);
    const scrollTo = vi.fn();
    screen.getByRole('main').scrollTo = scrollTo;
    rerender(<SetupFlowShell {...defaults} schoolCode="SCHOOL_02" />);
    expect(scrollTo).not.toHaveBeenCalled();
    rerender(<SetupFlowShell {...defaults} activeStep={2} />);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
    expect(
      screen.getByRole('navigation', { name: 'Setup steps', hidden: true })
    ).toBeInTheDocument();
  });

  it('bounds embedded flows to their parent instead of the browser viewport', () => {
    const { container } = render(<SetupFlowShell {...defaults} heightMode="container" />);
    expect(getComputedStyle(container.firstElementChild!).height).toBe('100%');
    expect(getComputedStyle(screen.getByRole('main')).overflowY).toBe('auto');
  });
});
