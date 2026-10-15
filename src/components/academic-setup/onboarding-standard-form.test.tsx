import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { OnboardingStandardForm } from './onboarding-standard-form';

const mocks = vi.hoisted(() => ({ addClass: vi.fn(), dispatch: vi.fn(), close: vi.fn() }));

vi.mock('react-redux', () => ({ useDispatch: () => mocks.dispatch }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => [mocks.addClass, { isLoading: false }],
}));
vi.mock('src/redux/class/classApi', () => ({ useAddClassMutation: vi.fn() }));
vi.mock('src/redux/board/boardApi', () => ({
  boardApi: {
    util: { invalidateTags: (tags: unknown) => ({ type: 'invalidate', payload: tags }) },
  },
}));
vi.mock('../customDialog', () => ({
  DialogScrollContent: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock('../confirm-dialog', () => ({
  ConfirmDialog: ({ open, action }: { open: boolean; action: React.ReactNode }) =>
    open ? action : null,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.addClass.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'new-standard' }) });
});

describe('onboarding standard creation', () => {
  it('renders the two required fields and submits without a shift mapping', async () => {
    render(<OnboardingStandardForm handleClose={mocks.close} organizationId="stage-1" />);
    expect(screen.queryByLabelText(/shift/i)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Class Name/), { target: { value: 'lkg' } });
    fireEvent.change(screen.getByLabelText(/Limit Of Age/), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm' }));
    await waitFor(() =>
      expect(mocks.addClass).toHaveBeenCalledWith({
        name: 'Lkg',
        ageLowerLimit: 4,
        educationMediumStageId: 'stage-1',
      })
    );
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  it('keeps invalid forms open without submitting', async () => {
    render(<OnboardingStandardForm handleClose={mocks.close} organizationId="stage-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Class is required')).toBeVisible();
    expect(mocks.addClass).not.toHaveBeenCalled();
    expect(mocks.close).not.toHaveBeenCalled();
  });
});
