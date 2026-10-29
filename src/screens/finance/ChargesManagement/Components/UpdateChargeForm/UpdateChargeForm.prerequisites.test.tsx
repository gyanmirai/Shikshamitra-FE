import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import UpdateChargeForm from './UpdateChargeForm';

const state = vi.hoisted(() => ({
  year: { id: 'year', boards: [] },
  trigger: vi.fn(),
  categories: { currentData: { items: [] }, refetch: vi.fn() },
  students: { students: [], candidateStudentIds: [], hasFetched: false },
  structure: { classes: [], allDivisions: [] },
}));
vi.mock('react-redux', () => ({
  useSelector: () => ({ currentYear: state.year }),
  useDispatch: () => state.trigger,
}));
vi.mock('next-auth/react', () => ({ useSession: () => ({ data: null, status: 'authenticated' }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: any) => currentQueryAndMutation(),
}));
vi.mock('framer-motion', () => ({ motion: { div: ({ children }: any) => <div>{children}</div> } }));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: any) => children,
}));
vi.mock('src/screens/finance/components/FinancePrerequisiteState', () => ({
  default: ({ requirements }: any) => <div>{requirements[0].key}</div>,
}));
vi.mock('@mui/x-date-pickers', () => ({ DatePicker: () => null }));
vi.mock('src/components/custom-select', () => ({ default: () => null }));
vi.mock('src/redux/finance/chargeCategory', () => ({
  useGetChargeCategoriesQuery: () => state.categories,
}));
vi.mock('src/redux/finance/ChargeManagement/chargeApi', () => ({
  usePostChargeMutation: () => [state.trigger, {}],
  useUpdateChargeMutation: () => [state.trigger, {}],
}));
vi.mock('../../useChargePermissions', () => ({
  useChargePermissions: () => ({ isReady: true, canAdd: true, canEdit: true }),
}));
vi.mock('./useChargeDetails', () => ({
  useChargeDetails: () => ({ restrictions: {} }),
  useDirtyState: () => false,
}));
vi.mock('./useChargeAcademicStructure', () => ({
  useChargeAcademicStructure: () => state.structure,
}));
vi.mock('./useStudentsInScope', () => ({ useStudentsInScope: () => state.students }));
vi.mock('./StudentSelectionLayout', () => ({ StudentSelectionLayout: () => null }));
vi.mock('./SelectedStudentsPanel', () => ({ SelectedStudentsPanel: () => null }));

it('shows category setup in the live charge workspace and preserves its Cancel footer', () => {
  render(<UpdateChargeForm open={{ value: true } as any} onClose={vi.fn()} />);
  expect(screen.getByText('charge-category')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expect(screen.queryByRole('textbox', { name: 'Charge name *' })).not.toBeInTheDocument();
});
