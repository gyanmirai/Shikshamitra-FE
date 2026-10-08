import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ViewFeeDetails from './ViewFeeDetails';

const mocks = vi.hoisted(() => ({
  query: {} as any,
  refetch: vi.fn(),
  queryOptions: {} as any,
}));

vi.mock('react-redux', () => ({
  useSelector: () => ({ currentYear: { id: 'year-1' } }),
}));
vi.mock('src/redux/feeCollection/feeCollection', () => ({
  useGetStudentFeeDetailsQuery: vi.fn(),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: (options: any) => {
    mocks.queryOptions = options;
    return { ...mocks.query, refetch: mocks.refetch };
  },
}));
vi.mock('src/components/scrollbar', () => ({ Scrollbar: ({ children }: any) => children }));
vi.mock('./ViewDetailsComponent/StudentFeesSummaryView', () => ({
  StudentFeesSummaryView: () => <div>Student Information</div>,
}));
vi.mock('./ViewDetailsComponent/FeeTermsViewDetails', () => ({
  ConsolidatedFeeDetails: () => <div>Fee Breakdown</div>,
}));
vi.mock('./ViewDetailsComponent/PaymentHistory', () => ({
  default: () => <div>Payment History</div>,
}));
vi.mock('./ViewDetailsComponent/FeeOverviewDetails', () => ({
  default: () => <div>Fee Overview</div>,
}));
vi.mock('./ViewDetailsComponent/concessionDetails', () => ({
  default: () => <div>Concessions</div>,
}));

const student = { studentId: 'student-1' } as any;
const dialog = {} as any;

describe('fee details request state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query = {};
  });

  it('shows a recoverable error without fabricated student or monetary details', () => {
    mocks.query = { isError: true, isFetching: false };

    render(<ViewFeeDetails student={student} collectFeesDialog={dialog} viewDialog={dialog} />);

    expect(screen.getByText('Fee details could not be loaded. Please try again.')).toBeInTheDocument();
    expect(screen.queryByText('Student Information')).not.toBeInTheDocument();
    expect(screen.queryByText('Fee Overview')).not.toBeInTheDocument();
    expect(mocks.queryOptions.popupConfig.error).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });

  it('renders financial details after the request succeeds', () => {
    mocks.query = { data: { student: { name: 'Avni Raj Baku' }, feeOverview: { totalFee: 106000 } } };

    render(<ViewFeeDetails student={student} collectFeesDialog={dialog} viewDialog={dialog} />);

    expect(screen.getByText('Student Information')).toBeInTheDocument();
    expect(screen.getByText('Fee Overview')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });
});
